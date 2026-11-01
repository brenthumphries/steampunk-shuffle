// The edition flag (docs/plans/monthly/00-monthly-content-plan.md §4.2,
// docs/app-store-readiness.md §7). One build-time switch: `VITE_EDITION`
// is "gift" (the default, and the copy Sara plays) or "public" (a future
// App Store build). Cards, opponents, lines and letters can carry
// `giftOnly: true`; every registry runs its list through `visibleInEdition`
// so a public build never reaches one.
//
// Read at call time, not import time, so a test can stub the env var.

export type Edition = "gift" | "public";

export function edition(): Edition {
  return import.meta.env?.VITE_EDITION === "public" ? "public" : "gift";
}

export function isPublicEdition(): boolean {
  return edition() === "public";
}

/** True when `item` belongs in the running edition: everything in the gift build, only non-`giftOnly` things in a public one. */
export function visibleInEdition(item: { giftOnly?: boolean }): boolean {
  return !(item.giftOnly === true && isPublicEdition());
}

/** `items` minus whatever the running edition drops. Returns the same array when nothing is dropped. */
export function forEdition<T extends { giftOnly?: boolean }>(items: readonly T[]): T[] {
  return isPublicEdition() ? items.filter(visibleInEdition) : (items as T[]);
}

/** A line that may be tagged gift-only: a plain string (always shown) or `{ text, giftOnly? }`. */
export type TaggedLine = string | { text: string; giftOnly?: boolean };

export function lineText(line: TaggedLine): string {
  return typeof line === "string" ? line : line.text;
}

/** The text of every line the running edition keeps. */
export function visibleLines(lines: readonly TaggedLine[]): string[] {
  return lines.filter((l) => typeof l === "string" || visibleInEdition(l)).map(lineText);
}
