import type { TrendingRepo } from "../types";

interface GitHubSearchItem {
  full_name: string;
  language: string | null;
  stargazers_count: number;
  html_url: string;
}

interface GitHubSearchResponse {
  items: GitHubSearchItem[];
}

/**
 * Finds today's most-starred repos via the GitHub search API as a proxy for
 * "trending" (the public trending page has no official API). Sorted by
 * stars among repos created recently enough to reflect current momentum
 * rather than long-tail popularity.
 */
export async function fetchTrendingRepos(
  limit = 10,
  fetchImpl: typeof fetch = fetch,
): Promise<TrendingRepo[]> {
  const since = new Date();
  since.setDate(since.getDate() - 7);
  const query = `created:>${since.toISOString().slice(0, 10)}`;
  const url = `https://api.github.com/search/repositories?q=${encodeURIComponent(
    query,
  )}&sort=stars&order=desc&per_page=${limit}`;

  const response = await fetchImpl(url, {
    headers: { Accept: "application/vnd.github+json" },
  });

  if (!response.ok) {
    throw new Error(`GitHub search failed with status ${response.status}`);
  }

  const data = (await response.json()) as GitHubSearchResponse;

  return data.items.map((item) => ({
    fullName: item.full_name,
    language: item.language,
    starsToday: item.stargazers_count,
    url: item.html_url,
  }));
}
