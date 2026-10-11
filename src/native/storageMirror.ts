// The iOS app keeps its save in WKWebView localStorage, which iOS can clear
// under storage pressure. This mirrors every steampunk-shuffle:* key into
// Capacitor Preferences (native UserDefaults) so a cleared localStorage is
// restored on the next launch. Only ever installed in the native build.

export const STORAGE_PREFIX = "steampunk-shuffle:";

export interface PreferencesLike {
  keys(): Promise<{ keys: string[] }>;
  get(options: { key: string }): Promise<{ value: string | null }>;
  set(options: { key: string; value: string }): Promise<void>;
  remove(options: { key: string }): Promise<void>;
}

function ownKeys(storage: Storage): string[] {
  const keys: string[] = [];
  for (let i = 0; i < storage.length; i += 1) {
    const key = storage.key(i);
    if (key?.startsWith(STORAGE_PREFIX)) keys.push(key);
  }
  return keys;
}

/**
 * Two-way sync at launch: a key Preferences has but localStorage lost comes
 * back; a key localStorage has that Preferences never saw (a save made
 * before the mirror existed) is copied across. If both have a key,
 * localStorage wins, since it is the copy the app has been writing to.
 */
export async function hydrateStorage(prefs: PreferencesLike, storage: Storage = localStorage): Promise<void> {
  const stored = (await prefs.keys()).keys.filter((key) => key.startsWith(STORAGE_PREFIX));
  for (const key of stored) {
    if (storage.getItem(key) !== null) continue;
    const { value } = await prefs.get({ key });
    if (value !== null) storage.setItem(key, value);
  }
  for (const key of ownKeys(storage)) {
    if (stored.includes(key)) continue;
    const value = storage.getItem(key);
    if (value !== null) await prefs.set({ key, value });
  }
}

/** Patches Storage.prototype (assigning on the instance would store an item) and returns an uninstall function. */
export function mirrorWrites(prefs: PreferencesLike, storage: Storage = localStorage): () => void {
  const proto = Storage.prototype;
  const { setItem, removeItem, clear } = proto;
  const quiet = (work: Promise<void>): void => {
    work.catch(() => {});
  };

  proto.setItem = function (this: Storage, key: string, value: string): void {
    setItem.call(this, key, value);
    if (this === storage && key.startsWith(STORAGE_PREFIX)) quiet(prefs.set({ key, value: String(value) }));
  };
  proto.removeItem = function (this: Storage, key: string): void {
    removeItem.call(this, key);
    if (this === storage && key.startsWith(STORAGE_PREFIX)) quiet(prefs.remove({ key }));
  };
  proto.clear = function (this: Storage): void {
    const doomed = this === storage ? ownKeys(this) : [];
    clear.call(this);
    for (const key of doomed) quiet(prefs.remove({ key }));
  };

  return () => {
    proto.setItem = setItem;
    proto.removeItem = removeItem;
    proto.clear = clear;
  };
}
