"use client";

import { type ReactNode, useCallback, useEffect, useRef, useState } from "react";

import { SPOTS, type SpotKey } from "@/scene/constants";
import { createNightField, type NightField as Engine } from "@/scene/engine";

import styles from "./field.module.css";

type Props = {
  scoreboardName: string;
  /** Rendered panel content for each spot. The scene never sees the data behind it. */
  panels: Record<SpotKey, ReactNode>;
};

type Tip = { key: SpotKey; x: number; y: number };

export function NightField({ scoreboardName, panels }: Props) {
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<Engine | null>(null);

  const [active, setActive] = useState<SpotKey | null>(null);
  // Keeps the last panel's content on screen while the panel fades out.
  const [shown, setShown] = useState<SpotKey | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [tip, setTip] = useState<Tip | null>(null);

  useEffect(() => {
    const engine = createNightField(canvasRef.current!, { scoreboardName });
    engineRef.current = engine;
    return () => {
      engine.destroy();
      engineRef.current = null;
    };
    // The engine is created once; the scoreboard name is synced below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => engineRef.current?.setScoreboardName(scoreboardName), [scoreboardName]);

  useEffect(() => {
    const engine = engineRef.current;
    if (!engine) return;
    engine.state.active = active;
    engine.state.showAll = showAll;
  }, [active, showAll]);

  const open = useCallback((key: SpotKey) => {
    setActive(key);
    setShown(key);
  }, []);

  const close = useCallback(() => setActive(null), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [close]);

  function onPointerMove(e: React.PointerEvent<HTMLCanvasElement>) {
    const engine = engineRef.current;
    if (!engine) return;
    const key = engine.hitTest(e.clientX, e.clientY);
    engine.state.hover = key;
    if (!key) return setTip(null);
    const r = stageRef.current!.getBoundingClientRect();
    const x = e.clientX - r.left;
    setTip({ key, x: Math.min(x + 12, r.width - 170), y: e.clientY - r.top + 14 });
  }

  function onPointerLeave() {
    if (engineRef.current) engineRef.current.state.hover = null;
    setTip(null);
  }

  function onClick(e: React.MouseEvent<HTMLCanvasElement>) {
    const key = engineRef.current?.hitTest(e.clientX, e.clientY);
    if (key) open(key);
    else close();
  }

  const panel = shown ? SPOTS[shown] : null;

  return (
    <div ref={stageRef} className={styles.stage}>
      <canvas
        ref={canvasRef}
        className={styles.canvas}
        style={{ cursor: tip ? "pointer" : "default" }}
        onPointerMove={onPointerMove}
        onPointerLeave={onPointerLeave}
        onClick={onClick}
        aria-label="A night soccer field under floodlights. Objects around the field open sections of the portfolio."
        role="img"
      />

      <div
        className={styles.tip}
        style={tip ? { left: tip.x, top: tip.y, opacity: 1 } : { opacity: 0 }}
        aria-hidden
      >
        {tip && `${SPOTS[tip.key].object} · ${SPOTS[tip.key].section}`}
      </div>

      <aside
        className={`${styles.panel} ${active ? styles.panelOpen : ""}`}
        aria-label={panel?.section}
        aria-hidden={!active}
        inert={!active}
      >
        <header className={styles.panelHead}>
          <div>
            <h2 className={styles.panelTitle}>{panel?.section}</h2>
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
        <button type="button" onClick={() => setShowAll((v) => !v)} aria-pressed={showAll}>
          {showAll ? "Hide spots" : "Show all spots"}
        </button>
      </div>
    </div>
  );
}
