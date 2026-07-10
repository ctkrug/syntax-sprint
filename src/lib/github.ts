import { extractExcerpt } from "./excerpt";
import type { Snippet, TrendingRepo } from "../types";

interface GitHubSearchItem {
  full_name: string;
  language: string | null;
  stargazers_count: number;
  html_url: string;
}

interface GitHubSearchResponse {
  items: GitHubSearchItem[];
}

interface GitHubContentEntry {
  name: string;
  path: string;
  type: "file" | "dir";
  download_url: string | null;
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

const CODE_EXTENSIONS = [
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".py",
  ".go",
  ".rs",
  ".java",
  ".rb",
  ".c",
  ".cpp",
  ".cs",
  ".kt",
  ".swift",
  ".php",
];

const SUBDIRS_TO_SEARCH = ["src", "lib", "cmd", "app"];

function isTestFileName(name: string): boolean {
  return /[._-](test|spec)s?\./i.test(name);
}

function findCodeFile(entries: GitHubContentEntry[]): GitHubContentEntry | undefined {
  return entries.find(
    (entry) =>
      entry.type === "file" &&
      entry.download_url !== null &&
      !isTestFileName(entry.name) &&
      CODE_EXTENSIONS.some((ext) => entry.name.endsWith(ext)),
  );
}

async function fetchContents(
  fullName: string,
  path: string,
  fetchImpl: typeof fetch,
): Promise<GitHubContentEntry[]> {
  const url = `https://api.github.com/repos/${fullName}/contents/${path}`;
  const response = await fetchImpl(url, {
    headers: { Accept: "application/vnd.github+json" },
  });
  if (!response.ok) {
    throw new Error(`GitHub contents failed with status ${response.status}`);
  }
  return (await response.json()) as GitHubContentEntry[];
}

/**
 * Finds a real source file in `repo` and returns a bounded, typeable
 * excerpt of it. Looks in the repo root first, then a handful of common
 * source directories, skipping test files so the excerpt reads like
 * application code.
 */
export async function fetchRepoSnippet(
  repo: TrendingRepo,
  fetchImpl: typeof fetch = fetch,
): Promise<Snippet> {
  const rootEntries = await fetchContents(repo.fullName, "", fetchImpl);
  let file = findCodeFile(rootEntries);

  if (!file) {
    const dirs = rootEntries.filter(
      (entry) => entry.type === "dir" && SUBDIRS_TO_SEARCH.includes(entry.name),
    );
    for (const dir of dirs) {
      const dirEntries = await fetchContents(repo.fullName, dir.path, fetchImpl);
      file = findCodeFile(dirEntries);
      if (file) break;
    }
  }

  if (!file || !file.download_url) {
    throw new Error(`No source file found in ${repo.fullName}`);
  }

  const rawResponse = await fetchImpl(file.download_url);
  if (!rawResponse.ok) {
    throw new Error(`GitHub raw content failed with status ${rawResponse.status}`);
  }
  const rawContent = await rawResponse.text();

  return {
    repo: repo.fullName,
    language: repo.language ?? "text",
    path: file.path,
    content: extractExcerpt(rawContent),
  };
}
