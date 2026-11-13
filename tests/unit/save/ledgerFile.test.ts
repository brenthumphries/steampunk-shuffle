// The .wheatstone ledger file (plan 14 §2.2): checksum, round trip, the old
// whole-save blob as a new ledger, and putting a received ledger on the shelf.

import { beforeEach, describe, expect, it } from "vitest";

import fixture from "./fixtures/currentRelease.json";
import { MAX_LEDGERS, createLedger, exportLedger, initLedgers, listLedgers, loadRegistry, planReceive, receiveLedger } from "../../../src/save/ledgers.ts";
import { buildSaveFile, ledgerFileName, parseIncomingSave, type IncomingLedger } from "../../../src/save/saveFile.ts";
import { sha256Hex } from "../../../src/save/sha256.ts";
import { ledgerKey } from "../../../src/save/storageKey.ts";
import { defaultPubState, loadPubState, savePubState } from "../../../src/pub/pubState.ts";

function seedLegacy(): void {
  localStorage.clear();
  for (const [key, value] of Object.entries(fixture as Record<string, string>)) localStorage.setItem(key, value);
}

function incomingFromExport(id: string): IncomingLedger {
  const parsed = parseIncomingSave(JSON.stringify(exportLedger(id)));
  if (!parsed.ok) throw new Error(parsed.error);
  return parsed.incoming;
}

function ledgerKeysOf(id: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (let i = 0; i < localStorage.length; i += 1) {
    const key = localStorage.key(i)!;
    if (key.startsWith(`ws:${id}:`)) out[key.slice(`ws:${id}:`.length)] = localStorage.getItem(key)!;
  }
  return out;
}

beforeEach(() => localStorage.clear());

describe("sha256", () => {
  it("matches the standard test vectors", () => {
    expect(sha256Hex("")).toBe("e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855");
    expect(sha256Hex("abc")).toBe("ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad");
    expect(sha256Hex("a".repeat(1000))).toBe("41edece42d63e8d9bf515a9ba6932e1c20cbc9f5a5d134645adb5db1b9737ea3");
  });
});

describe("the ledger file", () => {
  it("is named <name>-<date>.wheatstone", () => {
    expect(ledgerFileName("Mum & Dad", new Date("2026-11-13T10:00:00Z"))).toBe("mum-dad-2026-11-13.wheatstone");
  });

  it("round-trips: exported, then received on a fresh install, the keys are identical", () => {
    seedLegacy();
    const id = initLedgers().activeId;
    const before = ledgerKeysOf(id);
    const text = JSON.stringify(exportLedger(id), null, 2);
    expect(JSON.parse(text)).toMatchObject({ version: 2, ledgerId: id, ledgerName: "Sara" });

    localStorage.clear();
    initLedgers();
    const parsed = parseIncomingSave(text);
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    const result = receiveLedger(parsed.incoming, { mode: "add" });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.id).toBe(id);
    expect(ledgerKeysOf(id)).toEqual(before);
    expect(listLedgers().ledgers.find((l) => l.id === id)!.summary.wins).toBe(3);
  });

  it("covers only the exported ledger", () => {
    seedLegacy();
    const sara = initLedgers().activeId;
    const mum = createLedger("Mum").id!;
    localStorage.setItem(ledgerKey(mum, "pub-state"), JSON.stringify({ ...defaultPubState(), checks: 777 }));
    const file = exportLedger(sara);
    expect(JSON.stringify(file)).not.toContain("777");
    expect(file.ledgerId).toBe(sara);
  });

  it("refuses a file whose contents were changed", () => {
    seedLegacy();
    const file = exportLedger(initLedgers().activeId);
    const tampered = { ...file, keys: { ...file.keys, "pub-state": file.keys["pub-state"]!.replace('"totalWins":3', '"totalWins":99') } };
    const result = parseIncomingSave(JSON.stringify(tampered));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toContain("damaged");
    const renamed = parseIncomingSave(JSON.stringify({ ...file, ledgerName: "Eve" }));
    expect(renamed.ok).toBe(false);
  });

  it("refuses truncated text, a file with no checksum, unknown keys, and unrelated JSON", () => {
    seedLegacy();
    const file = exportLedger(initLedgers().activeId);
    const text = JSON.stringify(file);
    expect(parseIncomingSave(text.slice(0, text.length - 40)).ok).toBe(false);
    const { sha256: _omit, ...noSum } = file;
    expect(parseIncomingSave(JSON.stringify(noSum)).ok).toBe(false);
    expect(parseIncomingSave(JSON.stringify({ ...file, keys: { ...file.keys, "ws:ledgers": "{}" } })).ok).toBe(false);
    expect(parseIncomingSave(JSON.stringify({ hello: "world" })).ok).toBe(false);
    expect(parseIncomingSave("[]").ok).toBe(false);
  });

  it("refuses a newer file version politely", () => {
    seedLegacy();
    const file = { ...exportLedger(initLedgers().activeId), version: 3 };
    const result = parseIncomingSave(JSON.stringify(file));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toContain("newer version");
  });

  it("accepts an old whole-save file (version 1 and the earlier version 2) as a new ledger", () => {
    seedLegacy();
    initLedgers();
    const blob = JSON.parse(JSON.stringify(buildSaveFile(new Date("2026-10-01T00:00:00Z"))));
    const v1 = { ...JSON.parse(JSON.stringify(blob)), version: 1 };
    delete v1.pub.ledger;
    for (const file of [v1, blob]) {
      const parsed = parseIncomingSave(JSON.stringify(file));
      expect(parsed.ok).toBe(true);
      if (!parsed.ok) continue;
      expect(parsed.incoming.ledgerId).toBeNull();
      expect(parsed.incoming.summary.wins).toBe(3);
      const before = listLedgers().ledgers.length;
      const result = receiveLedger(parsed.incoming, { mode: "add" });
      expect(result.ok).toBe(true);
      if (!result.ok) continue;
      expect(listLedgers().ledgers).toHaveLength(before + 1);
      const pub = JSON.parse(localStorage.getItem(ledgerKey(result.id, "pub-state"))!);
      expect(pub.totalWins).toBe(3);
      expect(pub.ledger).toBeDefined();
    }
    expect(loadRegistry()!.ledgers.map((l) => l.name)).toEqual(["Sara", "Sara (2)", "Sara (3)"]);
  });
});

