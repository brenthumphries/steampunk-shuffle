// Art prompt sheet generator (plan step 1.6). This is the deterministic
// half of the ss-art-prompts skill: it turns a manifest of asset rows
// (each one authored by the skill against docs/style-bible.md — what the
// illustration should show) into a paste-ready CSV, chunked to the Gemini
// app's daily generation cap (plan §1's "~100 images/day on AI Pro").
//
// What's deterministic and lives here: palette/aspect lookups straight from
// docs/style-bible.md (so prompts can't drift from it by copy-paste), the
// negative-prompt base text, reference-image attachment per style-bible.md
// §7's consistency technique, and CSV formatting. What's NOT here: the
// actual scene description for each asset — that's authored content, same
// as flavour text in ss-card-author, and belongs in the manifest.
//
// Run: `npx tsx tools/artPrompts.ts <manifest.json> <sheetNumber>`.
// Writes art/prompts/prompt-sheet-<N>.csv (or -part2, -part3... beyond the
// daily cap) and prints a summary to stdout.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import type { CardType, Family } from "../src/cards/cardTypes.ts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ---------------------------------------------------------------------------
// Style bible, encoded (docs/style-bible.md §2, §4, §5)
// ---------------------------------------------------------------------------

/** style-bible.md §2 — one line per family, for the skill to weave into prompts. */
export const FAMILY_PALETTE: Record<Family, string> = {
  yard: "Gunmetal blue — cool dark blue-grey. Police wool, iron railings, evening fog.",
  irregulars: "Gaslight amber — warm yellow-orange glow. Street lamps, pub light, informants in doorways.",
  rookery: "Oxblood leather — deep aged red-brown. Worn leather, pawnshop counters, lock-picks.",
  foundry: "Brass & copper — warm, polished, high-value metal. Machinery, rivets, cog-work.",
  salon: "Verdigris — oxidised copper-green. Drawing-room brocade, greenhouse glass, old bronze.",
  neutral: "Parchment cream, ink black, and sparing sovereign gold — legendary frames, the Checks currency.",
};

/** Asset categories a prompt sheet can cover: the five card types plus non-card assets. */
export type AssetCategory = CardType | "portrait" | "background" | "card-back" | "icon";

/** style-bible.md §4's framing table, keyed by asset category. */
export const ASPECT_BY_CATEGORY: Record<AssetCategory, string> = {
  character: "3:4",
  gadget: "3:4",
  scheme: "3:4",
  location: "3:4",
  headline: "3:4",
  "card-back": "3:4",
  portrait: "1:1",
  icon: "1:1",
  background: "9:16",
};

/** style-bible.md §5, verbatim — included on every generation. */
export const NEGATIVE_PROMPT_BASE =
  "no text, no lettering, no watermark, no signature, no logo, " +
  "no photorealistic photography look, no 3D render look, no anime style, " +
  "no goggles-and-corsets cosplay clichés, no modern clothing or objects " +
  "(unless an explicit easter egg), no gore, no graphic violence, " +
  "no distorted or extra hands/limbs, no border or frame, no vignette, " +
  "no colors outside the palette in section 2";

export function buildNegativePrompt(extra: string[] = []): string {
  return extra.length === 0 ? NEGATIVE_PROMPT_BASE : `${NEGATIVE_PROMPT_BASE}, ${extra.join(", ")}`;
}

/** Gemini app's daily generation cap (plan §1: "~100 images/day on AI Pro"). */
export const GEMINI_DAILY_CAP = 100;

// ---------------------------------------------------------------------------
// Reference-image attachment (style-bible.md §7's consistency technique)
// ---------------------------------------------------------------------------

/**
 * Reference images that already exist on disk, seeded once (plan step 0.3's
 * batch 0) plus anything a later sheet should carry forward. Keyed by
 * family for "attach the closest existing reference for this cast."
 */
export interface ReferenceSeed {
  /** Attached to every row regardless of family — the taproom, for lighting/palette. */
  alwaysAttach: string[];
  /** Pre-existing reference image per family, if one exists on disk already. */
  byFamily?: Partial<Record<Family, string>>;
}

const CHARACTER_LIKE: ReadonlySet<AssetCategory> = new Set(["character", "portrait"]);

