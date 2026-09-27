import type { SpotKey } from "./constants";

/**
 * Everything the renderer needs to know about the world. Stage 3's player
 * routines mutate the prop flags; the UI sets hover/active/showAll.
 */
export type SceneState = {
  // Props
  bagOnBench: boolean;
  bagOnBack: boolean;
  boardHeld: boolean;
  ballInBag: boolean;

  // Scoreboard and nets
  homeScore: number;
  /** Seconds left on the scoreboard flash after a goal. */
  flash: number;
  /** Net ripple strength per goal, 0–1, decays over time. */
  ripple: { L: number; R: number };

  // UI
  hover: SpotKey | null;
  active: SpotKey | null;
  showAll: boolean;
};

export function createSceneState(): SceneState {
  return {
    bagOnBench: true,
    bagOnBack: false,
    boardHeld: false,
    ballInBag: false,
    homeScore: 0,
    flash: 0,
    ripple: { L: 0, R: 0 },
    hover: null,
    active: null,
    showAll: false,
  };
}
