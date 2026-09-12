// The House Rules reference page (plan step 2.7, design.md §13.4): "opens
// with §1.5, then: the round/match rules in six sentences, one line per
// keyword with the reminder text, the deck-legality rule, the tournament
// table, and 'how Checks work'." Static reference content — everything
// below is pulled from the same constants the rest of the app enforces
// (deck-legality caps, per-tier Checks, the tournament registry) rather
// than retyped, so this page can't quietly drift out of sync with them.

import { DECK_SIZE, MAX_COPIES, MAX_DECK_POINTS, MAX_LEGENDARY_COPIES } from "../cards/cardTypes.ts";
import { DAILY_BONUS_CHECKS, LOSE_CHECKS, WIN_CHECKS } from "../pub/pubState.ts";
import { TOURNAMENTS } from "../tournaments/tournaments.ts";

export interface HouseRulesScreenOptions {
  invitationalTriggered: boolean;
  onBack: () => void;
}

interface CardTypeEntry {
  name: string;
  reminder: string;
}

/** design.md §3's table, one line each (PT-29: card types were never defined anywhere a newcomer could read). */
const CARD_TYPES: CardTypeEntry[] = [
  { name: "Character", reminder: "People (and cats). The bulk of every deck." },
  { name: "Gadget", reminder: "Contraptions, tools, documents. Small points, small effects, often Persist." },
  { name: "Scheme", reminder: "One-shot: On Play, then it's spent. Flips, draws, un-flips." },
  { name: "Location", reminder: "A place. One active at a time, shared, replaces the last." },
  { name: "Headline", reminder: "A newspaper front page — a big, symmetrical, world-changing event." },
];

const HOUSE_RULES = [
  "No wagers above a sovereign.",
  "No arguing with the galvanometer.",
  "Cats have right of way.",
  "Settle your tab in the century you ran it up.",
  "The Landlady's chair is the Landlady's chair.",
];

const ROUND_RULES = [
  "Each player has a legal 20-card deck; shuffle and draw 5.",
  "A coin toss decides who leads round 1.",
  "Best of three rounds, three turns each a round, leader first.",
  "On your turn you play exactly one card from your hand — no voluntary pass.",
  "Higher score takes the round and nobody takes a tie — either way, whoever didn't take it leads the next round.",
  "First to two rounds takes the table; after three rounds it's most rounds, then most total points, then a draw.",
];

interface KeywordEntry {
  name: string;
  reminder: string;
}

const KEYWORDS: KeywordEntry[] = [
  { name: "On Play", reminder: "Does something once, when you play it." },
  { name: "Persist", reminder: "Stays on the table at the end of the round." },
  { name: "Friend +N", reminder: "Worth N more while another face-up Friend is on your side." },
  { name: "Elusive", reminder: "Can't be flipped." },
  { name: "Location", reminder: "One at a time, shared. A new one replaces the old." },
  { name: "Flip", reminder: "Turn an opposing face-up card face-down. It's worth 0 and does nothing." },
  { name: "Return", reminder: "Goes back to your hand at the end of the round." },
  { name: "Draw N", reminder: "Draw N cards from the top of your deck. No hand limit." },
  { name: "Transform", reminder: "At the start of each round, this card turns over to its other face." },
  { name: "Reveal", reminder: "Shows your opponent's hand to you until end of turn." },
  { name: "Legendary", reminder: "A deck may contain at most one copy of each legendary card." },
];

function el<K extends keyof HTMLElementTagNameMap>(tag: K, className?: string, text?: string): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

