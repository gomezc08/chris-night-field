import { Howl, Howler } from "howler";

import { TOWERS } from "./constants";
import type { SceneSound } from "./engine";

export type Soundboard = {
  /** Plays a cue from the scene. Silently tracks state while muted. */
  play: (sound: SceneSound) => void;
  setMuted: (muted: boolean) => void;
  destroy: () => void;
};

const src = (name: string) => [`/sounds/${name}.wav`];

/**
 * All scene audio. Starts muted and downloads nothing until the first unmute.
 * `ambientTrackUrl` is Chris's own track from Site settings, if he uploaded one.
 */
export function createSoundboard(ambientTrackUrl?: string | null): Soundboard {
  let muted = true;
  let litTowers = 0;
  let howls: ReturnType<typeof load> | null = null;

  function load() {
    return {
      thunk: new Howl({ src: src("thunk"), volume: 0.5 }),
      touch: new Howl({ src: src("touch"), volume: 0.35 }),
      swish: new Howl({ src: src("swish"), volume: 0.45 }),
      hum: new Howl({ src: src("hum"), loop: true, volume: 0 }),
      ambience: new Howl({ src: src("ambience"), loop: true, volume: 0.25 }),
      // html5 streams a long file instead of decoding it all up front.
      track: ambientTrackUrl
        ? new Howl({ src: [ambientTrackUrl], loop: true, volume: 0.35, html5: true })
        : null,
    };
  }

  // The hum grows with each tower that's on.
  const humVolume = () => 0.05 * litTowers;

  function startLoops() {
    if (!howls) return;
    for (const loop of [howls.hum, howls.ambience, howls.track]) {
      if (loop && !loop.playing()) loop.play();
    }
    howls.hum.volume(humVolume());
  }

  function stopLoops() {
    if (!howls) return;
    for (const loop of [howls.hum, howls.ambience, howls.track]) loop?.pause();
  }

  // Go quiet when the tab is in the background.
  const onVisibility = () => Howler.mute(document.hidden || muted);
  document.addEventListener("visibilitychange", onVisibility);

  return {
    play(sound) {
      if (sound.type === "tower") litTowers = Math.min(TOWERS.length, litTowers + 1);
      if (muted || !howls) return;

      switch (sound.type) {
        case "tower":
          howls.thunk.rate(0.9 + Math.random() * 0.2);
          howls.thunk.play();
          howls.hum.fade(howls.hum.volume(), humVolume(), 400);
          break;
        case "touch": {
          const id = howls.touch.play();
          howls.touch.volume(0.35 * sound.strength, id);
          howls.touch.rate(0.9 + Math.random() * 0.25, id);
          break;
        }
        case "swish":
          howls.swish.play();
          break;
      }
    },

    setMuted(next) {
      muted = next;
      Howler.mute(muted || document.hidden);
      if (muted) {
        stopLoops();
        return;
      }
      howls ??= load();
      startLoops();
    },

    destroy() {
      document.removeEventListener("visibilitychange", onVisibility);
      if (!howls) return;
      for (const h of Object.values(howls)) h?.unload();
      howls = null;
    },
  };
}
