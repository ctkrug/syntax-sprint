/**
 * Words-per-minute using the standard "5 characters = 1 word" convention,
 * computed from correctly-typed characters (not raw keystrokes) so
 * backspacing out a mistake doesn't inflate the score. Returns 0 rather
 * than Infinity/NaN when no time has elapsed yet.
 */
export function calculateWpm(correctChars: number, elapsedMs: number): number {
  if (elapsedMs <= 0 || correctChars <= 0) return 0;
  const minutes = elapsedMs / 60000;
  return correctChars / 5 / minutes;
}
