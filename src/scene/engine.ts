import {
  FLICKER_TOWER,
  H,
  INTRO_FIRST_TOWER,
  INTRO_RAMP,
  INTRO_TOWER_GAP,
  SPOTS,
  SPOT_KEYS,
  type SpotKey,
  TOWERS,
  W,
} from "./constants";
import { createScenery, drawDynamic, drawLighting, drawSpotOutlines, drawStatic } from "./draw";
import { createSceneState, type SceneState } from "./state";

export type NightFieldOptions = {
  scoreboardName: string;
};

export type NightField = {
  state: SceneState;
  /** Converts a pointer position to design space and returns the spot under it, if any. */
  hitTest: (clientX: number, clientY: number) => SpotKey | null;
  setScoreboardName: (name: string) => void;
  destroy: () => void;
};

/**
 * Mounts the night field on a canvas. The canvas is sized by CSS; the engine
 * matches its backing store to the displayed size × devicePixelRatio.
 */
export function createNightField(canvas: HTMLCanvasElement, options: NightFieldOptions): NightField {
  const ctx = canvas.getContext("2d")!;
  const state = createSceneState();
  const scenery = createScenery();
  let scoreboardName = options.scoreboardName;

  // Cached static layer, redrawn only when the canvas resizes.
  const staticLayer = document.createElement("canvas");
  const staticCtx = staticLayer.getContext("2d")!;

  let scale = 1; // CSS px per design unit
  let dpr = 1;

  function resize() {
    const cssW = canvas.clientWidth || W;
    dpr = window.devicePixelRatio || 1;
    scale = cssW / W;
    const pxW = Math.round(cssW * dpr);
    const pxH = Math.round(((cssW * H) / W) * dpr);
    if (canvas.width === pxW && canvas.height === pxH) return;
    canvas.width = staticLayer.width = pxW;
    canvas.height = staticLayer.height = pxH;
    staticCtx.setTransform(scale * dpr, 0, 0, scale * dpr, 0, 0);
    drawStatic(staticCtx, scenery);
  }

  const observer = new ResizeObserver(resize);
  observer.observe(canvas);
  resize();

  // --- Clock and floodlights -------------------------------------------------

  let t = 0; // scene time
  let lightTime = 0; // time since load, drives the intro
  let flicker = 1;
  let flickerTimer = 0;

  function towerIntensity(i: number) {
    const on = INTRO_FIRST_TOWER + i * INTRO_TOWER_GAP;
    if (lightTime < on) return 0;
    const k = Math.min(1, (lightTime - on) / INTRO_RAMP);
    // Small overshoot flash while the bank switches on.
    let v = k < 1 ? k * 1.2 : 1;
    if (i === FLICKER_TOWER) v *= flicker;
    return v;
  }

  function updateFlicker(dt: number) {
    flickerTimer -= dt;
    if (flickerTimer > 0) return;
    flicker = Math.random() < 0.25 ? 0.25 + Math.random() * 0.4 : 1;
    flickerTimer = flicker < 1 ? 0.06 + Math.random() * 0.1 : 0.3 + Math.random() * 2.5;
  }

  // --- Frame loop --------------------------------------------------------------

  let raf = 0;
  let last: number | null = null;

  function frame(now: number) {
    const dt = last === null ? 0 : Math.min(0.05, (now - last) / 1000);
    last = now;
    t += dt;
    lightTime += dt;

    updateFlicker(dt);
    state.ripple.L = Math.max(0, state.ripple.L - dt * 1.2);
    state.ripple.R = Math.max(0, state.ripple.R - dt * 1.2);
    state.flash = Math.max(0, state.flash - dt);

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.drawImage(staticLayer, 0, 0);

    ctx.setTransform(scale * dpr, 0, 0, scale * dpr, 0, 0);
    drawDynamic(ctx, state, t);
    // Stage 3: the ball and player draw here, between the props and the lighting.

    const towers = TOWERS.map((_, i) => towerIntensity(i));
    const level = towers.reduce((a, b) => a + b, 0) / towers.length;
    drawLighting(ctx, scenery, state, scoreboardName, { towers, level, t, dt });
    drawSpotOutlines(ctx, state);

    raf = requestAnimationFrame(frame);
  }
  raf = requestAnimationFrame(frame);

  // --- Public API --------------------------------------------------------------

  function hitTest(clientX: number, clientY: number) {
    const r = canvas.getBoundingClientRect();
    const x = (clientX - r.left) / scale;
    const y = (clientY - r.top) / scale;
    for (const k of SPOT_KEYS) {
      const [a, b, w, h] = SPOTS[k].rect;
      if (x >= a && x <= a + w && y >= b && y <= b + h) return k;
    }
    return null;
  }

  return {
    state,
    hitTest,
    setScoreboardName: (name) => {
      scoreboardName = name;
    },
    destroy: () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
    },
  };
}
