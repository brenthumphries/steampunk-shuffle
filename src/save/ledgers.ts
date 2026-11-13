// Multiple save ledgers on one device (design.md §12.5, release 1.1 plan
// docs/plans/monthly/14-saves-and-android.md §2). The registry lives in the
// global key `ws:ledgers`; every ledger's per-game keys live at
// `ws:<id>:<name>` (src/save/storageKey.ts). Before the registry existed the
// game kept one save under `steampunk-shuffle:<name>`; the first launch of the
// 1.1 build copies it into ledger one (never moves it) and leaves the original
// keys alone for CELLAR_DAYS, with a full backup in `ws:backup:v1`.

import { today } from "../events/eventClock.ts";
import { titleForWins } from "../pub/progression.ts";
import { buildLedgerFile, buildSaveFile, type IncomingLedger, type LedgerFile, type SaveFile } from "./saveFile.ts";
import {
  BACKUP_KEY,
  GLOBAL_KEY_LIST,
  LEGACY_PREFIX,
  PER_GAME_KEY_NAMES,
  REGISTRY_KEY,
  activeLedgerId,
  ledgerKey,
  withLedgerScope,
} from "./storageKey.ts";

export const MAX_LEDGERS = 4;
/** How long the original un-prefixed keys, and the "Restore the cellar copy" button, last after the migration. */
export const CELLAR_DAYS = 30;
export const DEFAULT_LEDGER_NAME = "Sara";
export const LEDGER_NAME_MAX = 24;
/** The beer mat shown once, on the first launch after the migration (plan §2.3). */
export const CELLAR_LINE = "Sir Charles has moved your ledger onto a shelf. Nothing's changed. There's a copy in the cellar, should you want it.";

export interface LedgerSummary {
  title: string;
  wins: number;
  collectionCount: number;
}

export interface LedgerEntry {
  id: string;
  name: string;
  createdAt: string;
  lastPlayedAt: string;
  summary: LedgerSummary;
}

export interface Registry {
  activeId: string;
  ledgers: LedgerEntry[];
  /** Local date (YYYY-MM-DD) the pre-1.1 save was copied into a ledger; absent on an install that never had one. */
  migratedAt?: string;
  migratedLedgerId?: string;
  /** The "moved onto a shelf" beer mat has been queued once. */
  cellarMatShown?: boolean;
  /** The original un-prefixed keys have been deleted (the 30 days are up). */
  legacyCleared?: boolean;
}

/** What `ws:backup:v1` holds: the pre-migration save, twice over. */
export interface CellarBackup {
  format: 1;
  createdAt: string;
  ledgerId: string;
  /** Every pre-1.1 key exactly as it was stored (raw strings), so a restore is byte-identical. */
  keys: Record<string, string>;
  /** The same save as a normal export, readable by "Import save". */
  save: SaveFile | null;
}

export type LedgerResult = { ok: true } | { ok: false; error: string };

function isEntry(value: unknown): value is LedgerEntry {
  if (!value || typeof value !== "object") return false;
  const e = value as Partial<LedgerEntry>;
  return typeof e.id === "string" && e.id.length > 0 && typeof e.name === "string" && typeof e.createdAt === "string" && typeof e.lastPlayedAt === "string" && !!e.summary && typeof e.summary === "object";
}

export function loadRegistry(): Registry | null {
  try {
    const raw = localStorage.getItem(REGISTRY_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<Registry>;
    if (typeof parsed.activeId !== "string" || !Array.isArray(parsed.ledgers)) return null;
    const ledgers = parsed.ledgers.filter(isEntry);
    if (ledgers.length === 0 || !ledgers.some((l) => l.id === parsed.activeId)) return null;
    const registry: Registry = { activeId: parsed.activeId, ledgers };
    if (typeof parsed.migratedAt === "string") registry.migratedAt = parsed.migratedAt;
    if (typeof parsed.migratedLedgerId === "string") registry.migratedLedgerId = parsed.migratedLedgerId;
    if (parsed.cellarMatShown === true) registry.cellarMatShown = true;
    if (parsed.legacyCleared === true) registry.legacyCleared = true;
    return registry;
  } catch {
    return null;
  }
}

function saveRegistry(registry: Registry): void {
  try {
    localStorage.setItem(REGISTRY_KEY, JSON.stringify(registry));
  } catch {
    // Safari private mode / storage quota: the registry just won't persist this session.
  }
}

export function newLedgerId(): string {
  const c = globalThis.crypto;
  if (c && typeof c.randomUUID === "function") return c.randomUUID();
  const hex = (n: number): string => Array.from({ length: n }, () => Math.floor(Math.random() * 16).toString(16)).join("");
  return `${hex(8)}-${hex(4)}-4${hex(3)}-a${hex(3)}-${hex(12)}`;
}

function localDateKeyOf(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function parseDateKey(key: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(key);
  return m ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])) : null;
}

