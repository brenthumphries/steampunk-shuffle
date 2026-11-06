// design.md §12.5: every per-game localStorage read and write goes through
// storageKey(), so a ledger's data can never leak into another's. This scans
// src/ and fails on any storage call whose key is neither built by storageKey
// nor one of the few device-wide keys.

import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";

import { GLOBAL_KEY_LIST, GLOBAL_KEYS, PER_GAME_KEY_NAMES } from "../../../src/save/storageKey.ts";

const SRC = join(__dirname, "..", "..", "..", "src");

/** The files that implement the key scheme itself; they build keys from the registry and are tested directly. */
const IMPLEMENTERS = new Set(["save/ledgers.ts", "save/storageKey.ts", "native/storageMirror.ts"]);

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? sourceFiles(path) : path.endsWith(".ts") ? [path] : [];
  });
}

/** Source with comments blanked, so prose about keys in a comment is not mistaken for code. */
function code(path: string): string {
  return readFileSync(path, "utf8").replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " ")).replace(/(^|[^:])\/\/.*$/gm, "$1");
}

/** The first argument of each `<store>.<method>(` call in `text`. */
function storageCalls(text: string): { store: string; arg: string }[] {
  const calls: { store: string; arg: string }[] = [];
  const re = /\b(localStorage|sessionStorage)\s*\.\s*(?:getItem|setItem|removeItem)\s*\(/g;
  for (let m = re.exec(text); m; m = re.exec(text)) {
    let depth = 0;
    let i = re.lastIndex;
    const start = i;
    for (; i < text.length; i += 1) {
      const ch = text[i]!;
      if (ch === "(") depth += 1;
      else if (ch === ")") {
        if (depth === 0) break;
        depth -= 1;
      } else if (ch === "," && depth === 0) break;
    }
    calls.push({ store: m[1]!, arg: text.slice(start, i).trim() });
  }
  return calls;
}

describe("per-game storage is namespaced", () => {
  const files = sourceFiles(SRC).map((path) => ({ rel: relative(SRC, path).replace(/\\/g, "/"), path }));

  it("finds the storage calls it is meant to police", () => {
    const total = files.flatMap((f) => storageCalls(code(f.path))).length;
    expect(total).toBeGreaterThan(15);
  });

  it("every localStorage call outside the key scheme uses storageKey(...) or a device-wide key", () => {
    const offenders: string[] = [];
    for (const f of files) {
      if (IMPLEMENTERS.has(f.rel)) continue;
      for (const call of storageCalls(code(f.path))) {
        const ok = call.store === "localStorage" && (/^storageKey\(\s*[A-Za-z_"'-]+\s*\)$/.test(call.arg) || /^GLOBAL_KEYS\.\w+$/.test(call.arg));
        if (!ok) offenders.push(`${f.rel}: ${call.store}(${call.arg})`);
      }
    }
    expect(offenders).toEqual([]);
  });

  it("any GLOBAL_KEYS member a module uses really is in the device-wide list", () => {
    for (const f of files) {
      for (const m of code(f.path).matchAll(/GLOBAL_KEYS\.(\w+)/g)) expect(Object.keys(GLOBAL_KEYS), `${f.rel} uses GLOBAL_KEYS.${m[1]}`).toContain(m[1]);
    }
  });

  it("no module outside the key scheme writes a raw key literal", () => {
    const offenders: string[] = [];
    for (const f of files) {
      if (IMPLEMENTERS.has(f.rel)) continue;
      const text = code(f.path);
      if (/["'`](steampunk-shuffle:|ws:)/.test(text)) offenders.push(f.rel);
    }
    expect(offenders).toEqual([]);
  });

  it("storageKey is only ever given a documented per-game key name", () => {
    for (const f of files) {
      for (const m of code(f.path).matchAll(/KEY_NAME = "([^"]+)"/g)) expect(PER_GAME_KEY_NAMES as readonly string[], f.rel).toContain(m[1]);
    }
  });

  it("the device-wide list is exactly the registry, the cellar backup and the mute toggle", () => {
    expect([...GLOBAL_KEY_LIST].sort()).toEqual(["steampunk-shuffle:audio-muted", "ws:backup:v1", "ws:ledgers"]);
  });
});
