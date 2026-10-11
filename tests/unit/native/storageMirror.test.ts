import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { hydrateStorage, mirrorWrites, type PreferencesLike } from "../../../src/native/storageMirror.ts";

function fakePrefs(initial: Record<string, string> = {}): PreferencesLike & { data: Map<string, string> } {
  const data = new Map(Object.entries(initial));
  return {
    data,
    keys: async () => ({ keys: [...data.keys()] }),
    get: async ({ key }) => ({ value: data.get(key) ?? null }),
    set: async ({ key, value }) => {
      data.set(key, value);
    },
    remove: async ({ key }) => {
      data.delete(key);
    },
  };
}

const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

describe("native storage mirror (plan step 4.2)", () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => localStorage.clear());

  it("restores a key that Preferences kept but localStorage lost", async () => {
    const prefs = fakePrefs({ "steampunk-shuffle:pub": '{"checks":42}' });
    await hydrateStorage(prefs);
    expect(localStorage.getItem("steampunk-shuffle:pub")).toBe('{"checks":42}');
  });

  it("copies a save made before the mirror existed into Preferences", async () => {
    localStorage.setItem("steampunk-shuffle:pub", '{"checks":7}');
    const prefs = fakePrefs();
    await hydrateStorage(prefs);
    expect(prefs.data.get("steampunk-shuffle:pub")).toBe('{"checks":7}');
  });

  it("lets localStorage win when both copies exist", async () => {
    localStorage.setItem("steampunk-shuffle:pub", "new");
    const prefs = fakePrefs({ "steampunk-shuffle:pub": "old" });
    await hydrateStorage(prefs);
    expect(localStorage.getItem("steampunk-shuffle:pub")).toBe("new");
  });

  it("ignores keys outside the game's prefix in both directions", async () => {
    localStorage.setItem("other-app:x", "1");
    const prefs = fakePrefs({ "other-app:y": "2" });
    await hydrateStorage(prefs);
    expect(localStorage.getItem("other-app:y")).toBeNull();
    expect(prefs.data.has("other-app:x")).toBe(false);
  });

  it("mirrors setItem, removeItem and clear for game keys only, and uninstalls cleanly", async () => {
    const prefs = fakePrefs();
    const uninstall = mirrorWrites(prefs);

    localStorage.setItem("steampunk-shuffle:deck-slots", "a");
    localStorage.setItem("other-app:x", "b");
    await flush();
    expect(prefs.data.get("steampunk-shuffle:deck-slots")).toBe("a");
    expect(prefs.data.has("other-app:x")).toBe(false);

    localStorage.removeItem("steampunk-shuffle:deck-slots");
    await flush();
    expect(prefs.data.has("steampunk-shuffle:deck-slots")).toBe(false);

    localStorage.setItem("steampunk-shuffle:player", "c");
    await flush();
    localStorage.clear();
    await flush();
    expect(prefs.data.size).toBe(0);

    uninstall();
    localStorage.setItem("steampunk-shuffle:after", "d");
    await flush();
    expect(prefs.data.has("steampunk-shuffle:after")).toBe(false);
  });

  it("keeps working when Preferences rejects a write", async () => {
    const prefs = fakePrefs();
    prefs.set = async () => {
      throw new Error("native bridge down");
    };
    const uninstall = mirrorWrites(prefs);
    localStorage.setItem("steampunk-shuffle:pub", "x");
    await flush();
    expect(localStorage.getItem("steampunk-shuffle:pub")).toBe("x");
    uninstall();
  });
});