/** Whole calendar days from `from` (YYYY-MM-DD) to `to`. */
export function daysBetween(from: string, to: string): number {
  const a = parseDateKey(from);
  const b = parseDateKey(to);
  if (!a || !b) return 0;
  return Math.round((b.getTime() - a.getTime()) / 86_400_000);
}

function readJson(key: string): Record<string, unknown> | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? (parsed as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

/** Reads a ledger's wins, title and collection straight from its stored pub state, so no other ledger's data is ever loaded through the active one. */
export function summaryFor(ledgerId: string): LedgerSummary {
  const pub = readJson(ledgerKey(ledgerId, "pub-state"));
  const wins = typeof pub?.totalWins === "number" ? pub.totalWins : 0;
  const collection = Array.isArray(pub?.collection) ? pub.collection.length : 0;
  return { title: titleForWins(wins), wins, collectionCount: collection };
}

function cleanName(name: string): string {
  return name.trim().replace(/\s+/g, " ").slice(0, LEDGER_NAME_MAX);
}

function nameError(name: string, ledgers: readonly LedgerEntry[], exceptId?: string): string | null {
  if (!name) return "A ledger needs a name.";
  if (ledgers.some((l) => l.id !== exceptId && l.name.toLowerCase() === name.toLowerCase())) return `There is already a ledger called ${name}.`;
  return null;
}

function legacyKeys(): string[] {
  const keys: string[] = [];
  for (let i = 0; i < localStorage.length; i += 1) {
    const key = localStorage.key(i);
    if (key && key.startsWith(LEGACY_PREFIX) && !GLOBAL_KEY_LIST.includes(key)) keys.push(key);
  }
  return keys.sort();
}

function stamp(): string {
  return today().toISOString();
}

function freshEntry(id: string, name: string): LedgerEntry {
  const now = stamp();
  return { id, name, createdAt: now, lastPlayedAt: now, summary: summaryFor(id) };
}

/**
 * First launch of the 1.1 build with an old save (plan §2.3): back everything
 * up, then COPY each original key into a new ledger. The registry is written
 * last, so a launch interrupted midway simply runs again (re-using the id the
 * backup recorded) and overwrites the same copies. Nothing original is touched.
 */
function migrateLegacySave(): Registry {
  const keys = legacyKeys();
  const raws: Record<string, string> = {};
  for (const key of keys) raws[key] = localStorage.getItem(key) ?? "";

  let id = newLedgerId();
  const earlier = readBackup();
  if (earlier) id = earlier.ledgerId;

  let save: SaveFile | null = null;
  try {
    save = buildSaveFile(today());
  } catch {
    save = null;
  }
  const backup: CellarBackup = { format: 1, createdAt: stamp(), ledgerId: id, keys: raws, save };
  try {
    localStorage.setItem(BACKUP_KEY, JSON.stringify(backup));
  } catch {
    // The copies below still leave the originals in place; the backup is the second net.
  }

  for (const key of keys) localStorage.setItem(ledgerKey(id, key.slice(LEGACY_PREFIX.length)), raws[key] ?? "");

  const player = readJson(`${LEGACY_PREFIX}player`);
  const name = typeof player?.name === "string" && cleanName(player.name) ? cleanName(player.name) : DEFAULT_LEDGER_NAME;
  const registry: Registry = { activeId: id, ledgers: [freshEntry(id, name)], migratedAt: localDateKeyOf(today()), migratedLedgerId: id };
  saveRegistry(registry);
  return registry;
}

/** A registry that went missing or corrupt while namespaced keys survive: rebuild it from them rather than starting over. */
function rebuildRegistry(): Registry | null {
  const ids = new Set<string>();
  for (let i = 0; i < localStorage.length; i += 1) {
    const m = /^ws:([0-9a-f-]{36}):/.exec(localStorage.key(i) ?? "");
    if (m?.[1]) ids.add(m[1]);
  }
  if (ids.size === 0) return null;
  const ledgers = [...ids].slice(0, MAX_LEDGERS).map((id) => {
    const player = readJson(ledgerKey(id, "player"));
    const name = typeof player?.name === "string" && cleanName(player.name) ? cleanName(player.name) : DEFAULT_LEDGER_NAME;
    return freshEntry(id, name);
  });
  const registry: Registry = { activeId: ledgers[0]!.id, ledgers };
  saveRegistry(registry);
  return registry;
}

/** Deletes the original un-prefixed keys once CELLAR_DAYS have passed since the migration. */
function clearExpiredLegacyKeys(registry: Registry): Registry {
  if (!registry.migratedAt || registry.legacyCleared) return registry;
  if (daysBetween(registry.migratedAt, localDateKeyOf(today())) < CELLAR_DAYS) return registry;
  for (const key of legacyKeys()) {
    try {
      localStorage.removeItem(key);
    } catch {
      // Leave it; the next launch tries again.
    }
  }
  const next = { ...registry, legacyCleared: true };
  saveRegistry(next);
  return next;
}

/**
 * Runs once at every launch, before anything reads a per-game key
 * (src/boot.ts). Idempotent: with a registry it only prunes the expired
 * originals and stamps the active ledger as played.
 */
export function initLedgers(): Registry {
  let registry = loadRegistry();
  if (!registry) {
    const hadRegistryKey = localStorage.getItem(REGISTRY_KEY) !== null;
    if (hadRegistryKey) registry = rebuildRegistry();
    if (!registry) {
      if (legacyKeys().length > 0) registry = migrateLegacySave();
      else {
        const id = newLedgerId();
        registry = { activeId: id, ledgers: [freshEntry(id, DEFAULT_LEDGER_NAME)] };
        saveRegistry(registry);
      }
    }
  }
  registry = clearExpiredLegacyKeys(registry);
  return touchActive(registry);
}

/** Stamps the active ledger's last-played time and refreshes its summary. */
export function touchActive(registry: Registry = requireRegistry()): Registry {
  const next: Registry = {
    ...registry,
    ledgers: registry.ledgers.map((l) => (l.id === registry.activeId ? { ...l, lastPlayedAt: stamp(), summary: summaryFor(l.id) } : l)),
  };
  saveRegistry(next);
  return next;
}

function requireRegistry(): Registry {
  const registry = loadRegistry();
  if (!registry) throw new Error("The ledger registry has not been initialised (initLedgers runs in src/boot.ts).");
  return registry;
}

/** Every ledger with its summary recomputed from storage, newest play first. */
export function listLedgers(): { ledgers: LedgerEntry[]; activeId: string } {
  const registry = requireRegistry();
  const ledgers = registry.ledgers.map((l) => ({ ...l, summary: summaryFor(l.id) }));
  saveRegistry({ ...registry, ledgers });
  return { ledgers: [...ledgers].sort((a, b) => b.lastPlayedAt.localeCompare(a.lastPlayedAt)), activeId: registry.activeId };
}

export function canCreateLedger(): boolean {
  return (loadRegistry()?.ledgers.length ?? 0) < MAX_LEDGERS;
}

/**
 * Starts a blank ledger (it begins at the tutorial). It does NOT switch to it;
 * call `switchLedger`. The dedication has been seen by whoever owns the device,
 * so a new ledger skips it.
 */
export function createLedger(rawName: string): LedgerResult & { id?: string } {
  const registry = requireRegistry();
  if (registry.ledgers.length >= MAX_LEDGERS) return { ok: false, error: `The shelf holds ${MAX_LEDGERS} ledgers. Delete one to make room.` };
  const name = cleanName(rawName);
  const bad = nameError(name, registry.ledgers);
  if (bad) return { ok: false, error: bad };
  const id = newLedgerId();
  try {
    localStorage.setItem(ledgerKey(id, "player"), JSON.stringify({ name, dedicationSeen: true }));
  } catch {
    return { ok: false, error: "There is no room left on this device to start another ledger." };
  }
  saveRegistry({ ...registry, ledgers: [...registry.ledgers, freshEntry(id, name)] });
  return { ok: true, id };
}

/** Makes `id` the active ledger. The caller reloads the app so every module reads the new keys. */
export function switchLedger(id: string): LedgerResult {
  const registry = requireRegistry();
  if (!registry.ledgers.some((l) => l.id === id)) return { ok: false, error: "That ledger is not on the shelf." };
  const stamped = touchActive(registry);
  saveRegistry({ ...stamped, activeId: id });
  return { ok: true };
}

export function renameLedger(id: string, rawName: string): LedgerResult {
  const registry = requireRegistry();
  if (!registry.ledgers.some((l) => l.id === id)) return { ok: false, error: "That ledger is not on the shelf." };
  const name = cleanName(rawName);
  const bad = nameError(name, registry.ledgers, id);
  if (bad) return { ok: false, error: bad };
  saveRegistry({ ...registry, ledgers: registry.ledgers.map((l) => (l.id === id ? { ...l, name } : l)) });
  return { ok: true };
}

function ledgerStorageKeys(id: string): string[] {
  const prefix = `ws:${id}:`;
  const keys: string[] = [];
  for (let i = 0; i < localStorage.length; i += 1) {
    const key = localStorage.key(i);
    if (key?.startsWith(prefix)) keys.push(key);
  }
  return keys;
}

/**
 * Removes a ledger and all its keys. `backedUp` must be true: the screen exports
 * the ledger to a file first (src/ui/saveExport.ts) and only then passes it, so
 * a ledger can never be deleted without a copy having been offered. Deleting the
 * active ledger makes the most recently played other one active (the caller
 * reloads); deleting the last one starts a fresh blank ledger.
 */
export function deleteLedger(id: string, options: { backedUp: boolean }): LedgerResult & { activeChanged?: boolean } {
  if (!options.backedUp) return { ok: false, error: "Export a backup of this ledger before deleting it." };
  const registry = requireRegistry();
  if (!registry.ledgers.some((l) => l.id === id)) return { ok: false, error: "That ledger is not on the shelf." };
  for (const key of ledgerStorageKeys(id)) localStorage.removeItem(key);

  let ledgers = registry.ledgers.filter((l) => l.id !== id);
  let activeId = registry.activeId;
  if (ledgers.length === 0) {
    const fresh = newLedgerId();
    ledgers = [freshEntry(fresh, DEFAULT_LEDGER_NAME)];
    activeId = fresh;
  } else if (activeId === id) {
    activeId = [...ledgers].sort((a, b) => b.lastPlayedAt.localeCompare(a.lastPlayedAt))[0]!.id;
  }
  const next: Registry = { ...registry, ledgers, activeId };
  if (registry.migratedLedgerId === id) delete next.migratedLedgerId;
  saveRegistry(next);
  return { ok: true, activeChanged: activeId !== registry.activeId };
}

/** One ledger file (.wheatstone) for any ledger, not only the active one. */
export function exportLedger(id: string): LedgerFile {
  const entry = requireRegistry().ledgers.find((l) => l.id === id);
  const keys: Record<string, string> = {};
  for (const name of PER_GAME_KEY_NAMES) {
    try {
      const raw = localStorage.getItem(ledgerKey(id, name));
      if (raw !== null) keys[name] = raw;
    } catch {
      // Unreadable key: leave it out rather than fail the whole export.
    }
  }
  return buildLedgerFile({ id, name: entry?.name ?? DEFAULT_LEDGER_NAME, summary: summaryFor(id), keys }, today());
}

/** What receiving a file would do (plan 14 §2.2): the screen asks the player only when there is a choice. */
export type ReceivePlan = { kind: "new" } | { kind: "same-id"; existing: LedgerEntry } | { kind: "full" };

export function planReceive(incoming: IncomingLedger): ReceivePlan {
  const registry = requireRegistry();
  const existing = incoming.ledgerId ? registry.ledgers.find((l) => l.id === incoming.ledgerId) : undefined;
  if (existing) return { kind: "same-id", existing };
  return registry.ledgers.length >= MAX_LEDGERS ? { kind: "full" } : { kind: "new" };
}

function uniqueName(name: string, ledgers: readonly LedgerEntry[], exceptId?: string): string {
  const base = cleanName(name) || DEFAULT_LEDGER_NAME;
  const taken = (candidate: string): boolean => ledgers.some((l) => l.id !== exceptId && l.name.toLowerCase() === candidate.toLowerCase());
  if (!taken(base)) return base;
  for (let n = 2; n < 100; n += 1) {
    const suffix = ` (${n})`;
    const candidate = `${base.slice(0, LEDGER_NAME_MAX - suffix.length)}${suffix}`;
    if (!taken(candidate)) return candidate;
  }
  return base;
}

/** Writes `keys` as ledger `id`'s whole save; on a storage failure, puts back exactly what was there. */
function writeLedgerKeys(id: string, keys: Record<string, string>): boolean {
  const before: Record<string, string> = {};
  for (const key of ledgerStorageKeys(id)) before[key] = localStorage.getItem(key) ?? "";
  try {
    for (const key of Object.keys(before)) localStorage.removeItem(key);
    for (const [name, raw] of Object.entries(keys)) localStorage.setItem(ledgerKey(id, name), raw);
    return true;
  } catch {
    for (const key of ledgerStorageKeys(id)) localStorage.removeItem(key);
    for (const [key, raw] of Object.entries(before)) {
      try {
        localStorage.setItem(key, raw);
      } catch {
        // Nothing more can be done; the next launch rebuilds what it can.
      }
    }
    return false;
  }
}

export type ReceiveChoice = { mode: "add" } | { mode: "replace-same" } | { mode: "keep-both" } | { mode: "replace-other"; replaceId: string };
export type ReceiveResult = { ok: true; id: string; name: string; activeReplaced: boolean } | { ok: false; error: string };

const NO_ROOM = "There is no room left on this device to take that ledger.";

/**
 * Puts a received ledger on the shelf. "replace-same" and "replace-other" delete
 * a ledger, so the screen has already had a backup of it shared to completion
 * (src/ui/receiveLedgerScreen.ts); `activeReplaced` tells the caller to reload.
 * "add" keeps the sender's id (so a later copy of the same ledger is recognised);
 * "keep-both" gives it a new one.
 */
export function receiveLedger(incoming: IncomingLedger, choice: ReceiveChoice): ReceiveResult {
  const registry = requireRegistry();
  const plan = planReceive(incoming);

  if (choice.mode === "replace-same") {
    if (plan.kind !== "same-id") return { ok: false, error: "That ledger is not on the shelf any more." };
    const id = plan.existing.id;
    if (!writeLedgerKeys(id, incoming.keys)) return { ok: false, error: NO_ROOM };
    const name = uniqueName(incoming.name, registry.ledgers, id);
    saveRegistry({ ...registry, ledgers: registry.ledgers.map((l) => (l.id === id ? { ...l, name, summary: summaryFor(id) } : l)) });
    return { ok: true, id, name, activeReplaced: id === registry.activeId };
  }

  let ledgers = [...registry.ledgers];
  let activeId = registry.activeId;
  let removed: { entry: LedgerEntry; keys: Record<string, string> } | null = null;
  if (choice.mode === "replace-other") {
    const gone = ledgers.find((l) => l.id === choice.replaceId);
    if (!gone) return { ok: false, error: "That ledger is not on the shelf." };
    const keys: Record<string, string> = {};
    for (const key of ledgerStorageKeys(gone.id)) keys[key] = localStorage.getItem(key) ?? "";
    removed = { entry: gone, keys };
    ledgers = ledgers.filter((l) => l.id !== gone.id);
  }
  if (ledgers.length >= MAX_LEDGERS) return { ok: false, error: `The shelf holds ${MAX_LEDGERS} ledgers. Delete one to make room.` };

  const keepId = choice.mode === "add" || choice.mode === "replace-other" ? incoming.ledgerId : null;
  const id = keepId && !ledgers.some((l) => l.id === keepId) ? keepId : newLedgerId();
  const name = uniqueName(incoming.name, ledgers);
  if (removed) for (const key of Object.keys(removed.keys)) localStorage.removeItem(key);
  if (!writeLedgerKeys(id, incoming.keys)) {
    if (removed) for (const [key, raw] of Object.entries(removed.keys)) localStorage.setItem(key, raw);
    return { ok: false, error: NO_ROOM };
  }
  const activeReplaced = removed?.entry.id === registry.activeId;
  ledgers = [...ledgers, freshEntry(id, name)];
  if (activeReplaced) activeId = [...ledgers].sort((a, b) => b.lastPlayedAt.localeCompare(a.lastPlayedAt))[0]!.id;
  saveRegistry({ ...registry, ledgers, activeId });
  return { ok: true, id, name, activeReplaced };
}

export function readBackup(): CellarBackup | null {
  try {
    const raw = localStorage.getItem(BACKUP_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<CellarBackup>;
    if (parsed.format !== 1 || typeof parsed.ledgerId !== "string" || !parsed.keys || typeof parsed.keys !== "object") return null;
    return parsed as CellarBackup;
  } catch {
    return null;
  }
}

/** True for the 30 days after the migration while the cellar copy exists. */
export function cellarCopyAvailable(): boolean {
  const registry = loadRegistry();
  if (!registry?.migratedAt || registry.legacyCleared) return false;
  if (daysBetween(registry.migratedAt, localDateKeyOf(today())) >= CELLAR_DAYS) return false;
  return readBackup() !== null;
}

/** The beer mat for the first launch after the migration, once. */
export function takeCellarNotice(): string | null {
  const registry = loadRegistry();
  if (!registry?.migratedAt || registry.cellarMatShown) return null;
  saveRegistry({ ...registry, cellarMatShown: true });
  return CELLAR_LINE;
}

/**
 * Puts the pre-migration save back as the migrated ledger and makes it active
 * (the caller reloads). Whatever was played in that ledger since is replaced,
 * so the screen asks first.
 */
export function restoreCellarCopy(): LedgerResult {
  if (!cellarCopyAvailable()) return { ok: false, error: "The cellar copy is no longer kept." };
  const backup = readBackup();
  const registry = requireRegistry();
  if (!backup) return { ok: false, error: "The cellar copy is missing." };
  const id = registry.migratedLedgerId ?? backup.ledgerId;

  let ledgers = registry.ledgers;
  if (!ledgers.some((l) => l.id === id)) {
    if (ledgers.length >= MAX_LEDGERS) return { ok: false, error: "The migrated ledger was deleted and the shelf is full. Delete a ledger first." };
    const player = backup.keys[`${LEGACY_PREFIX}player`];
    let name = DEFAULT_LEDGER_NAME;
    try {
      const parsed = player ? (JSON.parse(player) as { name?: unknown }) : null;
      if (typeof parsed?.name === "string" && cleanName(parsed.name)) name = cleanName(parsed.name);
    } catch {
      // keep the default
    }
    ledgers = [...ledgers, freshEntry(id, name)];
  }

  for (const key of ledgerStorageKeys(id)) localStorage.removeItem(key);
  for (const [key, raw] of Object.entries(backup.keys)) {
    if (key.startsWith(LEGACY_PREFIX)) localStorage.setItem(ledgerKey(id, key.slice(LEGACY_PREFIX.length)), raw);
  }
  saveRegistry({ ...registry, ledgers: ledgers.map((l) => (l.id === id ? { ...l, summary: summaryFor(id) } : l)), activeId: id });
  return { ok: true };
}

export { activeLedgerId, PER_GAME_KEY_NAMES };
