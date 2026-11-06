// The only place a per-game localStorage key is built (design.md §12.5).
// Kept free of imports so any state module can use it without a cycle: the
// registry is read straight from localStorage, as raw JSON.

export const REGISTRY_KEY = "ws:ledgers";
export const BACKUP_KEY = "ws:backup:v1";
export const LEGACY_PREFIX = "steampunk-shuffle:";

/**
 * Device-wide keys, the only localStorage keys a module may name directly.
 * The mute toggle belongs to the phone, not to a game; the registry and the
 * cellar backup describe every ledger at once. (The intro film plays on every
 * launch and there is no letters-seen key: B.'s letters, when they arrive,
 * belong here too.)
 */
export const GLOBAL_KEYS = {
  registry: REGISTRY_KEY,
  backup: BACKUP_KEY,
  audioMuted: `${LEGACY_PREFIX}audio-muted`,
} as const;

export const GLOBAL_KEY_LIST: readonly string[] = Object.values(GLOBAL_KEYS);

/** The per-game key names. Each lives at `ws:<ledgerId>:<name>`; before the 1.1 migration each lived at `steampunk-shuffle:<name>`. */
export const PER_GAME_KEY_NAMES = ["pub-state", "deck-slots", "tournament-state", "active-match", "tutorial-state", "player"] as const;

let cachedRaw: string | null | undefined;
let cachedId: string | null = null;
let scopedId: string | null = null;

/** The active ledger's id, or null before the registry exists. */
export function activeLedgerId(): string | null {
  if (scopedId) return scopedId;
  try {
    const raw = localStorage.getItem(REGISTRY_KEY);
    if (raw === cachedRaw) return cachedId;
    cachedRaw = raw;
    cachedId = null;
    if (raw) {
      const parsed = JSON.parse(raw) as { activeId?: unknown };
      if (typeof parsed.activeId === "string" && parsed.activeId) cachedId = parsed.activeId;
    }
    return cachedId;
  } catch {
    return null;
  }
}

/**
 * `ws:<activeId>:<name>`. Before a registry exists (a unit test, or the
 * instant before `initLedgers()` has run at launch) it is the pre-1.1
 * `steampunk-shuffle:<name>`, which is the key the migration reads from.
 */
export function storageKey(name: string): string {
  const id = activeLedgerId();
  return id ? `ws:${id}:${name}` : `${LEGACY_PREFIX}${name}`;
}

export function ledgerKey(ledgerId: string, name: string): string {
  return `ws:${ledgerId}:${name}`;
}

/** Runs `work` (synchronously) with every `storageKey` call pointing at another ledger, for exporting one that is not active. */
export function withLedgerScope<T>(ledgerId: string, work: () => T): T {
  const before = scopedId;
  scopedId = ledgerId;
  try {
    return work();
  } finally {
    scopedId = before;
  }
}
