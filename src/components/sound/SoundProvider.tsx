"use client";

import { usePathname } from "next/navigation";
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useSyncExternalStore,
} from "react";

import { MusicIcon } from "@/components/field/icons";
import type { SceneSound } from "@/scene/engine";
import { createSoundboard, type Soundboard } from "@/scene/sound";

import styles from "./sound.module.css";

type SoundContext = {
  /** The visitor's music preference (on by default). */
  on: boolean;
  toggle: () => void;
  /** Scene effects; silent whenever music is off. */
  play: (cue: SceneSound) => void;
};

const Context = createContext<SoundContext>({ on: false, toggle: () => {}, play: () => {} });

export const useSound = () => useContext(Context);

// --- Preference: on by default, remembered once someone turns it off. -------------

const PREF_KEY = "night-field:music";
const PREF_EVENT = "night-field:music-pref";

function readPref() {
  try {
    return localStorage.getItem(PREF_KEY) !== "off";
  } catch {
    return true;
  }
}

function subscribePref(onChange: () => void) {
  window.addEventListener(PREF_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(PREF_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

function writePref(on: boolean) {
  try {
    localStorage.setItem(PREF_KEY, on ? "on" : "off");
  } catch {
    // Storage blocked: the choice lasts until the page reloads.
  }
  window.dispatchEvent(new Event(PREF_EVENT));
}

/** Studio is the editing dashboard, so no music (or button) there. */
const isQuietPage = (path: string) => path.startsWith("/studio");

/**
 * Owns the one soundboard for the whole site. It lives in the root layout, so the
 * music keeps playing (without restarting) as visitors move between pages.
 */
export function SoundProvider({
  ambientTrackUrl,
  children,
}: {
  ambientTrackUrl?: string | null;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const quiet = isQuietPage(pathname);
  const on = useSyncExternalStore(subscribePref, readPref, () => true);
  const boardRef = useRef<Soundboard | null>(null);

  useEffect(() => {
    const board = createSoundboard(ambientTrackUrl);
    boardRef.current = board;
    return () => {
      board.destroy();
      boardRef.current = null;
    };
  }, [ambientTrackUrl]);

  useEffect(() => boardRef.current?.setMuted(!on || quiet), [on, quiet, ambientTrackUrl]);

  const toggle = useCallback(() => writePref(!readPref()), []);
  const play = useCallback((cue: SceneSound) => boardRef.current?.play(cue), []);

  return (
    <Context.Provider value={{ on, toggle, play }}>
      {children}
      {!quiet && (
        <button
          type="button"
          className={styles.music}
          onClick={toggle}
          aria-pressed={on}
          aria-label="Music"
          title={on ? "Turn music off" : "Turn music on"}
        >
          <MusicIcon off={!on} />
        </button>
      )}
    </Context.Provider>
  );
}
