import { describe, expect, it, vi } from "vitest";
import { fetchTrendingRepos } from "./github";

function mockFetch(items: unknown[], ok = true, status = 200) {
  return vi.fn().mockResolvedValue({
    ok,
    status,
    json: async () => ({ items }),
  }) as unknown as typeof fetch;
}

describe("fetchTrendingRepos", () => {
  it("maps GitHub search results to TrendingRepo", async () => {
    const fetchImpl = mockFetch([
      {
        full_name: "octo/widgets",
        language: "TypeScript",
        stargazers_count: 1234,
        html_url: "https://github.com/octo/widgets",
      },
    ]);

    const repos = await fetchTrendingRepos(10, fetchImpl);

    expect(repos).toEqual([
      {
        fullName: "octo/widgets",
        language: "TypeScript",
        starsToday: 1234,
        url: "https://github.com/octo/widgets",
      },
    ]);
  });

  it("throws when the GitHub API responds with an error status", async () => {
    const fetchImpl = mockFetch([], false, 403);
    await expect(fetchTrendingRepos(10, fetchImpl)).rejects.toThrow("403");
  });
});
