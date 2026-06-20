import { env } from '../../config/env.js';

export interface NewsItem {
  title: string;
  source: string | null;
  url: string | null;
  publishedAt: string | null;
}

/** Whether a news API key is configured. */
export function isNewsConfigured(): boolean {
  return Boolean(env.newsApiKey);
}

// Shape of a NewsAPI.org-style `everything` response (the configurable default).
interface NewsApiResponse {
  articles?: Array<{
    title?: string;
    url?: string;
    publishedAt?: string;
    source?: { name?: string };
  }>;
}

/**
 * Fetches recent market headlines for a country or company name from a
 * configurable news API (`NEWS_API_URL`, keyed by `NEWS_API_KEY`). Returns a
 * no-op empty list when no key is set, so the rest of the system keeps working
 * without external configuration. The API key stays server-side.
 */
export async function fetchHeadlines(name: string, limit = 5): Promise<NewsItem[]> {
  const query = name.trim();
  if (!env.newsApiKey || !query) {
    return [];
  }

  const url = new URL(env.newsApiUrl);
  url.searchParams.set('q', query);
  url.searchParams.set('pageSize', String(limit));
  url.searchParams.set('sortBy', 'publishedAt');
  url.searchParams.set('language', 'en');

  const response = await fetch(url, {
    headers: { 'X-Api-Key': env.newsApiKey },
  });

  if (!response.ok) {
    throw new Error(`News API request failed with status ${response.status}`);
  }

  const data = (await response.json()) as NewsApiResponse;
  return (data.articles ?? [])
    .slice(0, limit)
    .map((article) => ({
      title: article.title ?? '',
      source: article.source?.name ?? null,
      url: article.url ?? null,
      publishedAt: article.publishedAt ?? null,
    }))
    .filter((item) => item.title.length > 0);
}
