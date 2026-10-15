---
title: "App Store listing: copy, age rating and screenshots"
date: 2026-10-14
tags: [docs]
status: draft
---

# App Store listing for Wheatstone (ATT-35)

Written 2026-10-14 so a public release is ready if Brent says go (ATT-32). **Nothing has been submitted, published or entered in App Store Connect.** Voice follows `docs/design.md`: dry, short sentences, Sir Charles's apologetic manner. No exclamation points, no em-dashes, plain ASCII, so characters and bytes match.

## Read this first

- **Every Apple fact below was read from Apple's own pages on 2026-10-14**, linked in the last section. None of the pages shows a last-updated date (the screenshot page is footed "Copyright 2026 Apple Inc."). Apple changes these pages, so check the links again on the day you upload.
- **Fields Claude could not fill without Brent** are marked **BRENT** and gathered in the last-but-one section: the support URL, the copyright line, the Content Rights and EU trader answers, the review contact, and and nothing else about the age rating, which Brent settled on 2026-10-14 (13+, R 18+ in Australia).
- **No High-risk character is named.** `docs/app-store-readiness.md` rates Agatha Christie, Hercule Poirot and four film jokes used as card names as High. None of them is in any field or screenshot here. The description names only Low and Medium characters: Sherlock Holmes is Medium (public domain; the risk is the screen adaptations, and no actor or film costume appears in this text), the rest are Low. The one place the listing could use a High character's slot, the legends sentence, has an optional stand-in sentence, **marked STAND-IN**, below.
- **The listing describes the public edition**, and that edition does not exist yet. The shipping app still has the dedication, the default name "Sara", the Birthday Invitational and the Landlady (`docs/app-store-readiness.md` section 7), and its High-risk cards. Nothing in the listing mentions any of them, but the review notes and screenshots assume they are off. The screenshots are taken from a seeded save that leaves them out, so they are accurate for what is on screen; they are not a claim that the build has a flag.
- Whatever Brent decides, the name in App Store Connect can only be confirmed when the app record is created (see **Name**).

## What Apple allows in each field

Checked 2026-10-14. "Not stated" means the page gives no limit.

