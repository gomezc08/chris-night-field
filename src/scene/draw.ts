import { COLORS, H, SPOTS, SPOT_KEYS, TOWERS, W } from "./constants";
import type { SceneState } from "./state";

type Ctx = CanvasRenderingContext2D;
type Pt = readonly [number, number];

/** Random scenery generated once per page load. */
export type Scenery = {
  stars: [x: number, y: number, brightness: number][];
  city: { x: number; w: number; h: number; windows: Pt[] }[];
  moths: { tower: 0 | 1; angle: number; radius: number; speed: number }[];
};

// Stars and lit windows are drawn over the darkness overlay, so keep them off solid structures.
const inStructure = (x: number, y: number) =>
  (x >= 606 && x <= 774 && y >= 24) || (x >= 176 && x <= 564 && y >= 66);

export function createScenery(rand: () => number = Math.random): Scenery {
  const stars: Scenery["stars"] = [];
  while (stars.length < 60) {
    const star: Scenery["stars"][number] = [rand() * W, rand() * 80, rand()];
    if (!inStructure(star[0], star[1])) stars.push(star);
  }

  const city: Scenery["city"] = [];
  for (let x = 0; x < W; ) {
    const w = 20 + rand() * 40;
    const h = 12 + rand() * 30;
    const windows: Pt[] = [];
    for (let i = 0; i < 4; i++) {
      const win: Pt = [x + 4 + rand() * (w - 8), 92 - h + 4 + rand() * (h - 8)];
      if (rand() < 0.5 && !inStructure(win[0], win[1])) windows.push(win);
    }
    city.push({ x, w, h, windows });
    x += w + 2;
  }

  const moths = Array.from({ length: 18 }, (_, i) => ({
    tower: (i % 2) as 0 | 1,
    angle: rand() * Math.PI * 2,
    radius: 8 + rand() * 26,
    speed: 0.6 + rand() * 1.4,
  }));

  return { stars, city, moths };
}

// --- Primitives ---------------------------------------------------------------

function line(ctx: Ctx, a: Pt, b: Pt, c?: Pt) {
  ctx.beginPath();
  ctx.moveTo(a[0], a[1]);
  ctx.lineTo(b[0], b[1]);
  if (c) ctx.lineTo(c[0], c[1]);
  ctx.stroke();
}

function roundRect(ctx: Ctx, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  ctx.fill();
}

function dot(ctx: Ctx, x: number, y: number, r: number) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

// --- Static layer (drawn once per resize) ---------------------------------------

/** Everything that never changes: sky, skyline, stands, towers, pitch, bench, bottles, ball bag. */
export function drawStatic(ctx: Ctx, scenery: Scenery) {
  ctx.fillStyle = COLORS.sky;
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = COLORS.city;
  for (const b of scenery.city) ctx.fillRect(b.x, 92 - b.h, b.w, b.h);

  ctx.fillStyle = COLORS.ground;
  ctx.fillRect(0, 92, W, H - 92);

  drawBleachers(ctx);
  drawScoreboardFrame(ctx);
  drawTowerStructures(ctx);
  drawPitch(ctx);
  drawBench(ctx);
  drawBottles(ctx);
  drawBallBag(ctx);
}

function drawBleachers(ctx: Ctx) {
  for (let i = 0; i < 5; i++) {
    const y = 72 + i * 12;
    ctx.fillStyle = i % 2 ? "#161d29" : "#1b2330";
    ctx.fillRect(180, y, 380, 12);
    ctx.fillStyle = "#2b3547";
    ctx.fillRect(180, y, 380, 2.5);
  }
  ctx.strokeStyle = "#3a4558";
  ctx.lineWidth = 1.5;
  line(ctx, [180, 134], [560, 134]);
  for (let x = 180; x <= 560; x += 38) line(ctx, [x, 70], [x, 134]);
}

function drawScoreboardFrame(ctx: Ctx) {
  ctx.strokeStyle = "#2a2f38";
  ctx.lineWidth = 5;
  line(ctx, [640, 100], [640, 140]);
  line(ctx, [740, 100], [740, 140]);
  ctx.fillStyle = "#0b0f14";
  ctx.fillRect(610, 28, 160, 72);
  ctx.strokeStyle = "#2c3440";
  ctx.lineWidth = 2;
  ctx.strokeRect(610, 28, 160, 72);
}

