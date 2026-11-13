// "Receive a ledger" (design.md §12.5, plan 14 §2.2): shows what is in a
// .wheatstone file and what putting it on the shelf will do. Nothing is
// written until the player chooses. When the same ledger is already here the
// player sees both summaries and picks Replace (the old one is shared as a
// backup first, and the replace waits until that share has completed, the same
// rule as deleting a ledger) or Keep both; when the shelf is full the player
// picks one to replace the same way, or cancels.

import { receiveLedger, exportLedger, planReceive, type LedgerEntry, type ReceiveChoice, listLedgers } from "../save/ledgers.ts";
import { parseIncomingSave, type IncomingLedger, type LedgerFileSummary } from "../save/saveFile.ts";
import { exportSaveFile, saveFileName } from "./saveExport.ts";

export interface ReceiveLedgerOptions {
  /** The text of the file: from the picker on the Save & data screen, or opened from outside the app. */
  text: string;
  onBack: () => void;
  onOpenShelf: () => void;
  /** The active ledger was replaced or changed: reload into it. */
  onReload: () => void;
}

function el<K extends keyof HTMLElementTagNameMap>(tag: K, className?: string, text?: string): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function button(label: string, className: string, onClick: () => void): HTMLButtonElement {
  const b = el("button", className, label);
  b.type = "button";
  b.addEventListener("click", onClick);
  return b;
}

function dateText(iso: string | null): string {
  const date = iso ? new Date(iso) : null;
  if (!date || Number.isNaN(date.getTime())) return "an unknown date";
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function summaryBook(heading: string, name: string, summary: LedgerFileSummary, dateLabel: string, date: string | null, cls: string): HTMLElement {
  const book = el("article", `ledger-book ${cls}`);
  book.appendChild(el("p", "ledger-book-played", heading));
  book.appendChild(el("h2", "ledger-book-name", name));
  book.appendChild(el("p", "ledger-book-title", summary.title));
  book.appendChild(el("p", "ledger-book-stats", `${summary.wins} ${summary.wins === 1 ? "win" : "wins"} · ${summary.collectionCount} cards collected`));
  book.appendChild(el("p", "ledger-book-played", `${dateLabel} ${dateText(date)}`));
  return book;
}

export function mountReceiveLedgerScreen(root: HTMLElement, options: ReceiveLedgerOptions): () => void {
  let torn = false;
  let status: string | null = null;
  let done: string | null = null;
  let busy = false;
  const parsed = parseIncomingSave(options.text);

  /** Shares a backup of `entry` and resolves true only once the share completed. */
  async function backUp(entry: LedgerEntry): Promise<boolean> {
    const result = await exportSaveFile(exportLedger(entry.id), saveFileName(new Date(), entry.name));
    if (!result.completed) status = `${result.status} Nothing was replaced; ${entry.name} is still on the shelf.`;
    return result.completed;
  }

  function finish(incoming: IncomingLedger, choice: ReceiveChoice): void {
    const result = receiveLedger(incoming, choice);
    if (!result.ok) status = result.error;
    else if (result.activeReplaced) {
      options.onReload();
      return;
    } else done = `${result.name} is on the shelf.`;
    render();
  }

  async function replaceAfterBackup(incoming: IncomingLedger, entry: LedgerEntry, choice: ReceiveChoice): Promise<void> {
    if (busy) return;
    busy = true;
    status = null;
    try {
      if (!(await backUp(entry))) return render();
      finish(incoming, choice);
    } finally {
      busy = false;
    }
  }

  function render(): void {
    if (torn) return;
    root.replaceChildren();
    const screen = el("div", "deck-builder ledger-shelf receive-screen");
    const header = el("div", "deck-builder-header");
    header.appendChild(button("Back", "action-button action-button--secondary", options.onBack));
    header.appendChild(el("h1", "deck-builder-title", "Receive a ledger"));
    screen.appendChild(header);

    if (!parsed.ok) {
      screen.appendChild(el("p", "save-screen-status", parsed.error));
    } else if (done) {
      screen.appendChild(el("p", "save-screen-status", done));
      screen.appendChild(button("The Ledger Shelf", "action-button", options.onOpenShelf));
    } else {
      const incoming = parsed.incoming;
      const plan = planReceive(incoming);
      const fileBook = summaryBook("In the file", incoming.name, incoming.summary, "Sent", incoming.exportedAt, "ledger-book--incoming");

      if (plan.kind === "same-id") {
        const existing = listLedgers().ledgers.find((l) => l.id === plan.existing.id) ?? plan.existing;
        screen.appendChild(el("p", "save-screen-copy", `A ledger from this file is already on the shelf. Which copy do you want?`));
        screen.appendChild(summaryBook("On the shelf", existing.name, existing.summary, "Last played", existing.lastPlayedAt, "ledger-book--existing"));
        screen.appendChild(fileBook);
        const row = el("div", "ledger-book-actions");
        row.appendChild(button("Replace (backup first)", "action-button", () => void replaceAfterBackup(incoming, existing, { mode: "replace-same" })));
        row.appendChild(
          button("Keep both", "action-button action-button--secondary", () => {
            if (planReceive({ ...incoming, ledgerId: null }).kind === "full") {
              status = "The shelf is full. Pick a ledger to replace instead, or cancel.";
              chooseOther = true;
            } else finish(incoming, { mode: "keep-both" });
            render();
          }),
        );
        row.appendChild(button("Cancel", "action-button action-button--secondary", options.onBack));
        screen.appendChild(row);
        if (chooseOther) screen.appendChild(replaceList(incoming));
      } else if (plan.kind === "full") {
        screen.appendChild(el("p", "save-screen-copy", "The shelf is full. Pick a ledger to replace with this one (it is shared as a backup first), or cancel."));
        screen.appendChild(fileBook);
        screen.appendChild(replaceList(incoming));
        screen.appendChild(button("Cancel", "action-button action-button--secondary", options.onBack));
      } else {
        screen.appendChild(el("p", "save-screen-copy", "Add this ledger to the shelf?"));
        screen.appendChild(fileBook);
        const row = el("div", "ledger-book-actions");
        row.appendChild(button("Add to the shelf", "action-button", () => finish(incoming, { mode: "add" })));
        row.appendChild(button("Cancel", "action-button action-button--secondary", options.onBack));
        screen.appendChild(row);
      }
    }

    if (status) screen.appendChild(el("p", "save-screen-status", status));
    root.appendChild(screen);
  }

  let chooseOther = false;
  function replaceList(incoming: IncomingLedger): HTMLElement {
    const list = el("div", "ledger-books");
    for (const entry of listLedgers().ledgers) {
      list.appendChild(button(`Replace ${entry.name} (${entry.summary.title}, ${entry.summary.wins} wins)`, "action-button action-button--secondary", () => void replaceAfterBackup(incoming, entry, { mode: "replace-other", replaceId: entry.id })));
    }
    return list;
  }

  render();
  return () => {
    torn = true;
    root.replaceChildren();
  };
}
