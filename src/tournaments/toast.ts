// The toast (plan step 3.5, design.md §14.4): "When the Invitational ends
// (win or lose), the pub goes quiet, Sir Charles plays the concertina — the
// only time in the game — and every legend raises a glass. Lines, one
// each, then his: 'To the Landlady. Who was always going to be.'"
//
// Design.md names the beat and Sir Charles's exact closing line but leaves
// each legend's own toast unwritten — a content-authoring judgment call in
// the same vein as this project's other flagged ones (see CLAUDE.md),
// drawing on each legend's established voice from design.md §9.3's own
// flavour lines. Order matches §9.3's table (Holmes, Moriarty, Christie,
// Poirot, Dr Jekyll / Mr Hyde, Mary Shelley), same order src/pub/
// opponents.ts already uses.
//
// These lines are about "the Landlady"/"Sara" as the fixed in-fiction
// dedication (design.md §14.1, "resolved with Brent... is final") — they
// deliberately don't read from src/player/playerState.ts's editable name,
// which is a separate, later-editable setting (§14.2) and shouldn't be
// able to put an arbitrary string into a scripted narrative beat.

export interface ToastLine {
  speaker: string | null;
  line: string;
}

/** Sir Charles's line is quoted verbatim from design.md §14.4 — don't reword it. */
export const INVITATIONAL_CLOSING_LINE = "To the Landlady. Who was always going to be.";

export const INVITATIONAL_TOAST_SEQUENCE: readonly ToastLine[] = [
  { speaker: null, line: "Sir Charles sets down the tray. The concertina comes out from under the bar — nobody's seen it before tonight. The pub goes quiet." },
  { speaker: "Sherlock Holmes", line: "Every clue in this place has pointed at her since before I arrived. To the Landlady — the one case I was glad to lose." },
  { speaker: "Professor Moriarty", line: "I have spent a great many evenings arranging the board. She arranged the room. To Sara." },
  { speaker: "Agatha Christie", line: "Eleven days I went missing once, and the papers never solved it. This mystery was never much of one. To the Landlady." },
  { speaker: "Hercule Poirot", line: "The little grey cells require no further evidence, mon ami. To Sara — the arrangement was always going to end here." },
  { speaker: "Dr Jekyll / Mr Hyde", line: "I'm quite well, for once — and mean it. To her, before he says something worse." },
  { speaker: "Mary Shelley", line: "I stitched something together once and it outlived me. She built a whole pub out of spare parts and it's still standing. To Sara." },
  { speaker: "Sir Charles", line: INVITATIONAL_CLOSING_LINE },
];
