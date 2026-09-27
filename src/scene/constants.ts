// Fixed design space. Every coordinate in the scene lives in this 900 × 560 box.
export const W = 900;
export const H = 560;

export type Rect = readonly [x: number, y: number, w: number, h: number];

export type SpotKey =
  | "bag"
  | "goalR"
  | "goalL"
  | "score"
  | "board"
  | "flag"
  | "ballbag"
  | "stands";

export type Spot = {
  /** Section the spot opens, e.g. "Projects". */
  section: string;
  /** The object on the field, e.g. "Home goal". */
  object: string;
  /** Hit region in design space. */
  rect: Rect;
};

export const SPOTS: Record<SpotKey, Spot> = {
  bag: { section: "About me", object: "Bag on the bench", rect: [346, 496, 44, 22] },
  goalR: { section: "Projects", object: "Home goal", rect: [836, 262, 40, 106] },
  goalL: { section: "Links", object: "Away goal", rect: [24, 262, 40, 106] },
  score: { section: "Experience", object: "Scoreboard", rect: [608, 26, 164, 80] },
  board: { section: "Education", object: "Tactics board", rect: [280, 486, 36, 42] },
  flag: { section: "Places I've lived", object: "Corner flag", rect: [828, 446, 50, 50] },
  ballbag: { section: "Skills and stack", object: "Ball bag", rect: [598, 494, 36, 34] },
  stands: { section: "Credits", object: "Bleachers", rect: [180, 62, 380, 72] },
};

export const SPOT_KEYS = Object.keys(SPOTS) as SpotKey[];

/** Floodlight towers: head x, head y, facing. Top corners first, then bottom sides. */
export const TOWERS: readonly (readonly [x: number, y: number, facing: 1 | -1])[] = [
  [40, 18, 1],
  [860, 18, -1],
  [14, 400, 1],
  [886, 400, -1],
];

/** Index of the bottom-right tower, whose bulb flickers forever. */
export const FLICKER_TOWER = 3;

// Intro timing (seconds).
export const INTRO_FIRST_TOWER = 0.9;
export const INTRO_TOWER_GAP = 0.7;
export const INTRO_RAMP = 0.15;

export const CENTER = [450, 315] as const;

export const COLORS = {
  sky: "#050810",
  city: "#0a0f18",
  ground: "#0b120c",
  turfA: "#1f5d2c",
  turfB: "#1b5427",
  line: "rgba(235,240,235,.75)",
  amber: "#ffb547",
  bag: "#7a2a2a",
} as const;
