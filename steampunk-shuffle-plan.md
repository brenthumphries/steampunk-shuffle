# Steampunk Shuffle — Build & Ship Plan

**Goal:** a steampunk deck-building card game, playable on her iPhone 17, in her hands by **Friday, October 30, 2026**.
**Written:** September 9, 2026 (51 days out). **Owner:** Brent (product owner). **Implementer:** Claude, on the cheapest model that can do each step.

---

## 1. Decisions locked (Sept 9)

| Decision | Choice | Why |
|---|---|---|
| Rules base | Nokturna (Moonlight Peaks), gaps filled from Magic: The Gathering | Nokturna is really a Gwent-style points game, not a mana/combat game — see §8. MTG supplies rarity, keyword vocabulary, deck archetypes, and card-frame presentation. |
| Tech stack | TypeScript + HTML/CSS/Canvas web app, built with Vite, tested with Vitest + Playwright | UI-heavy card game; cheapest models are strongest here; tests run headless in cloud sessions; one codebase serves both delivery tracks. |
| Delivery (gift) | **TestFlight** via your paid Apple Developer membership, using a Capacitor wrapper around the web app | Real app icon, no "Add to Home Screen" ritual, Preferences storage, haptics. First external build needs Beta App Review (usually ≤48 h). Builds expire 90 days after upload — a final build uploaded Oct 27 expires ~Jan 25, 2027, so re-upload before then or submit to the App Store later. |
| Delivery (test + fallback) | **GitHub Pages PWA**, live from week 1 | Free, HTTPS, auto-deploys from `main`. You test on your own iPhone 17 (same phone as hers) from day 3. If TestFlight slips, she adds the Pages URL to her Home Screen and still gets the gift on time. |
| Art | You generate in the Gemini app (Nano Banana / Nano Banana Pro, ~100 images/day on AI Pro) from prompt sheets Claude writes; Claude processes the files | No free API tier for the image models, so Claude can't call them from the cloud. Manual generation costs zero Claude usage. |
| Audience | Newcomer | Barkeep-guided first match, tiered opponents, in-game rule hints, no timer. |
| Cost ceiling | Claude Pro + Gemini Pro + existing Apple membership. Nothing new. | GitHub Pages, TestFlight, Vite, Capacitor, Playwright are all free. |

---

## 2. Model ladder (the "least expensive model" rule)

Prices per million tokens (input / output): **Haiku 4.5 $1/$5 · Sonnet 5 $2/$10 · Opus 5 $5/$25 · Fable 5.1 $10/$50.** On a Pro plan the same ratios govern how fast you burn your 5-hour and weekly limits, so Haiku stretches the subscription ~10× further than Fable.

Rules that apply to every step below:

1. **Start on the listed model.** Pick it in the Cowork/Claude Code model picker when you open the session, or pass it as the subagent model when a step says "subagent".
2. **Escalate only on failure.** If a step fails its exit check twice on the listed model, move up exactly one tier (Haiku → Sonnet → Opus). Nothing starts on Fable; Fable is reserved for the two judgement calls in §4 marked ★, and only if Opus's output doesn't satisfy you.
3. **Deterministic beats generative.** Whenever a task can be a script (image resizing, manifest generation, deploys, simulations), Claude writes the script once and Haiku runs it forever after.
4. **Handoff doc first.** Every session begins by reading `CLAUDE.md`; every session ends by updating it (Haiku). This is what keeps cheap sessions cheap — no re-deriving context.

Rough split of Claude usage by the end: ~45% Haiku, ~45% Sonnet, ~10% Opus.

---

## 3. Timeline at a glance

