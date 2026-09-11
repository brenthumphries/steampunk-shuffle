// Unit tests for tools/artPrompts.ts's deterministic helpers (plan step
// 1.6). The manifest-driven CSV writing is exercised by actually running
// the sheet-1 manifest (see art/prompts/), so these focus on the pure
// pieces: negative-prompt assembly, reference-image resolution across an
// ordered sheet, CSV escaping, and daily-cap chunking.

import { describe, expect, it } from "vitest";

import {
  ASPECT_BY_CATEGORY,
  buildNegativePrompt,
  buildRerollPrompt,
  buildSheetRows,
  chunkRows,
  NEGATIVE_PROMPT_BASE,
  rowsToCsv,
  type AssetPromptRow,
} from "../../../tools/artPrompts.ts";

describe("buildNegativePrompt", () => {
  it("returns the base list unchanged with no extras", () => {
    expect(buildNegativePrompt()).toBe(NEGATIVE_PROMPT_BASE);
  });

  it("appends scene-specific negatives", () => {
    const result = buildNegativePrompt(["no red or oxblood dominant"]);
    expect(result).toBe(`${NEGATIVE_PROMPT_BASE}, no red or oxblood dominant`);
  });
});

describe("buildSheetRows", () => {
  const seed = {
    alwaysAttach: ["art/reference/The_Wheatstone_Bridge_taproom.jpeg"],
    byFamily: { foundry: "art/reference/Sir_Charles_Wheatstone-behind-the-bar.jpeg" },
  };

  it("attaches the always-attach reference plus a pre-seeded family reference", () => {
    const rows: AssetPromptRow[] = [
      { assetId: "ada-lovelace", category: "portrait", family: "foundry", prompt: "A countess." },
    ];
    const [sheetRow] = buildSheetRows(rows, seed);
    expect(sheetRow!.referenceImages).toBe(
      "art/reference/The_Wheatstone_Bridge_taproom.jpeg; art/reference/Sir_Charles_Wheatstone-behind-the-bar.jpeg",
    );
    expect(sheetRow!.aspectRatio).toBe(ASPECT_BY_CATEGORY.portrait);
  });

  it("has no family reference for a family's first appearance in the sheet", () => {
    const rows: AssetPromptRow[] = [{ assetId: "mudd", category: "portrait", family: "yard", prompt: "A constable." }];
    const [sheetRow] = buildSheetRows(rows, seed);
    expect(sheetRow!.referenceImages).toBe("art/reference/The_Wheatstone_Bridge_taproom.jpeg");
  });

  it("registers a character/portrait row as its family's reference for later rows in the same sheet", () => {
    const rows: AssetPromptRow[] = [
      { assetId: "mudd", category: "portrait", family: "yard", prompt: "A constable." },
      { assetId: "bucket", category: "portrait", family: "yard", prompt: "An inspector." },
    ];
    const sheetRows = buildSheetRows(rows, seed);
    expect(sheetRows[0]!.referenceImages).toBe("art/reference/The_Wheatstone_Bridge_taproom.jpeg");
    expect(sheetRows[1]!.referenceImages).toBe("art/reference/The_Wheatstone_Bridge_taproom.jpeg; (this sheet) mudd");
  });

  it("does not register or reference a family for non-character-like categories", () => {
    const rows: AssetPromptRow[] = [
      { assetId: "concertina-works", category: "location", family: "foundry", prompt: "A workshop location." },
    ];
    const [sheetRow] = buildSheetRows(rows, seed);
    // foundry already has a pre-seeded reference, but locations aren't "character-like" so it's not attached.
    expect(sheetRow!.referenceImages).toBe("art/reference/The_Wheatstone_Bridge_taproom.jpeg");
  });

  it("has no family column or reference lookup for rows without a family", () => {
    const rows: AssetPromptRow[] = [{ assetId: "card-back", category: "card-back", prompt: "A brass emblem." }];
    const [sheetRow] = buildSheetRows(rows, seed);
    expect(sheetRow!.family).toBe("");
    expect(sheetRow!.referenceImages).toBe("art/reference/The_Wheatstone_Bridge_taproom.jpeg");
  });

  it("builds a paste-ready block combining prompt, negative prompt, and aspect ratio", () => {
    const rows: AssetPromptRow[] = [{ assetId: "x", category: "icon", prompt: "A gear." }];
    const [sheetRow] = buildSheetRows(rows, seed);
    expect(sheetRow!.pasteReady).toBe(`A gear.\n\n${NEGATIVE_PROMPT_BASE}\n\nAspect ratio 1:1.`);
  });
});

describe("rowsToCsv", () => {
  it("quotes fields containing commas, quotes, or newlines", () => {
    const rows: AssetPromptRow[] = [
      { assetId: "x", category: "icon", prompt: 'A "gear," with rivets.\nSecond line.' },
    ];
    const [sheetRow] = buildSheetRows(rows, { alwaysAttach: [] });
    const csv = rowsToCsv([sheetRow!]);
    expect(csv).toContain('"A ""gear,"" with rivets.\nSecond line."');
    expect(csv.split("\n")[0]).toBe(
      "assetId,category,family,aspectRatio,prompt,negativePrompt,referenceImages,pasteReady,notes",
    );
  });
});

describe("chunkRows", () => {
  it("splits into chunks no larger than the given size", () => {
    const chunks = chunkRows([1, 2, 3, 4, 5], 2);
    expect(chunks).toEqual([[1, 2], [3, 4], [5]]);
  });

  it("returns a single empty chunk for an empty input", () => {
    expect(chunkRows([], 100)).toEqual([[]]);
  });

  it("returns one chunk when everything fits under the cap", () => {
    expect(chunkRows([1, 2, 3], 100)).toEqual([[1, 2, 3]]);
  });

  it("throws on a non-positive size", () => {
    expect(() => chunkRows([1], 0)).toThrow();
  });
});

describe("buildRerollPrompt", () => {
  it("folds the fix into the original prompt, keeping the same negative prompt and aspect ratio", () => {
    const row: AssetPromptRow = { assetId: "x", category: "background", prompt: "A cellar." };
    const result = buildRerollPrompt(row, "Make the gaslamp brighter and move it stage-left.");
    expect(result).toBe(
      `A cellar. Make the gaslamp brighter and move it stage-left.\n\n${NEGATIVE_PROMPT_BASE}\n\nAspect ratio 9:16.`,
    );
  });
});
