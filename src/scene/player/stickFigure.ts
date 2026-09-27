import { COLORS } from "../constants";
import type { PlayerRenderer, PlayerView } from "./types";

type Pt = [number, number];

const BODY = "#e9eef3";

/** Procedural stick figure, ported from the prototype's drawPlayer(). Origin is at his feet. */
export const stickFigure: PlayerRenderer = {
  draw(ctx, { x, y, facing, pose, hasBag }: PlayerView, t) {
    ctx.save();
    ctx.translate(x, y);

    if (pose !== "sit") {
      ctx.fillStyle = "rgba(0,0,0,.35)";
      ctx.beginPath();
      ctx.ellipse(0, 1, 10, 3, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.scale(facing, 1);
    const jump = pose === "cele" ? -Math.abs(Math.sin(t * 7)) * 6 : 0;
    ctx.translate(0, jump);

    let hip: Pt = [0, -14];
    let sh: Pt = [0, -26];
    let hd: Pt = [0, -32];
    let lf: Pt = [-4, 0];
    let rf: Pt = [4, 0];
    let lk: Pt = [-3, -7];
    let rk: Pt = [3, -7];
    let le: Pt | null = null;
    let re: Pt | null = null;
    let lh: Pt = [-6, -15];
    let rh: Pt = [6, -15];
    let prop: "board" | "bottle" | null = null;

    switch (pose) {
      case "juggle": {
        const lift = Math.max(0, 1 - Math.abs(Math.sin(t * 4)) * 3) * 6;
        rf = [7, -lift];
        rk = [6, -8 - lift * 0.4];
        lh = [-9, -18];
        rh = [9, -19];
        break;
      }
      case "run":
      case "walk": {
        const s = Math.sin(t * (pose === "run" ? 14 : 8));
        lf = [-6 * s, 0];
        rf = [6 * s, 0];
        lk = [-3 * s + 2, -7];
        rk = [3 * s + 2, -7];
        lh = [4 * s, -17];
        rh = [-4 * s, -17];
        sh = [2, -26];
        hd = [3, -32];
        break;
      }
      case "shoot":
        rf = [13, -8];
        rk = [6, -9];
        lf = [-2, 0];
        lk = [0, -7];
        lh = [-10, -22];
        rh = [6, -16];
        sh = [-2, -26];
        hd = [-2, -32];
        break;
      case "cele":
        lh = [-8, -40];
        rh = [8, -40];
        break;
      case "crouch":
        hip = [0, -8];
        sh = [3, -19];
        hd = [5, -25];
        lk = [5, -6];
        rk = [7, -5];
        lh = [9, -3];
        rh = [7, -4];
        break;
      case "hips":
        le = [-10, -20];
        re = [10, -20];
        lh = [-4, -15];
        rh = [4, -15];
        hd = [1, -33];
        break;
      case "study":
        le = [4, -18];
        re = [6, -17];
        lh = [9, -23];
        rh = [11, -21];
        hd = [1, -31];
        prop = "board";
        break;
      case "wind":
        lh = [-6, -38];
        rh = [8, -18];
        rf = [-8, -5];
        rk = [-3, -9];
        sh = [-2, -26];
        break;
      case "point":
        re = [7, -28];
        rh = [13, -33];
        lh = [-6, -15];
        break;
      case "drink":
        re = [8, -24];
        rh = [4, -32];
        hd = [-1, -32];
        prop = "bottle";
        break;
      case "sit":
        hip = [0, 0];
        sh = [0, -13];
        hd = [0, -19];
        lk = [9, 0];
        rk = [10, 1];
        lf = [10, 9];
        rf = [11, 9];
        lh = [8, -2];
        rh = [9, -1];
        le = [4, -6];
        re = [5, -5];
        break;
      case "stand":
        break;
    }

    if (hasBag) {
      ctx.fillStyle = COLORS.bag;
      ctx.beginPath();
      ctx.roundRect(sh[0] - 9, sh[1] + 1, 6, 12, 2);
      ctx.fill();
    }

    ctx.strokeStyle = BODY;
    ctx.lineWidth = 2.6;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    limb(ctx, hip, lk, lf);
    limb(ctx, hip, rk, rf);
    limb(ctx, hip, sh);
    limb(ctx, sh, le ?? lh, le ? lh : undefined);
    limb(ctx, sh, re ?? rh, re ? rh : undefined);

    ctx.fillStyle = BODY;
    ctx.beginPath();
    ctx.arc(hd[0], hd[1], 4.5, 0, Math.PI * 2);
    ctx.fill();

    if (prop === "board") {
      ctx.fillStyle = "#e9ece6";
      ctx.fillRect(10, -32, 4, 18);
    } else if (prop === "bottle") {
      ctx.fillStyle = "#3f7fc4";
      ctx.save();
      ctx.translate(rh[0], rh[1]);
      ctx.rotate(-0.9);
      ctx.fillRect(-2, -8, 4, 9);
      ctx.restore();
    }

    ctx.restore();
  },
};

function limb(ctx: CanvasRenderingContext2D, a: Pt, b: Pt, c?: Pt) {
  ctx.beginPath();
  ctx.moveTo(a[0], a[1]);
  ctx.lineTo(b[0], b[1]);
  if (c) ctx.lineTo(c[0], c[1]);
  ctx.stroke();
}
