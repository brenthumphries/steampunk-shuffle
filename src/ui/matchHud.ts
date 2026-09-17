// The match screen's persistent round/turn/whose-turn HUD (plan step 3.3
// extension). A separate builder from matchScreen.ts so the topbar's own
// render() stays readable — matchScreen.ts just calls buildMatchHud() with
// the small slice of state this needs and drops the result into its
// existing `.match-topbar`.
//
// Three cues, per the plan: a brass-gauge Round dial (filled segment per
// round), a distinct tick-style Turn dial (never confusable with the round
// gauge), and a pair of gas-lamp icons — position is fixed (opponent always
// left, you always right) so "whose turn" reads from light state and
// position alone, no text required.

const SVG_NS = "http://www.w3.org/2000/svg";
const ROUNDS = 3;
const TURNS_PER_ROUND = 3;

function svgEl<K extends keyof SVGElementTagNameMap>(tag: K, attrs: Record<string, string | number>): SVGElementTagNameMap[K] {
  const node = document.createElementNS(SVG_NS, tag);
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, String(v));
  return node;
}

function el<K extends keyof HTMLElementTagNameMap>(tag: K, className?: string): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (className) node.className = className;
  return node;
}

export interface MatchHudState {
  /** 1-based, clamped to ROUNDS for display (matchScreen already does the same clamp for its own round label). */
  round: number;
  /** 1-based within the round (design.md's 6 turns/round ÷ 2 players). */
  turnInRound: number;
  activeSide: "ai" | "human";
  humanName: string;
  aiName: string;
  /** This render's round is more advanced than the last one shown — plays the round-gauge's "click" beat. */
  roundJustAdvanced: boolean;
  /** Whose-turn just flipped since the last render — plays the lamp handoff beat (style.css gives it a real animation under `no-preference` and a short cross-fade under `reduce`, so this builder doesn't need to know which). */
  turnJustChanged: boolean;
}

/** Builds the round gauge: a circular dial with one arc segment per round, filled solid for a completed/current round. Segments start at 12 o'clock and run clockwise. */
function buildRoundGauge(state: MatchHudState): HTMLElement {
  const wrap = el("div", "round-gauge");
  const round = Math.min(Math.max(state.round, 1), ROUNDS);

  const size = 30;
  const r = 11;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * r;
  const gapDeg = 14;
  const segDeg = 360 / ROUNDS - gapDeg;
  const segLen = circumference * (segDeg / 360);

  const svg = svgEl("svg", { viewBox: `0 0 ${size} ${size}`, width: size, height: size, class: "round-gauge-svg" });
  const track = svgEl("circle", {
    cx,
    cy,
    r,
    fill: "none",
    stroke: "rgba(242, 230, 208, 0.18)",
    "stroke-width": 3,
  });
  svg.appendChild(track);

  for (let i = 0; i < ROUNDS; i++) {
    const startDeg = i * (360 / ROUNDS) - 90; // -90 so segment 0 starts at 12 o'clock
    const offset = -(circumference * (startDeg / 360));
    const completed = i < round; // this round's segment (and every earlier one) reads as "filled"
    const isCurrent = i === round - 1;
    const seg = svgEl("circle", {
      cx,
      cy,
      r,
      fill: "none",
      stroke: completed ? "var(--gold-leaf)" : "rgba(242, 230, 208, 0.3)",
      "stroke-width": completed ? 3.4 : 2,
      "stroke-linecap": "round",
      "stroke-dasharray": `${segLen} ${circumference - segLen}`,
      "stroke-dashoffset": offset,
      class: "round-gauge-segment" + (isCurrent && state.roundJustAdvanced ? " round-gauge-segment--advanced" : ""),
    });
    svg.appendChild(seg);
  }

  const label = el("span", "round-gauge-label");
  label.textContent = `Round ${round} of ${ROUNDS}`;
  wrap.appendChild(svg);
  wrap.appendChild(label);
  return wrap;
}

/** Builds the turn dial: a row of tick bars, distinct in shape from the round gauge's circular arcs, filled up to the current turn. */
function buildTurnDial(state: MatchHudState): HTMLElement {
  const wrap = el("div", "turn-dial");
  const turn = Math.min(Math.max(state.turnInRound, 1), TURNS_PER_ROUND);

  const ticks = el("div", "turn-dial-ticks");
  for (let i = 0; i < TURNS_PER_ROUND; i++) {
    const tick = el("span", "turn-dial-tick" + (i < turn ? " turn-dial-tick--filled" : ""));
    ticks.appendChild(tick);
  }

  const label = el("span", "turn-dial-label");
  label.textContent = `Turn ${turn} of ${TURNS_PER_ROUND}`;
  wrap.appendChild(ticks);
  wrap.appendChild(label);
  return wrap;
}

function buildLampIcon(): SVGSVGElement {
  const svg = svgEl("svg", { viewBox: "0 0 16 20", width: 14, height: 18, class: "turn-lamp-svg" });
  svg.appendChild(svgEl("rect", { x: 6, y: 14, width: 4, height: 5, rx: 0.6, class: "turn-lamp-post" }));
  svg.appendChild(svgEl("circle", { cx: 8, cy: 8, r: 7, class: "turn-lamp-halo" }));
  svg.appendChild(svgEl("circle", { cx: 8, cy: 8, r: 5, class: "turn-lamp-bulb" }));
  return svg;
}

/** Builds the whose-turn cue: two lamps at fixed positions (opponent always left, you always right) so light state + position identify the active side without reading text. */
function buildTurnLamps(state: MatchHudState): HTMLElement {
  const wrap = el("div", "turn-lamps");

  const aiLit = state.activeSide === "ai";
  const humanLit = state.activeSide === "human";

  // The animation class is added whenever the turn just changed, reduced
  // motion or not — style.css gives it a full handoff animation under
  // `no-preference` and a short cross-fade under `reduce`, same "shorten,
  // never eliminate outright" policy as the on-play/discard beats.
  const aiLamp = el("div", "turn-lamp turn-lamp--ai");
  aiLamp.dataset.lit = String(aiLit);
  if (state.turnJustChanged) aiLamp.classList.add(aiLit ? "turn-lamp--lighting" : "turn-lamp--dimming");
  aiLamp.appendChild(buildLampIcon());
  aiLamp.appendChild(el("span", "turn-lamp-name"));
  aiLamp.querySelector(".turn-lamp-name")!.textContent = state.aiName;

  const humanLamp = el("div", "turn-lamp turn-lamp--human");
  humanLamp.dataset.lit = String(humanLit);
  if (state.turnJustChanged) humanLamp.classList.add(humanLit ? "turn-lamp--lighting" : "turn-lamp--dimming");
  humanLamp.appendChild(buildLampIcon());
  humanLamp.appendChild(el("span", "turn-lamp-name"));
  humanLamp.querySelector(".turn-lamp-name")!.textContent = state.humanName;

  wrap.appendChild(aiLamp);
  wrap.appendChild(humanLamp);
  wrap.setAttribute("aria-label", `${state.activeSide === "ai" ? state.aiName : state.humanName}'s turn`);
  return wrap;
}

/** Builds the full HUD cluster — round gauge, turn dial, whose-turn lamps — for matchScreen.ts's topbar. */
export function buildMatchHud(state: MatchHudState): HTMLElement {
  const hud = el("div", "match-hud");
  hud.appendChild(buildRoundGauge(state));
  hud.appendChild(buildTurnDial(state));
  hud.appendChild(buildTurnLamps(state));
  return hud;
}
