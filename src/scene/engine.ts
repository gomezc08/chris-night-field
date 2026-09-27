import { ballGroundY, createBall, drawBall, updateBall } from "./ball";
import {
  CENTER,
  FLICKER_TOWER,
  H,
  INTRO_FIRST_TOWER,
  INTRO_RAMP,
  INTRO_TOWER_GAP,
  type SpotKey,
  TOWERS,
  W,
} from "./constants";
import { createDirector, type DirectorEvents } from "./director";
import {
  createScenery,
  drawDynamic,
  drawLighting,
  drawLongShadows,
  drawSpotOutlines,
  drawStatic,
} from "./draw";
import { stickFigure } from "./player/stickFigure";
import type { PlayerRenderer, PlayerState } from "./player/types";
import { type Bounds, fitDesign, visibleBounds } from "./layout";
import { createSceneState, type SceneState } from "./state";
import { createTeammate } from "./teammate";

/** Things worth a sound. The scene only reports them; playing audio is someone else's job. */
export type SceneSound =
  { type: "tower"; index: number } | { type: "touch"; strength: number } | { type: "swish" };

export type NightFieldOptions = DirectorEvents & {
  scoreboardName: string;
  /** How the player is drawn. Defaults to the procedural stick figure. */
  playerRenderer?: PlayerRenderer;
  /** Start with the floodlights already on (mobile hero). */
  skipIntro?: boolean;
  onSound?: (sound: SceneSound) => void;
};

export type NightField = {
  state: SceneState;
  /** Ask the player to go to a spot. Ignored mid-routine; the panel opens via onOpen when he's done. */
  select: (key: SpotKey) => void;
  /** Close the open panel; he puts things back and returns to center. */
  close: () => void;
  setHover: (key: SpotKey | null) => void;
  /** Outline every spot; labels can be turned off where they'd be too small to read. */
  setShowAll: (on: boolean, labels?: boolean) => void;
  setScoreboardName: (name: string) => void;
  destroy: () => void;
};

/** The corner-kick teammate wears light blue so he reads as someone else. */
const TEAMMATE_TINT = "#9fd4ff";

/** Seconds of lightTime at which every tower is fully on. */
const LIT = INTRO_FIRST_TOWER + TOWERS.length * INTRO_TOWER_GAP + INTRO_RAMP;
const DRIBBLE_TOUCH_EVERY = 0.33;

/**
 * Mounts the night field on a canvas of any size. The design is fitted and centered
 * (see layout.ts) and the scenery extends to the canvas edges. The backing store
 * matches the displayed size × devicePixelRatio.
 */
