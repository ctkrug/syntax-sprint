const LEADING_SKIP_PREFIXES = ["//", "#", "*", "/*"];
const MAX_LEADING_SKIP_LINES = 20;

function isSkippableLeadingLine(line: string): boolean {
  const trimmed = line.trim();
  if (trimmed === "") return true;
  return LEADING_SKIP_PREFIXES.some((prefix) => trimmed.startsWith(prefix));
}

/**
 * Pulls a bounded, typeable excerpt out of a full source file: skips a
 * leading license/comment block (capped so it can't eat the whole file),
 * then takes a slice between `minLines` and `maxLines` long. Files already
 * shorter than `minLines` are returned whole rather than padded.
 */
export function extractExcerpt(content: string, minLines = 10, maxLines = 40): string {
  const lines = content.split("\n");

  if (lines.length <= minLines) {
    return content.trim();
  }

  let start = 0;
  while (start < Math.min(MAX_LEADING_SKIP_LINES, lines.length) && isSkippableLeadingLine(lines[start])) {
    start += 1;
  }

  if (lines.length - start < minLines) {
    start = 0;
  }

  const end = Math.min(start + maxLines, lines.length);
  return lines.slice(start, end).join("\n").trim();
}
