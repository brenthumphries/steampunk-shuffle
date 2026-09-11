# Steampunk Shuffle — Root Claude Instructions

## Project overview

Steampunk Shuffle is a steampunk deck-building card game — a Gwent-style
points game (rules base: Nokturna/Moonlight Peaks) dressed in Magic: The
Gathering's rarity and keyword vocabulary, set in *The Wheatstone Bridge*, a
public house in 1871 London. It is a birthday gift, due **October 30, 2026**.

Full context lives in [`steampunk-shuffle-plan.md`](steampunk-shuffle-plan.md)
(model assignments, timeline, risks) and [`docs/design.md`](docs/design.md)
(rules, cards, opponents, progression). Read both before starting new work;
this file is the fast-reference summary, not a replacement for either.

This file is the master Claude context for the entire project. Scoped
CLAUDE.md files in subdirectories extend — never contradict — these root
instructions.

---

## Claude's role on this project

Claude is the implementer; Brent is the product owner. He defines direction,
approves design decisions (★ items in the plan), and playtests on his phone.
Claude writes the code, authors card content, builds the tooling/skills
in §5 of the plan, and keeps `CLAUDE.md` current so the next session — often
on a cheaper model — doesn't have to re-derive context.

**Model discipline** (plan §2): start every step on the model the plan
assigns. Escalate one tier only after failing a step's exit check twice.
Nothing starts on Fable. Prefer a deterministic script over a generative
step whenever the task can be scripted.

---

## Current state (updated after Step 0.5, Sept 10, 2026)

- Phase 0 (Foundations): 0.1–0.5 all done.
- Repo is public, Pages enabled (`build_type: workflow`, deploys from `main`).
- `docs/design.md` and `docs/style-bible.md` are approved. Three style-bible
  reference images are in `images/` (not yet moved into the art pipeline —
  that starts in Step 1.6).
- App is an empty PWA shell: one placeholder screen, no game logic yet.
- `.claude/skills/ss-ship/` (Haiku) + `tools/ship.sh` (the deterministic
  part) exist and are verified working: typecheck, test, build,
  non-blocking Lighthouse read, commit, push, wait for `deploy.yml`, print
  the live URL. Say "ship it" / "run ss-ship" to invoke it. First real run
  (commit `422383b`) went green end-to-end in ~30s.

**Next three tasks:** 1.1 card schema + validator → 1.2 rules engine →
1.3 AI opponent.

**Gotchas:**
- The site is served at `https://brenthumphries.github.io/steampunk-shuffle/`
  — a subpath, not a domain root. `vite.config.ts` sets `base` accordingly;
  any new hard-coded asset path needs the same treatment (prefer relative
  paths or `%BASE_URL%`/`import.meta.env.BASE_URL`, never a bare `/`).
- The `deploy.yml` workflow gates on `npm run typecheck` and `npm test`
  (Vitest) but does **not** run Playwright in CI — e2e is local-only for now
  to keep the pipeline fast. Revisit once the game has enough surface area
  that e2e coverage matters.
- `npm run build` runs `tsc --noEmit` before `vite build`; a type error fails
  the build even though Vite itself would happily transpile past it.
- Lighthouse 13 dropped the standalone `pwa` category (real installability
  scoring now needs a separate plugin). `tools/ship.sh` reports
  performance/best-practices/accessibility/seo as an informational read
  only — no threshold gates a ship. Real PWA/perf budgets are plan step 3.6;
  don't add a hard gate to `ss-ship` without checking with Brent first.
- `ss-ship` never pushes on its own initiative — it's invoked, not
  autonomous. It also never force-pushes and refuses to commit if a staged
  file name looks like a secret (`.env`, `.pem`, `credentials`, `secrets.*`).

---

## Repo structure

