import { afterEach, describe, expect, it, vi } from "vitest";
import { createSoundEngine } from "./sound";

function fakeStorage(initial: Record<string, string> = {}) {
  const store = new Map(Object.entries(initial));
  return {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => {
      store.set(key, value);
    },
  };
}

class FakeGainParam {
  setValueAtTime = vi.fn();
  exponentialRampToValueAtTime = vi.fn();
}

class FakeAudioParam extends FakeGainParam {}

class FakeOscillator {
  type = "sine";
  frequency = new FakeAudioParam();
  connect = vi.fn();
  start = vi.fn();
  stop = vi.fn();
}

class FakeGainNode {
  gain = new FakeGainParam();
  connect = vi.fn();
}

let createdOscillators: FakeOscillator[] = [];
let constructions = 0;

class FakeAudioContext {
  currentTime = 0;
  destination = {};
  constructor() {
    constructions += 1;
  }
  createOscillator() {
    const osc = new FakeOscillator();
    createdOscillators.push(osc);
    return osc as unknown as OscillatorNode;
  }
  createGain() {
    return new FakeGainNode() as unknown as GainNode;
  }
}

afterEach(() => {
  createdOscillators = [];
  constructions = 0;
  vi.unstubAllGlobals();
});

describe("createSoundEngine without AudioContext", () => {
  it("never throws when playing any SFX", () => {
    const engine = createSoundEngine(null);
    expect(() => {
      engine.playCorrect();
      engine.playTypo();
      engine.playStructural();
      engine.playLineComplete();
      engine.playRunComplete();
    }).not.toThrow();
  });

  it("defaults to unmuted when no storage is provided", () => {
    expect(createSoundEngine(null).isMuted()).toBe(false);
  });
});

describe("createSoundEngine mute state", () => {
  it("reads the initial muted state from storage", () => {
    const storage = fakeStorage({ "syntax-sprint:muted": "1" });
    expect(createSoundEngine(storage).isMuted()).toBe(true);
  });

  it("persists setMuted to storage", () => {
    const storage = fakeStorage();
    const engine = createSoundEngine(storage);
    engine.setMuted(true);
    expect(storage.getItem("syntax-sprint:muted")).toBe("1");
    expect(engine.isMuted()).toBe(true);
  });

  it("toggleMute flips and returns the new state", () => {
    const engine = createSoundEngine(fakeStorage());
    expect(engine.toggleMute()).toBe(true);
    expect(engine.toggleMute()).toBe(false);
  });
});

describe("createSoundEngine with a real AudioContext", () => {
  it("creates one oscillator per tone and starts it", () => {
    vi.stubGlobal("AudioContext", FakeAudioContext);
    const engine = createSoundEngine(fakeStorage());

    engine.playCorrect();

    expect(createdOscillators).toHaveLength(1);
    expect(createdOscillators[0].start).toHaveBeenCalled();
  });

  it("reuses the same AudioContext instance across multiple plays", () => {
    vi.stubGlobal("AudioContext", FakeAudioContext);
    const engine = createSoundEngine(fakeStorage());

    engine.playCorrect();
    engine.playTypo();

    expect(constructions).toBe(1);
  });

  it("schedules a two-note chime for line completion", () => {
    vi.stubGlobal("AudioContext", FakeAudioContext);
    const engine = createSoundEngine(fakeStorage());

    engine.playLineComplete();

    expect(createdOscillators).toHaveLength(2);
  });

  it("does not create an oscillator while muted", () => {
    vi.stubGlobal("AudioContext", FakeAudioContext);
    const engine = createSoundEngine(fakeStorage({ "syntax-sprint:muted": "1" }));

    engine.playCorrect();

    expect(createdOscillators).toHaveLength(0);
  });

  it("sweeps the structural-mistake tone's frequency down but never to zero", () => {
    vi.stubGlobal("AudioContext", FakeAudioContext);
    const engine = createSoundEngine(fakeStorage());

    engine.playStructural();

    expect(createdOscillators).toHaveLength(1);
    expect(createdOscillators[0].frequency.exponentialRampToValueAtTime).toHaveBeenCalledWith(
      80,
      expect.any(Number),
    );
  });

  it("does not sweep the correct-keystroke tone's frequency", () => {
    vi.stubGlobal("AudioContext", FakeAudioContext);
    const engine = createSoundEngine(fakeStorage());

    engine.playCorrect();

    expect(createdOscillators[0].frequency.exponentialRampToValueAtTime).not.toHaveBeenCalled();
  });
});
