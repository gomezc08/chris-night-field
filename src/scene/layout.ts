import { H, W } from "./constants";

/** How the 900 × 560 design space sits inside a canvas of any size. */
export type Fit = {
  /** CSS px per design unit. */
  scale: number;
  /** CSS px offset of the design origin. */
  ox: number;
  oy: number;
};

/** The part of the design plane that's visible, in design units. Extends past 0–W / 0–H. */
export type Bounds = { left: number; top: number; right: number; bottom: number };

/**
 * Fit the whole design inside the canvas (nothing important is ever cropped) and
 * center it. The scenery fills whatever space is left around it.
 */
export function fitDesign(width: number, height: number): Fit {
  const scale = Math.min(width / W, height / H) || 1;
  return { scale, ox: (width - W * scale) / 2, oy: (height - H * scale) / 2 };
}

export function visibleBounds({ scale, ox, oy }: Fit, width: number, height: number): Bounds {
  return {
    left: -ox / scale,
    top: -oy / scale,
    right: (width - ox) / scale,
    bottom: (height - oy) / scale,
  };
}
