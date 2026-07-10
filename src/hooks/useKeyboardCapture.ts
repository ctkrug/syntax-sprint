import { useEffect } from "react";

export interface UseKeyboardCaptureOptions {
  enabled: boolean;
  onChar: (char: string) => void;
  onBackspace: () => void;
}

/**
 * Captures raw keystrokes for the typing run: single printable characters go
 * to `onChar`, Backspace goes to `onBackspace` (and is prevented so it can't
 * also trigger a browser back-navigation), and Tab is remapped to a literal
 * "\t" char (and prevented so it can't shift focus away) since tab-indented
 * snippets need it typeable like any other character. Modifier combos
 * (Ctrl/Meta/Alt) are left alone so browser/OS shortcuts keep working.
 */
export function useKeyboardCapture(options: UseKeyboardCaptureOptions): void {
  const { enabled, onChar, onBackspace } = options;

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
  }, [enabled, onChar, onBackspace]);
}