| Phase | Dates | Outcome | Brent's hands-on work |
|---|---|---|---|
| 0 · Foundations | Sep 9–12 | Design brief, style bible, repo, empty PWA live on Pages and on your phone | Create GitHub repo; approve the design brief |
| 1 · Engine | Sep 13–21 | Rules engine + AI opponent + balance simulator, all under tests; card set v1 (data only) | Generate art batch 1 (portraits + card back + 3 pub backgrounds) |
| 2 · Game | Sep 22–Oct 5 | Match screen, deck builder, pub hub, opponents, tournaments, progression, save/load, tutorial — playable end-to-end with placeholder art | Art batches 2–4 (all cards); daily 10-minute playtest on your iPhone |
| 3 · Polish | Oct 6–15 | Real art wired in, card frames, animation, sound, dedication screen, app icon, performance pass | Playtest notes; art re-rolls |
| 4 · Ship | Oct 16–22 | **Content freeze Oct 16.** Capacitor wrap, Xcode archive, TestFlight upload **by Oct 20**, Beta App Review, PWA final deploy | Xcode + App Store Connect steps on your Mac (checklist provided) |
| 5 · Buffer | Oct 23–29 | Bug fixes only; final TestFlight build by Oct 27; gift card with TestFlight invite + fallback QR | Install-on-her-phone dry run using your phone |
| 🎂 | Oct 30 | Gift | |

Slack built in: Phase 2 has two weeks for what is ~8 days of Sonnet work; Phase 5 is pure buffer.

---

## 4. Step-by-step plan with model assignments

### Phase 0 — Foundations (Sep 9–12)

| # | Step | Model | Exit check |
|---|---|---|---|
| 0.1 | Create GitHub repo `steampunk-shuffle` and enable Pages from GitHub Actions; set up SSH push the same way Wildlife Crossing does. Make it **public** — Pages on a private repo needs GitHub Pro, which would be a new subscription. If you'd rather keep the code and art private, the fallback is TestFlight-only plus ad-hoc installs from your Mac. | You + Haiku | Repo exists, Pages enabled |
| 0.2 | **Game design brief** ★ — pub identity, five card families, card types, keywords, points economy, opponent roster (regulars + legends), tournament structure, card-acquisition loop, progression tiers, tutorial script, gift touches. Input: §8 of this doc + your notes. Output: `docs/design.md` | **Opus 5** (one session; Fable only if the result feels generic) | You approve it. Every later step cites it. |
| 0.3 | **Art style bible** — one page: palette (brass, oxblood leather, verdigris, gaslight amber), line/texture style, camera framing per card type, negative prompts, a "pub regulars" reference character sheet. Output: `docs/style-bible.md` + 3 reference prompts | Sonnet 5 | You generate the 3 reference images in Gemini and they look like one world |
| 0.4 | Scaffold: Vite + TypeScript + Vitest + Playwright, PWA manifest, service worker, iPhone safe-area CSS, GitHub Actions deploy to Pages, `CLAUDE.md` handoff doc modelled on Wildlife Crossing's | Sonnet 5 | Push → Actions green → URL loads on your iPhone → Add to Home Screen opens full-screen, works in airplane mode |
| 0.5 | Build the **`ss-ship` skill** (see §5) so every future deploy is a Haiku one-liner | Haiku 4.5 | `/ss-ship` runs typecheck, tests, build, commit, push, confirms Pages deploy |

### Phase 1 — Engine (Sep 13–21)

| # | Step | Model | Exit check |
|---|---|---|---|
| 1.1 | **Card schema + validator**: JSON schema for cards (id, name, family, type, printed points, rarity, keywords, ability DSL, flavor, art id), deck-legality checker (exactly 20 cards, ≤2 copies, ≤60 printed points) | Haiku 4.5 | Validator rejects every illegal fixture, accepts legal ones |
| 1.2 | **Rules engine** (pure TypeScript, no DOM): best-of-3 rounds, 3 turns per round, one card per turn, alternating priority, scoring, Persist/Elusive/Friend/On-Play/Flip/Location resolution, tie rules from the design brief. Written test-first from a rules spec Claude derives from `docs/design.md` | **Sonnet 5** | 100% of rules spec statements have a passing test; property test: 10k random games never throw |
| 1.3 | **AI opponent**: heuristic evaluator + 3-turn lookahead with hidden-hand sampling; three difficulty dials (regular / seasoned / legend) | Sonnet 5 | Legend beats random play >95%; regular beats random ~60% |
| 1.4 | **Balance simulator** `tools/sim.ts`: AI-vs-AI over every opponent deck and the starter deck; reports per-card win-rate lift and flags outliers | Sonnet 5 writes; **Haiku** runs and summarizes | Report generated in <2 min; outlier list is empty or explained |
| 1.5 | Build the **`ss-card-author` skill** (see §5), then author **card set v1: 60 cards** (5 families × ~9, 8 locations, 6 legends), 10 opponent decks, 1 starter deck | Haiku 4.5 | All cards pass validator; sim shows no card >±8% win lift; flavor text reads in-world |
| 1.6 | Build the **`ss-art-prompts` skill**, generate **prompt sheet 1** (10 portraits, card back, 3 pub backgrounds, app icon) | Haiku 4.5 | You paste prompts into Gemini; results match the style bible without edits |
| 1.7 | Build `tools/ingest-art.py` (drop files into `art/inbox/<asset-id>.png` → crop to card-window ratio, 2× retina resize, WebP, manifest update) | Haiku 4.5 | Running it on batch 1 produces correctly named assets that render in a test page |