function drawTowerStructures(ctx: Ctx) {
  for (const [x, y] of TOWERS) {
    ctx.strokeStyle = "#2a2f38";
    ctx.lineWidth = 4;
    line(ctx, [x, y + 8], [x, y < 100 ? 140 : 550]);
    ctx.fillStyle = "#1a1f27";
    ctx.fillRect(x - 14, y - 4, 28, 12);
  }
}

/** Half-angle of the penalty arc: the spot is 30 units inside the box, the arc radius is 40. */
const D_ARC = Math.acos(30 / 40);

function drawPitch(ctx: Ctx) {
  for (let i = 0; i < 13; i++) {
    ctx.fillStyle = i % 2 ? COLORS.turfB : COLORS.turfA;
    ctx.fillRect(60 + i * 60, 140, 60, 350);
  }

  ctx.strokeStyle = COLORS.line;
  ctx.lineWidth = 2;
  ctx.strokeRect(60, 140, 780, 350);
  line(ctx, [450, 140], [450, 490]);
  ctx.beginPath();
  ctx.arc(450, 315, 55, 0, Math.PI * 2);
  ctx.stroke();

  // Penalty boxes, six-yard boxes, spots, and arcs at each end.
  for (const s of [1, -1] as const) {
    const gx = s > 0 ? 60 : 840;
    ctx.strokeRect(s > 0 ? 60 : 730, 215, 110, 200);
    ctx.strokeRect(s > 0 ? 60 : 800, 265, 40, 100);
    ctx.fillStyle = "#e8ede8";
    dot(ctx, gx + s * 80, 315, 2);
    // The "D": only the part of the circle outside the box, meeting the 18-yard line exactly.
    ctx.beginPath();
    ctx.arc(gx + s * 80, 315, 40, s > 0 ? -D_ARC : Math.PI - D_ARC, s > 0 ? D_ARC : Math.PI + D_ARC);
    ctx.stroke();
  }

  // Corner arcs.
  for (const [cx, cy, a0] of [
    [60, 140, 0],
    [840, 140, Math.PI / 2],
    [60, 490, (3 * Math.PI) / 2],
    [840, 490, Math.PI],
  ]) {
    ctx.beginPath();
    ctx.arc(cx, cy, 9, a0, a0 + Math.PI / 2);
    ctx.stroke();
  }
}

function drawBench(ctx: Ctx) {
  ctx.fillStyle = "#3b2e22";
  ctx.fillRect(330, 510, 120, 6);
  ctx.fillRect(335, 516, 4, 12);
  ctx.fillRect(441, 516, 4, 12);
  ctx.fillRect(330, 498, 120, 4);
  ctx.fillRect(333, 498, 3, 14);
  ctx.fillRect(444, 498, 3, 14);
}

function drawBottles(ctx: Ctx) {
  for (let i = 0; i < 3; i++) {
    ctx.fillStyle = i === 1 ? "#dfe7ef" : "#3f7fc4";
    ctx.fillRect(460 + i * 8, 508, 6, 14);
    ctx.fillStyle = "#222";
    ctx.fillRect(461 + i * 8, 505, 4, 3);
  }
}

