export type TokenKind =
  | "whitespace"
  | "indent"
  | "newline"
  | "bracket"
  | "string"
  | "comment"
  | "word";

export interface Token {
  kind: TokenKind;
  text: string;
  /** Index of this token's first character within the original snippet. */
  start: number;
}

export interface Snippet {
  repo: string;
  language: string;
  path: string;
  content: string;
}

export interface TrendingRepo {
  fullName: string;
  language: string | null;
  starsToday: number;
  url: string;
}
