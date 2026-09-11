import "./style.css";
import { starterDeck } from "./cards/data/decks/starterDeck.ts";
import { muddsDeck } from "./cards/data/decks/mudd.ts";
import { mountMatchScreen } from "./ui/matchScreen.ts";

const app = document.querySelector<HTMLDivElement>("#app");
if (!app) {
  throw new Error("#app root element is missing from index.html");
}

let teardownMatch: (() => void) | undefined;

function showTaproom(): void {
  teardownMatch?.();
  teardownMatch = undefined;
  app!.innerHTML = `
    <main class="taproom">
      <h1>The Wheatstone Bridge</h1>
      <p>Sit anywhere. Not there. That's Charlotte's.</p>
      <div class="taproom-actions">
        <button type="button" class="taproom-button" id="play-match">Play a quick match</button>
      </div>
    </main>
  `;
  // The pub hub (plan step 2.3) will replace this with a real "tonight's
  // patrons" screen; for now this is the only way in, against the "easy
  // one" (design.md §13.2's own line about Mudd).
  app!.querySelector<HTMLButtonElement>("#play-match")!.addEventListener("click", startMatch);
}

function startMatch(): void {
  app!.innerHTML = "";
  teardownMatch = mountMatchScreen(app!, {
    humanDeck: starterDeck,
    aiDeck: muddsDeck,
    aiName: "Constable Tobias Mudd",
    aiPortraitArtId: "portrait-constable-tobias-mudd",
    difficulty: "regular",
    onExit: showTaproom,
  });
}

showTaproom();
