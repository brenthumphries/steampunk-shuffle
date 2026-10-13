# App Store readiness: review risk and character IP (ATT-33)

Written 2026-10-13 for the go/no-go on a public release (ATT-32). Nothing in `src/` or any card data was changed to produce it.

> **This is not legal advice.** It is one developer-minded reading of Apple's published rules and of what is in this repository, with the reasoning shown so a lawyer, or Brent, can check it. Copyright and trademark law differs by country, and an App Store listing reaches all of them. Two statuses below (whether a trademark is currently registered, and where a quoted line comes from) could not be confirmed from the session that wrote this; they are marked.

## 1. What Apple's rules say

Read from Apple's own page on 2026-10-13: [App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/). The page shows no last-updated date, and says it is "a living document".

- **5.2 Intellectual Property:** "Make sure your app only includes content that you created or that you have a license to use." **5.2.1:** "Don't use protected third-party material such as trademarks, copyrighted works, or patented ideas in your app without permission". Apple acts on a rights holder's complaint as well as on what its own reviewers see.
- **4.2 Minimum Functionality:** "Your app should include features, content, and UI that elevate it beyond a repackaged website." The same section lists what Apple does not want (marketing material, web clippings, link collections, thin clients).
- **2.2 Beta Testing:** "Any app submitted for beta distribution via TestFlight should be intended for public distribution and should comply with the App Review Guidelines." So a TestFlight build is read against 4.2 and 5.2 too; it is the same test with less at stake.
- **5.1.1(i):** privacy policy link in the store listing **and** "within the app in an easily accessible manner" (see `docs/app-privacy-answers.md`).

## 2. How the characters are rated

