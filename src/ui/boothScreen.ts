// The Fortune-teller's Booth (design.md §17.2): Pixie's curtained snug. Tap the
// curtain once a day; it draws back, her portrait appears, a face-down tarot
// card flips, and her line and the omen land on a beer mat. The rules live in
// src/booth; this file is DOM glue only.

import { COME_BACK_LINE, PIXIE_GIFT_LINE, PIXIE_PORTRAIT_ART_ID, arcanaDrawnToday, performReading, readingDoneToday, unlockedArcana } from "../booth/booth.ts";
import { describeOmen, todaysOmen } from "../booth/omens.ts";
import type { TarotArcana } from "../booth/tarot.ts";
import { today } from "../events/eventClock.ts";
import { loadPubState, savePubState, type PubState } from "../pub/pubState.ts";
import { playSound } from "../audio/soundEngine.ts";
import { buildBeerMat } from "./beerMat.ts";
import { buildTarotFace } from "./tarotCard.ts";

export interface BoothScreenOptions {
  onBack: () => void;
  onOpenAlbum: () => void;
}

const FLIP_DELAY_MS = 700;
const LATE_ROOM_LINE = "Pixie is still laying out the cards. Come back when the year turns.";

function el<K extends keyof HTMLElementTagNameMap>(tag: K, className?: string, text?: string): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function artUrl(assetId: string): string {
  return `${import.meta.env.BASE_URL}art/${assetId}.webp`;
}

function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches === true;
}

export function mountBoothScreen(root: HTMLElement, options: BoothScreenOptions): () => void {
  let pub: PubState = loadPubState();
  let torn = false;
  let timer: ReturnType<typeof setTimeout> | undefined;
  /** Booth phases: closed curtain -> drawn back (face-down card) -> flipped (line and omen). */
  let phase: "closed" | "open" | "flipped" = readingDoneToday(pub, today()) ? "flipped" : "closed";
  let revealed: TarotArcana | null = arcanaDrawnToday(pub, today());
  let giftLine: string | null = null;
  let justDrawn = false;

  function draw(): void {
    const date = today();
    const reading = performReading(pub, date);
    if (!reading) return;
    pub = reading.next;
    savePubState(pub);
    revealed = reading.arcana;
    justDrawn = true;
    if (reading.grantedCardId) giftLine = PIXIE_GIFT_LINE;
    playSound("brassHit");
    phase = "open";
    render();
    if (prefersReducedMotion()) {
      flip();
    } else {
      timer = setTimeout(flip, FLIP_DELAY_MS);
    }
  }

  function flip(): void {
    if (torn || phase !== "open") return;
    phase = "flipped";
    render();
  }

  function render(): void {
    if (torn) return;
    root.replaceChildren();
    const screen = el("div", "booth-screen");
    screen.dataset.phase = phase;
    screen.style.setProperty("--scene-bg", `url(${artUrl("background-the-back-parlour")})`);

    const header = el("div", "pub-hub-header");
    const back = el("button", "taproom-button taproom-button--secondary", "Back to the bar");
    back.type = "button";
    back.addEventListener("click", options.onBack);
    header.appendChild(back);
    header.appendChild(el("h1", "backroom-title", "The Fortune-teller's Booth"));
    screen.appendChild(header);

    const stage = el("div", "booth-stage");
    const portrait = el("div", "booth-portrait");
    const portraitImg = el("img", "booth-portrait-img");
    portraitImg.alt = "Pamela Colman Smith, called Pixie";
    portraitImg.addEventListener("error", () => portraitImg.remove());
    portraitImg.src = artUrl(PIXIE_PORTRAIT_ART_ID);
    portrait.appendChild(portraitImg);
    stage.appendChild(portrait);

    const noCards = unlockedArcana(pub.ledger.firstLaunch, today()).length === 0;
    if (phase === "closed") {
      if (noCards) {
        stage.appendChild(el("p", "booth-note", LATE_ROOM_LINE));
      } else {
        const curtain = el("button", "booth-curtain", "Draw back the curtain");
        curtain.type = "button";
        curtain.addEventListener("click", draw);
        stage.appendChild(curtain);
      }
    } else if (revealed) {
      const cardWrap = el("div", `booth-card booth-card--${phase}`);
      cardWrap.appendChild(buildTarotFace(revealed, "back"));
      cardWrap.appendChild(buildTarotFace(revealed, "front"));
      stage.appendChild(cardWrap);
      if (phase === "flipped") {
        const mat = el("div", "booth-mat");
        mat.appendChild(el("p", "booth-card-name", revealed.name));
        mat.appendChild(el("p", "booth-line", `"${revealed.line}"`));
        const today_ = todaysOmen(pub, today());
        if (today_) mat.appendChild(el("p", "booth-omen", `Omen: ${describeOmen(today_.omen)}`));
        if (!justDrawn) mat.appendChild(el("p", "booth-return", COME_BACK_LINE));
        stage.appendChild(mat);
      }
    }
    screen.appendChild(stage);

    const album = el("button", "taproom-button taproom-button--secondary", "Tarot album");
    album.type = "button";
    album.addEventListener("click", options.onOpenAlbum);
    screen.appendChild(album);

    root.appendChild(screen);
    if (phase === "flipped" && giftLine) {
      const line = giftLine;
      root.appendChild(
        buildBeerMat(line, () => {
          giftLine = null;
          render();
        }),
      );
    }
  }

  render();

  return () => {
    torn = true;
    if (timer !== undefined) clearTimeout(timer);
    root.replaceChildren();
  };
}