### Phase 2 — The game (Sep 22–Oct 5)

| # | Step | Model | Exit check |
|---|---|---|---|
| 2.1 | **Match screen**: hand, both boards, score, round tracker, card zoom, play/undo-before-commit, end-of-round reveal; phone-portrait layout tuned for iPhone 17 | Sonnet 5 | Playwright smoke at 402×874 viewport; full match playable on your phone |
| 2.2 | **Deck builder**: collection grid, filters by family/type, live legality meter (cards/copies/points), 13 saved deck slots as in Nokturna | Sonnet 5 | Can build, save, rename, and select a legal deck; illegal decks blocked with a reason |
| 2.3 | **Pub hub**: taproom scene, tonight's patrons (who's in, who's playable, who's a legend "in town"), pickup-game flow, card-reward reveal, pub tokens | Sonnet 5 | Win a pickup game → receive the opponent's reward card → it appears in collection |
| 2.4 | **Tournaments**: 8-seat single-elimination bracket vs AI, 3 named tournaments with entry rules and prize tables; "Birthday Invitational" that unlocks on Oct 30 | Sonnet 5 | Play through a bracket; prizes awarded; date trigger tested by faking the clock |
| 2.5 | **Other acquisition**: Lost & Found (one free card per real-world day), Pawnbroker (spend tokens), Tinker's Bench (fuse two duplicates into a foil/rarer variant), Bar Bet (wager a card) | Haiku 4.5 (each is data + small UI on 2.3's patterns) | Each path yields cards; token economy matches design brief numbers |
| 2.6 | **Progression + save**: opponent tiers unlock by wins; autosave to localStorage (Capacitor Preferences in the native wrap); export/import save via Share sheet | Sonnet 5 | Kill the app mid-match → resume; export → import on a second device restores everything |
| 2.7 | **Tutorial**: barkeep-narrated first match with forced hands, then hint chips for the next 3 matches; "House Rules" reference page | Haiku 4.5 (script from design brief) → Sonnet for the forced-hand logic | A newcomer tester (you, pretending) finishes without reading anything external |
| 2.8 | Build the **`ss-playtest`** skill: you text notes from your phone; Haiku triages into `PLAYTEST.md` with severity and repro | Haiku 4.5 | Notes → triaged list in one command |

### Phase 3 — Polish (Oct 6–15)

| # | Step | Model | Exit check |
|---|---|---|---|
| 3.1 | Card frames in SVG/CSS per family and rarity (brass, copper, gunmetal, gold-leaf legendary) so only the illustration window comes from Gemini | Sonnet 5 | Frames scale crisply at every zoom; legendary foil shimmer runs at 60 fps on iPhone |
| 3.2 | Wire all art; regenerate any card whose art fails the style bible (`ss-art-prompts` writes the re-roll prompt) | Haiku 4.5 | Zero placeholder art remaining |
| 3.3 | Animation: card play, flip, round reveal, tournament bracket advance, card reward "unwrap" | Sonnet 5 | No dropped frames on your iPhone; reduced-motion respected |
| 3.4 | Sound: Web-Audio-synthesized clicks/steam/brass hits (no licensing), optional CC0 ambience track; audio unlocks on first tap per iOS rules | Haiku 4.5 | Sound works after first tap; mute persists |
| 3.5 | Gift touches: dedication screen on first launch, her name as the default player, "The Landlady" legendary card featuring her, Birthday Invitational | Haiku 4.5 | Reviewed by you |
| 3.6 | Performance + offline pass: Lighthouse PWA audit, asset budget <15 MB, service-worker precache, airplane-mode full session | Haiku 4.5 runs audit → Sonnet fixes | Lighthouse PWA installable; offline works cold |
| 3.7 | ★ **Design review of the whole game** as a newcomer: rules clarity, difficulty curve, first-30-minutes feel | Opus 5 (one session) | Findings triaged into Phase 4 fix list |

