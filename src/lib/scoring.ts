import { tokenize } from "./tokenizer";
import type { Token } from "../types";

export type MistakeKind = "typo" | "structural";

export interface CharJudgement {
  expected: string;
  typed: string;
  correct: boolean;
  mistakeKind: MistakeKind | null;
}

export interface RunResult {
  judgements: CharJudgement[];
  correctCount: number;
  structuralMistakes: number;
  typoMistakes: number;
  accuracy: number;
}

const STRUCTURAL_KINDS: ReadonlyArray<Token["kind"]> = ["bracket", "indent"];

/** Maps each character offset in `source` to the token kind it belongs to. */
function buildKindMap(source: string): Token["kind"][] {
  const kinds: Token["kind"][] = new Array(source.length);
  for (const token of tokenize(source)) {
    for (let i = 0; i < token.text.length; i += 1) {
      kinds[token.start + i] = token.kind;
    }
  }
  return kinds;
}

/**
 * Compares what the player typed against the target snippet character by
 * character. A mismatch inside a bracket or indent token is a "structural"
 * mistake (the thing this game exists to punish); any other mismatch is an
 * ordinary "typo".
 */
export function scoreRun(target: string, typed: string): RunResult {
  const kinds = buildKindMap(target);
  const length = Math.min(target.length, typed.length);
  const judgements: CharJudgement[] = [];
  let correctCount = 0;
  let structuralMistakes = 0;
  let typoMistakes = 0;

  for (let i = 0; i < length; i += 1) {
    const expected = target[i];
    const typedChar = typed[i];
    const correct = expected === typedChar;

    let mistakeKind: MistakeKind | null = null;
    if (!correct) {
      mistakeKind = STRUCTURAL_KINDS.includes(kinds[i]) ? "structural" : "typo";
      if (mistakeKind === "structural") structuralMistakes += 1;
      else typoMistakes += 1;
    } else {
      correctCount += 1;
    }

    judgements.push({ expected, typed: typedChar, correct, mistakeKind });
  }

  return {
    judgements,
    correctCount,
    structuralMistakes,
    typoMistakes,
    accuracy: length === 0 ? 1 : correctCount / length,
  };
}
