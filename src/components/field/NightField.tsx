"use client";

import { Amatic_SC } from "next/font/google";
import { type ReactNode, useCallback, useEffect, useRef, useState } from "react";

import { H, SPOTS, type SpotKey, W } from "@/scene/constants";
import { createNightField, type NightField as Engine } from "@/scene/engine";
import { type Fit, fitDesign } from "@/scene/layout";
import { useSound } from "@/components/sound/SoundProvider";

import styles from "./field.module.css";
import { EyeIcon } from "./icons";
import { useMediaQuery } from "./useMediaQuery";

type Props = {
  scoreboardName: string;
  /** Rendered panel content for each spot. The scene never sees the data behind it. */
  panels: Record<SpotKey, ReactNode>;
};

type Tip = { key: SpotKey; x: number; y: number };

/** Tab order follows the /press section order, not the layout. */
const TAB_ORDER: SpotKey[] = [
  "stands", // About me
  "goalR",
  "score",
  "board",
  "ballbag",
  "flag",
  "goalL",
  "bag", // Accomplishments
];

const MOBILE = "(max-width: 700px)";

const amatic = Amatic_SC({ weight: ["700"], subsets: ["latin"] });

/** The "where do I click?" hint waits for the floodlights, then shows once per session. */
const HINT_DELAY_MS = 3500;
const HINT_KEY = "night-field:hint-seen";

function hintSeen() {
  try {
    return sessionStorage.getItem(HINT_KEY) === "1";
  } catch {
    return false;
  }
}

function markHintSeen() {
  try {
    sessionStorage.setItem(HINT_KEY, "1");
  } catch {
    // Storage blocked: the hint may show again next visit.
  }
}

