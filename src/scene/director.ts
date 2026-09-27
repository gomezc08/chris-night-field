import { type Ball, kick, rest } from "./ball";
import { CENTER, type SpotKey } from "./constants";
import type { Pose, PlayerState } from "./player/types";
import type { SceneState } from "./state";

// --- Step queue (the prototype's run()/stepQ()) ----------------------------------

type Step =
  | { kind: "move"; to: readonly [number, number]; speed: number; pose: Pose }
  | { kind: "wait"; duration: number; pose?: Pose; onStart?: () => void; onEnd?: () => void }
  | { kind: "do"; fn: () => void };

const DEFAULT_SPEED = 130; // design units per second

const move = (x: number, y: number, speed = DEFAULT_SPEED, pose: Pose = "run"): Step => ({
  kind: "move",
  to: [x, y],
  speed,
  pose,
});
const wait = (duration: number, pose?: Pose, onEnd?: () => void, onStart?: () => void): Step => ({
  kind: "wait",
  duration,
  pose,
  onEnd,
  onStart,
});
const act = (fn: () => void): Step => ({ kind: "do", fn });

// --- Director ---------------------------------------------------------------------

/** idle: juggling at center. busy: mid-routine, clicks ignored. open: a panel is showing. */
export type Phase = "idle" | "busy" | "open";

export type DirectorEvents = {
  /** A routine finished; show this spot's panel. */
  onOpen: (key: SpotKey) => void;
  /** Hide the panel (a close or switch routine is starting). */
  onHide: () => void;
};

const IDLE_BREAK_MIN = 10;
const IDLE_BREAK_SPAN = 30;
/** Don't start the water-break timer until the lights are up. */
const IDLE_AFTER_INTRO = 4;

export type Director = {
  readonly phase: Phase;
  /** Visitor clicked a spot. Returns false if the click was ignored. */
  select: (key: SpotKey) => boolean;
  /** Visitor closed the panel. Returns false if nothing was open. */
  close: () => boolean;
  update: (dt: number, lightTime: number) => void;
};