### Phase 4 — Ship (Oct 16–22)

| # | Step | Model | Exit check |
|---|---|---|---|
| 4.0a | **Batch A: Re-point opponent decks** (PT-32) — move to tier bands (Regular 38–42 · Seasoned 44–48 · Legend 48–54); Nell/Lovelace/Adler/Jekyll first, then others; use `ss-card-author` per deck, `npm run curve` after each | Haiku 4.5 | Every opponent *sensible* column within ±10 of target; `npm run sim` clean |
| 4.0b | **Batch B: Engine** (PT-3/10/25) — add `hasKeyword` to `TargetFilter`; fix Return detection; discard Schemes/Headlines after On Play | Sonnet 5 | Unit tests per rules block; tutorial script still pins 9-6/7-15/7-6 |
| 4.0c | **Batch C: Tutorial + match screen** (PT-2/7/8/9/11/12/13/14/22/27/30) — mats don't get overwritten, hand grows, coin toss shown, targeting clarity, points colour-coding | Sonnet 5 | Replay tutorial: every mat readable, round-3 hand fully visible at 402×874 |
| 4.0d | **Batch D: Ownership** (PT-1/4/16/17/24) — owned = starter + collection; builder tiles show owned count; unowned capped/dimmed; seed slot 1 | Sonnet 5 | Fresh install: slot 1 is "The Village Constable"; no unowned card addable |
| 4.0e | **Batch E: Hub + gift touches** (PT-5/6/15/18/19/20/21/23/26/28/29/31) — hide Invitational until Oct 30; subtitle hub buttons; Checks explanation | Haiku 4.5 | Invitational invisible day 1; newcomer can name each hub button's function |
| 4.1 | **Content freeze Oct 16.** Only bug fixes after this. | — | Tagged `v1.0-rc1` |
| 4.2 | Capacitor wrap: `npm i @capacitor/core @capacitor/ios`, `npx cap add ios`, Preferences + Haptics + StatusBar plugins, splash + icon set generated from the app icon art, `Info.plist` orientation lock (portrait) | Sonnet 5 | `npx cap sync` clean; project opens in Xcode |
| 4.3 | **Xcode + App Store Connect checklist** for you to execute on the Mac: signing with your team, bundle id, version/build, archive, upload; create the app record; add a TestFlight external group with her email; fill the Beta App Review info | Haiku 4.5 writes; you execute; **Sonnet** if a build error appears | Build shows "Ready to Submit" in App Store Connect **by Oct 20** |
| 4.4 | Submit for Beta App Review; meanwhile final PWA deploy of the same build via `ss-ship` | Haiku 4.5 | Review approved (typically 24–48 h); Pages URL matches the TestFlight build |
| 4.5 | Install the TestFlight build on **your** iPhone 17 first; full playthrough of tutorial + one tournament | You + `ss-playtest` (Haiku) | No P1 bugs |

### Phase 5 — Buffer (Oct 23–29)

| # | Step | Model | Exit check |
|---|---|---|---|
| 5.1 | Fix anything from 4.5; re-upload (same version, new build — later builds are approved in minutes) | Haiku → Sonnet on escalation | Final build by Oct 27 |
| 5.2 | Gift card: TestFlight invite instructions in three steps + QR code to the Pages URL as the "if all else fails" path | Haiku 4.5 | Printed |
| 5.3 | Update `CLAUDE.md` with post-launch notes: the 90-day TestFlight re-upload date (before ~Jan 25, 2027), how to add cards, how to run the sim | Haiku 4.5 | Future you can maintain it on Haiku alone |

---

## 5. Skills and tools to build (all on Haiku unless noted)

These are what make the cheap model sufficient. Each is created with Claude's skill-proposal flow in the session that first needs it, and lives in your account so cloud sessions from your phone can use it.

**`ss-ship`** — Deploy in one command: typecheck, test, build, Lighthouse PWA audit, conventional commit, push, wait for the Pages Action, print the URL. Refuses to ship if tests fail. *(Built in 0.5.)*

