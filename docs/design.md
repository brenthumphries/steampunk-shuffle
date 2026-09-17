# Steampunk Shuffle — Game Design Brief

**Status:** v1, **approved by Brent September 10, 2026** (plan step 0.2 complete).
**Authority:** once approved, this document outranks the plan on anything about the game itself. Later steps cite section numbers (`design.md §6.3`). If a downstream step needs a rule this document doesn't give, it adds the rule *here* first, then implements it.
**Notation:** anything in a `Rules text:` block is literal, engine-facing wording. Everything else is intent and flavour.

---

## 1. The pub

### 1.1 Name and address

**The Wheatstone Bridge**, Galvanic Court, off the Strand, London. The year outside is 1871. The year inside is negotiable.

Sir Charles wanted to call it *The Galvanometer*. Nobody could spell it, the sign-writer quoted by the letter, and the regulars had been calling it "the Bridge" for a month before the paint was dry. He has never quite forgiven Faraday for laughing. (Alternatives if you'd rather: *The Concertina & Crown*, *The Playfair Arms*. Both are his inventions too. The Bridge is the recommendation — a pub called *The Something Bridge* is the most English thing there is, and this one happens to be a bridge in the other sense.)

### 1.2 What the Bridge is

A narrow, gaslit public house — taproom, snug, back parlour, cellar — that is considerably roomier inside than the frontage on Galvanic Court suggests. It sits on a fault in time. Sir Charles found it by accident while measuring the earth's current through the cellar floor: his bridge circuit refused to balance, then balanced perfectly, and when the galvanometer read zero the cellar door opened onto a Tuesday in 1603.

He has since understood the arrangement well enough to run a pub on it. The bridge circuit in the cellar keeps the fault *balanced*; while it's balanced, the front door opens on the Strand in 1871 and the cellar door opens on whenever it likes. Patrons who come up the cellar stairs are welcome, as long as they settle their tab. Nobody remembers painting the cellar door blue.

That's the whole science-fiction budget of the game and it buys three things: historical figures from any century can be pub regulars without explanation; legends "in town tonight" is a natural rotation; and the birthday can be a fixed point that the pub has been waiting for.

### 1.3 Sir Charles Wheatstone, proprietor and barkeep

Real man, lightly fictionalised: physicist, inventor of the concertina, the stereoscope and the Playfair cipher, co-inventor of the electric telegraph, populariser of the Wheatstone bridge (he will tell you it was Samuel Hunter Christie's bridge, if you ask; nobody asks), knighted 1868, famously so shy of public speaking that Faraday delivered his lectures for him.

That shyness is the character. He narrates the tutorial in short sentences, apologises when he wins a round, keeps a concertina behind the bar and plays it only when the pub is empty, and communicates anything important by writing it on a beer mat and sliding it across. He is kind, exact, and a little sad that everyone else is better at talking than he is. He is the house: every newcomer's first game is against him, and he never plays a legend's deck — he plays the Foundry, because he built most of it.

**Voice sample (tutorial):**
> "Evening. I'm Wheatstone. This is the Bridge. You'll want a drink and a deck, and I've only got one of those licensed, so — deck. Sit anywhere. Not there. That's Charlotte's."

### 1.4 The Landlady

Sir Charles runs the Bridge. He doesn't own it. The licence over the door reads **SARA ALOYSIUS — Licensed to sell intoxicating liquors, and to keep a house at all hours** and always has, in a hand nobody recognises, on a board that predates the building. The regulars refer to "the Landlady" the way sailors refer to weather. Sir Charles keeps her chair by the fire, keeps the cats fed on her account, and has been holding the cellar door for a specific evening for some years now.

The Landlady is Sara. She is the game's default player name, the dedication, the Birthday Invitational's guest of honour, and the last card you can earn (§14).

### 1.5 The house rules (posted by the bar)

1. No wagers above a sovereign.
2. No arguing with the galvanometer.
3. Cats have right of way.
4. Settle your tab in the century you ran it up.
5. The Landlady's chair is the Landlady's chair.

These appear on the House Rules reference page (§13.4) above the actual rules, so the rules page opens with a joke and feels like part of the pub rather than a manual.

### 1.6 Nokturna in the Bridge's terms

Nokturna is a points game (plan §8). Here it's the pub's card game — "**the Shuffle**" — played at every table, with decks built from cards the regulars trade, win and pawn. Cards depict the people, places, contraptions and headlines of the Bridge's world. Winning a round is "taking the round"; winning the match is "taking the table". Flipping a card is "nicking" it — as in arrest, and as in theft, depending on which family did it.

---

## 2. Tone

**Cozy mystery to Law & Order.** Crimes happen; bodies are discovered, tastefully, off-card. Villains are villains and detectives are clever. Nothing is gory and nobody is cruel for fun. The steampunk is Victorian-engineering steampunk — brass, steam, telegraph wire, difference engines, a dirigible over Holborn — not goggles-and-corsets cosplay. The comedy is dry, mostly in flavour text, and occasionally lets a 20th-century film line walk in through the cellar door (§15).

Rules for writers (the `ss-card-author` skill enforces these):

- Flavour text is one or two sentences, in-world, and never explains the mechanic.
- Historical figures are treated with affection and accuracy where it's funny (Wheatstone's shyness, Christie's eleven missing days, Brunel's hat). Literary figures behave as in their books.
- Violence is implied, past tense, and solved. "The body in the library" is fine; the wound is not described.
- Cats are always right.
- No lettering in art prompts — the UI supplies all text (plan §6).

---

## 3. Card anatomy and types

Every card has: **name**, **type**, **family** (Characters and family-affiliated Gadgets/Schemes) or *neutral*, **printed points** (0–6), **rarity** (common / uncommon / rare / legendary), zero or more **keywords**, optional **ability text**, **flavour text**, **art id**, and (rare) a **second face** (§5.9).

| Type | Nokturna analogue | Has family? | Points | What it is |
|---|---|---|---|---|
| **Character** | family cards | yes | 1–6 | People (and cats). The bulk of every deck. |
| **Gadget** | Item | usually | 0–2 | Contraptions, tools, documents. Small points, small effects, often Persist. |
| **Scheme** | Spell | usually | 0 | One-shot: On Play, then it's spent. Flips, draws, un-flips. |
| **Location** | Location | never | 0 | A place. One active at a time, shared, replaces the last (§5.6). |
| **Headline** | Deity | never | 0 | A newspaper front page — a big, symmetrical, world-changing event. Rare by rarity. |

Family affiliation on Gadgets/Schemes matters only for **Friend** counting (§5.4) and deck-building filters.

---

## 4. The five families

Each family is a playstyle first and a theme second. Newcomers should be able to say "I play the Yard" and know what that means in one sentence. Frame colours are for step 3.1; palette names match the style bible (0.3).

| Family | Who | Playstyle | Signature keywords | Frame |
|---|---|---|---|---|
| **The Yard** | Constables, inspectors, magistrates, the Peelers | **Grind.** Mid points, arrests (Flip), officers who Persist across rounds. Wins round three by still being on the board. | Flip, Persist | Gunmetal blue |
| **The Irregulars** | Street kids, informants, consulting detectives, flower sellers, cabbies — everyone who *knows things* | **Trickery / information.** Low points, Elusive, draw, reveal, cheap answers. Wins by having the right card, not the biggest. | Elusive, Draw, Return | Gaslight amber |
| **The Rookery** | Cracksmen, forgers, fences, Moriarty's web | **Trickery / aggro.** Low-to-mid points, Flips that steal tempo, cards that leave before they can be arrested. Wins round one fast and bluffs round two. | Flip, Return, Elusive | Oxblood leather |
| **The Foundry** | Engineers, inventors, automatons, the works | **Points-fast / ramp.** The highest printed points in the game and the fewest abilities. Machines that Persist and stack up. Wins by weight. | Persist, high points | Brass and copper |
| **The Salon** | Authors, aristocrats, vicars' daughters, mediums, the village green — the cozy-mystery cast | **Friend synergy.** Individually weak, collectively strong; un-flips, protections, the pub cats. Wins when the drawing room is full. | Friend, un-flip | Verdigris |

**Points curves** (average printed points across the family's Characters; 1.5 authors to these, 1.4 verifies): Foundry 3.8 · Yard 3.0 · Salon 2.4 · Rookery 2.4 · Irregulars 2.0. Total printed points across a family's nine cards should land between 18 (Irregulars) and 30 (Foundry).

**Archetypes players discover** (for opponent decks and the House Rules page): *Yard + Salon* "the Village Constable" (starter deck) · *Foundry + Yard* "Heavy Industry" · *Rookery + Irregulars* "The Long Con" · *Salon + Irregulars* "The Parlour Game" · *Foundry + Rookery* "Sabotage".

---

## 5. Keywords and rules text (engine spec)

Keyword names are canonical and appear in the UI exactly as written. Reminder text (in parentheses on the card, MTG-style) is what a newcomer sees.

### 5.1 Points
Every card has printed points. A player's **score** for the round is the sum of the **effective points** of face-up cards on their side. Effective points = printed points + modifiers (Friend, Locations, abilities). Face-down cards have 0 effective points and no keywords or abilities. Effective points cannot go below 0.

### 5.2 On Play
*(Does something once, when you play it.)*
Rules text: `On Play` abilities resolve immediately after the card enters play, before the turn passes. If a card enters play any other way (e.g. un-flipped, transformed), On Play does **not** trigger.

### 5.3 Persist
*(Stays on the table at the end of the round.)*
Rules text: At end of round, a face-up card with Persist stays in play on its side and its points count in the next round. A face-down card is discarded at end of round even if it has Persist.

### 5.4 Friend +N
*(Worth N more while another face-up Friend is on your side.)*
Rules text: While at least one **other** face-up card on your side has Friend, this card gets +N effective points. The bonus does not stack per Friend unless the card says "for each". Face-down Friends don't count.

### 5.5 Elusive
*(Can't be flipped.)*
Rules text: This card cannot be Flipped and cannot be chosen by an opponent's Return or steal effect. It can still be discarded at end of round normally.

### 5.6 Location
*(One at a time, shared. A new one replaces the old.)*
Rules text: Locations play to the shared centre slot, not to a side. Playing a Location discards the current one. A Location stays through round ends. Locations have 0 points, cannot be Flipped, and are not on either side for Friend purposes. Location effects apply to both players unless the text says "your".

### 5.7 Flip
*(Turn an opposing face-up card face-down. It's worth 0 and does nothing.)*
Rules text: `Flip <target>` turns a face-up card on the opponent's side face-down. Flipped cards keep their identity (so an un-flip restores them) but have 0 points and no keywords/abilities while face-down. All face-down cards are discarded at end of round. Flip cannot target Elusive cards or Locations. If no legal target exists the Flip does nothing. Targeting constraints like "worth 3 or less" test **effective** points at the moment of the Flip.

**Un-flip** is not a keyword; it's ability text: "Turn one of your face-down cards face-up." An un-flipped card resumes its printed points, keywords and continuous effects; On Play does not retrigger.

### 5.8 Return
*(Goes back to your hand at the end of the round.)*
Rules text: At end of round, a face-up card with Return goes to its owner's hand instead of being discarded. Face-down cards are discarded regardless. Return beats Persist if a card somehow has both.

### 5.9 Draw N
Rules text: Draw N cards from the top of your deck. If the deck has fewer than N, draw what's there. There is no hand limit.

### 5.10 Transform (legend-only, two-faced cards)
*(At the start of each round, this card turns over to its other face.)*
Rules text: A two-faced card is one card with a front face and a back face, each with its own name, points, keywords and text. Only the front face counts for deck-building points. At the start of each round (before draws), every face-up two-faced card in play transforms to its other face; this is not "entering play", so On Play doesn't trigger. Transforming keeps any Persist/face-down state. Only Dr Jekyll uses this in v1 (§9.3); the schema (1.1) must support it, the engine (1.2) must test it.

### 5.11 Reveal
Rules text: "Reveal your opponent's hand" shows the opponent's hand face-up to you until end of turn. In the UI this is a fanned overlay; the AI, when it reveals yours, just knows (it already samples hidden hands — this sets its sample to the truth for one turn). Holmes only, v1.

### 5.12 Legendary (rarity rule)
Rules text: A deck may contain at most **one** copy of each legendary card.

### 5.13 Timing and ordering
- Continuous effects (Friend, Location modifiers) are recomputed whenever the board changes.
- When a card is played: it enters play → its own On Play resolves → then any "whenever a card is played" effects from Locations resolve. There are no other triggered effects in v1; keep it that way unless this section is amended.
- The engine must never ask a question it can't answer deterministically: every targeted ability has a target-selection rule for the AI (highest effective points, then leftmost/oldest) and prompts the human.

---

## 6. Match rules (engine spec)

### 6.1 Setup
Each player has a legal 20-card deck (§7.2). Shuffle. Draw 4. Sir Charles's sovereign is tossed to decide who **leads** round 1 (animated coin; in the tutorial the house always leads).

### 6.2 Round
1. **Start of round.** Transform any two-faced cards (§5.10).
2. **Three turns each, alternating**, leader first. At the start of your turn, draw one card (§5.9) — then you must play exactly one card from your hand. If your hand is empty you pass. There is no voluntary pass.
3. **End of round.** Compare scores. Higher score takes the round; equal scores, nobody takes it. Then: Return cards go to hand; face-down cards are discarded; face-up non-Persist cards are discarded; Persist cards and the Location stay.
4. **Next leader:** whoever did **not** take the previous round. If nobody took it, the player who did not lead it.

### 6.3 Match end
- First player to take **two rounds** takes the table. The match ends immediately (a third round isn't played after 2–0).
- After three rounds with no player on two: more rounds taken wins; else higher **total** score across all three rounds wins; else the match is a **draw**.
- Draws: pickup games pay no reward and count as neither win nor loss. Tournaments cannot end in a draw — the sovereign is tossed ("The galvanometer's call").

### 6.4 Undo
A human may take back a card before the turn commits (plan 2.1). The commit is the moment On Play resolves. No undo after commit; the AI never undoes.

### 6.5 Hidden information
Hands and decks are hidden; discards are public; the top of the deck is unknown. The AI (1.3) samples opponent hands from the known deck list minus seen cards — every opponent's deck list is public in the pub ("everyone knows what Mudd plays"), and the player's own deck is known to the AI likewise. This is a design choice: it keeps the AI honest and makes deck lists a thing players read.

---

## 7. Points economy, rarity and deck legality

### 7.1 Why points are the economy
There is no mana. The **60-printed-point cap** across 20 cards is the entire resource system: every high-point card you add forces low-point cards elsewhere, and low-point cards are where the abilities live. The community wisdom for Nokturna — 50–60 points, focus on one or two families, abilities over vanilla — is the intended endgame here too, and the starter deck deliberately sits at 37 so there is room to grow into.

### 7.2 Deck legality (1.1 validator)
Rules text: A deck is legal when it has exactly 20 cards; no more than 2 copies of any card by name; no more than 1 copy of any legendary; total printed points (front faces) ≤ 60. The player's 13 deck slots may hold illegal decks; illegal decks cannot be selected for play and the builder says why.

### 7.3 Rarity
Rarity governs how much a card *does*, not how many points it's worth. A common can be a 5-point vanilla; a rare is usually cheap points with a clever text box.

| Rarity | Design rule | Frame treatment (3.1) |
|---|---|---|
| Common | Vanilla, or one keyword | Plain family frame |
| Uncommon | One keyword + one short ability | Frame with rivets |
| Rare | Two keywords, or a targeted ability with a condition | Engraved frame |
| Legendary | Unique, one per deck, signature of a legend or the Landlady | Gold-leaf frame, foil shimmer |

### 7.4 Printed-point ranges
Character 1–6 · Gadget 0–2 · Scheme 0 · Location 0 · Headline 0 · Legendary Character 2–6. Nothing prints above 6. Effective points can exceed 6 via Friend and Locations; the sim (1.4) flags any card whose *average* effective points exceed printed + 3.

---

## 8. Card set v1 (what 1.5 authors)

### 8.1 Composition — 60 cards

| Slice | Count | Rarity split |
|---|---|---|
| 5 families × 9 (6 Characters incl. 1 pub cat, 1 Gadget, 1 Scheme, 1 Headline) | 45 | per family: 4 C, 3 U, 2 R |
| Locations | 8 | 4 U, 4 R |
| Legend signature cards (§9.3) | 6 | legendary |
| The Landlady (§14.3) | 1 | legendary |
| **Total** | **60** | 20 C · 15 U · 10 R · 8 Loc · 7 L |

Headlines are family-flavoured but **neutral** for Friend purposes, so any deck can run them.

### 8.2 The pub cats (one per family, all Friend — "the clowder")

The five cats of the Bridge. All are Characters, all have Friend, and because Friend counts any other Friend, a Salon player running three cats gets the whole clowder purring. They are the most personal cards in the set; the art brief for each cites the real cat.

| Cat | Family | Card | Rules | Flavour |
|---|---|---|---|---|
| **Hiawatha** | Irregulars | 2 pts, rare | Elusive. Friend +1. On Play: Flip an opposing card worth 2 or less. | *He called from down the hall and round the corner. You went. That was the mistake.* — Art: black American shorthair, half in shadow, eyes only. |
| **Banshee** | Salon | 3 pts, uncommon | Friend +1. On Play: discard the active Location. | *Nobody is going anywhere in the carriage. Nobody. Ask her.* — Art: long-haired tortoiseshell mid-yowl in a hansom cab. |
| **Bramwell** | Salon | 2 pts, common | Friend +2. | *Announces himself in the doorway, then in your lap, then again in case you missed it.* — Art: tuxedo cat in evening dress posture, mouth open. |
| **Charlotte** | Yard | 2 pts, uncommon | Persist. Friend +1. | *Once settled she is not moving, and neither, constable, are you.* — Art: grey-on-grey American shorthair asleep on a constable's helmet. |
| **Emily** | Rookery | 1 pt, rare | Elusive. Return. On Play: Draw 1. | *Small, brown, and gone before the treat tin closes.* — Art: tiny long-haired brown tabby on a pawnbroker's counter, one paw in a tin. |

A Location and a Headline complete the set: **The Parsonage Snug** (Location, uncommon: *Each face-up Friend card gets +1.* — *Where the cats sleep. Named for a house in Haworth none of them have visited.*) and **CAT BURGLAR STRIKES AGAIN** (Headline, rare: *On Play: each player Flips their own lowest-point non-Elusive card.* — *Nothing taken but a sardine. Constabulary baffled.*)

### 8.3 Tutorial cards (must exist with exactly these stats)

The tutorial (§13) forces specific hands. These cards are locked; 1.5 may retune anything *else*.

**Player's starter deck — "the Village Constable" (Yard + Salon), 20 cards, 37 printed points:**

| × | Card | Family / type | Pts | Rarity | Text |
|---|---|---|---|---|---|
| 2 | Constable on the Beat | Yard Character | 3 | C | — |
| 2 | Night Watchman | Yard Character | 5 | C | — |
| 1 | Sergeant Pike | Yard Character | 4 | U | Persist. |
| 2 | Inspector's Warrant | Yard Scheme | 0 | C | On Play: Flip an opposing card worth 3 or less. |
| 2 | Police Whistle | Yard Gadget | 1 | C | On Play: Draw 1. |
| 1 | Charlotte | Yard Character | 2 | U | Persist. Friend +1. |
| 2 | Parlour Guest | Salon Character | 2 | C | Friend +1. |
| 1 | Amateur Sleuth | Salon Character | 2 | U | Friend +2. |
| 1 | Bramwell | Salon Character | 2 | C | Friend +2. |
| 1 | Séance | Salon Scheme | 0 | U | On Play: turn one of your face-down cards face-up. |
| 2 | Afternoon Tea | Salon Gadget | 1 | C | Friend +1. |
| 1 | The Parsonage Snug | Location | 0 | U | Each face-up Friend card gets +1. |
| 1 | Hiawatha | Irregulars Character | 2 | R | Elusive. Friend +1. On Play: Flip an opposing card worth 2 or less. |
| 1 | Emily | Rookery Character | 1 | R | Elusive. Return. On Play: Draw 1. |

(Two cats outside the deck's families on purpose: the starter teaches that families are a guide, not a rule, and it shows off two cats early.)

**The House deck — Sir Charles's Foundry deck for the tutorial** (also his everyday deck; only these nine cards are locked):

| Card | Type | Pts | Rarity | Text |
|---|---|---|---|---|
| Apprentice Fitter | Foundry Character | 2 | C | — |
| Boiler Hand | Foundry Character | 3 | C | — |
| Riveter | Foundry Character | 3 | C | — |
| Brass Cog | Foundry Gadget | 1 | C | Persist. |
| Steam Hammer | Foundry Character | 4 | C | — |
| Foreman Gudgeon | Foundry Character | 5 | U | — |
| Difference Engine | Foundry Character | 6 | U | — *(No Persist: it must not carry into round 3 of the tutorial.)* |
| Sabotage | Foundry Scheme | 0 | U | On Play: Flip an opposing card worth 3 or less. |
| The Concertina Works | Location | 0 | U | Each face-up Foundry Character gets +1. *(Sign on the wall: NO STAIRWAY.)* |

---

## 9. Opponents

Every opponent has a **tier** (sets the AI dial from 1.3), a **deck** (public), a **reward card** (given once, on your first win against them), a **bet pool** (cards they'll stake in a Bar Bet, §11.5) and a **line** (what they say when they sit down). Authoring priority for 1.5 is the table order; the plan's "10 decks" in 1.5 covers the House deck, four regulars, three seasoned and Holmes, Christie, Jekyll. The rest land in 2.3.

### 9.1 Regulars (tier 1 — AI "regular": loses ~40% to the starter deck played sensibly)

| Opponent | Family | Deck archetype | Reward card | Line |
|---|---|---|---|---|
| **Constable Tobias Mudd** — a rookie Peeler, earnest, always slightly out of breath | Yard | Straight points, one Warrant | *Sergeant Pike* | "I'm not on duty. Well. I'm a bit on duty." |
| **Old Nell Ashby** — flower seller, knows everything, tells you half | Irregulars | Cheap Elusive cards, draw | *Nell's Basket* (Gadget: On Play: Draw 2) | "Violets, guv? Or the other thing?" |
| **"Dodgy" Reg Farrow** — a fence with a wounded sense of honour | Rookery | Return tricks, one Flip | *Reg's Ledger* (Scheme: Flip an opposing card worth 2 or less; Draw 1) | "Everything on this table's legitimate. Mostly." |
| **Miss Prudence Hollis** — the vicar's daughter, writes mysteries under a man's name | Salon | Friend, Afternoon Tea, the cats | *Miss Hollis, Authoress* (3 pts, Friend +2, Elusive) | "I've already worked out how you did it. Sit down." |

### 9.2 Seasoned (tier 2 — AI "seasoned": wins ~55–60% vs the starter, ~45% vs a tuned deck)

| Opponent | Family | Deck archetype | Reward card | Line |
|---|---|---|---|---|
| **Inspector Bucket** (Dickens, *Bleak House*, 1853) — the first police detective in English fiction, patient, forefinger raised | Yard + Irregulars | Persist officers, two Flips, reveal-ish draw | *Bucket's Forefinger* (Scheme: Flip an opposing card worth 4 or less) | "I'll just sit here, if I may, and think about you." |
| **Ada Lovelace** — the Countess, Babbage's collaborator, the first programmer | Foundry | Heavy Industry with engines that Persist | *The Analytical Engine* (5 pts, Persist, Elusive) | "Your deck has a loop in it. I can see it from here." |
| **Irene Adler** (Doyle) — *the* woman; the only one who beat Holmes | Rookery + Irregulars | The Long Con: Elusive, Return, one big Flip | *The Photograph* (Scheme: Return one of your cards to hand; Draw 1) | "Good night, Mr Sherlock Holmes." |
| **Charles Dickens** — serialist, public reader, walks twenty miles a night | Salon | The Parlour Game: Friend and draw, Return cards that come back every round | *Next Instalment* (Gadget, 1 pt, Return, Friend +1) | "You'll have to wait for the ending. Everyone does." |

### 9.3 Legends (tier 3 — AI "legend": beats random play >95%; ~70% vs the starter, ~50% vs a tuned deck)

Legends come up the cellar stairs. Two are "in town" on any given real-world day (§12.3). Each carries a **signature legendary card** that you earn on your first win against them.

| Legend | Family | Signature card | Deck and personality |
|---|---|---|---|
| **Sherlock Holmes** | Irregulars | *Sherlock Holmes* — 4 pts. Elusive. On Play: Reveal your opponent's hand, then Flip an opposing card worth 3 or less. | Irregulars + Yard (Lestrade, Mrs Hudson, the Baker Street boys). Plays the information game: cheap Elusive cards, holds his Flips for round three. Bored between turns. "You've been to the Foundry. It's on your cuff." |
| **Professor Moriarty** | Rookery | *Professor Moriarty* — 5 pts. Persist. On Play: Flip an opposing card worth 4 or less. | Rookery + Foundry ("Sabotage"). Round one is a feint; round two he Persists something ugly and rounds three is arithmetic. His deck contains the Location *The Reichenbach Falls* (rare: *At end of round, each player Flips their own highest-point card* — no Elusive exception) and he'll use it when behind. "You stand fire admirably." |
| **Agatha Christie** | Salon | *Dame Agatha* — 3 pts. Elusive. Friend +2. On Play: Return one of your other face-up cards to hand. *(Flavour: "Missing for eleven days in 1926. Not related to Samuel Hunter Christie, who actually invented the bridge — Sir Charles mentions this more than you'd expect.")* | The Parlour Game with a twist: Friend deck that Returns key cards so the drawing room fills again next round. Her deck holds the Location *The Overnight Express* (rare: *At end of round, Persist cards are discarded instead*) — everybody did it. "The obvious suspect is the deck you built." |
| **Hercule Poirot** | Yard | *Hercule Poirot* — 4 pts. Friend +1. On Play: Flip the opposing card with the most effective points. | Yard + Salon, order and method: Persist officers, then Poirot in round three to remove the biggest thing on your side. Fussy about the arrangement of his cards on the table (UI: his cards always snap to a perfect row). "The little grey cells, mon ami, have already finished." |
| **Dr Jekyll / Mr Hyde** | Salon / Rookery | *Dr Henry Jekyll* — 2 pts. Persist. Friend +2. **Transforms** at the start of each round into **Mr Edward Hyde** — 6 pts. Elusive. At end of round, if Hyde is face-up, Flip one of your own other cards (he's a liability). | Salon front, Rookery back. Plays Jekyll in round one so round two opens with a 6-point Hyde already on the board, then plays round three around Hyde's liability. The AI's dial flips too: Jekyll rounds play "seasoned", Hyde rounds play "legend" — implement as a per-round dial override. "I'm quite well. Round two, ask again." |
| **Mary Shelley** | Foundry | *Mary Shelley* — 3 pts. On Play: turn one of your face-down cards face-up; it gets +2 this round. *(It's alive.)* | Foundry "creature" deck with the Young Frankenstein easter eggs (§15): *Abby Normal* (6 pts, On Play: Flip one of your own cards worth 2 or less), *Put the Candle Back* (Location: *Whenever a card is played, its owner may un-flip one of their face-down cards worth 1 or less* — the bookcase turns), *Eye-gor* (1 pt, On Play: Draw 1 — "walk this way"). She un-flips her own wreckage every round. "I wrote him at nineteen. What have you made?" |

**Stretch legends** (post-v1, only if 1.5 has room; both are in the plan's public-domain pool): **William Shakespeare** (Salon — Location *The Globe*: every face-up Character has Friend +0, i.e. counts as a Friend) and **Robin Hood** (Rookery/Irregulars — *Robin of Locksley*, 3 pts, Elusive, On Play: take control of an opposing non-Elusive card worth 2 or less — the only steal in the game, and the reason §5.5 mentions steal).

### 9.4 AI dials (for 1.3)

| Dial | regular | seasoned | legend |
|---|---|---|---|
| Lookahead | 1 turn | 2 turns | 3 turns |
| Hidden-hand samples | 1 | 8 | 32 |
| Evaluator noise | high (picks a random top-3 move 40%) | low (top-2, 15%) | none |
| Holds Flips for the last turn of a round | never | sometimes | when it wins the round |
| Concedes a round it can't win (dumps low cards) | never | yes | yes, and saves the good cards |

---

## 10. Tournaments

All tournaments are **8-seat single elimination** vs AI (quarter, semi, final — three matches). Seats are the player plus seven opponents drawn from the eligible pool; brackets are shown as a chalkboard by the bar. Entry costs Checks (§11.1). Losing at any stage pays the consolation; only the final pays the prize card.

| Tournament | When | Eligible field | Entry rule (deck) | Entry | Prize (winner) | Consolation |
|---|---|---|---|---|---|---|
| **The Tuesday Knockout** | always | Regulars + Seasoned | any legal deck | 20 Checks | 60 Checks + a random uncommon | 10 Checks |
| **The Peelers' Cup** | after 5 wins | Regulars + Seasoned (Yard opponents favoured) | ≤ 45 printed points *(the "pauper" format — abilities over weight)* | 40 Checks | 120 Checks + a random rare | 15 Checks |
| **The Reichenbach Open** | after 20 wins | Seasoned + all Legends | at least 12 cards from a single family | 80 Checks | 250 Checks + a random legendary you don't own (or 300 Checks if you own them all) | 30 Checks |
| **The Birthday Invitational** | unlocks **October 30** (any year), stays unlocked once triggered | All six legends + Sir Charles | any legal deck | free | *The Landlady* (§14.3), 500 Checks, and the toast (§14.4) | the toast anyway |

Tournament matches use the normal rules; draws are broken by the sovereign (§6.3). The bracket persists in the save, so a tournament can be left mid-way and resumed. 2.4 tests the Oct 30 trigger by faking the clock.

---

## 11. Card acquisition and the Checks economy

The pub's currency is **Checks** — brass pub checks, the real Victorian tokens pubs stamped and redeemed. The UI shows them as a small brass disc with a "W". Nothing is ever *lost* permanently: cards you gamble away go to the Pawnbroker's window where you can buy them back.

### 11.1 Earning Checks

| Event | Checks |
|---|---|
| Win a pickup game vs a Regular / Seasoned / Legend | 8 / 15 / 30 |
| Lose a pickup game (any tier) | 2 |
| Tournament consolation / prize | see §10 |
| First win vs each opponent | + their reward card |
| Daily: first pickup game of the real-world day | +5 |

### 11.2 Pickup games (2.3)
"Tonight's patrons" shows who's in: all unlocked Regulars and Seasoned, the two Legends in town, and Sir Charles (always). Beat someone for the first time → their reward card is revealed with the "unwrap" animation and goes to your collection. Subsequent wins pay Checks.

### 11.3 Lost & Found (Haiku, 2.5)
Once per real-world day, the box behind the bar has something in it: 70% common, 25% uncommon, 5% rare, weighted away from cards you already have two of. Free. Sir Charles: "Nobody's claimed it. I've asked."

### 11.4 The Pawnbroker (2.5)
Three cards in the window, rotating daily (seeded from the date so it's testable): common 15, uncommon 35, rare 90 Checks. Legendaries never appear. Cards you lost in Bar Bets appear here first, at their rarity price. Buy button reads *Take my Checks*.

### 11.5 Bar Bet (2.5)
Before a pickup game you may stake one card from your collection (not one that would make any saved deck illegal — the builder shows which). Win → you also receive a card from the opponent's **bet pool** (each opponent lists 3–4 cards, mostly uncommons, one rare for Seasoned/Legends). Lose → your staked card goes to the Pawnbroker's window. House rule 1 applies: one card per bet.

### 11.6 The Tinker's Bench (2.5)
Sir Charles will take **two copies** of the same card plus 10 Checks and give you back **either** a **foil** of that card (cosmetic shimmer, same rules, shows as a distinct collection entry) **or** a random card of the **next rarity up** (common → uncommon → rare; rares can only become foils; legendaries can't be fused). Since decks cap at two copies, a third copy is exactly the thing you'd want to fuse.

### 11.7 Budget check (for 1.4 / 2.5)
A sensible newcomer playing ~4 games a day earns ~40–60 Checks/day plus a Lost & Found card. That buys one Pawnbroker uncommon a day, one Knockout entry every other day, and the Peelers' Cup weekly — about right for a game that should feel generous over the ~six weeks she'll have it before the Invitational.

---

## 12. Progression

### 12.1 Titles and unlocks (by pickup + tournament wins combined)

| Wins | Title (shown on the deck-slot screen) | Unlocks |
|---|---|---|
| 0 | Newcomer | Sir Charles, the four Regulars, the Tuesday Knockout, Lost & Found, Pawnbroker |
| 3 | Regular | Bar Bet, Tinker's Bench, first Seasoned opponent (Bucket) |
| 5 | Known at the Bar | All Seasoned, the Peelers' Cup |
| 10 | Seasoned | Legends begin coming through the cellar door (§12.3) |
| 20 | Notorious | The Reichenbach Open |
| 35 | Legend of the Bridge | Foil frame on the player's name; nothing else — it's a title |

### 12.2 Difficulty curve intent
The starter deck should beat Regulars about 60% of the time when played sensibly and lose to Seasoned about as often, so the first deck-building moment ("I need better cards") arrives naturally around win 5. Legends should feel unfair the first time and fair once the player has a 55+-point deck built around one family. 3.7 reviews this with a newcomer's eyes.

### 12.3 Legends in town
From 10 wins, two Legends are in the pub each real-world day, chosen deterministically from the date (so tests can pin it) with the rule that each of the six appears at least every third day. On tournament days for the Open and the Invitational, everyone eligible is in.

### 12.4 Save (2.6)
Autosave after every committed turn and every screen transition. Save contains: collection (with foil flags), 13 deck slots, Checks, win/loss record per opponent, reward-card flags, unlock flags, active tournament bracket, current match state, tutorial/hint progress, settings, first-launch flag, Invitational-triggered flag. Export/import via Share sheet as a single JSON blob.

---

## 13. Tutorial

### 13.1 Shape
The first match is against Sir Charles with **forced draws on both sides** so his narration lands every time. The narration is beer mats: short lines that slide in from the bar, tap to dismiss, never blocking a legal move. He explains exactly one idea per turn. The player is prompted ("play this one") for six of nine turns and free for three; the free turns are ones where every choice is fine.

Teaches: points, taking a round (R1) · Persist, Flip (R1–2) · Friend (R2) · being Flipped and un-flipping (R3) · winning the table. Left for hint chips (§13.3): Locations, Elusive, Return, Headlines, deck-building.

### 13.2 Script

Player's forced draws: opening hand **Constable on the Beat, Night Watchman, Police Whistle, Inspector's Warrant**. From there every turn also draws one card (§6.2 step 2) before the play: round 1's remaining turn-draws surface **The Parsonage Snug, Hiawatha, Emily** as unused distractors, then Police Whistle's own On Play effect — not an ordinary turn-draw — draws **Bramwell** specifically, so "the whistle fetched you a card" lands on cue. The rest of the match's turn-draws bring up **Parlour Guest, Amateur Sleuth, Charlotte, Séance** in that order, each arriving a turn or two ahead of when it's actually played.

House forced plays are in order below. The house leads round 1.

**Before the deal**
> "Evening. I'm Wheatstone. This is the Bridge. You'll want a drink and a deck, and I've only got one of those licensed, so — deck. Sit anywhere. Not there. That's Charlotte's."
> "Best of three rounds. Three cards each a round. Most points on the table takes the round. That's the whole of it, really. The rest is people being clever."

**Round 1**
| Turn | Play | Beer mat |
|---|---|---|
| H1 | Apprentice Fitter (2) | "I go first. House leads, the first time. That's two points, there, on my side." |
| P1 *(prompt: Constable)* | Constable on the Beat (3) | "Three. Three beats two. You're ahead. Enjoy it." |
| H2 | Boiler Hand (3) | "Five to three." |
| P2 *(prompt: Night Watchman)* | Night Watchman (5) | "Eight. Big cards are big. They are also, you'll notice, all you've got in that hand that's big." |
| H3 | Brass Cog (1, Persist) | "One point. But look — *Persist*. He stays on the table when the round ends. Most cards don't. Remember him." |
| P3 *(prompt: Police Whistle)* | Police Whistle (1, Draw 1) → draws Bramwell | "Nine to six. And the whistle fetched you a card. Small cards that *do* something. That's the Bridge's game." |
| *round end* | | "Round's yours. First to two. Sit tight while I clear the table. Not the cog. The cog stays." |

**Round 2** (house leads — he lost)
| Turn | Play | Beer mat |
|---|---|---|
| H1 | Foreman Gudgeon (5) | "Six on my side already, with the cog. This is what Persist is for." |
| P1 *(prompt: Inspector's Warrant)* | Warrant → Flip Brass Cog | "A *Flip*. Turn a card of mine face-down. It's worth nothing now and does nothing, and it'll be swept at the end of the round, Persist or no. The warrant says 'three or less' — the cog's a one. Nicked." |
| H2 | Steam Hammer (4) | "Nine. Sorry." |
| P2 *(prompt: Parlour Guest)* | Parlour Guest (2, Friend +1) | "*Friend*. She's worth more with company. No company yet. Two." |
| H3 | Difference Engine (6) | "Fifteen. I did say sorry." |
| P3 *(prompt: Amateur Sleuth)* | Amateur Sleuth (2, Friend +2) | "Now they've got each other. Three and four — seven. Not fifteen. But you see how it works." |
| *round end* | | "One round each. Round two is where the house shows its hand. Round three is where you show yours." |

**Round 3** (player leads — lost the previous round)
| Turn | Play | Beer mat |
|---|---|---|
| P1 *(prompt: Bramwell)* | Bramwell (2, Friend +2) | "You lead. Bramwell. He's louder with company. Two, for now." |
| H1 | Riveter (3) | "Three." |
| P2 *(prompt: Charlotte)* | Charlotte (2, Persist, Friend +1) | "There's the company. Four and three — seven to three. She Persists, too, not that it'll matter if you finish this." |
| H2 | Sabotage → Flip Charlotte | "…Sorry. Habit. She's face-down — Sabotage only reaches three, and she was three. Bramwell's alone again. Two to three." |
| P3 *(prompt: Séance)* | Séance → un-flip Charlotte | "Turn her back over. Everything she was, she is again. Seven to three." |
| H3 | Boiler Hand (3) | "Six. Seven beats six." |
| *match end* | | "Table's yours. Two rounds to one. …That's the first one I've lost in a while, actually. Take the deck. It was always going to be yours." |

**After** — the reward reveal gives the player the starter deck formally (it's the deck they just played) and 10 Checks, then a beer mat: *"The others'll play you now. Mudd's the easy one. Don't tell him I said so."* The pub hub opens.

### 13.3 Hint chips (matches 2–4, dismissible, once each)
- Match 2: the first time a Location is played by either side — "One Location at a time, in the middle, for both of you. A new one replaces it."
- Match 2: the first time the player tries to Flip an Elusive card — "*Elusive.* Can't be flipped. Pick another."
- Match 3: the first Return card leaves the table — "*Return.* Back to hand at the end of the round. Some people never leave."
- Match 3: the first Headline — "A Headline. Happens to everybody. Read it."
- Match 4, at the hub: "You've enough Checks for the Pawnbroker. And you've cards you're not using — the deck builder's the ledger on the bar."

### 13.4 House Rules page
Opens with §1.5, then: the round/match rules in six sentences, one line per keyword with the reminder text, the deck-legality rule, the tournament table, and "how Checks work". Everything on it is derived from this document; Haiku writes it in 2.7.

---

## 14. Gift touches

### 14.1 Dedication screen (first launch only, tap to continue)
A single card face, oversized, gold-leaf frame, no illustration yet — just engraved lettering:

> *The Wheatstone Bridge*
> *Licensed to* **Sara**
> *in every century, the best is yet to come*
>
> *Happy birthday. — B.*

Then Sir Charles: "You're expected. Your chair's by the fire."

### 14.2 Default player name
"Sara", pre-filled and editable, because the licence says so.

### 14.3 The Landlady (card)
Legendary, neutral, the last card in the collection. **4 pts. Persist. Elusive. Every other face-up Friend card on your side gets +1.** Flavour: *Her name is on the licence. Everyone else just drinks here.* Art: a woman in the chair by the fire, face turned toward the cats, seen from the bar — never a portrait, always a presence. Earned by winning the Birthday Invitational (§10). Until then it shows in the collection as a silhouette with "reserved".

### 14.4 The toast
When the Invitational ends (win or lose), the pub goes quiet, Sir Charles plays the concertina — the only time in the game — and every legend raises a glass. Lines, one each, then his: "To the Landlady. Who was always going to be." If she wins, the Landlady card unwraps after the toast.

### 14.5 The cats
§8.2. Also: Hiawatha's card enters play from off-screen with a distant meow and then a pounce, because of course it does (3.3 / 3.4).

### 14.6 The fixed point
The Invitational is date-triggered so it arrives while she's already playing. If she opens the app for the first time *on* October 30 it triggers immediately after the tutorial; the dedication mentions nothing about it, so it's a surprise either way.

---

## 15. Easter-egg register (for `ss-card-author`; use sparingly, never on tutorial cards)

| Source | Where it lives | How |
|---|---|---|
| Dodgeball | Rookery Scheme *The Five D's* (0, R): *Target Character you control gains Elusive until end of round.* Flavour: *Dodge, duck, dip, dive and… dodge.* · Foundry Scheme *Dodge a Spanner* flavour: *If you can dodge a spanner, you can dodge a constable.* | cards |
| Young Frankenstein | Mary Shelley's deck (§9.3): *Abby Normal*, *Put the Candle Back*, *Eye-gor* ("walk this way"); flavour on Shelley's cards: *It's pronounced Frankenstein.* | cards |
| Wayne's World | *The Concertina Works* Location sign reads NO STAIRWAY (art prompt + tooltip) · Salon Scheme *We're Not Worthy* (0, U): *If your opponent has a legendary face-up, Draw 2.* · Headline *PARTY TIME. EXCELLENT.* (0, U): *Each player draws 1.* · Card-zoom gesture label: "Extreme close-up" · Coin-toss result screen: "Game on." | cards, UI |
| Futurama | Headline *GOOD NEWS, EVERYONE!* (0, R): *Each player draws 2, then discards a card at random.* · Pawnbroker buy button *Take my Checks* · Foundry rival flavour: *Wernstrom!* · Salon rare *The Hypnofrog* (2, Elusive, Friend +1): *All glory.* · Séance flavour: *Not sure if the spirits, or the drains.* | cards, UI |
| Doctor Who (allusion only, no names or trademarks) | The blue cellar door; "roomier inside than the frontage suggests"; the birthday as "a fixed point" | copy |
| The Brontës | The cats' names; *The Parsonage Snug* | cards |
| Wheatstone / Christie | Dame Agatha's flavour text; Sir Charles's "it was Christie's bridge" | flavour |

---

## 16. Notes for downstream steps

- **1.1 (schema):** needs `faces[]` for two-faced cards (§5.10), `reveal` and `unflip` in the ability DSL, `steal` reserved for Robin Hood, a `neutral` family value, a `foil` flag on collection entries (not on cards), and `tutorialLocked: true` on the §8.3 cards.
- **1.2 (engine):** the rules spec is §5 + §6 verbatim; each `Rules text:` block becomes at least one test. Property test invariants: scores never negative; ≤1 Location; face-down cards contribute 0; Persist cards never survive face-down; a match never exceeds three rounds; leader alternation per §6.2.4.
- **1.3 (AI):** dials per §9.4; Jekyll's per-round dial override; hand sampling from public deck lists (§6.5).
- **1.4 (sim):** report per-card effective-vs-printed lift (§7.4), family average points against §4 curves, starter-vs-Regular win rate (§12.2 target 60%), Legend-vs-starter (~70%).
- **1.5 (cards):** §8 composition, §8.2–8.3 locked, §9 reward and signature cards, §15 easter eggs. Family curves §4. Flavour rules §2.
- **2.3–2.5 (hub, acquisition):** numbers in §11, unlocks in §12.1, daily seeds from the real date.
- **2.7 (tutorial):** §13 verbatim; forced draws are a deck-order override, not special cards.
- **0.3 (style bible):** palette from §4 frames; Sir Charles's reference sheet from §1.3; the cats from §8.2; the Landlady's art rule from §14.3.

**Resolved with Brent (Sept 10, 2026):** pub name is *The Wheatstone Bridge*; dedication wording in §14.1 is final; the Reichenbach Falls and Poirot mechanics are approved as written; cat families and tricks in §8.2 are approved.
