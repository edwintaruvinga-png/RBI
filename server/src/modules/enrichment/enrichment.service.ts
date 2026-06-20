import type { MeetingType } from '@prisma/client';

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
 * concrete provider, so an AI-backed implementation can be swapped in later
 * via `setEnrichmentService` without touching the rest of the system.
 */
export interface EnrichmentService {
  enrich(input: EnrichmentInput): Promise<EnrichmentResult>;
}

const ACTION_PATTERN =
  /\b(action|todo|to-do|follow[- ]?up|will|shall|should|need to|must|next step|schedule|send|prepare|review|circulate|confirm|chase)\b/i;

/**
 * Deterministic placeholder used until an AI provider is wired up. It performs
 * naive extraction so the API works end-to-end: the first few sentences become
 * summary bullets, and sentences that read like commitments become action
 * items. Replace with an LLM-backed `EnrichmentService` when ready.
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

let activeService: EnrichmentService = new StubEnrichmentService();

/** Returns the currently injected enrichment service. */
export function getEnrichmentService(): EnrichmentService {
  return activeService;
}

/** Injects a concrete enrichment service (e.g. an AI-backed one, or a test double). */
export function setEnrichmentService(service: EnrichmentService): void {
  activeService = service;
}
