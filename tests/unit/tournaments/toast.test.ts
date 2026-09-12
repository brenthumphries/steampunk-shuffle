// The Birthday Invitational's toast (plan step 3.5, design.md §14.4).

import { describe, expect, it } from "vitest";

import { INVITATIONAL_CLOSING_LINE, INVITATIONAL_TOAST_SEQUENCE } from "../../../src/tournaments/toast.ts";

describe("INVITATIONAL_TOAST_SEQUENCE", () => {
  it("has an opening scene-setting line, one line each for all six legends, then Sir Charles's closing line", () => {
    expect(INVITATIONAL_TOAST_SEQUENCE).toHaveLength(8);
    expect(INVITATIONAL_TOAST_SEQUENCE[0]!.speaker).toBeNull();
    const legendSpeakers = INVITATIONAL_TOAST_SEQUENCE.slice(1, 7).map((l) => l.speaker);
    expect(legendSpeakers).toEqual(["Sherlock Holmes", "Professor Moriarty", "Agatha Christie", "Hercule Poirot", "Dr Jekyll / Mr Hyde", "Mary Shelley"]);
    expect(INVITATIONAL_TOAST_SEQUENCE.at(-1)).toEqual({ speaker: "Sir Charles", line: INVITATIONAL_CLOSING_LINE });
  });

  it("quotes Sir Charles's closing line exactly as design.md §14.4 gives it", () => {
    expect(INVITATIONAL_CLOSING_LINE).toBe("To the Landlady. Who was always going to be.");
  });

  it("every line is non-empty", () => {
    for (const { line } of INVITATIONAL_TOAST_SEQUENCE) {
      expect(line.length).toBeGreaterThan(0);
    }
  });
});
