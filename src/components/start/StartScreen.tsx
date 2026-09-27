"use client";

import { Amatic_SC } from "next/font/google";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { SoccerBall } from "./SoccerBall";
import styles from "./start.module.css";

const amatic = Amatic_SC({ weight: ["400", "700"], subsets: ["latin"] });

/** How long the loader takes to count to 100%. */
const LOAD_MS = 2600;
/** Once the loader has played in this tab, coming back to the start screen skips it. */
const SEEN_KEY = "night-field:loader-seen";

// Slow start, quick middle, a little hesitation near the end, like a real loader.
const easeInOut = (x: number) => (x < 0.5 ? 2 * x * x : 1 - (-2 * x + 2) ** 2 / 2);

function loaderSeen() {
  try {
    return sessionStorage.getItem(SEEN_KEY) === "1";
  } catch {
    return false;
  }
}

/**
 * Black loading screen with a spinning ball and a percentage, then START (the field)
 * and About. The field page starts pitch black, so the handoff is seamless.
 */
export function StartScreen() {
  const [ready, setReady] = useState(false);
  const [percent, setPercent] = useState(0);
  const startRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    let raf = 0;
    if (loaderSeen()) {
      // Already watched it this visit: go straight to START on the next frame.
      raf = requestAnimationFrame(() => setReady(true));
      return () => cancelAnimationFrame(raf);
    }
    const begin = performance.now();
    const tick = (now: number) => {
      const k = Math.min(1, (now - begin) / LOAD_MS);
      setPercent(Math.floor(easeInOut(k) * 100));
      if (k < 1) {
        raf = requestAnimationFrame(tick);
        return;
      }
      try {
        sessionStorage.setItem(SEEN_KEY, "1");
      } catch {
        // Storage blocked: the loader just plays again next time.
      }
      setReady(true);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    if (ready) startRef.current?.focus({ preventScroll: true });
  }, [ready]);

  return (
    <div className={`${styles.screen} ${amatic.className}`}>
      {ready ? (
        <nav className={styles.menu} aria-label="Start">
          <Link ref={startRef} href="/field" className={styles.start}>
            Start
          </Link>
          <Link href="/about" className={styles.about}>
            About
          </Link>
        </nav>
      ) : (
        <div className={styles.loader} role="status" aria-live="polite">
          <SoccerBall className={styles.ball} />
          <p className={styles.caption}>Warming up the floodlights… {percent}%</p>
        </div>
      )}
    </div>
  );
}
