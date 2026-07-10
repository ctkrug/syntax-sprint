import { cursorPositionAt } from "../lib/cursorPosition";
import type { CharJudgement } from "../lib/scoring";

export interface SnippetCardProps {
  target: string;
  typed: string;
  judgements: CharJudgement[];
  /** Row of the most recent structural mistake, or null if the last keystroke wasn't one. */
  structuralMistakeRow: number | null;
  /** Increments on every structural mistake so the shake can replay on repeated hits. */
  mistakeSeq: number;
  reducedMotion: boolean;
}

function charClass(index: number, typedLength: number, activeIndex: number, judgement?: CharJudgement): string {
  if (index === activeIndex) return "snippet-char snippet-char-active";
  if (index >= typedLength || !judgement) return "snippet-char snippet-char-pending";
  if (judgement.correct) return "snippet-char snippet-char-correct";
  return judgement.mistakeKind === "structural"
    ? "snippet-char snippet-char-mistake-structural"
    : "snippet-char snippet-char-mistake-typo";
}

function displayChar(char: string): string {
  return char === " " ? " " : char;
}

/**
 * The hero of the page (docs/DESIGN.md #3): renders the target snippet as
 * per-character cells so every keystroke's judgement (correct / typo /
 * structural) can be styled independently, plus a tweened cursor overlay
 * and a shake on the line where a structural mistake just happened.
 */
export function SnippetCard({
  target,
  typed,
  judgements,
  structuralMistakeRow,
  mistakeSeq,
  reducedMotion,
}: SnippetCardProps) {
  const lines = target.split("\n");
  const activeIndex = typed.length;
  const cursor = cursorPositionAt(target, activeIndex);

  let offset = 0;

  return (
    <div className="snippet-card">
      <pre className="snippet-source" aria-hidden="true">
        {lines.map((line, rowIndex) => {
          const lineStart = offset;
          offset += line.length + 1;
          const isShaking =
            !reducedMotion && structuralMistakeRow === rowIndex && mistakeSeq > 0;

          return (
            <div
              key={isShaking ? `line-${rowIndex}-${mistakeSeq}` : `line-${rowIndex}`}
              className={isShaking ? "snippet-line snippet-line-shake" : "snippet-line"}
            >
              {line.length === 0 && <span className="snippet-char">&nbsp;</span>}
              {line.split("").map((char, colIndex) => {
                const index = lineStart + colIndex;
                return (
                  <span key={index} className={charClass(index, typed.length, activeIndex, judgements[index])}>
                    {displayChar(char)}
                  </span>
                );
              })}
            </div>
          );
        })}
      </pre>
      <div
        className="snippet-cursor"
        style={{
          transform: `translate(${cursor.col}ch, ${cursor.row * 1.6}em)`,
        }}
      />
      <p className="visually-hidden" role="status" aria-live="polite">
        {typed.length} of {target.length} characters typed
      </p>
    </div>
  );
}