```
steampunk-shuffle/
├── .github/workflows/   # CI: typecheck, test, build, deploy to Pages
├── docs/                # design.md, style-bible.md
├── images/              # Gemini-generated art, staged before tools/ingest-art.py exists
├── public/              # PWA icons, static files served as-is
├── src/                 # App source (TypeScript)
├── tests/
│   ├── unit/            # Vitest
│   └── e2e/             # Playwright
├── tools/               # Scripts (sim.ts, ingest-art.py — added as later steps need them)
├── steampunk-shuffle-plan.md   # The build plan: phases, model assignments, exit checks
└── README.md
```

---

## Technology stack

| Layer            | Tool / Language              |
|------------------|-------------------------------|
| Language         | TypeScript                    |
| Build            | Vite                          |
| PWA              | vite-plugin-pwa (Workbox)     |
| Unit tests       | Vitest (jsdom environment)    |
| E2e tests        | Playwright (iPhone 17 viewport) |
| Native wrapper   | Capacitor (iOS), added in Phase 4 |
| Hosting          | GitHub Pages (Actions-built)  |
| Delivery (gift)  | TestFlight, added in Phase 4  |

---

## Coding conventions

- **Strict TypeScript.** `strict` and `noUncheckedIndexedAccess` are on in
  `tsconfig.json`. Don't relax them to make a type error disappear.
- **No DOM in the rules engine.** Phase 1's rules engine and AI opponent are
  pure TypeScript with no `document`/`window` access, so they stay testable
  headless and portable if the UI layer ever changes.
- **Comments**: default to none. Add one only for a non-obvious constraint
  (an iOS quirk, a rules edge case from `docs/design.md`, a workaround).
- **Tests**: every new module gets a Vitest unit test; every new screen gets
  at least one Playwright smoke test at the 402×874 iPhone 17 viewport.
- **No magic numbers** for game balance — deck limits, point caps, etc. come
  from `docs/design.md` and should be named constants, not inlined literals.

---

## iOS web app conventions (plan §7 — don't relearn these)

- Audio needs a user gesture on iOS; never assume autoplay works.
- Use `env(safe-area-inset-*)` for anything near a screen edge; `100dvh` over
  `100vh`. `src/style.css` already does this for the app shell.
- `navigator.vibrate` doesn't exist on iOS; haptics come from the Capacitor
  `Haptics` plugin once the native wrap exists (Phase 4), not the Web
  Vibration API.
- Disable double-tap-to-zoom and rubber-band scroll (`overscroll-behavior`,
  `user-select: none`) — already set globally in `src/style.css`.

---

## Naming conventions

| Thing              | Convention              | Example                     |
|--------------------|--------------------------|------------------------------|
| Source files       | camelCase.ts             | ruleEngine.ts                |
| Components/classes | PascalCase               | class MatchScreen            |
| Test files          | mirrors source, `.test.ts` / `.spec.ts` | ruleEngine.test.ts (unit), smoke.spec.ts (e2e) |
| Card/data files     | kebab-case.json          | opponent-decks.json          |
| Docs                | kebab-case.md            | style-bible.md               |
| Git branches        | type/short-description   | feat/rules-engine            |
| Git commits         | Conventional Commits     | feat: add scoring resolver   |

---

## Git workflow

- **Main branch**: `main` should always build and pass tests — CI enforces
  typecheck + Vitest + build on every push and PR.
- **Commits**: Conventional Commits (`feat:`, `fix:`, `docs:`, `chore:`,
  `test:`).
- **Deploys**: automatic on push to `main` via `.github/workflows/deploy.yml`.
  No manual Pages step. `ss-ship` (Step 0.5) wraps the local side of this
  (typecheck, test, build, commit, push) into one command.

---

## What to do when uncertain

- **Ambiguous requirement**: check `docs/design.md` first — most game
  questions are answered there. If still unclear, stop and ask Brent rather
  than guessing at rules or content.
- **A design decision, not an implementation one**: don't decide it — flag it
  for one of the ★ sessions in the plan (currently 0.2 done, 3.7 pending).
- **Something seems off from the plan**: say so and suggest an alternative;
  Brent makes the call, especially anything that touches the Oct 30 date.
