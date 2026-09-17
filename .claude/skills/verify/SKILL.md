---
name: verify
description: Cold-start recipe for runtime-verifying a Steampunk Shuffle change in the browser (not tests/typecheck). Use when driving the app to confirm a change works, not when running CI.
---

# Runtime verification (Steampunk Shuffle)

This is a Vite PWA. `npm test`/`npm run typecheck` are CI's job, not
verification — to actually observe a change, launch the app and drive it.

## Launch

```
preview_start name: "steampunk-shuffle-dev"   # from .claude/launch.json, port 5173
```

Set the Browser pane to `mobile` preset (375x812) — this is a phone-first
PWA and some layouts assume it. Reset to `desktop` when done.

## Skip the dedication screen and tutorial

The app always opens on the dedication screen, then the forced tutorial
match against Sir Charles. To land straight in the pub hub instead (e.g. to
reach House Rules, the deck builder, or a real pickup match):

```js
localStorage.setItem("steampunk-shuffle:tutorial-state", JSON.stringify({ completed: true, matchesPlayed: 0, shownHints: [] }));
localStorage.setItem("steampunk-shuffle:player", JSON.stringify({ name: "Sara", dedicationSeen: true }));
```

then reload/navigate to `http://localhost:5173/steampunk-shuffle/`.

## Useful surfaces

- **Tutorial match** (deterministic, `src/tutorial/tutorialScript.ts`): good
  for checking exact score checkpoints and specific card-draw timing, since
  every card played and every beer-mat line is fixed and known in advance.
- **A real pickup match** (pub hub → tap a patron row, e.g. "Constable
  Tobias Mudd"): good for confirming a change holds with a real shuffled
  deck and the real AI opponent, not just the scripted path. Coin toss
  decides who leads; cards stage with a Play/Cancel confirm before
  committing.
- **House Rules** (pub hub → "House Rules" button): static reference copy,
  `src/ui/houseRulesScreen.ts` — check with `get_page_text`, not just a
  screenshot, since it's mostly text.

## Gotchas

- The dev-mode service worker reloads the page once, unprompted, the first
  time it takes control of a tab (looks like a bug mid-match; it isn't —
  see CLAUDE.md's gotcha on this).
- `find`/`read_page` can return stale refs right after a screen transition
  (a beer-mat dismiss, a round-end overlay) — re-screenshot or re-read_page
  rather than trusting a ref from before the transition.
- Hand/score text is plain DOM text (`Your hand (N)`, `Hand: N`,
  `Your score: N`), readable with `read_page`/`get_page_text` — no need to
  count card images in a screenshot.
