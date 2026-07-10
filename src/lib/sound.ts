const STORAGE_KEY = "syntax-sprint:muted";

export interface SoundEngine {
  playCorrect(): void;
  playTypo(): void;
  playStructural(): void;
  playLineComplete(): void;
  playRunComplete(): void;
  isMuted(): boolean;
  setMuted(muted: boolean): void;
  toggleMute(): boolean;
}

type MinimalStorage = Pick<Storage, "getItem" | "setItem">;

function readStoredMute(storage: MinimalStorage | null): boolean {
  if (!storage) return false;
  return storage.getItem(STORAGE_KEY) === "1";
}

function getAudioContextCtor(): (new () => AudioContext) | undefined {
  if (typeof window === "undefined") return undefined;
  const withVendorPrefix = window as unknown as { webkitAudioContext?: new () => AudioContext };
  return window.AudioContext ?? withVendorPrefix.webkitAudioContext;
}

function defaultStorage(): MinimalStorage | null {
  return typeof localStorage === "undefined" ? null : localStorage;
}

/**
 * Synthesized SFX per docs/DESIGN.md's juice plan (oscillators/noise, no
 * audio files). The AudioContext is created lazily on the first play call
 * (autoplay policy needs a user gesture first) and every method is a safe
 * no-op when AudioContext isn't available, e.g. in tests or unsupported
 * browsers.
 */
export function createSoundEngine(storage: MinimalStorage | null = defaultStorage()): SoundEngine {
  let muted = readStoredMute(storage);
  let ctx: AudioContext | null = null;

  function ensureContext(): AudioContext | null {
    if (ctx) return ctx;
    const Ctor = getAudioContextCtor();
    if (!Ctor) return null;
    ctx = new Ctor();
    return ctx;
  }

  function tone(
    frequency: number,
    durationMs: number,
    type: OscillatorType,
    gain: number,
    sweepToHz?: number,
    startOffsetMs = 0,
  ) {
    if (muted) return;
    const audioCtx = ensureContext();
    if (!audioCtx) return;

    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    const now = audioCtx.currentTime + startOffsetMs / 1000;
    const durationSec = durationMs / 1000;

    osc.type = type;
    osc.frequency.setValueAtTime(frequency, now);
    if (sweepToHz !== undefined) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(sweepToHz, 1), now + durationSec);
    }

    gainNode.gain.setValueAtTime(gain, now);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + durationSec);

    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + durationSec);
  }

  function setMuted(value: boolean): void {
    muted = value;
    storage?.setItem(STORAGE_KEY, value ? "1" : "0");
  }

  return {
    playCorrect: () => tone(900, 15, "sine", 0.05),
    playTypo: () => tone(180, 40, "square", 0.08),
    playStructural: () => tone(500, 60, "sawtooth", 0.12, 80),
    playLineComplete: () => {
      tone(600, 60, "sine", 0.08, undefined, 0);
      tone(900, 80, "sine", 0.08, undefined, 60);
    },
    playRunComplete: () => {
      tone(523.25, 140, "sine", 0.1, undefined, 0); // C5
      tone(659.25, 140, "sine", 0.1, undefined, 140); // E5
      tone(783.99, 180, "sine", 0.1, undefined, 280); // G5
    },
    isMuted: () => muted,
    setMuted,
    toggleMute: () => {
      setMuted(!muted);
      return muted;
    },
  };
}
