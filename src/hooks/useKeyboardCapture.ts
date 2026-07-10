import { useEffect } from "react";

export interface UseKeyboardCaptureOptions {
  enabled: boolean;
  /** True when the next character the player needs to type is a literal tab. */
  interceptTab: boolean;
  onChar: (char: string) => void;
  onBackspace: () => void;
}

/**
 * Captures raw keystrokes for the typing run: single printable characters go
 * to `onChar`, Backspace goes to `onBackspace` (and is prevented so it can't
 * also trigger a browser back-navigation). Tab is only ever remapped to a
 * literal "\t" char when `interceptTab` says the game is actually expecting
 * one (tab-indented snippets); otherwise it's left alone so Tab keeps doing
 * its native job of moving focus to the mute/new-snippet/source-link
 * controls. Modifier combos (Ctrl/Meta/Alt) are left alone so browser/OS
 * shortcuts keep working.
 */
export function useKeyboardCapture(options: UseKeyboardCaptureOptions): void {
  const { enabled, interceptTab, onChar, onBackspace } = options;

  useEffect(() => {
    if (!enabled) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.ctrlKey || event.metaKey || event.altKey) return;

      if (event.key === "Backspace") {
        event.preventDefault();
        onBackspace();
        return;
      }

      if (event.key === "Tab") {
        if (!interceptTab) return;
        event.preventDefault();
        onChar("\t");
        return;
      }

      if (event.key.length === 1) {
        onChar(event.key);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [enabled, interceptTab, onChar, onBackspace]);
}
