# A Year at the Bridge: Monthly Content Plan (November to September)

**Status:** approved by Brent, 2026-10-31, with his decisions in §10. Plan only: nothing in the game has been built or changed yet. A remaining ★ marks a scheduling risk or an optional later choice.
**Scope:** one time-limited content month for each month from November 2026 to September 2027, built on the seasonal-event layer (design.md §17). The Hallowe'en event already covers every October. Each month has a one-shot prompt for every part: agent prompts for code and content, and a Gemini one-shot that makes all of that month's art. **Execution:** one Opus conversation (the orchestrator) runs the whole year, dispatching subagents and driving Gemini through Claude in Chrome; Brent's only hands-on task is Letters from B. See `12-orchestration-runbook.md`.
**Files:** this overview; one file per month (`01-november.md` … `11-september.md`); `12-orchestration-runbook.md` (how the orchestrator runs it all); `13-orchestrator-kickoff.md` (the first message that starts it). `14-saves-and-android.md` (Release 1.1: multiple save ledgers, moving a game between devices, and Android), scheduled into the same orchestration. Setup step S-6 commits the folder to the repo at `docs/plans/monthly/`, so every prompt can cite it by section.

---

## 1. What the year is for

The game was a birthday present. This plan makes it a year-long one: something new comes up the cellar stairs every month, and each month is built around something Sara loves.

