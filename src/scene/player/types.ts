/** Every pose a routine can ask for. A Rive state machine would expose these as inputs. */
export type Pose =
  | "juggle"
  | "run"
  | "walk"
  | "stand"
  | "shoot"
  | "cele"
  | "crouch"
  | "hips"
  | "study"
  | "wind"
  | "point"
  | "drink"
  | "sit"
  | "header";

export type PlayerState = {
  x: number;
  y: number;
  /** 1 faces right, -1 faces left. */
  facing: 1 | -1;
  pose: Pose;
};

export type PlayerView = PlayerState & {
  /** The duffel bag is on his back (the bench bag spot is open). */
  hasBag: boolean;
  /** Body color; the teammate who heads in the corner is tinted to tell him apart. */
  tint?: string;
};

/**
 * The only thing the scene knows about how the player looks. Swap the stick
 * figure for an illustrated or Rive-driven renderer by implementing this.
 */
export interface PlayerRenderer {
  draw(ctx: CanvasRenderingContext2D, player: PlayerView, t: number): void;
}
