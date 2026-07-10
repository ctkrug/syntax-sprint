import { fetchRepoSnippet, fetchTrendingRepos } from "./github";
import { getFallbackSnippet } from "./fallbackSnippets";
import type { Snippet } from "../types";

export interface DailySnippetResult {
  snippet: Snippet;
  source: "live" | "fallback";
  notice: string | null;
}

const UNAVAILABLE_NOTICE =
  "GitHub is unavailable right now — showing a bundled snippet instead.";
const NO_SNIPPET_NOTICE =
  "Couldn't pull a snippet from today's trending repos — showing a bundled snippet instead.";

/**
 * Picks today's snippet: the highest-starred recent repo GitHub will hand
 * over a real source file for, falling back to the bundled set if the API
 * is unreachable/rate-limited or none of the candidate repos yield one.
 */
export async function getDailySnippet(
  fetchImpl: typeof fetch = fetch,
  random: () => number = Math.random,
): Promise<DailySnippetResult> {
  let repos;
  try {
    repos = await fetchTrendingRepos(10, fetchImpl);
  } catch {
    return { snippet: getFallbackSnippet(random), source: "fallback", notice: UNAVAILABLE_NOTICE };
  }

  for (const repo of repos.filter((r) => r.language !== null)) {
    try {
      const snippet = await fetchRepoSnippet(repo, fetchImpl);
      return { snippet, source: "live", notice: null };
    } catch {
      continue;
    }
  }

  return { snippet: getFallbackSnippet(random), source: "fallback", notice: NO_SNIPPET_NOTICE };
}
