import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../../src/ui/saveExport.ts", () => ({
  saveFileName: () => "backup.json",
  exportSaveFile: vi.fn(async () => ({ status: "Downloaded backup.json.", completed: true })),
}));

import { exportSaveFile } from "../../../src/ui/saveExport.ts";
import { mountLedgerShelfScreen } from "../../../src/ui/ledgerShelfScreen.ts";
import { createLedger, initLedgers, loadRegistry } from "../../../src/save/ledgers.ts";

const flush = () => new Promise((r) => setTimeout(r, 0));

function click(root: HTMLElement, label: string, within?: Element): void {
  const b = [...(within ?? root).querySelectorAll("button")].find((x) => x.textContent === label);
  if (!b) throw new Error(`no button ${label}`);
  b.click();
}

beforeEach(() => {
  localStorage.clear();
  vi.mocked(exportSaveFile).mockClear();
  initLedgers();
});

describe("the Ledger Shelf screen", () => {
  it("shows a book per ledger with the active one marked", () => {
    createLedger("Mum");
    const root = document.createElement("div");
    mountLedgerShelfScreen(root, { onBack: () => {}, onReload: () => {} });
    expect(root.querySelectorAll(".ledger-book")).toHaveLength(2);
    expect(root.querySelectorAll(".ledger-book--active")).toHaveLength(1);
    expect(root.querySelector(".ledger-book--active")!.textContent).toContain("Sara");
    expect(root.querySelector(".ledger-book--active")!.textContent).toContain("In use");
  });

  it("switching changes the active ledger and asks for a reload", () => {
    const mum = createLedger("Mum").id!;
    const onReload = vi.fn();
    const root = document.createElement("div");
    mountLedgerShelfScreen(root, { onBack: () => {}, onReload });
    click(root, "Switch", root.querySelector(`[data-ledger-id="${mum}"]`)!);
    expect(loadRegistry()!.activeId).toBe(mum);
    expect(onReload).toHaveBeenCalled();
  });

  it("deleting needs the name typed, then exports a backup before removing", async () => {
    const mum = createLedger("Mum").id!;
    const root = document.createElement("div");
    mountLedgerShelfScreen(root, { onBack: () => {}, onReload: () => {} });
    const book = () => root.querySelector(`[data-ledger-id="${mum}"]`)!;
    click(root, "Delete", book());
    const confirm = book().querySelector<HTMLButtonElement>(".ledger-delete-confirm")!;
    expect(confirm.disabled).toBe(true);
    const input = book().querySelector<HTMLInputElement>("input")!;
    input.value = "Mu";
    input.dispatchEvent(new Event("input"));
    expect(confirm.disabled).toBe(true);
    input.value = "mum";
    input.dispatchEvent(new Event("input"));
    expect(confirm.disabled).toBe(false);
    confirm.click();
    await flush();
    expect(exportSaveFile).toHaveBeenCalledTimes(1);
    expect(loadRegistry()!.ledgers.map((l) => l.id)).not.toContain(mum);
  });

  it("a cancelled or failed backup deletes nothing and says so", async () => {
    const mum = createLedger("Mum").id!;
    vi.mocked(exportSaveFile).mockResolvedValueOnce({ status: "The backup was not saved.", completed: false });
    const root = document.createElement("div");
    mountLedgerShelfScreen(root, { onBack: () => {}, onReload: () => {} });
    const book = () => root.querySelector(`[data-ledger-id="${mum}"]`)!;
    click(root, "Delete", book());
    const input = book().querySelector<HTMLInputElement>("input")!;
    input.value = "Mum";
    input.dispatchEvent(new Event("input"));
    book().querySelector<HTMLButtonElement>(".ledger-delete-confirm")!.click();
    await flush();
    expect(loadRegistry()!.ledgers.map((l) => l.id)).toContain(mum);
    expect(root.textContent).toContain("The backup was not saved. Mum is still on the shelf.");
  });

  it("the New ledger button is disabled when the shelf is full", () => {
    for (const n of ["A", "B", "C"]) createLedger(n);
    const root = document.createElement("div");
    mountLedgerShelfScreen(root, { onBack: () => {}, onReload: () => {} });
    const add = [...root.querySelectorAll("button")].find((b) => b.textContent === "New ledger")!;
    expect(add.disabled).toBe(true);
    expect(root.textContent).toContain("The shelf is full");
  });

  it("renaming updates the book", () => {
    const root = document.createElement("div");
    mountLedgerShelfScreen(root, { onBack: () => {}, onReload: () => {} });
    click(root, "Rename");
    const input = root.querySelector<HTMLInputElement>(".ledger-name-input")!;
    input.value = "Sarah";
    click(root, "Save name");
    expect(root.querySelector(".ledger-book-name")!.textContent).toBe("Sarah");
  });
});
