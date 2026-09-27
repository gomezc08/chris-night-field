"use client";

import { Amatic_SC } from "next/font/google";
import { type ReactNode, useEffect, useRef, useState } from "react";

import { SoccerBall } from "./SoccerBall";
import styles from "./start.module.css";

const amatic = Amatic_SC({ weight: ["400", "700"], subsets: ["latin"] });

/** How long the loader takes to count to 100%. */
const LOAD_MS = 2600;

type Phase = "loading" | "ready" | "leaving" | "started";

// Slow start, quick middle, a little hesitation near the end, like a real loader.
const easeInOut = (x: number) => (x < 0.5 ? 2 * x * x : 1 - (-2 * x + 2) ** 2 / 2);

/**
 * Black loading screen with a spinning ball and a percentage, then a START button.
 * The field (children) mounts only after START, so its floodlight intro plays from black.
 */
export function StartScreen({ children }: { children: ReactNode }) {
  const [phase, setPhase] = useState<Phase>("loading");
  const [percent, setPercent] = useState(0);
  const startRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    let raf = 0;
    const begin = performance.now();
    const tick = (now: number) => {
      const k = Math.min(1, (now - begin) / LOAD_MS);
      setPercent(Math.floor(easeInOut(k) * 100));
      if (k < 1) raf = requestAnimationFrame(tick);
      else setPhase("ready");
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    if (phase === "ready") startRef.current?.focus({ preventScroll: true });
  }, [phase]);

  function start() {
    setPhase("leaving");
    // Backstop in case the fade's transitionend never fires (e.g. a background tab).
    setTimeout(() => setPhase("started"), 900);
  }

  return (
    <>
      {(phase === "leaving" || phase === "started") && children}
      {phase !== "started" && (
        <div
          className={`${styles.screen} ${amatic.className} ${phase === "leaving" ? styles.leaving : ""}`}
          onTransitionEnd={(e) => {
            if (e.target === e.currentTarget && phase === "leaving") setPhase("started");
          }}
        >
          {phase === "loading" ? (
            <div className={styles.loader} role="status" aria-live="polite">
              <SoccerBall className={styles.ball} />
              <p className={styles.caption}>Warming up the floodlights… {percent}%</p>
            </div>
          ) : (
            <button ref={startRef} type="button" className={styles.start} onClick={start}>
              Start
            </button>
          )}
        </div>
      )}
    </>
  );
}
