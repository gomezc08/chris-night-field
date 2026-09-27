import type { PlayerState } from "./player/types";

/**
 * The teammate who appears for the corner kick. He moves on his own (in parallel
 * with Chris's step queue), fading in when he arrives and out when he leaves.
 */
export type Teammate = PlayerState & {
  visible: boolean;
  /** 0–1, for fading in from and out to "nowhere". */
  alpha: number;
  target: readonly [number, number] | null;
  speed: number;
  leaving: boolean;
};

const FADE_PER_SECOND = 2.5;

export function createTeammate(): Teammate {
  return {
    x: 0,
    y: 0,
    facing: 1,
    pose: "stand",
    visible: false,
    alpha: 0,
    target: null,
    speed: 175,
    leaving: false,
  };
}

/** Appear at `from` and run to `to`. */
export function arrive(
  tm: Teammate,
  from: readonly [number, number],
  to: readonly [number, number],
) {
  Object.assign(tm, {
    x: from[0],
    y: from[1],
    visible: true,
    alpha: 0,
    leaving: false,
    pose: "run",
  });
  tm.target = to;
}

/** Jog off toward `to`, fading out on the way. */
export function leave(tm: Teammate, to: readonly [number, number]) {
  if (!tm.visible) return;
  tm.leaving = true;
  tm.pose = "run";
  tm.target = to;
}

export function updateTeammate(tm: Teammate, dt: number) {
  if (!tm.visible) return;

  if (tm.target) {
    const dx = tm.target[0] - tm.x;
    const dy = tm.target[1] - tm.y;
    const dist = Math.hypot(dx, dy);
    const stride = tm.speed * dt;
    if (Math.abs(dx) > 1) tm.facing = dx > 0 ? 1 : -1;
    if (dist <= stride) {
      tm.x = tm.target[0];
      tm.y = tm.target[1];
      tm.target = null;
      if (tm.pose === "run") tm.pose = "stand";
    } else {
      tm.x += (dx / dist) * stride;
      tm.y += (dy / dist) * stride;
      tm.pose = "run";
    }
  }

  if (tm.leaving) {
    tm.alpha = Math.max(0, tm.alpha - FADE_PER_SECOND * dt);
    if (tm.alpha === 0) Object.assign(tm, { visible: false, leaving: false, target: null });
  } else {
    tm.alpha = Math.min(1, tm.alpha + FADE_PER_SECOND * dt);
  }
}