export function createDirector(
  state: SceneState,
  player: PlayerState,
  ball: Ball,
  events: DirectorEvents,
): Director {
  let phase: Phase = "idle";
  let queue: Step[] = [];
  let current: Step | null = null;
  let elapsed = 0;
  let idleTime = 0;
  let nextBreak = IDLE_BREAK_MIN + Math.random() * IDLE_BREAK_SPAN;
  /** The water break is idle behaviour, so a click may interrupt it. */
  let onBreak = false;

  function run(steps: Step[]) {
    queue = steps.slice();
    current = null;
  }

  // --- Shared pieces ---

  const dribble = act(() => (ball.mode = "foot"));

  const openPanel = (key: SpotKey) =>
    act(() => {
      phase = "open";
      state.active = key;
      events.onOpen(key);
    });

  const scoreGoal = (side: "L" | "R") => () => {
    state.ripple[side] = 1;
    state.homeScore++;
    state.flash = 1.6;
  };

  const backToCenter = (): Step[] => [
    dribble,
    move(CENTER[0], CENTER[1]),
    act(() => {
      ball.mode = "juggle";
      player.pose = "juggle";
      phase = "idle";
      onBreak = false;
      idleTime = 0;
    }),
  ];

  // --- Routines (coordinates and timings from reference/prototype.html) ---

  const OPEN: Record<SpotKey, () => Step[]> = {
    // Dribble to the bench, leave the ball, crouch, pick up the bag.
    bag: () => [
      dribble,
      move(372, 492),
      act(() => rest(ball, player.x + player.facing * 12, player.y + 2)),
      wait(0.5, "crouch", () => {
        state.bagOnBench = false;
        state.bagOnBack = true;
      }),
      act(() => (player.pose = "stand")),
      openPanel("bag"),
    ],

    // Low shot into the home goal, then celebrate.
    goalR: () => [
      dribble,
      move(712, 305, 150),
      wait(0.22, "shoot", undefined, () => kick(ball, 856, 300, 0.35, 6, scoreGoal("R"))),
      wait(0.35, "shoot"),
      wait(1.1, "cele"),
      act(() => (player.pose = "stand")),
      openPanel("goalR"),
    ],

    // Zigzag dribble with four quick cuts, then a chipped finish with a high arc.
    goalL: () => [
      dribble,
      move(390, 262, 165),
      move(335, 355, 165),
      move(275, 268, 165),
      move(215, 348, 165),
      move(172, 305, 165),
      wait(0.25, "shoot", undefined, () => kick(ball, 44, 296, 0.6, 34, scoreGoal("L"))),
      wait(0.45, "shoot"),
      wait(1.1, "cele"),
      act(() => (player.pose = "stand")),
      openPanel("goalL"),
    ],

    // Jog under the scoreboard, leave the ball, hands on hips looking up.
    score: () => [
      dribble,
      move(682, 178),
      act(() => {
        rest(ball, player.x - 12, player.y + 2);
        player.facing = 1;
        player.pose = "hips";
      }),
      openPanel("score"),
    ],

    // Jog to the tactics board, crouch, pick it up and study it.
    board: () => [
      dribble,
      move(312, 490),
      act(() => rest(ball, player.x + 12, player.y + 2)),
      wait(0.45, "crouch", () => (state.boardHeld = true)),
      act(() => (player.pose = "study")),
      openPanel("board"),
    ],

    // Place the ball on the corner arc, wind up, run in, and cross it into the box.
    flag: () => [
      dribble,
      move(800, 470),
      act(() => {
        rest(ball, 836, 487);
        player.facing = 1;
      }),
      wait(0.6, "wind"),
      move(828, 483, 110),
      wait(0.22, "shoot", undefined, () => kick(ball, 700, 262, 0.9, 70)),
      wait(0.4, "shoot"),
      act(() => {
        player.facing = -1;
        player.pose = "point";
      }),
      openPanel("flag"),
    ],

    // Jog to the ball bag, crouch, drop the ball in.
    ballbag: () => [
      dribble,
      move(596, 496),
      wait(0.5, "crouch", () => {
        ball.mode = "hidden";
        state.ballInBag = true;
      }),
      act(() => (player.pose = "stand")),
      openPanel("ballbag"),
    ],

    // Leave the ball at the touchline, climb the tiers, sit down.
    stands: () => [
      dribble,
      move(372, 152),
      act(() => rest(ball, 390, 154)),
      move(372, 121, 45, "walk"),
      act(() => (player.pose = "sit")),
      openPanel("stands"),
    ],
  };

  const CLOSE: Record<SpotKey, () => Step[]> = {
    bag: () => [
      wait(0.5, "crouch", () => {
        state.bagOnBack = false;
        state.bagOnBench = true;
      }),
    ],
    goalR: () => [move(826, 304)], // retrieve the ball from the net
    goalL: () => [move(70, 300)],
    score: () => [],
    board: () => [wait(0.45, "crouch", () => (state.boardHeld = false))],
    flag: () => [move(704, 266)], // jog to where the cross landed
    ballbag: () => [
      wait(0.5, "crouch", () => {
        state.ballInBag = false;
        ball.mode = "foot";
      }),
    ],
    stands: () => [move(372, 152, 45, "walk")], // climb down, then pick up the ball
  };

  const waterBreak = (): Step[] => [
    dribble,
    move(484, 494),
    act(() => {
      rest(ball, player.x - 12, player.y + 2);
      player.facing = -1;
    }),
    wait(1.8, "drink"),
    ...backToCenter(),
  ];

  // --- Queue runner ---

  function step(dt: number) {
    if (!current) {
      const next = queue.shift();
      if (!next) return;
      current = next;
      elapsed = 0;
      if (current.kind === "wait") current.onStart?.();
    }
    elapsed += dt;

    switch (current.kind) {
      case "move": {
        const dx = current.to[0] - player.x;
        const dy = current.to[1] - player.y;
        const dist = Math.hypot(dx, dy);
        const stride = current.speed * dt;
        player.pose = current.pose;
        if (Math.abs(dx) > 1) player.facing = dx > 0 ? 1 : -1;
        if (dist <= stride) {
          player.x = current.to[0];
          player.y = current.to[1];
          current = null;
        } else {
          player.x += (dx / dist) * stride;
          player.y += (dy / dist) * stride;
        }
        break;
      }
      case "wait":
        if (current.pose) player.pose = current.pose;
        if (elapsed >= current.duration) {
          current.onEnd?.();
          current = null;
        }
        break;
      case "do":
        current.fn();
        current = null;
        break;
    }
  }

  // --- Public API ---

  function select(key: SpotKey) {
    if (phase === "busy" && !onBreak) return false;
    let steps: Step[] = [];
    if (phase === "open") {
      if (key === state.active) return false;
      // Switching: put the current spot back, skip the trip to center.
      steps = CLOSE[state.active!]();
      state.active = null;
      events.onHide();
    }
    phase = "busy";
    onBreak = false;
    run([...steps, ...OPEN[key]()]);
    return true;
  }

  function close() {
    if (phase !== "open") return false;
    const key = state.active!;
    state.active = null;
    events.onHide();
    phase = "busy";
    run([...CLOSE[key](), ...backToCenter()]);
    return true;
  }

  function update(dt: number, lightTime: number) {
    step(dt);

    if (phase === "idle" && lightTime > IDLE_AFTER_INTRO) {
      idleTime += dt;
      if (idleTime > nextBreak) {
        nextBreak = IDLE_BREAK_MIN + Math.random() * IDLE_BREAK_SPAN;
        phase = "busy";
        onBreak = true;
        run(waterBreak());
      }
    }
  }

  return {
    get phase() {
      return phase;
    },
    select,
    close,
    update,
  };
}
