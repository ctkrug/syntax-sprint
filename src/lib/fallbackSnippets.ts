import type { Snippet } from "../types";

/**
 * Bundled snippets used when the GitHub API is unreachable or rate-limited.
 * Hand-written (not scraped) so there's no licensing ambiguity, but shaped
 * like real production code across languages so the tokenizer/scorer sees
 * the same bracket and indentation patterns a live snippet would have.
 */
export const FALLBACK_SNIPPETS: Snippet[] = [
  {
    repo: "syntax-sprint/offline-set",
    language: "TypeScript",
    path: "fallback/retry.ts",
    content: `export async function withRetry<T>(
  task: () => Promise<T>,
  attempts = 3,
): Promise<T> {
  let lastError: unknown;
  for (let i = 0; i < attempts; i += 1) {
    try {
      return await task();
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError;
}`,
  },
  {
    repo: "syntax-sprint/offline-set",
    language: "Python",
    path: "fallback/cache.py",
    content: `def memoize(fn):
    cache = {}

    def wrapper(*args):
        if args not in cache:
            cache[args] = fn(*args)
        return cache[args]

    return wrapper


@memoize
def fib(n):
    if n < 2:
        return n
    return fib(n - 1) + fib(n - 2)`,
  },
  {
    repo: "syntax-sprint/offline-set",
    language: "Go",
    path: "fallback/pool.go",
    content: `package pool

type Worker struct {
	jobs chan func()
}

func NewWorker(buffer int) *Worker {
	return &Worker{jobs: make(chan func(), buffer)}
}

func (w *Worker) Run() {
	for job := range w.jobs {
		job()
	}
}

func (w *Worker) Submit(job func()) {
	w.jobs <- job
}`,
  },
  {
    repo: "syntax-sprint/offline-set",
    language: "Rust",
    path: "fallback/stack.rs",
    content: `struct Stack<T> {
    items: Vec<T>,
}

impl<T> Stack<T> {
    fn new() -> Self {
        Stack { items: Vec::new() }
    }

    fn push(&mut self, item: T) {
        self.items.push(item);
    }

    fn pop(&mut self) -> Option<T> {
        self.items.pop()
    }
}`,
  },
];

/** Picks a fallback snippet; `random` is injectable so tests are deterministic. */
export function getFallbackSnippet(random: () => number = Math.random): Snippet {
  const index = Math.floor(random() * FALLBACK_SNIPPETS.length);
  return FALLBACK_SNIPPETS[Math.min(index, FALLBACK_SNIPPETS.length - 1)];
}