**`ss-card-author`** — Given a family and a role ("a 3-point Aeronaut with a draw effect"), emits a card in the schema, checks the point budget against the family's curve, writes in-world flavor text in the design brief's voice, and adds it to the set file. Batch mode takes a whole family list. *(Built in 1.5.)*

**`ss-art-prompts`** — Reads the style bible and a card/asset list; emits a CSV prompt sheet (asset id, prompt, negative prompt, aspect ratio, reference image to attach) sized to the Gemini app's daily cap. Also writes single re-roll prompts with the specific fix. *(Built in 1.6.)*

**`tools/ingest-art.py`** — Deterministic script: crop, resize, WebP, manifest. You drop files into `art/inbox/` (from the Mac via a connected folder, or by uploading to the repo from your phone). *(Built in 1.7.)*

**`tools/sim.ts`** — Balance simulator; Haiku runs it after any card change and pastes the summary into `docs/balance.md`. *(Built in 1.4 by Sonnet.)*

**`ss-playtest`** — Your phone notes → triaged `PLAYTEST.md`. *(Built in 2.8.)*

**`CLAUDE.md` handoff doc** — same pattern as Wildlife Crossing: current state, next three tasks, gotchas, commands. Updated by Haiku at the end of every session.

Not building: an automated Gemini driver. Claude-in-Chrome could run the Gemini app, but it spends Claude usage to save you pasting ~100 prompts, and the manual path costs nothing.

---

## 6. Art plan (Gemini app, ~100 images/day)

| Batch | When | Contents | Count |
|---|---|---|---|
| 0 | Sep 11 | Three style-bible reference images | 3 (+ re-rolls) |
| 1 | Sep 14–16 | 10 opponent portraits, card back, 3 pub backgrounds, app icon | ~15 (+ re-rolls) |
| 2 | Sep 22–24 | Families 1–3 (~27 cards) | ~27 |
| 3 | Sep 29–Oct 1 | Families 4–5 + locations (~26) | ~26 |
| 4 | Oct 6–8 | Legends (6), remaining UI textures, re-rolls | ~15 |

Technique notes the prompt sheets will bake in: attach the same reference image to every prompt in a family for consistency; ask for the illustration only (the SVG frame supplies borders, so any corner watermark is cropped away); generate at 3:4 for cards, 1:1 for portraits, 9:16 for backgrounds; keep a "no text, no lettering" negative prompt so card names stay crisp in the UI font. Stick to historical and public-domain figures for legends (Boudica, Newton, Brunel, Lovelace, Nelson, Darwin, Turpin, Shakespeare, Arthur, Robin Hood, Holmes, Jekyll) — no trademarked characters.

---

## 7. Risks and what we do about them

**TestFlight review stalls or rejects.** The Pages PWA is live from week 1 and is the identical build; she adds it to her Home Screen and the gift is on time. Home-screen web apps are exempt from Safari's 7-day storage purge, and export/import save covers the rest.

**Art runs late.** Cards without final art ship with procedurally generated engraved-silhouette placeholders that fit the style; art can be added in a later build. Scope floor: 40 cards, 8 opponents, 1 tournament — still a complete game.

**Claude Pro weekly limit bites.** Two sessions a day max, Haiku for anything mechanical, no Fable. If the weekly cap is hit, that day's work is playtesting (yours) and art (yours), which cost no Claude usage.

**iOS web quirks.** Known and planned for: audio needs a first tap; `100vh` and safe areas need `env(safe-area-inset-*)`; no `navigator.vibrate` on iOS (haptics come from the Capacitor plugin only); disable double-tap zoom and rubber-band scroll.

**Balance is off for a newcomer.** The simulator plus tiered difficulty plus the Opus newcomer review in 3.7. Regular opponents are tuned to lose ~40% of the time to the starter deck played sensibly.

**90-day TestFlight expiry.** Calendar reminder for Jan 15, 2027 to re-upload (five minutes on Haiku + Xcode) before the ~Jan 25 expiry, or submit to the App Store as an unlisted app at that point.

---

## 8. Reference facts (verified Sep 9, 2026 — so future sessions don't re-research)