function drawBallBag(ctx: Ctx) {
  ctx.fillStyle = "#1f2a22";
  ctx.beginPath();
  ctx.ellipse(615, 512, 14, 16, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#4d5d52";
  ctx.lineWidth = 1;
  for (let i = -12; i <= 12; i += 6) line(ctx, [615 + i, 498], [615 + i * 0.8, 527]);
  ctx.fillStyle = "#e8ede8";
  for (const [a, b] of [
    [610, 505],
    [620, 508],
    [614, 515],
  ]) {
    dot(ctx, a, b, 3.4);
  }
}

// --- Dynamic world layer (every frame, before lighting) -------------------------

/** Goals, the waving corner flag, and props whose position depends on state. */
export function drawDynamic(ctx: Ctx, state: SceneState, t: number) {
  drawGoal(ctx, 840, 1, state.ripple.R, t);
  drawGoal(ctx, 60, -1, state.ripple.L, t);
  drawCornerFlag(ctx, t);

  if (state.bagOnBench) {
    ctx.fillStyle = COLORS.bag;
    roundRect(ctx, 352, 500, 30, 11, 4);
    ctx.fillStyle = "#5a1e1e";
    ctx.fillRect(360, 498, 14, 3);
  }

  if (!state.boardHeld) {
    ctx.save();
    ctx.translate(296, 500);
    ctx.rotate(-0.18);
    ctx.fillStyle = "#e9ece6";
    ctx.fillRect(-12, -14, 24, 30);
    ctx.strokeStyle = "#5a6a7a";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(-4, -4, 2.5, 0, Math.PI * 2);
    ctx.stroke();
    line(ctx, [2, 2], [7, -6]);
    line(ctx, [2, -6], [7, 2]);
    ctx.restore();
  }

  if (state.ballInBag) {
    ctx.fillStyle = "#e8ede8";
    dot(ctx, 616, 497, 3.6);
  }
}

function drawGoal(ctx: Ctx, x: number, s: 1 | -1, ripple: number, t: number) {
  ctx.strokeStyle = "rgba(220,225,230,.35)";
  ctx.lineWidth = 1;
  for (let i = 0; i <= 8; i++) {
    const y = 275 + i * 10;
    const o = Math.sin(t * 18 + i) * ripple * 4;
    line(ctx, [x, y], [x + s * 30 + o * s, y + 2]);
  }
  for (let j = 0; j <= 6; j++) {
    const xx = x + s * j * 5;
    line(ctx, [xx, 275], [xx + Math.sin(t * 18 + j) * ripple * 3, 355]);
  }
  ctx.strokeStyle = "#f2f4f2";
  ctx.lineWidth = 3;
  line(ctx, [x, 275], [x, 355]);
}

function drawCornerFlag(ctx: Ctx, t: number) {
  ctx.strokeStyle = "#d8dcd8";
  ctx.lineWidth = 2;
  line(ctx, [840, 490], [840, 456]);
  ctx.fillStyle = COLORS.amber;
  const wave = Math.sin(t * 3) * 2;
  ctx.beginPath();
  ctx.moveTo(840, 456);
  ctx.quadraticCurveTo(848, 458 + wave, 856, 461);
  ctx.lineTo(840, 467);
  ctx.fill();
}

/**
 * One soft shadow per lit tower, stretching away from it along the ground.
 * Farther from a tower means a longer shadow. (x, y) is the object's ground contact point.
 */
export function drawLongShadows(ctx: Ctx, x: number, y: number, height: number, towers: number[]) {
  TOWERS.forEach(([tx, ty], i) => {
    const intensity = Math.min(1, towers[i]);
    if (intensity < 0.05) return;
    const dx = x - tx;
    const dy = y - ty;
    const dist = Math.hypot(dx, dy);
    const length = height * (0.6 + dist / 320);
    ctx.save();
    ctx.translate(x, y + 1);
    ctx.rotate(Math.atan2(dy, dx));
    ctx.fillStyle = `rgba(0,0,0,${0.13 * intensity})`;
    ctx.beginPath();
    ctx.ellipse(length / 2, 0, length / 2, Math.max(1.2, height * 0.09), 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });
}

// --- Lighting and overlays (every frame, after the world) -----------------------

export type LightingInput = {
  /** Per-tower intensity, 0 (off) to ~1.2 (overshoot while switching on). */
  towers: number[];
  /** Average field light level, 0–1. */
  level: number;
  t: number;
  dt: number;
};

export function drawLighting(
  ctx: Ctx,
  scenery: Scenery,
  state: SceneState,
  scoreboardName: string,
  { towers, level, t, dt }: LightingInput,
) {
  // Darkness fades as towers come on.
  ctx.fillStyle = `rgba(2,3,6,${Math.max(0.1, 0.94 - 0.84 * level)})`;
  ctx.fillRect(0, 0, W, H);

  // Warm cone from each lit tower toward the pitch.
  ctx.globalCompositeOperation = "lighter";
  TOWERS.forEach(([x, y], i) => {
    if (!towers[i]) return;
    const g = ctx.createRadialGradient(x, y, 4, (x + 450) / 2, (y + 315) / 2, 420);
    g.addColorStop(0, `rgba(255,244,215,${0.16 * towers[i]})`);
    g.addColorStop(1, "rgba(255,244,215,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
  });
  ctx.globalCompositeOperation = "source-over";

  // Stars dim as the field lights up; skyline windows stay warm.
  for (const [x, y, a] of scenery.stars) {
    ctx.fillStyle = `rgba(220,230,255,${0.25 + 0.35 * a * (1 - level * 0.6)})`;
    ctx.fillRect(x, y, 1.2, 1.2);
  }
  ctx.fillStyle = "rgba(245,196,107,.35)";
  for (const b of scenery.city) for (const [wx, wy] of b.windows) ctx.fillRect(wx, wy, 2, 2);

  // Bulbs.
  TOWERS.forEach(([x, y], i) => {
    for (let b = 0; b < 4; b++) {
      ctx.fillStyle = towers[i] > 0.1 ? `rgba(255,248,225,${Math.min(1, towers[i])})` : "#2a2d33";
      ctx.fillRect(x - 11 + b * 6, y - 1, 4, 5);
    }
  });

  drawScoreboardText(ctx, state, scoreboardName, level);

  // Moths around the two top towers once they're properly lit.
  ctx.globalCompositeOperation = "lighter";
  ctx.fillStyle = "rgba(255,240,210,.7)";
  for (const m of scenery.moths) {
    if (towers[m.tower] < 0.5) continue;
    const [tx, ty] = TOWERS[m.tower];
    m.angle += m.speed * dt * 3;
    const mx = tx + Math.cos(m.angle) * m.radius + Math.sin(t * 5 + m.radius) * 3;
    const my = ty + 10 + Math.sin(m.angle * 1.3) * m.radius * 0.6;
    ctx.fillRect(mx, my, 1.6, 1.6);
  }
  ctx.globalCompositeOperation = "source-over";
}

function drawScoreboardText(ctx: Ctx, state: SceneState, name: string, level: number) {
  const glow = Math.min(1, level * 1.5);
  const amber = (base: number, span: number) => `rgba(255,181,71,${base + span * glow})`;

  ctx.textAlign = "center";
  ctx.font = "500 11px monospace";
  ctx.fillStyle = amber(0.25, 0.75);
  ctx.fillText(name, 690, 44);

  ctx.font = "500 26px monospace";
  const blink = state.flash > 0 && Math.floor(state.flash * 6) % 2;
  ctx.fillStyle = blink ? "rgba(255,240,200,1)" : amber(0.25, 0.75);
  ctx.fillText(`${state.homeScore} - 0`, 690, 78);

  ctx.font = "11px monospace";
  ctx.fillStyle = amber(0.2, 0.5);
  ctx.fillText("HOME     GUESTS", 690, 94);
}

/** Dashed outlines for hovered, active, or (with "Show all spots") every spot, plus labels. */
export function drawSpotOutlines(ctx: Ctx, state: SceneState) {
  for (const k of SPOT_KEYS) {
    if (!(state.showAll || k === state.hover || k === state.active)) continue;
    const { rect, section } = SPOTS[k];
    const [a, b, w, h] = rect;

    ctx.strokeStyle = k === state.active ? "rgba(255,181,71,.9)" : "rgba(255,255,255,.55)";
    ctx.setLineDash([4, 4]);
    ctx.lineWidth = 1.2;
    ctx.strokeRect(a - 3, b - 3, w + 6, h + 6);
    ctx.setLineDash([]);

    if (state.showAll && state.showLabels) {
      ctx.font = "11px system-ui, sans-serif";
      ctx.textAlign = "center";
      const lw = ctx.measureText(section).width + 10;
      const lx = Math.min(Math.max(a + w / 2, lw / 2 + 2), W - lw / 2 - 2);
      const ly = b > 400 ? b - 10 : b + h + 14;
      ctx.fillStyle = "rgba(8,12,18,.8)";
      ctx.fillRect(lx - lw / 2, ly - 11, lw, 15);
      ctx.fillStyle = "#e8edf2";
      ctx.fillText(section, lx, ly);
    }
  }
}
