import { describe, expect, it } from "vitest";

import { createBall, updateBall } from "./ball";
import { CENTER, SPOT_KEYS, type SpotKey } from "./constants";
import { createDirector } from "./director";
import type { PlayerState } from "./player/types";
import { createSceneState } from "./state";
import { createTeammate } from "./teammate";

const DT = 1 / 60;

function world() {
  const state = createSceneState();
  const player: PlayerState = { x: CENTER[0], y: CENTER[1], facing: 1, pose: "juggle" };
  const ball = createBall();
  const teammate = createTeammate();
  const panel = { key: null as SpotKey | null };
  const director = createDirector(
    state,
    player,
    ball,
    { onOpen: (k) => (panel.key = k), onHide: () => (panel.key = null) },
    teammate,
  );
  let t = 0;
  const tick = (frames = 1, lightTime = 0) => {
    for (let i = 0; i < frames; i++) {
      t += DT;
      director.update(DT, lightTime);
      updateBall(ball, player, t, DT);
    }
  };
  const until = (done: () => boolean, maxSeconds = 30) => {
    let frames = 0;
    while (!done()) {
      if (++frames > maxSeconds * 60) throw new Error("timed out");
      tick();
    }
    return frames * DT;
  };
  return { state, player, ball, teammate, panel, director, tick, until };
}

type World = ReturnType<typeof world>;

function expectIdle(w: World) {
  expect(w.director.phase).toBe("idle");
  expect(w.state).toMatchObject({
    bagOnBench: true,
    bagOnBack: false,
    boardHeld: false,
    ballInBag: false,
    active: null,
  });
  expect(w.ball.mode).toBe("juggle");
  expect([w.player.x, w.player.y]).toEqual([...CENTER]);
  expect(w.panel.key).toBeNull();
  // The corner-kick teammate is long gone by the time Chris is back juggling.
  expect(w.teammate.visible).toBe(false);
}

function expectOpen(w: World, key: SpotKey) {
  expect(w.director.phase).toBe("open");
  expect(w.state).toMatchObject({
    bagOnBench: key !== "bag",
    bagOnBack: key === "bag",
    boardHeld: key === "board",
    ballInBag: key === "ballbag",
    active: key,
  });
  expect(w.ball.mode).toBe(key === "ballbag" ? "hidden" : "rest");
  // Only the corner kick brings on the teammate, and he stays while its panel is open.
  if (key === "flag") expect(w.teammate).toMatchObject({ visible: true, alpha: 1 });
  expect(w.panel.key).toBe(key);
}

const FINAL_POSE: Record<SpotKey, string> = {
  bag: "stand",
  goalR: "stand",
  goalL: "stand",
  score: "hips",
  board: "study",
  flag: "point",
  ballbag: "stand",
  stands: "sit",
};

describe("director", () => {
  it.each(SPOT_KEYS)("opens and closes %s cleanly", (key) => {
    const w = world();
    expect(w.director.select(key)).toBe(true);
    expect(w.director.select("bag")).toBe(false); // ignored mid-routine
    w.until(() => w.director.phase === "open");
    expectOpen(w, key);
    expect(w.player.pose).toBe(FINAL_POSE[key]);
    // Both goals score, and so does the corner (headed in by the teammate).
    expect(w.state.homeScore).toBe(["goalR", "goalL", "flag"].includes(key) ? 1 : 0);

    expect(w.director.close()).toBe(true);
    expect(w.panel.key).toBeNull(); // panel hides as the close routine starts
    w.until(() => w.director.phase === "idle");
    expectIdle(w);
  });

  it("switches directly between every pair of spots", () => {
    for (const a of SPOT_KEYS) {
      for (const b of SPOT_KEYS) {
        if (a === b) continue;
        const w = world();
        w.director.select(a);
        w.until(() => w.director.phase === "open");
        expect(w.director.select(b)).toBe(true);
        w.until(() => w.director.phase === "open");
        expectOpen(w, b);
        w.director.close();
        w.until(() => w.director.phase === "idle");
        expectIdle(w);
      }
    }
  });

  it("keeps state consistent under random clicking", () => {
    for (let run = 0; run < 100; run++) {
      const w = world();
      for (let i = 0; i < 60; i++) {
        const r = Math.random();
        if (r < 0.45) w.director.select(SPOT_KEYS[Math.floor(Math.random() * SPOT_KEYS.length)]);
        else if (r < 0.7) w.director.close();
        w.tick(Math.floor(Math.random() * 120));
        if (w.director.phase === "open") expectOpen(w, w.state.active!);
        if (w.director.phase === "idle" && w.player.x === CENTER[0]) expectIdle(w);
      }
    }
  });

  it("takes an interruptible water break when idle", () => {
    const w = world();
    let drank = false;
    for (let i = 0; i < 45 * 60 && !drank; i++) {
      w.tick(1, 10);
      drank = w.player.pose === "drink";
    }
    expect(drank).toBe(true);
    expect(w.director.select("goalR")).toBe(true);
    w.until(() => w.director.phase === "open");
    expectOpen(w, "goalR");
  });
});
