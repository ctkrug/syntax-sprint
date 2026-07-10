import { useEffect, useState } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

function readPreference(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return false;
  return window.matchMedia(QUERY).matches;
}

/** Tracks the `prefers-reduced-motion` media query, updating live if the OS setting changes. */
export function usePrefersReducedMotion(): boolean {
  const [prefersReduced, setPrefersReduced] = useState(readPreference);

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return;
    const mediaQueryList = window.matchMedia(QUERY);
    const onChange = () => setPrefersReduced(mediaQueryList.matches);
    mediaQueryList.addEventListener("change", onChange);
    return () => mediaQueryList.removeEventListener("change", onChange);
  }, []);

  return prefersReduced;
}