describe("receiving a ledger", () => {
  function twoDevices(): { text: string; id: string } {
    seedLegacy();
    const id = initLedgers().activeId;
    return { text: JSON.stringify(exportLedger(id)), id };
  }

  it("the same id on the shelf: replace overwrites it, keep both makes a second ledger", () => {
    const { id } = twoDevices();
    const incoming = incomingFromExport(id);
    savePubState({ ...loadPubState(), totalWins: 50 });
    expect(planReceive(incoming).kind).toBe("same-id");

    const kept = receiveLedger(incoming, { mode: "keep-both" });
    expect(kept.ok && kept.id).not.toBe(id);
    expect(listLedgers().ledgers).toHaveLength(2);
    expect(JSON.parse(localStorage.getItem(ledgerKey(id, "pub-state"))!).totalWins).toBe(50);

    const replaced = receiveLedger(incoming, { mode: "replace-same" });
    expect(replaced.ok && replaced.activeReplaced).toBe(true);
    expect(JSON.parse(localStorage.getItem(ledgerKey(id, "pub-state"))!).totalWins).toBe(3);
    expect(listLedgers().ledgers).toHaveLength(2);
  });

  it("a new id is added with the sender's id, and a duplicate name gets a number", () => {
    const { id } = twoDevices();
    const incoming = { ...incomingFromExport(id), ledgerId: "11111111-2222-4333-8444-555555555555" };
    expect(planReceive(incoming).kind).toBe("new");
    const result = receiveLedger(incoming, { mode: "add" });
    expect(result).toMatchObject({ ok: true, id: "11111111-2222-4333-8444-555555555555", name: "Sara (2)", activeReplaced: false });
  });

  it("a full shelf cannot take another, and replacing one is explicit", () => {
    const { id } = twoDevices();
    for (let i = 1; i < MAX_LEDGERS; i += 1) createLedger(`Guest ${i}`);
    const incoming = { ...incomingFromExport(id), ledgerId: "11111111-2222-4333-8444-555555555555", name: "Visitor" };
    expect(planReceive(incoming).kind).toBe("full");
    expect(receiveLedger(incoming, { mode: "add" }).ok).toBe(false);
    expect(listLedgers().ledgers).toHaveLength(MAX_LEDGERS);

    const target = listLedgers().ledgers.find((l) => l.name === "Guest 1")!;
    const result = receiveLedger(incoming, { mode: "replace-other", replaceId: target.id });
    expect(result.ok).toBe(true);
    const names = listLedgers().ledgers.map((l) => l.name);
    expect(names).toHaveLength(MAX_LEDGERS);
    expect(names).toContain("Visitor");
    expect(names).not.toContain("Guest 1");
    expect(localStorage.getItem(ledgerKey(target.id, "player"))).toBeNull();
  });

  it("keep both on a full shelf is refused", () => {
    const { id } = twoDevices();
    for (let i = 1; i < MAX_LEDGERS; i += 1) createLedger(`Guest ${i}`);
    expect(receiveLedger(incomingFromExport(id), { mode: "keep-both" }).ok).toBe(false);
  });
});
