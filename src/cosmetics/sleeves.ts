// Card sleeves (docs/design.md §17.5, docs/plans/monthly/03-january.md §5):
// cosmetic card backs the player picks per deck slot. Pure data plus pure
// helpers; ownership lives in `PubState.ownedSleeves`, the pick in each
// `DeckSlot.sleeveId` (both inside existing per-ledger stores).

/** The sleeve everyone owns: today's card back, art id "card-back". */
export const DEFAULT_SLEEVE_ID = "sleeve-the-bridge";

export type SleeveSource = { kind: "default" } | { kind: "event"; eventId: string };

export interface Sleeve {
  id: string;
  name: string;
  /** An image under `art/<artId>.webp`; a missing file falls back to the default sleeve's art. */
  artId: string;
  source: SleeveSource;
}

export const DEFAULT_SLEEVE: Sleeve = { id: DEFAULT_SLEEVE_ID, name: "The Bridge", artId: "card-back", source: { kind: "default" } };

/** Every sleeve in the game. A month's pack adds its sleeve here (J-C adds `sleeve-starfield`) and names it in its event's `sleeveId`. */
export const SLEEVES: readonly Sleeve[] = [DEFAULT_SLEEVE];

export const SLEEVES_BY_ID: ReadonlyMap<string, Sleeve> = new Map(SLEEVES.map((s) => [s.id, s]));

/** What a new or migrated save owns. */
export function defaultOwnedSleeves(): string[] {
  return [DEFAULT_SLEEVE_ID];
}

/** Keeps the string ids of `value`, de-duplicated, and always includes the default sleeve (first). Anything that is not an array of strings reads as default-only. */
export function parseOwnedSleeves(value: unknown): string[] {
  const owned = Array.isArray(value) ? value.filter((v): v is string => typeof v === "string") : [];
  return [DEFAULT_SLEEVE_ID, ...new Set(owned.filter((id) => id !== DEFAULT_SLEEVE_ID))];
}

/** The sleeves in `ownedIds` that exist in `sleeves`, in registry order. */
export function ownedSleeves(ownedIds: readonly string[], sleeves: readonly Sleeve[] = SLEEVES): Sleeve[] {
  return sleeves.filter((s) => s.id === DEFAULT_SLEEVE_ID || ownedIds.includes(s.id));
}

/** The sleeve a deck slot shows: its `sleeveId` when that sleeve exists and is owned, otherwise the default. */
export function resolveSleeve(sleeveId: string | undefined, ownedIds: readonly string[], sleeves: readonly Sleeve[] = SLEEVES): Sleeve {
  if (sleeveId === undefined || sleeveId === DEFAULT_SLEEVE_ID) return DEFAULT_SLEEVE;
  const found = sleeves.find((s) => s.id === sleeveId);
  return found && ownedIds.includes(found.id) ? found : DEFAULT_SLEEVE;
}

export function sleeveArtUrl(artId: string): string {
  return `${import.meta.env.BASE_URL}art/${artId}.webp`;
}

/** Points an <img> at a sleeve's art; if the file is missing it falls back once to the default sleeve's art. */
export function setSleeveImage(img: HTMLImageElement, sleeve: Sleeve): void {
  if (sleeve.artId !== DEFAULT_SLEEVE.artId) {
    img.addEventListener(
      "error",
      () => {
        img.src = sleeveArtUrl(DEFAULT_SLEEVE.artId);
      },
      { once: true },
    );
  }
  img.src = sleeveArtUrl(sleeve.artId);
}