**Nokturna (Moonlight Peaks) rules.** Best-of-three rounds; each round is three turns; players start with a five-card hand and play one card per turn; highest total points wins the round; ties go to nobody. Decks are exactly 20 cards, max 2 copies of any card, and at most 60 printed points across the deck; up to 13 saved decks. Keywords: **On Play** (resolves when played), **Persist** (stays in play across rounds unless removed), **Elusive** (cannot be flipped), **Friend** (bonus when another Friend is in play). **Flip** turns an opposing card face-down (its points stop counting); e.g. "Death" is a 0-point Deity that flips every card worth 3 or less on play. Only one **Location** can be active; a new one replaces it. Card families: Werewolf, Vampire, Aquatic, Plant, Animal; other types: Location, Item, Spell, Deity. Draw effects exist (Starfish, Roses, Almanac draws 3). Some cards return to hand at round end (Loyal Wolf, Skullfin). Cards come from dig spots, diving, fishing, bat nooks, and beating the 11 NPC opponents, each of whom rewards a specific card. No mana or resource system — the 60-point deck cap *is* the economy. Community advice: 50–60 points, focus on 1–2 families, low-point cards with abilities beat high-point vanilla cards.

**What MTG fills in.** Rarity tiers (common/uncommon/rare/legendary), the keyword-and-reminder-text presentation, frame color by family, deck archetypes (aggro/tempo/control analogues become "points-fast / trickery / grind"), "legendary" uniqueness, and the collector loop (starter deck → boosters-by-winning → crafting duplicates).

**Apple.** Free Apple ID: apps signed by a Personal Team expire in 7 days, max 3 apps, no TestFlight — unusable for a gift. Paid membership (you have it): TestFlight external testers via email or public link, first build of a version needs Beta App Review (typically 24 h, up to 48), later builds of the same version clear in minutes, builds expire after 90 days. Capacitor 8/9 needs Xcode 26+, targets iOS 15+, works with CocoaPods or Swift Package Manager.

**iOS web apps.** Since iOS 26 every site added to the Home Screen opens as a standalone web app; service workers and offline caching work; web push is available; home-screen web apps keep their own storage counter and are not subject to Safari's 7-day script-writable-storage cap. No `beforeinstallprompt`, no Background Sync, no Web Bluetooth/NFC.

**Gemini.** Google AI Pro: ~100 images/day in the Gemini app (Nano Banana 2 and Nano Banana Pro). No free API tier for the current image models, so generation stays in the app.

**Claude pricing.** Haiku 4.5 $1/$5, Sonnet 5 $2/$10, Opus 5 $5/$25, Fable 5.1 $10/$50 per million tokens (input/output).

Sources: [Nokturna — Moonlight Peaks Wiki](https://moonlightpeaks.wiki.gg/wiki/Nokturna) · [Nokturna rules & deckbuilding](https://moonlightpeaks.wiki/guides/nokturna-card-game/) · [Nokturna abilities guide](https://moonlightpeaksguide.com/wiki/nokturna) · [All Nokturna cards](https://gameshorizon.com/guides/moonlight-peaks-all-nokturna-cards-strategy-guide/) · [Apple developer account comparison](https://developer.apple.com/support/compare-memberships/) · [Free account 7-day limits](https://mybyways.com/blog/new-limitations-imposed-on-free-apple-developer-account/) · [TestFlight distribution guide](https://techconcepts.org/blog/testflight-guide) · [Capacitor iOS docs](https://capacitorjs.com/docs/ios) · [PWAs on iOS 2026](https://www.mobiloud.com/blog/progressive-web-apps-ios/) · [WebKit: home-screen apps and the 7-day cap](https://webkit.org/blog/10218/full-third-party-cookie-blocking-and-more/) · [Gemini image limits 2026](https://www.aifreeapi.com/en/posts/gemini-image-free-tier-2026) · [Nano Banana Pro rate limits](https://www.aifreeapi.com/en/posts/nano-banana-pro-rate-limits) · [Claude pricing](https://platform.claude.com/docs/en/about-claude/pricing)

---

## 9. What happens next

Step 0.1 is yours (create the repo). Step 0.2 is the one Opus session — bring any notes on the pub's name, favourite historical figures, and anything she'd find funny. Everything after that runs on Sonnet and Haiku with this document and `CLAUDE.md` as the source of truth.
