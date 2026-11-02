/**
 * Rdzenie: a processor lying on its substrate. A 6 x 6 grid of cores stands on
 * the die, a ring of pads runs round it, and one pad at a corner marks which way
 * the part goes in. The pointer is projected back onto the die's top, which never
 * moves, and each core takes its height from its distance to it, on its own
 * spring. At rest two cores are already warm and the hottest takes the bright
 * stroke. The slider is the radius of the load, in cells.
 *
 * The pattern: a continuous field. Springs, a falloff by distance, a hit test on
 * a plane that never moves, and a rest that is a composition.
 */
const {
  Cam, clamp, facing, fit, prism, proj, rings, unproj, spring, stepS,
  flatDot, mk, place, pointer, put, register, disposer, solid,
} = HL;

const N = 5, CELL = 15, CORE = 12, EXT = N * CELL;
const M = 17;     // the substrate's border, wide enough for two rows of pads
const PB = 4.6;   // the substrate's thickness
const DIE = 5.5;  // the die's thickness: the cores stand on its top
const LIP = 4;    // how far the die stands out past the core grid
const HMAX = 34;  // a core at full load
const HI = HMAX * 0.56;

/** The share of full height at u radii from the pointer: 1 -> .31 at 42% -> .09 at the edge and beyond. */
const falloff = (u) =>
  u <= 0 ? 1 : u <= 0.417 ? 1 - (u / 0.417) * 0.6875 : u <= 1 ? 0.3125 - ((u - 0.417) / 0.583) * 0.2185 : 0.094;

/** Two warm cores at idle, so rest is a composition and not a flat grid. */
const idle = (u, v) =>
  2.6 + 17.4 * Math.exp(-((u - 0.25) ** 2 + (v - 0.75) ** 2) / 0.07) + 7 * Math.exp(-((u - 0.75) ** 2 + (v - 0.25) ** 2) / 0.05);

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  const C = Cam(45, 0.5, 1.92);
  fit(C, [
    [-M, -M, -PB], [EXT + M, EXT + M, -PB], [EXT + M, -M, -PB], [-M, EXT + M, -PB],
    [0, 0, DIE + HMAX * 0.78],
  ], 200, 166);
  const P = proj(C), front = facing(C);
  let R = value * CELL, over = null;

  const g = mk("g", {}, svg);

  // The substrate carries everything, so it is painted first.
  const [sr, si] = rings(-M, -M, EXT + M, EXT + M, 7, 2);
  put(solid(g), prism(P, front, sr, si, -PB, 0));

  // Paint order, back to front: the two far strips of pads, the die and its
  // cores, then the two near strips, which stand in front of the cores.
  const far = mk("g", {}, g), dieG = mk("g", {}, g), coreG = mk("g", {}, g), near = mk("g", {}, g);
  const pad = (parent, x, y, cls) => place(flatDot(parent, C, 1.25, cls), P(x, y, 0));
  const ROW = [LIP + 4, LIP + 10.5]; // two rows of pads, out from the die's edge
  const PN = 7;
  for (const d of ROW) for (let k = 0; k < PN; k++) {
    const t = (k + 0.5) * (EXT / PN);
    pad(far, t, -d, "dot off");
    pad(far, -d, t, "dot off");
    pad(near, t, EXT + d, "dot off");
    pad(near, EXT + d, t, "dot off");
  }
  // The orientation mark: one corner pad, where a part really carries it.
  pad(near, -ROW[1], EXT + ROW[1], "dot m");

  const [dr, di] = rings(-LIP, -LIP, EXT + LIP, EXT + LIP, 4.5, 1.6);
  put(solid(dieG), prism(P, front, dr, di, 0, DIE));

  const cores = [], byCell = new Map();
  // Diagonal by diagonal from the far corner, so appending is painting back to front.
  for (let s = 0; s <= 2 * (N - 1); s++) for (let i = 0; i < N; i++) {
    const j = s - i;
    if (j < 0 || j >= N) continue;
    const h0 = idle(i / (N - 1), j / (N - 1));
    const x0 = i * CELL + (CELL - CORE) / 2, y0 = j * CELL + (CELL - CORE) / 2;
    const [ring, inner] = rings(x0, y0, x0 + CORE, y0 + CORE, 2.2, 0.8);
    const c = { i, j, h0, ring, inner, sp: spring(h0, { eps: 0.04 }), el: solid(coreG), drawn: NaN };
    cores.push(c);
    byCell.set(i + "," + j, c);
  }

  // A core whose spring hasn't moved keeps its paths: most of the 36 are still on most frames.
  function drawCore(c) {
    const h = Math.max(0.8, c.sp.x);
    if (h === c.drawn) return;
    c.drawn = h;
    put(c.el, prism(P, front, c.ring, c.inner, DIE, DIE + h));
    c.el.sil.classList.toggle("hi", h > HI);
  }

  const B = register(stage, (dt) => {
    let m = false;
    for (const c of cores) { if (stepS(c.sp, dt)) m = true; drawCore(c); }
    return m;
  });
  bag.add(B.unregister);

  function retarget() {
    for (const c of cores) {
      if (!over) { c.sp.t = c.h0; continue; }
      const dx = (c.i + 0.5) * CELL - over[0], dy = (c.j + 0.5) * CELL - over[1];
      c.sp.t = HMAX * falloff(Math.hypot(dx, dy) / R);
    }
    if (over) {
      const i = clamp(Math.floor(over[0] / CELL), 0, N - 1), j = clamp(Math.floor(over[1] / CELL), 0, N - 1);
      read.textContent = `rdzen ${i}\u00b7${j}`;
    } else read.textContent = "rest";
    B.wake();
  }

  bag.add(pointer(stage, {
    move: (p) => { over = unproj(C, p[0], p[1], DIE); retarget(); },
    leave: () => { over = null; retarget(); },
  }));
  bag.add(() => svg.replaceChildren());

  return {
    set: (v) => { R = v * CELL; if (over) retarget(); },
    destroy: bag.dispose,
  };
}

hairline({
  name: "rdzenie",
  means: "Siatka rdzeni procesora podnosi sie pod kursorem i opada wraz z odlegloscia.",
  rules: [1, 3, 5, 9],
  range: [1.2, 2.4, 4],
  tour: [[152, 152], [248, 152], [200, 204], null],
  mount,
});