/** Mounts the House Rules page into `root` and returns a teardown function. */
export function mountHouseRulesScreen(root: HTMLElement, options: HouseRulesScreenOptions): () => void {
  let torn = false;

  function render(): void {
    if (torn) return;
    root.replaceChildren();

    const screen = el("div", "house-rules-screen");

    const header = el("div", "house-rules-header");
    header.appendChild(el("h1", "house-rules-title", "House Rules"));
    const backBtn = el("button", "taproom-button taproom-button--secondary", "Back to the bar");
    backBtn.type = "button";
    backBtn.addEventListener("click", options.onBack);
    header.appendChild(backBtn);
    screen.appendChild(header);

    screen.appendChild(el("p", "house-rules-posted", "Posted by the bar:"));
    const posted = el("ol", "house-rules-list");
    for (const line of HOUSE_RULES) posted.appendChild(el("li", undefined, line));
    screen.appendChild(posted);

    screen.appendChild(el("h2", "house-rules-section-title", "The Shuffle, in six sentences"));
    const rounds = el("ol", "house-rules-list");
    for (const line of ROUND_RULES) rounds.appendChild(el("li", undefined, line));
    screen.appendChild(rounds);

    screen.appendChild(el("h2", "house-rules-section-title", "Card types"));
    const typeList = el("div", "house-rules-keywords");
    for (const t of CARD_TYPES) {
      const row = el("div", "house-rules-keyword-row");
      row.appendChild(el("span", "house-rules-keyword-name", t.name));
      row.appendChild(el("span", "house-rules-keyword-reminder", t.reminder));
      typeList.appendChild(row);
    }
    screen.appendChild(typeList);

    screen.appendChild(el("h2", "house-rules-section-title", "Keywords"));
    const keywordList = el("div", "house-rules-keywords");
    for (const kw of KEYWORDS) {
      const row = el("div", "house-rules-keyword-row");
      row.appendChild(el("span", "house-rules-keyword-name", kw.name));
      row.appendChild(el("span", "house-rules-keyword-reminder", kw.reminder));
      keywordList.appendChild(row);
    }
    screen.appendChild(keywordList);

    screen.appendChild(el("h2", "house-rules-section-title", "Building a deck"));
    screen.appendChild(
      el(
        "p",
        undefined,
        `Exactly ${DECK_SIZE} cards. No more than ${MAX_COPIES} copies of any card, and no more than ${MAX_LEGENDARY_COPIES} copy of a legendary. Total printed points, ${MAX_DECK_POINTS} or under.`,
      ),
    );

    screen.appendChild(el("h2", "house-rules-section-title", "The chalkboard (tournaments)"));
    const tTable = el("div", "house-rules-tournaments");
    for (const t of TOURNAMENTS) {
      // PT-5: same reasoning as tournamentsScreen.ts — the Invitational stays
      // off this page too until its date trigger actually fires.
      if (t.id === "birthday-invitational" && !options.invitationalTriggered) continue;
      const row = el("div", "house-rules-tournament-row");
      row.appendChild(el("span", "house-rules-tournament-name", t.name));
      row.appendChild(el("span", "house-rules-tournament-meta", `${t.whenLabel} · ${t.fieldLabel} · ${t.entryRuleLabel}`));
      row.appendChild(
        el(
          "span",
          "house-rules-tournament-checks",
          `Entry ${t.entryChecks} · Consolation ${t.consolationChecks} · Prize ${t.prizeChecks}${t.ownAllBonusChecks ? ` (or ${t.ownAllBonusChecks} if you own them all)` : ""} Checks`,
        ),
      );
      tTable.appendChild(row);
    }
    screen.appendChild(tTable);

    screen.appendChild(el("h2", "house-rules-section-title", "How Checks work"));
    const checksList = el("ul", "house-rules-list");
    checksList.appendChild(el("li", undefined, `Win a pickup game: ${WIN_CHECKS.regular} (Regular) · ${WIN_CHECKS.seasoned} (Seasoned) · ${WIN_CHECKS.legend} (Legend). Sir Charles pays nothing — he's the house.`));
    checksList.appendChild(el("li", undefined, `Lose a pickup game: ${LOSE_CHECKS} Checks, regardless of tier.`));
    checksList.appendChild(el("li", undefined, `First win against any opponent: their reward card, on top of the usual Checks.`));
    checksList.appendChild(el("li", undefined, `First game of the real-world day: +${DAILY_BONUS_CHECKS} Checks.`));
    checksList.appendChild(el("li", undefined, "A draw pays nothing and counts as neither a win nor a loss."));
    screen.appendChild(checksList);

    root.appendChild(screen);
  }

  render();

  return () => {
    torn = true;
    root.replaceChildren();
  };
}
