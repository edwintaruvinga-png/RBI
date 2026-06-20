import { Prisma, type MeetingType } from '@prisma/client';
import { env } from '../../config/env.js';
import { prisma } from '../../lib/prisma.js';
import { buildMarketBrief, isAiConfigured, summariseNotes } from './ai.provider.js';
import { fetchHeadlines, type NewsItem } from './news.provider.js';

export interface EnrichmentInput {
  rawNotes: string;
  type?: MeetingType;
  attendees?: string[];
}

export interface EnrichmentResult {
  summaryBullets: string[];
  actionItems: string[];
}

/**
 * Generates structured insights (summary bullets + action items) from a
 * meeting's raw notes. The reports module depends on this interface, not a
 * concrete provider, so the AI-backed implementation can be swapped for a test
 * double via `setEnrichmentService` without touching the rest of the system.
 */
export interface EnrichmentService {
  enrich(input: EnrichmentInput): Promise<EnrichmentResult>;
}

const ACTION_PATTERN =
  /\b(action|todo|to-do|follow[- ]?up|will|shall|should|need to|must|next step|schedule|send|prepare|review|circulate|confirm|chase)\b/i;

/**
 * Deterministic fallback used when no AI provider is configured (or a call
 * fails). Naive extraction: the first few sentences become summary bullets, and
 * sentences that read like commitments become action items.
 */
export class StubEnrichmentService implements EnrichmentService {
  async enrich({ rawNotes }: EnrichmentInput): Promise<EnrichmentResult> {
    const text = (rawNotes ?? '').trim();
    if (!text) {
      return { summaryBullets: [], actionItems: [] };
    }

    const segments = text
      .split(/\r?\n|(?<=[.!?])\s+/)
      .map((segment) => segment.trim())
      .filter(Boolean);

    return {
      summaryBullets: segments.slice(0, 5),
      actionItems: segments.filter((segment) => ACTION_PATTERN.test(segment)).slice(0, 10),
    };
  }
}

/**
 * AI-backed enrichment that summarises notes via the Anthropic provider, with a
 * graceful fallback to the heuristic stub when the provider is unconfigured or
 * errors — so the API stays functional without a key.
 */
export class AiEnrichmentService implements EnrichmentService {
  private readonly fallback = new StubEnrichmentService();

  async enrich(input: EnrichmentInput): Promise<EnrichmentResult> {
    const notes = (input.rawNotes ?? '').trim();
    if (!notes) {
      return { summaryBullets: [], actionItems: [] };
    }
    if (!isAiConfigured()) {
      return this.fallback.enrich(input);
    }
    try {
      return await summariseNotes(notes);
    } catch (error) {
      console.error('AI note summarisation failed; using heuristic fallback', error);
      return this.fallback.enrich(input);
    }
  }
}

// Default to the AI-backed service when a key is present, otherwise the stub.
let activeService: EnrichmentService = isAiConfigured()
  ? new AiEnrichmentService()
  : new StubEnrichmentService();

/** Returns the currently injected enrichment service. */
export function getEnrichmentService(): EnrichmentService {
  return activeService;
}

/** Injects a concrete enrichment service (e.g. a test double). */
export function setEnrichmentService(service: EnrichmentService): void {
  activeService = service;
}

// ---------------------------------------------------------------------------
// Market-brief orchestration + caching in the Enrichment table
// ---------------------------------------------------------------------------

const MARKET_BRIEF_SOURCE = 'market-brief';

export type EnrichmentTarget =
  | { kind: 'country'; id: string; name: string }
  | { kind: 'company'; id: string; name: string };

export interface MarketBrief {
  brief: string;
  headlines: NewsItem[];
  generatedAt: string;
}

function isStale(fetchedAt: Date): boolean {
  return Date.now() - fetchedAt.getTime() > env.enrichmentTtlMs;
}

async function safeFetchHeadlines(name: string): Promise<NewsItem[]> {
  try {
    return await fetchHeadlines(name);
  } catch (error) {
    console.error('News headline fetch failed; continuing without headlines', error);
    return [];
  }
}

function heuristicBrief(name: string, headlines: NewsItem[]): string {
  if (headlines.length === 0) {
    return `No market intelligence is available for ${name} yet.`;
  }
  return [`Recent headlines for ${name}:`, ...headlines.map((item) => `- ${item.title}`)].join('\n');
}

/**
 * Returns a synthesised market brief for a country or company, orchestrating
 * the news and AI providers. Results are cached in the Enrichment table; a
 * cached entry younger than the configured TTL is reused unless `forceRefresh`
 * is set.
 */
export async function getMarketBrief(
  target: EnrichmentTarget,
  options: { forceRefresh?: boolean } = {},
): Promise<MarketBrief> {
  const link =
    target.kind === 'country' ? { countryId: target.id } : { companyId: target.id };

  const cached = await prisma.enrichment.findFirst({
    where: { ...link, source: MARKET_BRIEF_SOURCE },
    orderBy: { fetchedAt: 'desc' },
  });

  if (!options.forceRefresh && cached && !isStale(cached.fetchedAt)) {
    return cached.payload as unknown as MarketBrief;
  }

  const headlines = await safeFetchHeadlines(target.name);
  const context = `${target.kind === 'country' ? 'Country' : 'Company'}: ${target.name}`;

  let brief: string;
  if (isAiConfigured()) {
    try {
      brief = await buildMarketBrief(context, headlines);
    } catch (error) {
      console.error('AI market brief failed; using heuristic fallback', error);
      brief = heuristicBrief(target.name, headlines);
    }
  } else {
    brief = heuristicBrief(target.name, headlines);
  }

  const payload: MarketBrief = {
    brief,
    headlines,
    generatedAt: new Date().toISOString(),
  };

  await prisma.enrichment.create({
    data: {
      ...link,
      source: MARKET_BRIEF_SOURCE,
      payload: payload as unknown as Prisma.InputJsonValue,
    },
  });

  return payload;
}