| Field | Apple's limit | Required | Source |
|---|---|---|---|
| Name | 2 to 30 characters | yes (creating the record) | [App information](https://developer.apple.com/help/app-store-connect/reference/app-information/app-information) |
| Subtitle | at most 30 characters | not stated | same |
| Promotional Text | at most 170 characters | not stated | [Platform version information](https://developer.apple.com/help/app-store-connect/reference/app-information/platform-version-information) |
| Description | at most 4000 characters, plain text | yes | same |
| Keywords | at most 100 bytes; each keyword more than 2 characters | yes | same |
| Support URL | not stated; needs a protocol and must lead to real contact information | yes | same |
| Marketing URL | not stated; needs a protocol | not stated | same |
| What's New | at most 4000 characters | every version after the first; not available for the first | same |
| Copyright | not stated | yes | same |
| Privacy Policy URL | not stated | yes for iOS | [App information](https://developer.apple.com/help/app-store-connect/reference/app-information/app-information) |
| Age Rating | n/a | yes | same |
| Primary and secondary category | not stated; Games allows one or two subcategories | not stated | same |
| App Review notes | up to 4000 bytes (not shown to customers) | not clearly marked | platform version information |
| App Review contact | name, email, phone; phone in international format | not clearly marked | same |
| Screenshots | 1 to 10 per display size; `.jpeg`, `.jpg` or `.png`; no alpha channel or transparency | yes | [Screenshot specifications](https://developer.apple.com/help/app-store-connect/reference/app-information/screenshot-specifications) |

Apple's screenshot page says that if the interface is consistent across sizes you only need the largest required size and App Store Connect scales the rest down. Claude made both sizes anyway (below).

## Name, subtitle, promotional text, keywords

### Name

`Wheatstone` (10 of 30 characters). Fallback if App Store Connect says it is taken: `Wheatstone Bridge` (17 of 30), from `docs/testflight-checklist.md`. The home-screen name stays "Wheatstone" either way.

A US App Store search on 2026-10-11 found no live app with this name (`CLAUDE.md`), but Apple only confirms uniqueness when the record is created. `docs/app-store-readiness.md` section 6 adds a to-do before a public listing: search the USPTO and EUIPO for WHEATSTONE in classes 9 and 41 (a broadcast-audio company of that name exists). That search has not been done.

### Subtitle (27 of 30)

```text
A steampunk card game, 1871
```

Alternative, with less keyword and more voice (28 of 30): `Cards in a gaslit London pub`. "Steampunk" is in the first because the App Store indexes name, subtitle, keywords and category together, and the keywords below leave the word out on purpose.

### Promotional text (160 of 170)

Apple lets you change this without a new version, so it is the place for "the Hallowe'en visitors are in" in October.

```text
The Bridge is open. Sir Charles has a deck for you, the regulars have opinions, and the chalkboard has a Knockout with a seat free. No wagers above a sovereign.
```

### Keywords (98 of 100 bytes)

Comma-separated, no spaces after the commas. Words already in the name, subtitle or category (card, game, steampunk, strategy) are left out because they are indexed already. No character, franchise or other app's name is used as a keyword.

```text
deckbuilder,deck building,victorian,london,tournament,offline,single player,mystery,gaslight,brass
```

## Description (2573 of 4000 characters)

Paste as plain text. It makes no price claim and names no other platform or game.

```text
The Wheatstone Bridge is a narrow, gaslit public house off the Strand, London, 1871. It is considerably roomier inside than the frontage suggests. The cellar door opens on whenever it likes. Nobody remembers painting it blue.

Sir Charles Wheatstone keeps the bar. He is shy, exact and rather good at cards. He will teach you the Shuffle on beer mats slid across the counter, one idea at a time, and he will apologise when he wins.

THE SHUFFLE
A card game of points. Each round is three turns each, and the most points on the table takes the round. First to two rounds takes the table. A deck is twenty cards with sixty printed points to spend, so every big card you add means a small one somewhere with a trick in it.

Flip an opponent's card face down. Keep a card on the table from round to round. Fill the parlour with Friends. Slip a card out of reach before it can be nicked. The rules fit on one page. The rest is people being clever.

THE REGULARS
Constable Tobias Mudd is always slightly out of breath. Old Nell Ashby sells violets and knows everything. "Dodgy" Reg Farrow's table is legitimate, mostly. Ada Lovelace can see the loop in your deck from across the room. Inspector Bucket will sit and think about you. Dickens will not tell you the ending.

Win enough and the legends begin to come up the cellar stairs, two in town on any given day: Sherlock Holmes, Professor Moriarty, Dr Jekyll and Mr Hyde (one man, different rounds) and Mary Shelley.

BUILD IT, WIN IT, PAWN IT
Beat someone for the first time and they hand over a card. Spend your Checks, the pub's brass tokens, at the Pawnbroker's window. Look in the Lost and Found box behind the bar once a day. Stake a card on a Bar Bet if you are sure of your hand; lose it and it turns up at the Pawnbroker's. Ask Sir Charles at the Tinker's Bench to fuse two copies of a card into a foil, or into something better. Thirteen deck slots, each one checked for legality, so there is no arguing with the galvanometer.

THE CHALKBOARD
Eight seats, three matches, one knockout. The Tuesday Knockout is always on. The Peelers' Cup is for decks light on weight. The Reichenbach Open is for anyone who has earned a name. In October, the cellar stairs bring odder visitors.

QUIET BY DESIGN
No account. No adverts. No purchases. No internet needed, and nothing leaves your phone. Your progress is saved on the device, with export and import if you change phones. Made for iPhone, in portrait.

HOUSE RULES
No wagers above a sovereign. No arguing with the galvanometer. Settle your tab in the century you ran it up.
```

### Optional sentence, STAND-IN

**STAND-IN, not in the app today.** `docs/app-store-readiness.md` section 4 offers original replacements for the two High-risk legends: **Dame Octavia Marlowe** for Agatha Christie's card and **Mr Ambrose Quillfeather** for Hercule Poirot's. The legends sentence above leaves both out, which is accurate for the app as it is now if the public build drops those two legends. If ATT-32 goes ahead *and* the replacements are made, this sentence can go after "Mary Shelley.":

```text
Cosy murder is in the hands of Dame Octavia Marlowe, who plays a very patient drawing room, and Mr Ambrose Quillfeather, who is fussy about the row.
```

(148 characters; the description plus it is 2722.) If the replacements are not made, do not use it: it would describe two characters the app does not have.

## Category, URLs, copyright and the rest

| Field | Suggested value | Note |
|---|---|---|
| Primary category | **Games** | |
| Game subcategories | **Card** and **Strategy** | Apple allows one or two. The subcategory names are from general knowledge, not from a page read today; confirm them in the dropdown. Do not pick Casino: the app information page lists it as a trigger for the Korean rating rules. |
| Secondary category | leave empty | Optional. |
| Price | Free | ATT-32 prefers free: no in-app purchases keeps review simpler. |
| Support URL | **BRENT** | Required, and Apple says it must lead to real contact information. The repo deliberately holds no email address or phone number (`docs/logs/2026-10-13.md`), so Claude cannot fill this. Two ways to supply one: a page on the same GitHub Pages site (Claude can add `public/support.html` once Brent gives the address he wants shown; it needs the same privacy care as `privacy.html`), or a link he controls. The repo's GitHub Issues page may not count as contact information to Apple; that was not checked. |
| Marketing URL | optional; `https://brenthumphries.github.io/steampunk-shuffle/` or blank | That is the playable web version. Leave it blank if the web version should not be advertised alongside the app. |
| Privacy Policy URL | `https://brenthumphries.github.io/steampunk-shuffle/privacy.html` | From `docs/app-privacy-answers.md`. Open it in a browser before pasting; `docs/testflight-copy.md` notes it had not been confirmed live. The in-app link that guideline 5.1.1(i) asks for is still not built. |
| App Privacy | **No, we do not collect data from this app** | Evidence in `docs/app-privacy-answers.md`; a test (`tests/e2e/privacy.spec.ts`) holds it. |
| Copyright | `2026 Brent Humphries` | **BRENT** to confirm the name or entity. Required. The year is the year of first release. |
| What's New | not available | First version. For later versions, 4000 characters at most. |
| Version, build | 1.0 (1) | From the TestFlight work. |
| Primary language | English (U.S.) | |
| Content Rights | **BRENT** | Apple asks whether the app contains, shows or accesses third-party content. The cast is public domain or invented, but the art was generated in the Gemini app, and `docs/app-store-readiness.md` section 6 says to settle Google's terms for commercial use first. Do not answer until that is done. |
| EU trader status | **BRENT** | Apple requires a trader declaration to distribute in the EU (app information page). Declaring as a trader puts name, address and contact details on the product page. Claude cannot choose this for him. |
| Availability | **BRENT** | Territories. Nothing in the repo restricts them. |

## Age rating

Apple's questionnaire sits at **App Store Connect, the app, General, App Information, Age Ratings, Set Up Age Ratings** ([Set an app age rating](https://developer.apple.com/help/app-store-connect/manage-app-information/set-an-app-age-rating)). It runs in steps: in-app controls and capabilities, then each content section with None / Infrequent / Frequent (Gambling and Loot Boxes are Yes / No), then an age-category step, then an optional age-suitability URL. Apple's [values and definitions page](https://developer.apple.com/help/app-store-connect/reference/app-information/age-ratings-values-and-definitions) lists the categories and the rating tiers (4+, 9+, 13+, 16+, 18+). **Apple's pages do not print every question's exact wording and do not say how Infrequent differs from Frequent**; the table uses Apple's category names and Claude's reading of them. Check each against the wording on screen.

The answers come from the app itself: text and card data in `src/`, the art prompts in `art/prompts/`, and the privacy audit.

| Category (Apple's name) | Suggested answer | Reason |
|---|---|---|
| Parental controls | No | None in the app. |
| Age assurance | No | None. |
| Unrestricted web access | No | The app shows its own bundled pages only; it cannot navigate to any website. If the in-app privacy link is built to open inside the app, re-check this. |
| User-generated content | No | None. |
| Social media | No | None. |
| Messaging and chat | No | None. |
| Advertising | No | None. |
| Profanity or crude humor | None | A search of every card, screen and tutorial string found none. |
| Horror or fear themes | **Infrequent** | The Hallowe'en layer (1 to 31 October) brings a Carpathian count, a clockwork pharaoh, a werewolf, an invisible man and a galvanic creature, and the Nightfall cards include a grave robber. All are played mild and "no gore" per `docs/style-bible.md`; still dread-themed, so not None. |
| Alcohol, tobacco, or drug use or references | **Infrequent** (decided, see below) | The setting is a public house: a barkeep, a tutorial line about a drink, ale casks in the cellar art. No drink is consumed in play. |
| Medical or treatment information | None | None. |
| Health or wellness topics | None | None. |
| Mature or suggestive themes | None | None. |
| Sexual content or nudity | None | None. |
| Cartoon or fantasy violence | None | Nothing is harmed on screen. "Flip" turns a card face down; the rules call it nicking, as in arrest. Violence in the stories is implied and in the past tense (`docs/design.md` section 2). |
| Realistic violence | None | None. |
| Guns or other weapons | **Infrequent** | A constable's truncheon, a rivet gun and a butter knife appear in art prompts and flavour text. The 129 art images were not looked at one by one, so Brent should glance through them. |
| Gambling (real money) | No | Checks cannot be bought and have no cash value; there are no in-app purchases (`docs/app-privacy-answers.md`). |
| Loot boxes | No | Nothing is for sale. Lost and Found, the Pawnbroker and the Tinker's Bench use Checks earned in play or a free daily pick. |
| Simulated gambling | **Infrequent** (decided, see below) | The **Bar Bet** lets a player stake a card on a match against the computer, win a card from the opponent's pool or lose theirs to the Pawnbroker, and House Rule 1 is "No wagers above a sovereign." Apple's definition is betting or wagering without real money. Claude's reading is that this qualifies, rarely. Claude's judgement: answering None and being challenged in review is the worse outcome, while over-rating costs only the tier. |
| Contests | Infrequent | Tournaments (the chalkboard) are a mode against the computer for in-game rewards; there are no rankings between people. Apple lists Infrequent contests at 4+ and Frequent at 13+. |

| Final step | Suggested |
|---|---|
| Age category and override | Not Applicable |
| Made for Kids | No (it is not a kids' app, and the choice cannot be changed after approval) |
| Age Suitability URL | blank |

### What that gives

Apple's tiers (values page, 2026-10-14): **Infrequent alcohol references and Infrequent simulated gambling are both 13+ items**; Infrequent horror, weapons and (not chosen here) fantasy violence are 9+; Infrequent contests are 4+. So the answers above calculate to **13+**.

**Australia.** The same page lists Infrequent simulated gambling as the trigger for an Australian rating of **R 18+**, a region-specific rating shown only in Australia. That is a visible consequence of one answer about the Bar Bet.

**Decided by Brent on 2026-10-14: keep the suggested answers, so 13+ globally and R 18+ in Australia.** The two answers that move the result, for the record:

| If | Rating | Cost |
|---|---|---|
| Alcohol Infrequent and simulated gambling Infrequent (suggested, the honest reading today) | 13+ globally, R 18+ in Australia | Nothing to change in the app. |
| Both None | 9+ globally, no Australian R 18+ | Only defensible if the game stops wagering cards (rename or remove the Bar Bet) and the pub setting is judged background rather than a reference. That is a design decision, not a listing one, and `docs/design.md` section 11.5 specifies the Bar Bet. |

Claude did not weigh the tier against the audience. A birthday game for adults loses nothing at 13+. A wider public release might care.

## Screenshots

Made by `tools/store-screenshots.ts` (`npm run store-screenshots`; add `-- --no-build` to reuse `dist-native`). It builds the iOS bundle, serves it, drives it in WebKit with a seeded save and a fixed clock, scans each screen, and writes `art/store-screenshots/`. It has a unit test, `tests/unit/tools/storeScreenshots.test.ts`. Three runs in a row gave byte-identical files.

### Sizes

Apple's required set (screenshot specifications page): at least one screenshot for **iPhone with Dynamic Island, medium display** (1179 x 2556 or 1206 x 2622), and one for the **large display** (1260 x 2736, 1290 x 2796 or 1320 x 2868) unless a Face ID large set is given instead. Claude made one set of each. Each is a real iPhone's point size at 3x, so the game lays out as it does on the phone.

| Folder | Pixels | Viewport (points, 3x) | Covers |
|---|---|---|---|
| `art/store-screenshots/iphone-6.3in-1206x2622/` | 1206 x 2622 | 402 x 874 | iPhone 17, 17 Pro, 16, 16 Pro (Dynamic Island, medium). The e2e suite's own size. |
| `art/store-screenshots/iphone-6.9in-1320x2868/` | 1320 x 2868 | 440 x 956 | iPhone 17 Pro Max, 16 Pro Max (Dynamic Island, large). |

The PNGs are 8-bit RGB with no alpha channel (Playwright writes RGBA; the tool strips the alpha and refuses if any pixel is not opaque). Twelve files, about 21 MB in all. They are not in `.gitignore`: committing them adds that to the repo, which Brent may not want (the folder can be regenerated).

### The six shots

All shots are from one seeded player: "Alex", 87 Checks, five wins, a 45-point 20-card deck called "Heavy Industry" (Foundry and Yard), the date fixed to Tuesday 22 September 2026.

| File | Shows |
|---|---|
| `01-pub-hub.png` | The pub hub on a Tuesday evening: Tonight's patrons (Sir Charles, four Regulars, four Seasoned), 87 Checks, the selected deck and the hub's buttons. |
| `02-match.png` | Round 2 of a match against Old Nell Ashby, the player ahead one round to none, cards on both boards (Sergeant Pike and Steam Hammer on the player's side) and a hand of four to play. |
| `03-card-zoom.png` | The full-card zoom for a card on the player's board mid-match (Sergeant Pike when he is out): art, points, family, rarity, keyword, flavour text. |
| `04-deck-builder.png` | The deck builder open on "Heavy Industry" (20/20 cards, 45/60 points, legal), filtered to the Foundry and the cards the player owns. |
| `05-chalkboard.png` | The chalkboard: the Tuesday Knockout and the Peelers' Cup open to enter, the Reichenbach Open locked, each with its entry rule, cost and prize. No Birthday Invitational. |
| `06-tournament-bracket.png` | The Tuesday Knockout bracket: the quarterfinal won against Dodgy Reg Farrow, the semifinal against Ada Lovelace next, the final against Charles Dickens. |

### What is kept out

- **Gift-edition touches are off.** The seed has the dedication marked seen, a neutral player name, no Birthday Invitational (the clock is before 30 October; the trigger fires on that day *and every later day*, so a November date would show it and the Landlady on the chalkboard), no Landlady, no mention of Sara. The tool scans every shot for `Sara`, `Landlady`, `Invitational`, `birthday` and `Licensed to`.
- **No High-risk character or card is on screen.** The tool scans for Christie, Agatha, Poirot, the four film-joke cards and their art ids. The match is a seed search with the real engine so that neither board holds one; the opponents shown are Sir Charles, Mudd, Ashby, Farrow, Hollis, Bucket, Lovelace, Adler and Dickens, none a Legend. **Bucket's deck contains Good News, Everybody and Lovelace's contains Party Time. Excellent.**, so neither is ever played against in a shot; each appears only as a portrait and a name, on the hub (both) and the bracket (Lovelace).
- **No Legend is on the hub.** At five wins none is in town, so no Legend portrait, line or first-win card appears.
- **No pub cat is on screen.** The scan fails on the five cats' names, and the deck is built without them. One thing cannot be switched off: the app's own **taproom background art** (the match screen) has two or three cats asleep on cushions, and the chalkboard and deck builder backgrounds are the same house art. That is the app's art, not a card, and no name is shown. Brent's call whether it matters for a public release.

### Two weak shots

The bracket and the chalkboard are the app's real screens, and each leaves the lower half of the phone empty. If Brent wants a fuller sixth shot, the bracket's champion overlay (a card reveal over the bracket) is the richer one; it needs a one-line change to the seed. Claude kept the plain bracket because the brief asked for "a tournament bracket".

### Uploading

In App Store Connect, the version page, add the files in numeric order under each display size. Apple names the size groups on screen; the 6.3-inch files are the medium Dynamic Island set and the 6.9-inch files the large set. There is no app preview video.

## App Review notes (public edition)

For the version's **App Review Information**, not the TestFlight form (`docs/testflight-copy.md` section 3 has that one). 1023 characters, 1023 bytes of the 4000-byte limit. It drops the TestFlight sentence "This is a personal gift build for a small private group", and the "short opening card" line, because the public build should not show the dedication. **It is only accurate once the gift-edition flag exists.** The Bar Bet paragraph is new: it matches the simulated-gambling answer above. The quick route to a tournament is worked out from the code and the e2e specs, not played on a device (see `docs/testflight-copy.md`).

```text
No account, sign-in, network connection, purchase or advertising is involved. The app is an offline card game and makes no network requests. The in-game currency (Checks) has no cash value and cannot be bought.

First launch: a guided tutorial plays against the barkeep (follow the on-screen hints; it takes a few minutes of taps). It pays 10 Checks and opens the pub. Some seasonal content appears only around Hallowe'en.

To reach a tournament quickly: The Tuesday Knockout is always open and costs 20 Checks. From the pub, tap Constable Tobias Mudd, tap Continue, tap Leave Game, then Leave anyway. That pays 7 Checks the first time each day and 2 Checks each time after, so three of these give 21 Checks in total. Or win one game against Mudd for 8 Checks plus the 5-Check daily bonus. Then tap The chalkboard, find The Tuesday Knockout, tap Enter (20 Checks), then tap Play Quarterfinal.

The Bar Bet in the pub lets a player stake one in-game card on a match against the computer. Checks and cards have no cash value.
```

Sign-in required: off. Contact name, phone and email: **BRENT** (phone in international form, `+1` then ten digits).

## Everything that needs Brent

1. **Support URL** and the contact address behind it.
2. **Copyright** line: confirm `2026 Brent Humphries`.
3. **Content Rights** answer, after the Gemini art terms are checked.
4. **EU trader status**, and whether to distribute in the EU.
5. ~~Age rating~~ decided 2026-10-14: alcohol Infrequent and simulated gambling Infrequent, so 13+ and R 18+ in Australia.
6. **App Review contact** name, phone, email.
7. **Whether to commit `art/store-screenshots/`** (21 MB), or keep it out of git.
8. **Name**: the trademark search for WHEATSTONE, and a try at the name in App Store Connect.
9. **Stand-ins**: whether the two High legends are replaced (decides whether the STAND-IN sentence is used) and whether the Medium items go too.
10. **Everything in `docs/app-store-readiness.md` section 8**: the six High items, the gift-edition flag, the in-app privacy link, and the audio and art licences. The listing is ready; the build behind it is not.

## Sources (read 2026-10-14)

- [Screenshot specifications](https://developer.apple.com/help/app-store-connect/reference/app-information/screenshot-specifications)
- [Platform version information](https://developer.apple.com/help/app-store-connect/reference/app-information/platform-version-information)
- [App information](https://developer.apple.com/help/app-store-connect/reference/app-information/app-information)
- [Set an app age rating](https://developer.apple.com/help/app-store-connect/manage-app-information/set-an-app-age-rating)
- [Age ratings values and definitions](https://developer.apple.com/help/app-store-connect/reference/app-information/age-ratings-values-and-definitions). Only the first 100,000 of its 116,266 characters were read; the Australia section and the tier lists were in that part, and the rest is the Vietnam, Korea and older-OS tables.
- The repository: `docs/app-store-readiness.md`, `docs/app-privacy-answers.md`, `docs/testflight-copy.md`, `docs/testflight-checklist.md`, `docs/design.md`, `docs/style-bible.md`.
