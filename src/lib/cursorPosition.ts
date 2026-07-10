export interface CursorPosition {
  row: number;
  col: number;
}

/**
 * Converts a flat character index into a monospace-grid (row, col) so the
 * live cursor can be positioned with a CSS transform (`translate(col ch,
 * row lineHeight)`) instead of measuring DOM nodes.
 */
export function cursorPositionAt(source: string, index: number): CursorPosition {
  const clamped = Math.max(0, Math.min(index, source.length));
  let row = 0;
  let lineStart = 0;

  for (let i = 0; i < clamped; i += 1) {
    if (source[i] === "\n") {
      row += 1;
      lineStart = i + 1;
    }
  }

  return { row, col: clamped - lineStart };
}
