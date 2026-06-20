import Anthropic from '@anthropic-ai/sdk';
import { env } from '../../config/env.js';
import type { NewsItem } from './news.provider.js';

export interface NoteSummary {
  summaryBullets: string[];
  actionItems: string[];
}

let client: Anthropic | null = null;

/** Whether the Anthropic API key is configured (server-side only). */
export function isAiConfigured(): boolean {
  return Boolean(env.anthropicApiKey);
}

function getClient(): Anthropic {
  if (!env.anthropicApiKey) {
    throw new Error('ANTHROPIC_API_KEY is not configured');
  }
  if (!client) {
    client = new Anthropic({ apiKey: env.anthropicApiKey });
  }
  return client;
}

/** Concatenates all text blocks of a message response into a single string. */
function textOf(message: Anthropic.Message): string {
  return message.content
    .map((block) => (block.type === 'text' ? block.text : ''))
    .join('')
    .trim();
}

/** Tolerantly extracts a JSON value from model output that may be fenced. */
function extractJson(text: string): unknown {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = (fenced ? fenced[1] : text).trim();
  return JSON.parse(candidate);
}

function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
}

/**
 * Summarises raw meeting notes into concise bullet points and concrete action
 * items via the Anthropic API. Returns empty arrays for empty input.
 */
export async function summariseNotes(rawNotes: string): Promise<NoteSummary> {
  const notes = rawNotes.trim();
  if (!notes) {
    return { summaryBullets: [], actionItems: [] };
  }

  const message = await getClient().messages.create({
    model: env.anthropicModel,
    max_tokens: 1024,
    system:
      'You are an analyst assistant for a reinsurance market-intelligence team. ' +
      'Summarise meeting notes into concise, factual bullet points and concrete, ' +
      'actionable follow-ups. Do not invent facts. Respond with ONLY a JSON object ' +
      'of the form {"summaryBullets": string[], "actionItems": string[]} and nothing else.',
    messages: [
      {
        role: 'user',
        content: `Summarise the following meeting notes.\n\nNotes:\n"""\n${notes}\n"""`,
      },
    ],
  });

  const parsed = extractJson(textOf(message)) as Partial<NoteSummary>;
  return {
    summaryBullets: asStringArray(parsed.summaryBullets),
    actionItems: asStringArray(parsed.actionItems),
  };
}

/**
 * Synthesises a short market brief for a country or company from supplied
 * context and recent news headlines via the Anthropic API.
 */
export async function buildMarketBrief(
  countryOrCompanyContext: string,
  newsItems: NewsItem[],
): Promise<string> {
  const headlines = newsItems.length
    ? newsItems
        .map((item, index) => {
          const source = item.source ? ` (${item.source})` : '';
          const link = item.url ? ` — ${item.url}` : '';
          return `${index + 1}. ${item.title}${source}${link}`;
        })
        .join('\n')
    : 'No recent headlines available.';

  const message = await getClient().messages.create({
    model: env.anthropicModel,
    max_tokens: 1024,
    system:
      'You are a reinsurance market-intelligence analyst. Write a concise, factual ' +
      'market brief (3-5 short paragraphs or bullet points). Ground every claim in the ' +
      'provided context and headlines; do not speculate beyond them.',
    messages: [
      {
        role: 'user',
        content: `Context:\n${countryOrCompanyContext}\n\nRecent headlines:\n${headlines}\n\nWrite a short synthesised market brief.`,
      },
    ],
  });

  return textOf(message);
}
