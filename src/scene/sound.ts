import { Howl, Howler } from "howler";

import type { SceneSound } from "./engine";

export type Soundboard = {
  /** Plays a cue from the scene. Ignored while muted. */
  play: (sound: SceneSound) => void;
  setMuted: (muted: boolean) => void;
  destroy: () => void;
};

const src = (name: string) => [`/sounds/${name}.wav`];

const MUSIC_VOLUME = 0.45;
const TOUCH_VOLUME = 0.16;

/**
 * All site audio: a late-night music loop with quiet scene effects on top. Nothing
 * downloads until the first unmute. `ambientTrackUrl` is Chris's own track from Site
 * settings; when present it replaces the built-in loop. Browsers block audio until
 * the visitor interacts, so the music starts on their first click or key press.
 */
export function createSoundboard(ambientTrackUrl?: string | null): Soundboard {
  let muted = true;
  let howls: ReturnType<typeof load> | null = null;

  function load() {
    // If the browser blocked playback, try again as soon as audio is unlocked.
    const retryOnUnlock = () => music.once("unlock", () => !muted && startMusic());
    const music = ambientTrackUrl
      ? // html5 streams a long uploaded file instead of decoding it all up front.
        new Howl({
          src: [ambientTrackUrl],
          loop: true,
          volume: 0,
          html5: true,
          onplayerror: retryOnUnlock,
        })
      : new Howl({ src: src("night"), loop: true, volume: 0, onplayerror: retryOnUnlock });
    return {
      thunk: new Howl({ src: src("thunk"), volume: 0.22 }),
      touch: new Howl({ src: src("touch"), volume: TOUCH_VOLUME }),
      swish: new Howl({ src: src("swish"), volume: 0.3 }),
      music,
    };
  }

  function startMusic() {
    if (!howls) return;
    if (!howls.music.playing()) howls.music.play();
    howls.music.fade(howls.music.volume(), MUSIC_VOLUME, 1500);
  }

  function stopMusic() {
    howls?.music.pause();
  }

  // Go quiet when the tab is in the background.
  const onVisibility = () => Howler.mute(document.hidden || muted);
  document.addEventListener("visibilitychange", onVisibility);

  return {
    play(sound) {
      if (muted || !howls) return;

      switch (sound.type) {
        case "tower":
          howls.thunk.rate(0.9 + Math.random() * 0.2);
          howls.thunk.play();
          break;
        case "touch": {
          const id = howls.touch.play();
          howls.touch.volume(TOUCH_VOLUME * sound.strength, id);
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
        stopMusic();
        return;
      }
      howls ??= load();
      startMusic();
    },

    destroy() {
      document.removeEventListener("visibilitychange", onVisibility);
      if (!howls) return;
      for (const h of Object.values(howls)) h?.unload();
      howls = null;
    },
  };
}