/**
 * Resolves which reference images a row should attach, and — for
 * character/portrait rows — registers this row as the new "closest
 * reference" for its family so later rows in the same sheet inherit it.
 * A same-sheet reference isn't a real file yet, so it's recorded as a
 * "(this sheet)" label rather than a path; Brent attaches it by hand once
 * it's actually been generated, earlier in the same Gemini chat.
 */
export function resolveReferences(
  row: { assetId: string; category: AssetCategory; family?: Family },
  registry: { alwaysAttach: string[]; byFamily: Map<Family, string> },
): string[] {
  const refs = [...registry.alwaysAttach];
  if (row.family && CHARACTER_LIKE.has(row.category)) {
    const existing = registry.byFamily.get(row.family);
    if (existing) refs.push(existing);
  }
  return refs;
}

function registerIfCharacterLike(
  row: { assetId: string; category: AssetCategory; family?: Family },
  registry: { alwaysAttach: string[]; byFamily: Map<Family, string> },
): void {
  if (row.family && CHARACTER_LIKE.has(row.category) && !registry.byFamily.has(row.family)) {
    registry.byFamily.set(row.family, `(this sheet) ${row.assetId}`);
  }
}

// ---------------------------------------------------------------------------
// Rows and CSV
// ---------------------------------------------------------------------------

export interface AssetPromptRow {
  assetId: string;
  category: AssetCategory;
  family?: Family;
  /** The scene description only — palette/negative/aspect are added mechanically. */
  prompt: string;
  extraNegatives?: string[];
  notes?: string;
}

export interface PromptSheetRow {
  assetId: string;
  category: AssetCategory;
  family: string;
  aspectRatio: string;
  prompt: string;
  negativePrompt: string;
  referenceImages: string;
  pasteReady: string;
  notes: string;
}

function pasteReadyText(prompt: string, negativePrompt: string, aspectRatio: string): string {
  return [prompt, "", negativePrompt, "", `Aspect ratio ${aspectRatio}.`].join("\n");
}

/**
 * Converts an ordered manifest into sheet rows, resolving reference images
 * per row as it goes (so later rows can pick up earlier same-sheet output).
 */
export function buildSheetRows(rows: AssetPromptRow[], seed: ReferenceSeed): PromptSheetRow[] {
  const registry = {
    alwaysAttach: seed.alwaysAttach,
    byFamily: new Map<Family, string>(Object.entries(seed.byFamily ?? {}) as [Family, string][]),
  };
  return rows.map((row) => {
    const aspectRatio = ASPECT_BY_CATEGORY[row.category];
    const negativePrompt = buildNegativePrompt(row.extraNegatives);
    const referenceImages = resolveReferences(row, registry);
    registerIfCharacterLike(row, registry);
    return {
      assetId: row.assetId,
      category: row.category,
      family: row.family ?? "",
      aspectRatio,
      prompt: row.prompt,
      negativePrompt,
      referenceImages: referenceImages.join("; "),
      pasteReady: pasteReadyText(row.prompt, negativePrompt, aspectRatio),
      notes: row.notes ?? "",
    };
  });
}

