// The Advent Cabinet screen (design.md §17.3): a 5x5 grid of numbered brass
// doors. A door that can be opened glints; tapping it swings it open (a fade
// under Reduce Motion), pays the reward, and shows the card unwrap for cards
// or the door's beer-mat line. A claimed door stays open and shows what it held.
// The rules live in src/events/advent.ts; this file is DOM glue only.

import { claimDoor, doorStatus, liveAdvent, openableCount, type AdventDoor } from "../events/advent.ts";
import { today } from "../events/eventClock.ts";
import { loadPubState, savePubState, type PubState } from "../pub/pubState.ts";
import { playSound } from "../audio/soundEngine.ts";
import { buildCabinetPicture, describeReward, shortReward, withContents } from "./adventCabinet.ts";
import { buildBeerMat } from "./beerMat.ts";
import { buildRevealOverlay } from "./revealCard.ts";

export interface AdventScreenOptions {
  onBack: () => void;
}

const SWING_CLASS = "advent-door--swinging";
/** Doors 1-24 are the regular grid; anything past them (Christmas Day) is the larger door. */
const REGULAR_DOORS = 24;

function el<K extends keyof HTMLElementTagNameMap>(tag: K, className?: string, text?: string): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

export function mountAdventScreen(root: HTMLElement, options: AdventScreenOptions): () => void {
  let pub: PubState = loadPubState();
  let torn = false;
  let reveals: string[] = [];
  let line: string | null = null;
  let swinging: number | null = null;
  let swingTimer: ReturnType<typeof setTimeout> | undefined;

  function openDoor(day: number): void {
    const claim = claimDoor(pub, today(), day);
    if (!claim) return;
    pub = claim.next;
    savePubState(pub);
    reveals = claim.cardIds;
    const contents = describeReward(claim.door.reward);
    line = claim.door.line ? withContents(claim.door.line, contents) : contents;
    swinging = day;
    playSound("brassHit");
    render();
    // The class is cleared after the CSS swing so a re-render doesn't replay it; Reduce Motion's CSS has no swing to wait for.
    swingTimer = setTimeout(() => {
      swinging = null;
    }, 700);
  }

  function buildDoor(door: AdventDoor, status: ReturnType<typeof doorStatus>, big: boolean): HTMLElement {
    const btn = el("button", `advent-door advent-door--${status}${big ? " advent-door--big" : ""}${swinging === door.day ? ` ${SWING_CLASS}` : ""}`);
    btn.type = "button";
    btn.dataset.door = String(door.day);
    btn.disabled = status !== "openable";
    btn.appendChild(el("span", "advent-door-number", String(door.day)));
    if (status === "opened") {
      btn.appendChild(el("span", "advent-door-reward", shortReward(door.reward)));
      btn.setAttribute("aria-label", `Door ${door.day}, open: ${describeReward(door.reward)}`);
    } else {
      btn.setAttribute("aria-label", status === "openable" ? `Door ${door.day}, ready to open` : `Door ${door.day}, shut`);
    }
    if (status === "openable") btn.addEventListener("click", () => openDoor(door.day));
    return btn;
  }

  function render(): void {
    if (torn) return;
    root.replaceChildren();
    const screen = el("div", "advent-screen");
    const live = liveAdvent(today());

    const header = el("div", "advent-header");
    const back = el("button", "taproom-button taproom-button--secondary", "Back to the bar");
    back.type = "button";
    back.addEventListener("click", options.onBack);
    header.appendChild(back);
    screen.appendChild(header);
    screen.appendChild(buildCabinetPicture());
    screen.appendChild(el("h1", "advent-title", "The Advent Cabinet"));

    if (!live) {
      screen.appendChild(el("p", "advent-note", "The cabinet has been wheeled away until next year."));
      root.appendChild(screen);
      return;
    }

    const ready = openableCount(pub, live, today());
    screen.appendChild(el("p", "advent-note", ready > 0 ? `${ready} ${ready === 1 ? "door is" : "doors are"} ready to open.` : "Every door that can be opened today is open."));

    const grid = el("div", "advent-grid");
    const sorted = [...live.advent.doors].sort((a, b) => a.day - b.day);
    for (const door of sorted) {
      grid.appendChild(buildDoor(door, doorStatus(pub, live, door, today()), door.day > REGULAR_DOORS));
    }
    screen.appendChild(grid);
    root.appendChild(screen);

    const reveal = reveals[0];
    if (reveal) {
      root.appendChild(
        buildRevealOverlay("From behind the little door", reveal, () => {
          reveals = reveals.slice(1);
          if (reveals[0]) playSound("brassHit");
          render();
        }),
      );
    } else if (line !== null) {
      root.appendChild(
        buildBeerMat(line, () => {
          line = null;
          render();
        }),
      );
    }
  }

  render();
  return () => {
    torn = true;
    if (swingTimer) clearTimeout(swingTimer);
    root.replaceChildren();
  };
}