| Sara loves | Where it shows up |
|---|---|
| The witchy-vibes trend: kitchen witchcraft, moon phases, herbs, candles | A sixth family, **the Coven**, grows by a card every month. Real moon phases from January. A kitchen-witch window box in May. Hedge-witch flavour everywhere. |
| Tarot | **The Fortune-teller's Booth** opens in November and gives a daily reading. Two Major Arcana arrive each month: 22 cards in 11 months, so the deck is complete in September. |
| Astrology | **The Almanack**, one zodiac Headline per sign, each arriving as its season starts. Scorpio (her sign) comes first, as a belated birthday gift. All 12 signs by September. |
| Hitchcock, *Rebecca*, *The Uninvited* | July, **The House on the Cliff**: all three are set in or drawn from Cornwall. Hitchcock was born in Leytonstone, so he's practically a local. |
| Critical Role, Campaign 3 (Bell's Hells) | The Brontës published as "the Bells" (Currer, Ellis and Acton), so February's tournament is **The Bells' Hells**. There are allusion cards in December (the toymaker who is also a werewolf), February (the pale witch and the mind-reader) and August (the cheerful automaton and the faun with a monkey-cat). |
| Dimension 20: *A Starstruck Odyssey* | January, **The Aether Voyage**: a misfit aether-ship crew comes through the cellar. |
| Dimension 20: *Fantasy High* | September, **Michaelmas Term**: an eccentric headmaster's night school and a sixth form of misfits. |
| Dimension 20: *Of Mice and Murder* | March, **Of Mice and Mischief**: a murder mystery among the mice in the Bridge's walls, plus a new Mystery mode. |
| Dropout in general (Game Changer, Um Actually, Make Some Noise, Dirty Laundry) | April, **The Cellar Cabaret**: a tournament where nobody knows the rules until they've played them. Sir Charles has been saying "um, actually, it was Christie's bridge" since day one. |
| In-jokes already in the game | The cats meet the Brontës they're named after (February; "It's *Branwell*. With an N."). The Landlady is a Scorpio. Hiawatha keeps getting mistaken for a witch's cat (November). Mice negotiate with the cats under House Rule 3 (March). The Parsonage Snug finally gets a visit from Haworth. |

## 2. Guardrails (read before writing any card, line or art prompt)

1. **Fan allusions are allusions only.** For Critical Role, Dimension 20, Dropout, Hitchcock, *Rebecca* and *The Uninvited*: no character names, no show titles on cards, no logos, no cast likenesses, and no quoted dialogue. A fan should recognise the joke; a stranger should see an original Victorian character. This extends the design.md §15 rule for Doctor Who. Every allusion card, line and opponent is tagged `giftOnly: true` (see §4.2), so a future public App Store build can drop them with one flag. That matches app-store-readiness.md §7.
2. **Public-domain sources are fine to use directly.** Dickens, the Brontës, Carroll, Shakespeare, Wells, Irving, M. R. James's pre-1927 stories, folklore, and historical people who died long ago. Rider-Waite-Smith tarot imagery (1909) is public domain, so tarot art may follow its compositions.
3. **Real people.** Historical figures appear the same way Christie and Lovelace already do: with affection, and accurate where the accuracy is funny. Nobody living, and no Dropout or Critical Role cast members, in art or text. Hitchcock is never named or drawn face-on; he's "the Gentleman from Leytonstone", seen from behind or leaving the frame.
4. **Tone stays cozy mystery to Law & Order** (design.md §2). Witch-trial victims aren't used (no Pendle). Ghosts are atmospheric, not gory. Fortunes are always kind: no omen in the Booth is ever a penalty.
5. **The cats are real cats.** No sixth pub cat gets invented, and there are no cat costumes (the Hallowe'en rule carries over). The Coven's familiar is a hare, after the English folklore that witches became hares.
6. **Nothing is lost for good, and nothing has to be done on a particular day.** Gifts and advent doors stay claimable after their day. Missing a month's tournament only means waiting a year. Event cards stay owned and legal all year (design.md §17 rule 3).

## 3. The year at a glance

| # | Month (window) | Theme | Visitors · tournament boss | Coven card | Almanack | Tarot | Enhancement (code) |
|---|---|---|---|---|---|---|---|
| 1 | **Nov** (1–30) | **The Cunning Folk** | Mother Shipton, Dr John Dee · boss Mother Red Cap · Booth host Pamela Colman Smith | Hedge Witch, Cunning Woman, Witch Bottle | ♏ Scorpio (gift), ♐ Sagittarius | 0 Fool, I Magician | Content packs, `giftOnly` edition flag, arrival gifts, stats ledger, Almanack frame, **the Coven + Scry**, **the Fortune-teller's Booth** |
| 2 | **Dec** (1–31) | **A Ghost Story for Christmas** | The Ghost of Christmas Present, Mr Pockett the Toymaker · boss the Ghost of Christmas Yet to Come | Salt at the Threshold | ♑ Capricorn | II High Priestess, IX Hermit | **The Advent Cabinet**, snowfall dressing |
| 3 | **Jan** (1–31) | **The Aether Voyage** | Caroline Herschel, the Time Traveller · boss Captain Starling | Moon Water | ♒ Aquarius | IV Emperor, XVII Star | **Real moon phases** + **Full Moon +N**, **card sleeves** |
| 4 | **Feb** (1–28/29) | **Wuthering Weather** | Charlotte, Emily and Anne Brontë · boss Heathcliff | Tea-Leaf Reading | ♓ Pisces | VI Lovers, XV Devil | **Devoted (partner) +N**, **Letters from B.** |
| 5 | **Mar** (1–31) | **Of Mice and Mischief** | Beatrix Potter, Detective Sergeant Nibbs · culprit unmasked | The Hare | ♈ Aries | VIII Strength, XI Justice | **Mystery mode**, **Mischief +N** |
| 6 | **Apr** (1–30) | **The Cellar Cabaret** | The Hatter, the Cheshire Cat · boss the Impresario | Hag Stone | ♉ Taurus | V Hierophant, XVI Tower | **House Rules of the Night** (match modifiers) |
| 7 | **May** (1–31) | **Maying** | Robin Hood, Nicholas Culpeper · boss Herne the Hunter | Herbwife | ♊ Gemini | III Empress, XIV Temperance | **Steal**, **the kitchen-witch window box** |
| 8 | **Jun** (1–30) | **A Midsummer Night's Revel** | William Shakespeare, Robin Goodfellow · boss Titania | Besom | ♋ Cancer | XIX Sun, XXI World | **The Midsummer Fair Draft**, Friend-granting Locations |
| 9 | **Jul** (1–31) | **The House on the Cliff** | The Gentleman from Leytonstone, the Woman in White · boss the Cold Presence | Candle Magic | ♌ Leo | XII Hanged Man, XVIII Moon | **Cameo**, **the Stereoscope** gallery |
| 10 | **Aug** (1–31) | **The Lammas Fair** | The Automaton Oracle, the Faun of the Fair · boss Charles Green, Aeronaut | The Village Wise Woman | ♍ Virgo | VII Chariot, X Wheel of Fortune | **The Gauntlet** (permanent run mode) |
| 11 | **Sep** (1–30) | **Michaelmas Term** | The Headmaster, the Sixth Form · boss Flashman of Rugby | Rowan and Red Thread | ♎ Libra | XIII Death, XX Judgement | **Night School** (puzzles), **A Year at the Bridge** recap, the Grand Reading |
| — | **Oct** | Hallowe'en at the Bridge (existing) | — | — | — | — | — |

The year has three threads (§5). Each month also has 4 to 5 event cards, a taproom variant, Sir Charles lines, cross-character joke lines and, from January, a card sleeve.

## 4. The framework (built once, in November)

November's prompt N-A builds everything below, so every later month is data plus one feature.

### 4.1 Content packs

- One file per month: `src/events/packs/<eventId>.ts` exports a `SeasonalEvent`. `seasonalEvents.ts` keeps only types, the registry (`SEASONAL_EVENTS = [halloween, ...packs]`) and the predicates. Hallowe'en moves into `packs/halloween.ts` unchanged.
- New optional `SeasonalEvent` fields:
  - `hosts`: non-playing characters who arrive on a date and **stay year-round** afterwards. Pamela Colman Smith, the Booth host, is the only one; she never sits down to play.
  - `arrivalGifts`: card ids granted once per event per year on the first launch inside the window, with a beer-mat line (for example, *"Someone left this on the step. It has your name on it. Most things here do."*). An optional `fromYear` holds a gift back until that year (the 2027 Bonfire Night card).
  - `almanack`, `tarot`, `covenCard`, `sleeveId`: the month's thread items (§5), so the year-round systems read them from one place.
  - `banner`: a one-time "new this month" beer mat in the hub on the first launch inside the window.
- Rule: **one event live at a time.** Windows never overlap. A test asserts this across every pack.

### 4.2 Gift edition flag

`src/edition.ts` reads `import.meta.env.VITE_EDITION` (default `"gift"`; `"public"` is a future build). Cards, opponents, lines and letters can carry `giftOnly: true`. In a public build, registries filter them out, and any deck that contains one gets a substitute card or is flagged illegal (decide when the public build happens; for now, just filter, and test that the filter works). This is the seam app-store-readiness.md §7 asks for.

### 4.3 The Ledger (stats tracking)

The September recap needs a year of data, so tracking starts in November. Add a save-file section `ledger` that records per-card plays, per-opponent results, Checks earned, the first legendary and its date, tournaments won, cats played, Booth readings drawn, and the first-launch date. Bump the save version with a migration and a test. Track counts only; there are no analytics and nothing leaves the device (keep the privacy test green).

### 4.4 Visual seams

- **Almanack frame:** a Headline can set `frame: "almanack"` (a printed almanack page with a brass orrery ring and a zodiac glyph slot) instead of the newspaper frame. Same rules as any other Headline.
- **New family colour:** *Heather* (dusky violet, `#6E5A7E`-ish; tune for contrast) for the Coven. Amend style-bible.md §2 and the frame SVGs.
- **Taproom variants** use the existing `dressing.taproomArtId` with its fallback.

## 5. The three year-long threads

### 5.1 The Coven (sixth family)

*"Hedge witches, cunning folk, tea-leaf readers, herbwives and almanack-makers: everyone in England who knew what the weather would do before the weather did."*

- **Playstyle: foresight.** Set up your draws with **Scry**, soften threats with hexes (a negative one-shot `buff`, which the engine already supports), and from January read the real moon. "I play the Coven" means "I always know what's coming."
- **Keyword: Scry N** *(Look at the top N cards of your deck. Put any of them on the bottom and the rest back on top, in any order.)* This is a new `scry` effect (design.md §5.16).
- **Points curve:** 2.6 average across Characters (between Salon and Yard).
- **Frame:** Heather. **Familiar:** the Hare (March).
- **Roster by month (13 cards):**

| Month | Card | Type · rarity | Pts | Text |
|---|---|---|---|---|
| Nov | Hedge Witch | character · C | 2 | On Play: Scry 2. |
| Nov | Cunning Woman | character · U | 3 | On Play: an opposing face-up card gets -1. |
| Nov | Witch Bottle | gadget · U | 1 | Persist. On Play: Scry 1. |
| Dec | Salt at the Threshold | scheme · U | 0 | On Play: turn one of your face-down cards face-up, then Scry 1. |
| Jan | Moon Water | gadget · C | 1 | Full Moon +2. |
| Feb | Tea-Leaf Reading | scheme · C | 0 | On Play: Scry 3. |
| Mar | The Hare | character · R | 2 | Elusive. Return. On Play: Scry 2. |
| Apr | Hag Stone | gadget · U | 1 | On Play: Reveal your opponent's hand. |
| May | Herbwife | character · U | 3 | On Play: one of your face-up cards gets +2. |
| Jun | Besom | gadget · C | 1 | On Play: discard the active Location. |
| Jul | Candle Magic | scheme · U | 0 | On Play: one of your face-up cards gets +3. |
| Aug | The Village Wise Woman | character · R | 4 | Persist. On Play: Scry 3. |
| Sep | Rowan and Red Thread | gadget · U | 1 | Persist. Elusive. |

Each month's Coven card is an `arrivalGift` and is in that month's Lost & Found and Pawnbroker pool. The November trio is gifted together (2 × Hedge Witch, 1 × Witch Bottle) so the November tournament's Coven entry rule is fair.

### 5.2 The Almanack (zodiac Headlines)

Neutral rare Headlines with the Almanack frame, after *Old Moore's Almanack* (published since 1697). Like every Headline, they are symmetrical. Each is an `arrivalGift` in its month. The texts are drafts for `ss-card-author` to balance.

| Month | Sign | Draft text |
|---|---|---|
| Nov | ♏ **Scorpio** (gift on first November launch; it's the Landlady's sign) | On Play: each player turns all of their face-down cards face-up. *(Death and rebirth, and nothing stays buried.)* |
| Nov | ♐ Sagittarius | On Play: each player draws 1. Each player's highest face-up card gets +1. |
| Dec | ♑ Capricorn | On Play: each face-up Persist card gets +1. |
| Jan | ♒ Aquarius | On Play: each player returns their lowest face-up card to hand. |
| Feb | ♓ Pisces | On Play: each player turns one of their face-down cards face-up. |
| Mar | ♈ Aries | On Play: each player Flips an opposing card worth 2 or less. |
| Apr | ♉ Taurus | On Play: each face-up Gadget gets +1. |
| May | ♊ Gemini | On Play: each player draws 1. Each face-up Friend card gets +1. |
| Jun | ♋ Cancer | On Play: each player draws 2. |
| Jul | ♌ Leo | On Play: each player's highest face-up card gets +2. |
| Aug | ♍ Virgo | On Play: each player reveals their hand, then draws 1. |
| Sep | ♎ Libra | On Play: each player's highest face-up card gets -1 and lowest face-up card gets +1. |

The Scorpio card's flavour: *"Born under the Scorpion, like the Landlady. Sir Charles says this explains a great deal, and won't say what."*

### 5.3 The Fortune-teller's Booth (tarot)

A curtained booth in the snug, run by **Pamela Colman Smith** ("Pixie", 1878–1951), the London-born artist who drew the Rider-Waite-Smith tarot in 1909. She arrives on Nov 13 and stays for good, as the Booth host only: she never plays a match. On her first reading she gives Sara her signature card, *Pamela Colman Smith*, a self-portrait she painted as a card.

- **Once per real day**, tap the booth: Pixie draws one Major Arcana card from those unlocked so far. It flips with her line, and its **Omen** applies until midnight. Omens are always kind.
- **Unlock rule:** each arcana has an `unlocks` date: the 1st of its month in the table below (the Fool and the Magician unlock on Nov 13, when Pixie arrives). It unlocks permanently once the calendar has passed that date at least once since `ledger.firstLaunch`. All 22 are in the data from November; later months only add their art. Every arcana she's ever drawn shows in a **Tarot album** page (22 slots, silhouettes until unlocked).
- **Omen kinds** (closed set, defined in N-C): `checksNow(n)`, `firstWinBonus(n)`, `checksPerWin(n)`, `lostAndFoundUpgrade`, `lostAndFoundExtra`, `pawnbrokerDiscount(pct)`, `tinkerFree`, `openingHandPlusOne` (her first match of the day opens with 5), `barBetInsurance` (her first lost Bar Bet today comes straight back), `wildcard` (one of the others, seeded by date).
- **In September**, with all 22 drawn, the Booth offers a one-time **Grand Reading**: a three-card spread (past, present, future) drawn from her own ledger. Its first card is her first-ever win, its second is her most-played card, and its third is always the Landlady. Then Pixie gives her a foil of her own signature card.

| Arcana | Month | Omen | Pixie's line |
|---|---|---|---|
| 0 The Fool | Nov | checksNow(10) | "A step off a cliff, and a little dog who thinks it's a fine idea. Go on, then." |
| I The Magician | Nov | tinkerFree | "Everything on the table, and you know what each one's for. The Tinker's Bench is on the house." |
| II The High Priestess | Dec | openingHandPlusOne | "She knows something you don't. Today, so do you: take an extra card." |
| IX The Hermit | Dec | pawnbrokerDiscount(25) | "One lantern, one path, and the pawnbroker's in a giving mood." |
| IV The Emperor | Jan | checksPerWin(3) | "Order, method, and three Checks a win. Poirot would approve." |
| XVII The Star | Jan | lostAndFoundExtra | "After the storm, a little light. Two things in the box today." |
| VI The Lovers | Feb | lostAndFoundUpgrade | "A choice of the heart. The box behind the bar has chosen well." |
| XV The Devil | Feb | barBetInsurance | "Chains you could slip any time. Bet freely: your first loss comes home." |
| VIII Strength | Mar | firstWinBonus(15) | "A lady and a lion, and the lion has decided to be polite. Win once and be paid for it." |
| XI Justice | Mar | checksPerWin(3) | "The scales come out even. Every win pays a little extra." |
| V The Hierophant | Apr | firstWinBonus(15) | "The one who keeps the rules. Today he's keeping a purse for you." |
| XVI The Tower | Apr | wildcard | "Everything shaken loose. Let's see what falls out." |
| III The Empress | May | lostAndFoundExtra | "A garden that grows whether you watch it or not. Two in the box." |
| XIV Temperance | May | tinkerFree | "A little of this, a little of that. The Tinker won't charge." |
| XIX The Sun | Jun | checksNow(15) | "A child on a white horse and nothing at all to worry about. Here." |
| XXI The World | Jun | checksPerWin(5) | "The dance is finished and the wreath is yours. Every win pays well today." |
| XII The Hanged Man | Jul | openingHandPlusOne | "Upside down and quite content. You'll see more from there: take an extra card." |
| XVIII The Moon | Jul | lostAndFoundUpgrade | "Two towers, one road, and a dog and a wolf who can't agree. The box has something odd in it." |
| VII The Chariot | Aug | firstWinBonus(20) | "Two sphinxes pulling opposite ways, and still he gets there. Win once." |
| X Wheel of Fortune | Aug | wildcard | "Round it goes." |
| XIII Death | Sep | pawnbrokerDiscount(25) | "Not what you think. Something ends, so something else can start. Prices are down." |
| XX Judgement | Sep | checksNow(20) | "A trumpet, and everyone sits up. Your year's been counted, and it came out well." |

**Card ids** (art id = card id): `tarot-the-fool`, `tarot-the-magician`, `tarot-the-high-priestess`, `tarot-the-empress`, `tarot-the-emperor`, `tarot-the-hierophant`, `tarot-the-lovers`, `tarot-the-chariot`, `tarot-strength`, `tarot-the-hermit`, `tarot-wheel-of-fortune`, `tarot-justice`, `tarot-the-hanged-man`, `tarot-death`, `tarot-temperance`, `tarot-the-devil`, `tarot-the-tower`, `tarot-the-star`, `tarot-the-moon`, `tarot-the-sun`, `tarot-judgement`, `tarot-the-world`.

## 6. Recurring monthly checklist (what every month file specifies)

1. **Window and arrivals** (all dates are local `MonthDay`, so the month recurs every year).
2. **Visitors:** 2 visitors (tier `visitor`, seasoned dial, 15 Checks, signature legendary on first win) and 1 **tournament boss** (tier `legend`, tournament-only, so not in Tonight's Patrons; prize is their signature card). This is the Spring-Heeled Jack pattern.
3. **Event cards:** 4 or 5, in the month's event `cardPool`.
4. **Thread items:** Coven card, Almanack, two Tarot, and a sleeve (from January).
5. **Tournament or mode** (March's mystery, June's draft and August's Gauntlet replace the bracket).
6. **Dressing:** taproom variant, `lockedHint`, 3 Sir Charles lines, `lineOverrides` for regulars reacting to the visitors.
7. **One enhancement** (code), sized for one Sonnet session.
8. **Prompts:** a feature prompt (Sonnet), a content prompt (Haiku, with `ss-card-author`), and a **Gemini one-shot** that makes every image for the month in one chat.

**Art budget per month:** about 15 images (6 portrait and signature images, 4–5 event cards, 1 Coven, 1 Almanack, 2 Tarot, 1 taproom, 1 sleeve). Manifests continue the sheet numbering: November is `sheet-9`, through September as `sheet-19`.

**New art framings** (added to style-bible.md §4 by N-A):

| Type | Aspect | Rule |
|---|---|---|
| Tarot (Booth) | 2:3 | The Rider-Waite-Smith composition for that arcana, re-imagined in the house style with Victorian-engineering details. No numerals, titles or lettering (the UI adds them). Thin painted border allowed *inside* the image, since these are shown as tarot cards, not in the game frame. |
| Almanack (Headline) | 3:4 | Looks printed, not painted: a woodcut or engraving of the zodiac figure, centred and symmetrical, inside a brass orrery ring on foxed parchment. Two inks plus a sovereign-gold accent. No lettering or glyph text (the frame adds the glyph). |
| Sleeve (card back) | 3:4 | Symmetrical, pattern-led, full-bleed, readable at thumbnail size. No lettering. |

## 7. How to run a month

The orchestrator runs every month the same way (`12-orchestration-runbook.md` §5): open the month, then run the **art agent** (the month's Gemini one-shot, through Claude in Chrome) and the **build agent** (feature prompts, Sonnet) in parallel. Each PR gets a **verify agent** and is merged, which deploys to Pages. Then the **content agent** runs (Haiku; ingests the art), then the **playtest agent** (the dev clock on every key date, at iPhone size), fixes for any P1, and the **release agent** (TestFlight through CI). On the 1st there's a go-live check, and when the window ends, a close-out. Brent does nothing in this loop except answer a ★ question if one comes up.

## 8. Schedule and routing

Content is date-gated in data, so shipping early is always safe. Two months can go out in one build. Target: **art done by the 15th, build shipped by the 25th of the month before.** TestFlight builds expire 90 days after upload, so a monthly build also keeps her copy alive.

| Month | Art agent done | Orchestrator opens the month (agents start) | Ship (release agent: Pages + TestFlight) |
|---|---|---|---|
| Nov ★ compressed | Nov 8 | at kickoff (N-A → N-B → N-C → N-D through Nov 10) | **Nov 12** (visitors arrive Nov 13) |
| Dec | Nov 20 | Nov 16 | Nov 27 |
| Jan | Dec 12 | Dec 5 | Dec 21 (before the holidays) |
| Feb | Jan 15 | Jan 9 | Jan 25 |
| Mar | Feb 13 | Feb 6 | Feb 24 |
| Apr | Mar 15 | Mar 8 | Mar 25 |
| May | Apr 15 | Apr 8 | Apr 25 |
| Jun | May 15 | May 8 | May 25 |
| Jul | Jun 15 | Jun 8 | Jun 24 |
| Aug | Jul 15 | Jul 8 | Jul 25 |
| Sep | Aug 15 | Aug 8 | Aug 25 |

**Routing** (hq/routing.md and plan §2): the orchestrator is **Opus**; build, verify, playtest, fix and art agents use **Sonnet**; content and release agents use **Haiku** (content with `ss-card-author`), escalating to Sonnet only after two failed exit checks. Sizes for Linear: L = 5, M = 3, S = 2. Agents push branches and open PRs; only the orchestrator merges, through the gates in the runbook §6.

**★ November is tight.** Visitors and the tournament are dated Nov 13 and Nov 20 so the first build has room. If N-A to N-D slip, the event still runs: whatever ships late just arrives late. In later years the same data runs on its own.

## 9. Exit checks (every month)

- With `?now=&preview=1` set to the day before the window, the first day, each arrival date, the tournament start, the last day and the day after, the right visitors, cards, tournament, dressing and gifts appear and disappear (unit tests plus one Playwright smoke test).
- Arrival gifts are granted once per event per year, survive relaunch, and are never granted twice.
- `npm run curve -- seasoned seasoned 200`: the starter deck wins 40–50% against each visitor. Bosses sit at legend intent.
- In a `VITE_EDITION=public` test build, no `giftOnly` card, opponent or line is reachable.
- `npm run typecheck && npm test` pass; CI e2e is green on all four browsers.
- design.md gains a short subsection for the month (§17.x) and any new keyword (§5.x).

## 10. Decisions (settled by Brent, Oct 31)

1. **Allusions:** allusion-only, every one tagged `giftOnly` (§2.1).
2. **Pamela Colman Smith:** Booth host only, not an opponent. She gives her signature card on her first reading (§5.3).
3. **Letters from B.:** Brent writes every message and picks every date. Nothing personal goes in until he has written it. Letters ship as `TODO(Brent)` placeholders that never show (February F-A, September S-B).
4. **March mystery:** fixed solution (the Reverend). A 2028 expansion will add a new solution for March; it isn't part of this plan.
5. **The Gauntlet** stays year-round after August.
6. **Bonfire Night:** a Bonfire Night card, *Penny for the Guy*, arrives from 2027 (November §3 and §4; held back in 2026 with `fromYear: 2027`).
7. **Execution model:** every step except Letters from B. is done by Claude. One Opus conversation is the orchestrator; it dispatches Sonnet and Haiku subagents, drives Gemini through Claude in Chrome, merges, ships, playtests and wakes itself on schedule. Brent comes back to that one conversation (`12-orchestration-runbook.md`, `13-orchestrator-kickoff.md`).
8. **Release 1.1** (`14-saves-and-android.md`): stays on TestFlight; 4 save ledgers per device plus moving a ledger by file; no automatic sync; a free web install page; Android is a later deployment target, not scheduled. Ships Dec 21.
