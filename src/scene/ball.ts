import type { PlayerState } from "./player/types";

/** juggle: bouncing off his foot. foot: at his feet while he dribbles. fly: in the air. rest: on the ground. hidden: in the ball bag. */
export type BallMode = "juggle" | "foot" | "fly" | "rest" | "hidden";

type Flight = {
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  /** 0 → 1 over the flight. */
  progress: number;
  duration: number;
  /** Peak height of the arc in design units. */
  arc: number;
  onLand?: () => void;
};

export type Ball = {
  x: number;
  y: number;
  mode: BallMode;
  flight: Flight | null;
};

export function createBall(): Ball {
  return { x: 0, y: 0, mode: "juggle", flight: null };
}

export function kick(
  ball: Ball,
  toX: number,
  toY: number,
  duration: number,
  arc: number,
  onLand?: () => void,
) {
  ball.mode = "fly";
  ball.flight = { fromX: ball.x, fromY: ball.y, toX, toY, progress: 0, duration, arc, onLand };
}

export function rest(ball: Ball, x: number, y: number) {
  ball.mode = "rest";
  ball.flight = null;
  ball.x = x;
  ball.y = y;
}

export function updateBall(ball: Ball, player: PlayerState, t: number, dt: number) {
  switch (ball.mode) {
    case "juggle":
      ball.x = player.x + player.facing * 7;
      ball.y = player.y - 4 - Math.abs(Math.sin(t * 4)) * 26;
      break;
    case "foot":
      ball.x = player.x + player.facing * 9;
      ball.y = player.y + 1;
      break;
    case "fly": {
      const f = ball.flight!;
      f.progress += dt / f.duration;
      const k = Math.min(1, f.progress);
      ball.x = f.fromX + (f.toX - f.fromX) * k;
      ball.y = f.fromY + (f.toY - f.fromY) * k - Math.sin(k * Math.PI) * f.arc;
      if (k >= 1) {
        const onLand = f.onLand;
        rest(ball, f.toX, f.toY);
        onLand?.();
      }
      break;
    }
  }
}

/** Where the ball's shadow falls: on the ground under its path, not under the ball itself. */
export function ballGroundY(ball: Ball, player: PlayerState) {
  if (ball.mode === "juggle") return player.y;
  if (ball.mode === "fly" && ball.flight) {
    const f = ball.flight;
    return f.fromY + (f.toY - f.fromY) * Math.min(1, f.progress);
  }
  return ball.y;
}

export function drawBall(ctx: CanvasRenderingContext2D, ball: Ball, player: PlayerState) {
  if (ball.mode === "hidden") return;
  const groundY = ballGroundY(ball, player);

  ctx.fillStyle = "rgba(0,0,0,.35)";
  ctx.beginPath();
  ctx.ellipse(ball.x, groundY + 1, 4, 1.5, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#f4f6f4";
  ctx.beginPath();
  ctx.arc(ball.x, ball.y - 3, 3.6, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#222";
  ctx.beginPath();
  ctx.arc(ball.x + 0.8, ball.y - 3.5, 1.1, 0, Math.PI * 2);
  ctx.fill();
}