export function createNightField(
  canvas: HTMLCanvasElement,
  options: NightFieldOptions,
): NightField {
  const ctx = canvas.getContext("2d")!;
  const state = createSceneState();
  const scenery = createScenery();
  const renderPlayer = options.playerRenderer ?? stickFigure;
  const emit = (s: SceneSound) => options.onSound?.(s);
  let scoreboardName = options.scoreboardName;

  const player: PlayerState = { x: CENTER[0], y: CENTER[1], facing: 1, pose: "juggle" };
  const ball = createBall();
  const teammate = createTeammate();
  const director = createDirector(
    state,
    player,
    ball,
    { onOpen: (key) => options.onOpen(key), onHide: () => options.onHide() },
    teammate,
  );

  // Cached static layer, redrawn whenever its size is out of date.
  const staticLayer = document.createElement("canvas");
  const staticCtx = staticLayer.getContext("2d")!;

  let fit = fitDesign(W, H);
  let bounds: Bounds = { left: 0, top: 0, right: W, bottom: H };
  let dpr = 1;

  /** Design units → device pixels. */
  const applyTransform = (c: CanvasRenderingContext2D) =>
    c.setTransform(fit.scale * dpr, 0, 0, fit.scale * dpr, fit.ox * dpr, fit.oy * dpr);

  function resize() {
    const cssW = canvas.clientWidth || W;
    const cssH = canvas.clientHeight || H;
    dpr = window.devicePixelRatio || 1;
    fit = fitDesign(cssW, cssH);
    bounds = visibleBounds(fit, cssW, cssH);
    const pxW = Math.round(cssW * dpr);
    const pxH = Math.round(cssH * dpr);
    // Compare against the static layer, not the canvas: a new engine on a canvas that an
    // earlier engine already sized must still draw its own background.
    if (staticLayer.width === pxW && staticLayer.height === pxH) return;
    canvas.width = staticLayer.width = pxW;
    canvas.height = staticLayer.height = pxH;
    applyTransform(staticCtx);
    drawStatic(staticCtx, scenery, bounds);
  }

  const observer = new ResizeObserver(resize);
  observer.observe(canvas);
  resize();

  // --- Clock and floodlights -------------------------------------------------

  let t = 0; // scene time
  let lightTime = options.skipIntro ? LIT : 0; // drives the intro
  let flicker = 1;
  let flickerTimer = 0;
  const towerWasOn = TOWERS.map(() => lightTime > 0);

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

  // --- Sound cues ----------------------------------------------------------------

  let lastJuggleSin = 0;
  let dribbleTimer = 0;
  let lastBallMode = ball.mode;
  let lastRipple = 0;

  function detectSounds(dt: number) {
    TOWERS.forEach((_, i) => {
      const on = lightTime >= INTRO_FIRST_TOWER + i * INTRO_TOWER_GAP;
      if (on && !towerWasOn[i]) emit({ type: "tower", index: i });
      towerWasOn[i] = on;
    });

    if (ball.mode === "juggle") {
      // The ball meets his foot each time sin(4t) crosses zero.
      const s = Math.sin(t * 4);
      if (Math.sign(s) !== Math.sign(lastJuggleSin)) emit({ type: "touch", strength: 0.5 });
      lastJuggleSin = s;
    }

    if (ball.mode === "foot" && (player.pose === "run" || player.pose === "walk")) {
      dribbleTimer -= dt;
      if (dribbleTimer <= 0) {
        emit({ type: "touch", strength: 0.35 });
        dribbleTimer = DRIBBLE_TOUCH_EVERY;
      }
    }

    if (ball.mode === "fly" && lastBallMode !== "fly") emit({ type: "touch", strength: 1 });
    lastBallMode = ball.mode;

    const ripple = Math.max(state.ripple.L, state.ripple.R);
    if (ripple > lastRipple + 0.5) emit({ type: "swish" });
    lastRipple = ripple;
  }

  // --- Frame loop --------------------------------------------------------------

  let raf = 0;
  let last: number | null = null;

  function frame(now: number) {
    raf = requestAnimationFrame(frame);
    const dt = last === null ? 0 : Math.min(0.05, (now - last) / 1000);
    last = now;
    t += dt;
    lightTime += dt;

    updateFlicker(dt);
    director.update(dt, lightTime);
    state.ripple.L = Math.max(0, state.ripple.L - dt * 1.2);
    state.ripple.R = Math.max(0, state.ripple.R - dt * 1.2);
    state.flash = Math.max(0, state.flash - dt);
    updateBall(ball, player, t, dt);
    detectSounds(dt);

    const towers = TOWERS.map((_, i) => towerIntensity(i));
    const level = towers.reduce((a, b) => a + b, 0) / towers.length;

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.drawImage(staticLayer, 0, 0);

    applyTransform(ctx);
    drawDynamic(ctx, state, t);
    if (player.pose !== "sit") drawLongShadows(ctx, player.x, player.y, 30, towers);
    if (teammate.visible) {
      const faded = towers.map((v) => v * teammate.alpha);
      drawLongShadows(ctx, teammate.x, teammate.y, 30, faded);
    }
    if (ball.mode !== "hidden") drawLongShadows(ctx, ball.x, ballGroundY(ball, player), 5, towers);
    drawBall(ctx, ball, player);

    // Whoever is further up the pitch is drawn first, so the nearer figure overlaps.
    const drawChris = () => renderPlayer.draw(ctx, { ...player, hasBag: state.bagOnBack }, t);
    const drawTeammate = () => {
      if (!teammate.visible) return;
      ctx.globalAlpha = teammate.alpha;
      renderPlayer.draw(ctx, { ...teammate, hasBag: false, tint: TEAMMATE_TINT }, t);
      ctx.globalAlpha = 1;
    };
    if (teammate.y < player.y) {
      drawTeammate();
      drawChris();
    } else {
      drawChris();
      drawTeammate();
    }

    drawLighting(ctx, scenery, state, scoreboardName, { towers, level, t, dt, bounds });
    drawSpotOutlines(ctx, state);
  }
  raf = requestAnimationFrame(frame);

  // --- Public API --------------------------------------------------------------

  return {
    state,
    select: (key) => void director.select(key),
    close: () => void director.close(),
    setHover: (key) => {
      state.hover = key;
    },
    setShowAll: (on, labels = true) => {
      state.showAll = on;
      state.showLabels = labels;
    },
    setScoreboardName: (name) => {
      scoreboardName = name;
    },
    destroy: () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
    },
  };
}