export function NightField({ scoreboardName, panels }: Props) {
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const engineRef = useRef<Engine | null>(null);
  const spotRefs = useRef<Partial<Record<SpotKey, HTMLButtonElement | null>>>({});
  /** The spot whose button should get focus back when the panel closes. */
  const returnFocusTo = useRef<SpotKey | null>(null);

  const [active, setActive] = useState<SpotKey | null>(null);
  // Keeps the last panel's content on screen while the panel fades out.
  const [shown, setShown] = useState<SpotKey | null>(null);
  const [showAllPref, setShowAll] = useState(false);
  const [tip, setTip] = useState<Tip | null>(null);
  const [hint, setHint] = useState(false);
  const { play } = useSound();
  // Where the design sits in the full-window stage; spot buttons and chips follow it.
  const [fit, setFit] = useState<Fit>(() => fitDesign(W, H));

  const isMobile = useMediaQuery(MOBILE);
  // On phones the spots are too small to discover by hovering, so labels are always on.
  const showAll = showAllPref || isMobile;

  useEffect(() => {
    const stage = stageRef.current!;
    const measure = () => setFit(fitDesign(stage.clientWidth, stage.clientHeight));
    const observer = new ResizeObserver(measure);
    observer.observe(stage);
    return () => observer.disconnect();
  }, []);

  // First visit this session: once the floodlights are up, point at the eye button.
  useEffect(() => {
    if (window.matchMedia(MOBILE).matches || hintSeen()) return;
    const timer = setTimeout(() => setHint(true), HINT_DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  function dismissHint() {
    setHint(false);
    markHintSeen();
  }

  useEffect(() => {
    const engine = createNightField(canvasRef.current!, {
      scoreboardName,
      skipIntro: window.matchMedia(MOBILE).matches,
      // The player walks over first; the panel opens when his routine ends.
      onOpen: (key) => {
        setActive(key);
        setShown(key);
      },
      onHide: () => setActive(null),
      onSound: play,
    });
    engineRef.current = engine;
    return () => {
      engine.destroy();
      engineRef.current = null;
    };
    // The engine is created once; later prop changes are synced below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => engineRef.current?.setScoreboardName(scoreboardName), [scoreboardName]);
  // Canvas labels would be ~4px tall on a phone, so there the chips below the field name the spots.
  useEffect(() => engineRef.current?.setShowAll(showAll, !isMobile), [showAll, isMobile]);

  // Focus moves into the panel when it opens and back to its spot when it closes.
  useEffect(() => {
    if (active) {
      panelRef.current?.focus({ preventScroll: true });
    } else if (returnFocusTo.current && panelRef.current?.contains(document.activeElement)) {
      spotRefs.current[returnFocusTo.current]?.focus({ preventScroll: true });
    }
  }, [active]);

  const close = useCallback(() => engineRef.current?.close(), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [close]);

  function select(key: SpotKey) {
    dismissHint();
    returnFocusTo.current = key;
    engineRef.current?.select(key);
  }

  function hover(key: SpotKey | null, tipAt?: { x: number; y: number }) {
    engineRef.current?.setHover(key);
    setTip(key && tipAt ? { key, ...tipAt } : null);
  }

  /** Tooltip follows the pointer, clamped so it stays inside the scene. */
  function tipAtPointer(e: React.PointerEvent) {
    const r = stageRef.current!.getBoundingClientRect();
    return { x: Math.min(e.clientX - r.left + 12, r.width - 170), y: e.clientY - r.top + 14 };
  }

  /** Keyboard focus has no pointer, so anchor the tooltip next to the spot. */
  function tipAtSpot(key: SpotKey) {
    const width = stageRef.current!.clientWidth;
    const [x, y, , h] = SPOTS[key].rect;
    const { scale, ox, oy } = fit;
    const top = oy + (y > 400 ? (y - 26) * scale : (y + h + 6) * scale);
    return { x: Math.min(Math.max(ox + x * scale, 4), width - 170), y: top };
  }

  /** Keep Tab inside the open panel. */
  function trapFocus(e: React.KeyboardEvent) {
    if (e.key !== "Tab" || !panelRef.current) return;
    const focusable = panelRef.current.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
    );
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const current = document.activeElement;
    if (e.shiftKey && (current === first || current === panelRef.current)) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && current === last) {
      e.preventDefault();
      first.focus();
    }
  }

  const panel = shown ? SPOTS[shown] : null;

  return (
    <>
      <div ref={stageRef} className={styles.stage}>
        <canvas
          ref={canvasRef}
          className={styles.canvas}
          // Spots are buttons layered on top, so any click that reaches the canvas is empty field.
          onClick={close}
          aria-hidden
        />

        <ul className={styles.spots} aria-label="Sections on the field">
          {TAB_ORDER.map((key) => {
            const { rect, section, object } = SPOTS[key];
            const [x, y, w, h] = rect;
            return (
              <li key={key}>
                <button
                  ref={(el) => {
                    spotRefs.current[key] = el;
                  }}
                  type="button"
                  className={styles.spot}
                  style={{
                    left: fit.ox + x * fit.scale,
                    top: fit.oy + y * fit.scale,
                    width: w * fit.scale,
                    height: h * fit.scale,
                  }}
                  aria-label={`${section}: ${object.toLowerCase()}`}
                  aria-expanded={active === key}
                  aria-controls="field-panel"
                  onClick={() => select(key)}
                  onPointerEnter={(e) => e.pointerType === "mouse" && hover(key, tipAtPointer(e))}
                  onPointerMove={(e) => e.pointerType === "mouse" && hover(key, tipAtPointer(e))}
                  onPointerLeave={() => hover(null)}
                  onFocus={(e) => e.target.matches(":focus-visible") && hover(key, tipAtSpot(key))}
                  onBlur={() => hover(null)}
                />
              </li>
            );
          })}
        </ul>

        <div
          className={styles.tip}
          style={tip ? { left: tip.x, top: tip.y, opacity: 1 } : { opacity: 0 }}
          aria-hidden
        >
          {tip && `${SPOTS[tip.key].object} · ${SPOTS[tip.key].section}`}
        </div>

        <aside
          id="field-panel"
          ref={panelRef}
          role="dialog"
          aria-labelledby="field-panel-title"
          tabIndex={-1}
          className={`${styles.panel} ${active ? styles.panelOpen : ""}`}
          aria-hidden={!active}
          inert={!active}
          onKeyDown={trapFocus}
        >
          <header className={styles.panelHead}>
            <div>
              <h2 id="field-panel-title" className={styles.panelTitle}>
                {panel?.section}
              </h2>
              <p className={styles.panelSub}>{panel?.object}</p>
            </div>
            <button type="button" className={styles.close} onClick={close} aria-label="Close panel">
              ×
            </button>
          </header>
          {/* Keyed so switching spots resets scroll and any expanded state. */}
          <div key={shown ?? "none"} className={styles.panelBody}>
            {shown && panels[shown]}
          </div>
        </aside>

        <div className={styles.controls}>
          {!isMobile && (
            <button
              type="button"
              className={styles.iconButton}
              onClick={() => {
                dismissHint();
                setShowAll((v) => !v);
              }}
              aria-pressed={showAllPref}
              aria-label="Show all spots"
              title={showAllPref ? "Hide spots" : "Show all spots"}
            >
              <EyeIcon off={!showAllPref} />
            </button>
          )}
        </div>

        {hint && !isMobile && (
          <div className={`${styles.hint} ${amatic.className}`} role="note">
            <p>Not sure where to start?</p>
            <p>Tap here to see every spot</p>
            <svg className={styles.hintArrow} viewBox="0 0 60 90" aria-hidden>
              <path d="M30 4 C 12 30, 44 52, 30 80" />
              <path d="M18 68 L30 82 L42 68" />
            </svg>
          </div>
        )}

        {isMobile && (
          <nav
            className={styles.chips}
            style={{ top: fit.oy + H * fit.scale + 12 }}
            aria-label="Sections"
          >
            {TAB_ORDER.map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => select(key)}
                aria-pressed={active === key}
              >
                {SPOTS[key].section}
              </button>
            ))}
          </nav>
        )}
      </div>
    </>
  );
}
