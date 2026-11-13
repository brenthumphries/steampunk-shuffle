import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../../src/ui/saveExport.ts", () => ({
  saveFileName: () => "backup.wheatstone",
  exportSaveFile: vi.fn(async () => ({ status: "Downloaded backup.wheatstone.", completed: true })),
}));

import { exportSaveFile } from "../../../src/ui/saveExport.ts";
import { mountReceiveLedgerScreen } from "../../../src/ui/receiveLedgerScreen.ts";
import { exportLedger, initLedgers, listLedgers } from "../../../src/save/ledgers.ts";
import { loadPubState, savePubState } from "../../../src/pub/pubState.ts";

const flush = () => new Promise((r) => setTimeout(r, 0));

function click(root: HTMLElement, label: string): void {
  const b = [...root.querySelectorAll("button")].find((x) => x.textContent === label);
  if (!b) throw new Error(`no button ${label}`);
  b.click();
}

function mount(text: string, onReload = vi.fn()): HTMLElement {
  const root = document.createElement("div");
  mountReceiveLedgerScreen(root, { text, onBack: () => {}, onOpenShelf: () => {}, onReload });
  return root;
}

beforeEach(() => {
  localStorage.clear();
  vi.mocked(exportSaveFile).mockClear();
});

describe("the receive screen", () => {
  it("shows a polite refusal for a damaged file and offers no way to add it", () => {
    initLedgers();
    const root = mount('{"version":2,"keys":{},"ledgerId":"abcdefgh","sha256":"0","exportedAt":"x"}');
    expect(root.textContent).toContain("damaged");
    expect(root.textContent).not.toContain("Add to the shelf");
  });

  it("a same-id file shows both summaries; Replace waits for the backup share to complete", async () => {
    const id = initLedgers().activeId;
    const text = JSON.stringify(exportLedger(id));
    savePubState({ ...loadPubState(), totalWins: 9 });
    const onReload = vi.fn();
    const root = mount(text, onReload);
    expect(root.querySelectorAll(".ledger-book")).toHaveLength(2);
    expect(root.textContent).toContain("9 wins");
    expect(root.textContent).toContain("0 wins");

    vi.mocked(exportSaveFile).mockResolvedValueOnce({ status: "The backup was not saved.", completed: false });
    click(root, "Replace (backup first)");
    await flush();
    expect(exportSaveFile).toHaveBeenCalledTimes(1);
    expect(loadPubState().totalWins).toBe(9);
    expect(onReload).not.toHaveBeenCalled();
    expect(root.textContent).toContain("Nothing was replaced");

    click(root, "Replace (backup first)");
    await flush();
    expect(loadPubState().totalWins).toBe(0);
    expect(onReload).toHaveBeenCalled();
  });

  it("Keep both adds a second ledger without any backup", () => {
    const id = initLedgers().activeId;
    const root = mount(JSON.stringify(exportLedger(id)));
    click(root, "Keep both");
    expect(listLedgers().ledgers).toHaveLength(2);
    expect(exportSaveFile).not.toHaveBeenCalled();
  });
});