The cast was read from the data, not just from `design.md`: 99 distinct cards (the 60, the Seasoned reward cards, the 14 seasonal cards and every opponent's deck-local cards), 21 opponents, and the flavour text, toast lines and UI strings. Every card face and opponent was listed with a script and checked.

| Rating | Meaning here |
|---|---|
| **Low** | Public domain in the places that matter, folklore, a long-dead historical person, a generic word or phrase, or an original invention. |
| **Medium** | Recognisable and probably defensible, but with a reason someone could object: a public-domain source with a modern adaptation attached, a quoted line whose origin is unverified, a name that collides with someone else's mark in another field, a lookalike risk in the art. |
| **High** | A card or opponent is **named** for a protected character, title or catchphrase, or the name belongs to a living rights holder known to register it for games or software. |

"High" does not mean "illegal". It means "the most likely thing to cost Brent a rejection or a take-down request, for the least gain".

## 3. The cast

### 3.1 People and characters who are named

| Name (where it appears) | What it is, and its status | Risk | Why |
|---|---|---|---|
| **Agatha Christie** (opponent `christie`; card *Dame Agatha*, `legends.ts:57`; toast line) | A real author, died 1976. Her works are protected in the UK and EU until 70 years after her death (2046). Agatha Christie Limited holds a large trademark portfolio, including AGATHA CHRISTIE and MISS MARPLE, concentrated in classes 9 (which includes software), 16 and 41 ([Justia listing](https://trademarks.justia.com/owners/agatha-christie-limited-1426144), [aggregator](https://gleanmark.com/owner/agathachristieltd)). | **High** | A living rights holder that actively licenses and registers the name, in the class a game app falls into, and sells in the same stores. The mark status is from third-party databases and was not checked on the USPTO's own records. |
| **Hercule Poirot** (opponent `poirot`; card, `legends.ts:81`; toast line with "mon ami" and "the little grey cells") | Christie's detective. Early novels are public domain in the US, later ones are not, and the character is protected in the UK and EU as above. The word mark POIROT is listed as registered and renewed to Agatha Christie Limited ([TrademarkElite](https://www.trademarkelite.com/trademark/trademark-detail/74419957/POIROT)); a HERCULE POIROT application is also listed (status not shown). | **High** | Named outright, with the character's catchphrases as the card's flavour and the opponent's line. Same rights holder as above. |
| **Sherlock Holmes** (opponent `holmes`; card, `legends.ts:10`; toast line) | Conan Doyle, died 1930. Public domain in the US: the courts rejected the Estate's argument that later stories extended protection ([Klinger v. Conan Doyle Estate](https://en.wikipedia.org/wiki/Klinger_v._Conan_Doyle_Estate,_Ltd.)); the final ten stories (1923 to 1927) became free in stages and the whole canon should be free in the US since 2023 (not checked to the day). Public domain in the UK ([summary](https://www.loeb.com/en/insights/publications/2014/01/leslie-klinger-v-conan-doyle-estate-ltd)). | **Medium** | The original character is free. The risk is the modern look and feel: the 2010s TV and film versions are protected. Keep the art to the Victorian illustrations' idea (no specific actor, no screen costume designs or catchphrases), and check the Estate has no trademark in the games class (a search this session could not make). |
| **Professor Moriarty** (opponent; card, `legends.ts:35`) | Doyle, 1893. Public domain. | **Low** | Same source as Holmes, with less modern baggage. |
| **"You stand fire admirably."** (Moriarty's flavour line, `legends.ts:50`; *The Reichenbach Falls*, `locations.ts:200`; his opponent line) | A line used three times. **Origin unverified**: a search found it in none of Doyle's texts. It reads like a screenplay line. | **Medium** | If it is from a film or series, it is protected text. Brent to confirm where it came from, or rewrite it in all three places. |
| **Irene Adler** (opponent `adler`; her deck; line "Good night, Mr Sherlock Holmes.") | Doyle, 1891, public domain. The line is from the story. | **Low** | |
| **Inspector Bucket** and **Charles Dickens** (opponents; *Bucket's Forefinger*) | Dickens died 1870; *Bleak House* (1853) is public domain everywhere. | **Low** | |
| **Ada Lovelace** (opponent; *The Analytical Engine*) | Real, died 1852. | **Low** | A long-dead historical figure. |
| **Mary Shelley** (opponent; card) | Real, died 1851; *Frankenstein* (1818) is public domain. | **Low** | Her lines are the game's own. The two Young Frankenstein jokes in her deck are rated separately below. |
| **Dr Jekyll / Mr Hyde** (opponent; card) | Stevenson, died 1894. | **Low** | |
| **Sir Charles Wheatstone** (the barkeep, the pub) | Real, died 1875. | **Low** | Long dead and treated kindly. See section 6 for the app *name* "Wheatstone". |
| **The Carpathian Count / The Count / Renfield** (visitor; card, `halloween.ts:64`; deck-local, `decks/count.ts:26`) | Stoker's *Dracula* (1897), public domain; Stoker died 1912. | **Low** | The code comments already avoid the film look (no widow's peak, no medallion). The risk to watch is the *art*, not the name: keep it away from the 1931 film's look. "The Count" alone is also the name of a Sesame Street character, so keep the full "Carpathian Count" wording wherever it is displayed. |
| **Mr Griffin, Thomas Marvel, Mrs Hall** (visitor; deck-locals) | Wells, *The Invisible Man* (1897). | **Low** | |
| **The Creature / The Galvanic Creature** (visitor; card, `halloween.ts:101`) | Shelley, 1818. | **Low** | As with the Count, the risk is the art: flat head and neck bolts are Universal's look and the code comments avoid it. |
| **Spring-Heeled Jack** (legend, Wake only; card) | Victorian folklore, 1837 onward. | **Low** | |
| **The Clockwork Pharaoh, The Hampstead Wolf, The Gentleman of the Heath** | Original inventions on folklore (mummy, werewolf). | **Low** | |
| **Hiawatha, Banshee, Bramwell, Charlotte, Emily** (the pub cats) | Names from poetry, folklore and the Brontës, all generic. They are also **the real cats** (see section 8). | **Low** | Personal, not an IP problem. |
| **Constable Tobias Mudd, Old Nell Ashby, "Dodgy" Reg Farrow, Miss Prudence Hollis, Sergeant Pike, Detective Sergeant Vale** and the other everyday names | Original characters in the game's own world. | **Low** | None found that match a famous character. |

### 3.2 Borrowed jokes, titles and catchphrases in names and text

These are the easter eggs from `design.md` §15 that were built into cards and UI.

| Where | Source it echoes | Risk | Why |
|---|---|---|---|
| **Good News, Everybody!** (card, `families/irregulars.ts:154`), flavour "Wernstrom! No — sorry. Wrong headline." | *Futurama* (a catchphrase as the **card name**, and a named character in the text) | **High** | The title is the franchise's catchphrase and the flavour names one of its characters. Recognisable to anyone who has seen the show. |
| **Party Time. Excellent.** (card, `families/foundry.ts:149`) | *Wayne's World* catchphrase, used as the **card name** | **High** | Same pattern: a film's catchphrase as the name. |
| **Abby Normal** (card, `decks/shelley.ts:32`), flavour "It's pronounced Frankenstein." | *Young Frankenstein* (1974): a named character and the film's best-known line | **High** | The card is named for a film character and carries a famous line. |
| **Eye-gor** (card, `decks/shelley.ts:53`), flavour "Walk this way." | *Young Frankenstein*: the film's spelling joke, with its famous line | **High** | Same film, same pattern. |
| **The Hypnofrog** (card, `families/salon.ts:136`), flavour "All glory to it…" | *Futurama*'s Hypnotoad and its "All glory to the Hypnotoad" | **Medium** | A parody in name and line. If the art is a large-eyed wobbling toad it will also look like the original. |
| **Resurrection Man** (card, `nightfall.ts:30`) | The real Victorian term for a body-snatcher, and also a DC Comics character and series title | **Medium** | The phrase is period-accurate, but a comic-book hero already carries this exact title. |
| **The Overnight Express** (location, `locations.ts:213`), "everybody had a compartment" | The plot of Christie's *Murder on the Orient Express* | **Medium** | The idea is not protectable, but it sits in the cast Christie rated High, and the text is an obvious nod. Goes with Christie. |
| **Sabotage** flavour "If you can dodge a spanner, you can dodge a constable." (`families/foundry.ts`) | *Dodgeball* ("If you can dodge a wrench, you can dodge a ball") | **Low** | One reworded joke line in flavour text. |
| **The Concertina Works** flavour "Sign on the wall: NO STAIRWAY." (`locations.ts:41`) | *Wayne's World*'s "No stairway" sign | **Low** | A two-word allusion, not the film's words. |
| **Séance** flavour "Not sure if the spirits, or the drains." | an internet meme format | **Low** | Generic. |
| **Take my Checks** (Pawnbroker button) | *Futurama*'s "Shut up and take my money" | **Low** | Not a quotation. |
| **The blue cellar door, "a fixed point"** | *Doctor Who* (allusion only, no names) | **Low** | No BBC name, no police box shape. |
| **The Witching Hour** (location) | A common phrase; also a book and comic title | **Low** | Generic phrase. |
| **Scotland Yard Announces Arrests** (headline) | A real institution's name | **Low** | A place name and a description, no badge or logo. |
| **Game on.** (coin-toss screen) | an everyday phrase | **Low** | |

## 4. Stand-ins for every High item

Original names, same mechanics. Nothing here changes a card's points, keywords or rules text, so the sim and the balance pass do not move. Only name, flavour and art id change, and the art would need regenerating. This is a menu for Brent, not a done change.

| High-risk card | Original stand-in | Keeps | Flavour line (new) |
|---|---|---|---|
| Agatha Christie, *Dame Agatha* (Salon legend) | **Dame Octavia Marlowe**, the Queen of Cosy Murder | Friend deck that Returns key cards; Persist/Elusive/Friend as printed | *"The obvious suspect is the deck you built."* (already original, keep it) |
| Hercule Poirot (Yard legend) | **Mr Ambrose Quillfeather**, Consulting Arranger, fussy about the row | Friend +1; Flip the opposing card with the most points (the "cards snap into a perfect row" idea in `design.md` §9.3 is not built, so there is nothing to carry over) | *"A tidy mind, madam, has already finished."* |
| *Good News, Everybody!* (Irregulars headline) | **STOP PRESS: GLAD TIDINGS** | "each player draws 2, then discards one at random" | *"Hold the front page. For once, it's good."* |
| *Party Time. Excellent.* (Foundry card) | **Early Whistle** | as printed | *"The Foundry's whistle blew an hour early. Nobody's arguing."* (the flavour already works; only the name changes) |
| *Abby Normal* (Shelley's deck) | **Gwendolyn Fumble**, Laboratory Assistant | 6 pts; On Play: flip one of your own cards worth 2 or less | *"She fetched the wrong brain. It was a lively one."* |
| *Eye-gor* (Shelley's deck) | **Squint**, the Doctor's Man | 1 pt; Draw 1 | *"Carries the lantern and the opinions."* |

Medium items worth acting on at the same time, if Brent wants a clean sheet: *The Hypnofrog* to **The Mesmerist's Toad** (and an art check against the Hypnotoad's look), *Resurrection Man* to **The Resurrectionist** (the period's own word), and Moriarty's "You stand fire admirably" (rewrite, or confirm the source).

Whatever Brent decides, the opponent lines for Christie and Poirot, the toast lines for both (`src/tournaments/toast.ts`) and the House Rules wording must change with the card, or the old name survives in the text.

## 5. Guideline 4.2 (minimum functionality) for a wrapped web app

**Risk: low to medium.** It is low because of what the app is, and medium only because a reviewer who is in a hurry sees a web view and may stop there.

**Why it should pass.** Apple's test is features, content and UI "beyond a repackaged website". This app has a full rules engine and an AI opponent with three difficulty levels, 99 cards and 21 opponents with original art, a progression and save system, a tutorial, a tournament system with a persistent bracket, and a seasonal-event layer. It is a game, not a site in a frame. None of the 4.2 "does not want" categories apply: no marketing material, no link collection, no thin client for a server (there is no server).

**Native touches the app already has**, checked in the source:

| Touch | Where | Notes |
|---|---|---|
| Fully offline | `npm run cap:sync` builds `--mode native` with every image and sound inside the binary and no service worker | There is no network dependency at all (`docs/app-privacy-answers.md`). A reviewer on a plane can play. |
| Capacitor Preferences mirror of the save | `src/native/storageMirror.ts`, started from `src/boot.ts` | Restores progress if iOS clears the web view's storage. |
| Haptics | `src/native/haptics.ts`, called from `src/ui/matchScreen.ts:686` | Exactly one call site: a light tap when a card is played. |
| Splash screen and status bar | `capacitor.config.ts` (1.2 s, dark), `src/native/native.ts` | |
| Safe-area layout, portrait only, iPhone only | `src/style.css` (`env(safe-area-inset-*)`, `100dvh`); `Info.plist` | |
| Own app icon, display name "Wheatstone" | `ios/`, `assets/` | |
| Audio unlocked by the first tap | `src/audio/soundEngine.ts` | iOS rules. |

**Worth adding, in order of value for review.** None of these is needed to pass; they make a hurried reviewer's first impression "native app".

1. **Native share sheet for "Save & data" export.** Today it relies on `navigator.share` with files and falls back to a blob download, which iOS web views may not honour. `@capacitor/share` fixes both the feel and the reliability. User-initiated and local, so the App Privacy answer is unchanged.
2. **A few more haptics** on round won, round lost and a Flip. Trivial, no privacy effect.
3. **A privacy-policy link inside the app** (5.1.1(i) above). Needed for a public listing, not for beta.
4. **Local notifications** ("the box behind the bar has something in it"). Real native value, no network, but it adds a permission prompt and a reason to explain it in review notes. Optional.
5. **Not recommended now:** Game Center or any cloud feature. It would need a network, change the App Privacy answers and the policy page, and open guideline 4.8 and others. Revisit only as a deliberate project.

Also for the review notes, plain words help: "an offline card game; no account, no network, no purchases; the first launch plays a guided tutorial." The checklist already has this text.

## 6. Other things that are not about characters

- **The app name "Wheatstone."** It is the real physicist, but a company called **Wheatstone Corporation** also makes broadcast audio equipment (from general knowledge; not checked in this session). The goods are different, and software is a separate market, so confusion looks unlikely. It could not be searched in a trademark register from here. Before a *public* listing, check the USPTO and EUIPO for WHEATSTONE in classes 9 and 41. The home-screen name is separate from the store name; the store fallback is "Wheatstone Bridge".
- **Art.** The card art is generated in the Gemini app (`docs/style-bible.md`, `art/prompts/`). Two things to settle before going public: that Google's terms for the generated images permit commercial use, and that no image reads as a specific film character (the Count, the Creature, Holmes and the Hypnofrog are the ones to eyeball). Under current US practice, purely AI-generated images may not be copyrightable by the person who prompted them, so the art may be freely copyable by others; that is a commercial question rather than a review one.
- **Audio.** `public/audio/ambience.mp3` (4 MB) is a track Brent supplied, recorded in `docs/logs/2026-09-12.md` as "CC0/licensed" without the source or licence text. For a public listing, write down where it came from and the licence terms.
- **Where the game's rules come from.** `CLAUDE.md` and `design.md` describe the rules as Gwent-style, with Nokturna / Moonlight Peaks as the base and Magic: The Gathering's rarity and keyword vocabulary. None of those names appears in the app, and game mechanics are generally ideas rather than protected expression. Keep it that way: do not use those names in the store title, subtitle, keywords, description or screenshots.
- **In-app purchase and sign-in:** none exist, which keeps guidelines 3.1 and 4.8 out of scope.

## 7. Gift touches that belong behind a "gift edition" flag

Everything below is personal to Sara. A public build would want a single build-time flag (for example `VITE_EDITION=gift` against a default of `public`, read in one small module) so the gift build is unchanged and the public build has none of this. The existing seam: `vite.config.ts` already switches behaviour by build mode, and `src/player/playerState.ts`, `src/events/eventClock.ts` and `src/tournaments/tournaments.ts` each own the logic that needs the check.

| Gift touch | Where it lives | In a public build |
|---|---|---|
| **The dedication screen** ("Licensed to Sara... Happy birthday. — B.") and its Sep 1 to Oct 29 hold | `src/ui/dedicationScreen.ts`, `dedicationShouldShow` in `src/player/playerState.ts`, the call in `src/main.ts` | Never shown; go straight to the tutorial. |
| **Default player name "Sara"** | `DEFAULT_NAME` in `src/player/playerState.ts`; the pub-hub name field | Default to a neutral name or ask once. |
| **The Birthday Invitational**: the tournament, its Oct 30 trigger, its prize, the hidden-until-triggered chalkboard and House Rules rows | `src/tournaments/tournaments.ts`, `checkInvitationalTrigger` in `tournamentState.ts`, `src/ui/tournamentsScreen.ts`, `src/ui/houseRulesScreen.ts`, `src/main.ts` (`syncTournamentTrigger`) | Remove the tournament, the trigger and the flag. |
| **The toast** (Holmes, Moriarty, Christie, Poirot, Jekyll/Hyde, Shelley and Sir Charles toasting "Sara"/"the Landlady") | `src/tournaments/toast.ts`, `src/ui/bracketScreen.ts` | Goes with the Invitational. (It also contains the High-risk names.) |
| **The Landlady card**, its art and its "reserved" silhouette in the deck builder | `src/cards/data/landlady.ts`, `public/art/the-landlady.webp`, the "Reserved" case in `src/ui/deckBuilderScreen.ts`, the `the-landlady` exclusion in `src/tournaments/prizes.ts` | Without the Invitational it can never be earned; hide it and the silhouette. It is one of the labelled 60, so the set size changes to 59 and `dataSet.test.ts`, the sim and the art manifest need to know. |
| **House Rule 5** "The Landlady's chair is the Landlady's chair." and the licence-over-the-door lore | `src/ui/houseRulesScreen.ts:38`, `docs/design.md` §1.4 | Drop the rule, or rewrite it without the reference. |
| **The real pub cats**: Hiawatha, Banshee, Bramwell, Charlotte, Emily, whose art briefs cite the real animals | `src/cards/data/families/*.ts`, their art | Not a problem for a store; a personal choice whether to keep real pets' names and likenesses in a public product. |
| **The date logic tied to her birthday** and the `?now=` / `?preview=1` dev clock | `src/events/eventClock.ts`, `src/main.ts` | Not personal, but the dev clock is worth disabling in a public build so a player cannot reach it. |

The Hallowe'en layer is a calendar feature and not personal; it can stay.

Because tests use these features, a public edition needs the e2e specs that touch the Invitational, the dedication and the Landlady to run with the gift flag on (`tests/e2e/birthday.spec.ts`, `tutorial.spec.ts`, `tournaments.spec.ts`, `houseRules.spec.ts`, `soak.spec.ts`).

## 8. What this means for the go/no-go (ATT-32)

- **Nothing here blocks the 20 Oct TestFlight build or her gift.** Beta review reads the guidelines, but the cast is a gift risk of zero and a low risk in a private beta.
- **A public listing is possible with a short list of changes:** the six High items in section 4 (two are Christie's, four are film or series jokes), a decision on the Medium items, the gift-edition flag in section 7, a privacy link inside the app, and a record of the audio licence and art terms.
- **The cheapest first step is the four non-Christie High items,** because they are jokes the game can lose without losing anything else. The Christie and Poirot replacements are the larger creative decision, since both are among the six legends.
- **Public versus Unlisted** (the other half of ATT-32) does not change any of this: both go through full App Review.

## Sources (read 2026-10-13)

- [App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/) (4.2, 5.2, 2.2, 5.1.1(i)); no last-updated date shown.
- [Agatha Christie Limited trademarks (Justia)](https://trademarks.justia.com/owners/agatha-christie-limited-1426144), [POIROT (TrademarkElite)](https://www.trademarkelite.com/trademark/trademark-detail/74419957/POIROT): third-party databases, not the USPTO's own records.
- [Klinger v. Conan Doyle Estate](https://en.wikipedia.org/wiki/Klinger_v._Conan_Doyle_Estate,_Ltd.), [Loeb & Loeb summary](https://www.loeb.com/en/insights/publications/2014/01/leslie-klinger-v-conan-doyle-estate-ltd).
- The repository itself: a script listed every card face and opponent from `src/cards/data/` and `src/pub/opponents.ts`.
