import { describe, expect, it, vi } from "vitest";
import { fetchRepoSnippet, fetchTrendingRepos } from "./github";
import type { TrendingRepo } from "../types";

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

  it("sends a bearer token when VITE_GITHUB_TOKEN is configured", async () => {
    vi.stubEnv("VITE_GITHUB_TOKEN", "secret-token");
    const fetchImpl = mockFetch([]);

    await fetchTrendingRepos(10, fetchImpl);

    const [, options] = (fetchImpl as ReturnType<typeof vi.fn>).mock.calls[0];
    expect((options.headers as Record<string, string>).Authorization).toBe(
      "Bearer secret-token",
    );
    vi.unstubAllEnvs();
  });
});

const REPO: TrendingRepo = {
  fullName: "octo/widgets",
  language: "TypeScript",
  starsToday: 1234,
  url: "https://github.com/octo/widgets",
};

function contentsResponse(entries: unknown[]) {
  return { ok: true, status: 200, json: async () => entries };
}

function rawResponse(text: string) {
  return { ok: true, status: 200, text: async () => text };
}

describe("fetchRepoSnippet", () => {
  it("returns an excerpt of the first code file found in the repo root", async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(
        contentsResponse([
          { name: "README.md", path: "README.md", type: "file", download_url: "x" },
          {
            name: "index.ts",
            path: "index.ts",
            type: "file",
            download_url: "https://raw/index.ts",
          },
        ]),
      )
      .mockResolvedValueOnce(rawResponse("export const x = 1;\n"));

    const snippet = await fetchRepoSnippet(REPO, fetchImpl as unknown as typeof fetch);

    expect(snippet).toEqual({
      repo: "octo/widgets",
      language: "TypeScript",
      path: "index.ts",
      content: "export const x = 1;",
    });
  });

  it("falls back to \"text\" as the language when GitHub reports none", async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(
        contentsResponse([
          { name: "index.ts", path: "index.ts", type: "file", download_url: "https://raw/index.ts" },
        ]),
      )
      .mockResolvedValueOnce(rawResponse("export const x = 1;\n"));

    const snippet = await fetchRepoSnippet(
      { ...REPO, language: null },
      fetchImpl as unknown as typeof fetch,
    );

    expect(snippet.language).toBe("text");
  });

  it("skips test files and recurses into a common source directory", async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(
        contentsResponse([
          {
            name: "index.test.ts",
            path: "index.test.ts",
            type: "file",
            download_url: "https://raw/index.test.ts",
          },
          { name: "src", path: "src", type: "dir", download_url: null },
        ]),
      )
      .mockResolvedValueOnce(
        contentsResponse([
          {
            name: "main.ts",
            path: "src/main.ts",
            type: "file",
            download_url: "https://raw/src/main.ts",
          },
        ]),
      )
      .mockResolvedValueOnce(rawResponse("function main() {}\n"));

    const snippet = await fetchRepoSnippet(REPO, fetchImpl as unknown as typeof fetch);

    expect(snippet.path).toBe("src/main.ts");
  });

  it("throws when no code file is found anywhere searched", async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValue(
        contentsResponse([
          { name: "README.md", path: "README.md", type: "file", download_url: "x" },
        ]),
      );

    await expect(
      fetchRepoSnippet(REPO, fetchImpl as unknown as typeof fetch),
    ).rejects.toThrow("No source file found");
  });

  it("throws when the contents request fails", async () => {
    const fetchImpl = vi.fn().mockResolvedValue({ ok: false, status: 404 });
    await expect(
      fetchRepoSnippet(REPO, fetchImpl as unknown as typeof fetch),
    ).rejects.toThrow("404");
  });

  it("throws when the raw file download fails after being listed", async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(
        contentsResponse([
          {
            name: "index.ts",
            path: "index.ts",
            type: "file",
            download_url: "https://raw/index.ts",
          },
        ]),
      )
      .mockResolvedValueOnce({ ok: false, status: 404 });

    await expect(
      fetchRepoSnippet(REPO, fetchImpl as unknown as typeof fetch),
    ).rejects.toThrow("404");
  });

  it("throws when the only code file found excerpts to empty content", async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(
        contentsResponse([
          {
            name: "index.ts",
            path: "index.ts",
            type: "file",
            download_url: "https://raw/index.ts",
          },
        ]),
      )
      .mockResolvedValueOnce(rawResponse("   \n\n  \n"));

    await expect(
      fetchRepoSnippet(REPO, fetchImpl as unknown as typeof fetch),
    ).rejects.toThrow("empty");
  });
});