function csvEscape(value: string): string {
  return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

const CSV_COLUMNS: (keyof PromptSheetRow)[] = [
  "assetId",
  "category",
  "family",
  "aspectRatio",
  "prompt",
  "negativePrompt",
  "referenceImages",
  "pasteReady",
  "notes",
];

export function rowsToCsv(rows: PromptSheetRow[]): string {
  const header = CSV_COLUMNS.join(",");
  const lines = rows.map((row) => CSV_COLUMNS.map((col) => csvEscape(String(row[col]))).join(","));
  return [header, ...lines].join("\n") + "\n";
}

const RULE = "-".repeat(80);

/**
 * One row as a self-contained block for manual copy/paste: which images to
 * attach first, then the paste-ready prompt on its own (so it can be
 * selected and pasted into Gemini without the reference-image list coming
 * along with it), then any notes.
 */
function rowToTextBlock(row: PromptSheetRow, index: number, total: number): string {
  const header = `[${index}/${total}] ${row.assetId}  (${row.category}${row.family ? ` · ${row.family}` : ""})`;
  const refs = row.referenceImages
    ? row.referenceImages
        .split("; ")
        .map((ref) => `  - ${ref}`)
        .join("\n")
    : "  (none)";
  const lines = [
    "=".repeat(80),
    header,
    RULE,
    "Attach these images first:",
    refs,
    "",
    "Paste this into Gemini:",
    RULE,
    row.pasteReady,
  ];
  if (row.notes) lines.push(RULE, `Notes: ${row.notes}`);
  return lines.join("\n");
}

/** Plain-text sibling of `rowsToCsv` — every field a person needs, formatted to cut/paste one asset at a time. */
export function rowsToText(rows: PromptSheetRow[]): string {
  return rows.map((row, i) => rowToTextBlock(row, i + 1, rows.length)).join("\n\n") + "\n";
}

export function chunkRows<T>(rows: T[], size: number = GEMINI_DAILY_CAP): T[][] {
  if (size <= 0) throw new Error("chunk size must be positive");
  if (rows.length === 0) return [[]];
  const chunks: T[][] = [];
  for (let i = 0; i < rows.length; i += size) {
    chunks.push(rows.slice(i, i + size));
  }
  return chunks;
}

/**
 * Writes one or more CSV files sized to `dailyCap` rows each. A sheet that
 * fits in one day gets `prompt-sheet-<N>.csv`; a bigger one is split into
 * `-part1`, `-part2`, ... so each file maps to one day's generation run.
 */
export function writePromptSheet(
  rows: AssetPromptRow[],
  seed: ReferenceSeed,
  options: { sheetNumber: number; dailyCap?: number; outDir?: string },
): string[] {
  const sheetRows = buildSheetRows(rows, seed);
  const chunks = chunkRows(sheetRows, options.dailyCap ?? GEMINI_DAILY_CAP);
  const outDir = options.outDir ?? path.join(__dirname, "..", "art", "prompts");
  mkdirSync(outDir, { recursive: true });
  const paths: string[] = [];
  chunks.forEach((chunk, index) => {
    const suffix = chunks.length > 1 ? `-part${index + 1}` : "";
    const csvPath = path.join(outDir, `prompt-sheet-${options.sheetNumber}${suffix}.csv`);
    writeFileSync(csvPath, rowsToCsv(chunk));
    paths.push(csvPath);
    const txtPath = path.join(outDir, `prompt-sheet-${options.sheetNumber}${suffix}.txt`);
    writeFileSync(txtPath, rowsToText(chunk));
    paths.push(txtPath);
  });
  return paths;
}

/**
 * A single re-roll prompt for one asset with a specific fix folded in, for
 * when a generation is close but needs a targeted correction rather than a
 * full re-run of the original prompt.
 */
export function buildRerollPrompt(row: AssetPromptRow, fix: string): string {
  const aspectRatio = ASPECT_BY_CATEGORY[row.category];
  const negativePrompt = buildNegativePrompt(row.extraNegatives);
  return pasteReadyText(`${row.prompt} ${fix}`, negativePrompt, aspectRatio);
}

// ---------------------------------------------------------------------------
// Manifest file shape + CLI
// ---------------------------------------------------------------------------

interface ManifestFile {
  seed: ReferenceSeed;
  rows: AssetPromptRow[];
}

function main(): void {
  const [, , manifestPath, sheetNumberArg] = process.argv;
  if (!manifestPath || !sheetNumberArg) {
    console.error("Usage: tsx tools/artPrompts.ts <manifest.json> <sheetNumber>");
    process.exitCode = 1;
    return;
  }
  const sheetNumber = Number(sheetNumberArg);
  if (!Number.isInteger(sheetNumber) || sheetNumber <= 0) {
    console.error(`sheetNumber must be a positive integer, got "${sheetNumberArg}"`);
    process.exitCode = 1;
    return;
  }

  const resolvedManifestPath = path.isAbsolute(manifestPath) ? manifestPath : path.join(process.cwd(), manifestPath);
  const manifest: ManifestFile = JSON.parse(readFileSync(resolvedManifestPath, "utf-8"));

  const paths = writePromptSheet(manifest.rows, manifest.seed, { sheetNumber });

  console.log(`${manifest.rows.length} asset(s) from ${path.relative(process.cwd(), resolvedManifestPath)}`);
  for (const filePath of paths) {
    console.log(`Wrote ${path.relative(process.cwd(), filePath)}`);
  }
}

const isMain = process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) main();
