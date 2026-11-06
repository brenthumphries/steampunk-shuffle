// The Ledger Shelf (design.md §12.5): one leather-bound book per save on this
// device. New, Switch, Rename and Delete. Same DOM-glue/full-rebuild pattern
// as the other screens. Switching writes the registry and asks the caller to
// reload the app so every module reads the chosen ledger's keys; a match in
// progress needs no extra save, since it is written on every move
// (src/save/activeMatch.ts) and resumes when the player switches back.

import { MAX_LEDGERS, canCreateLedger, createLedger, deleteLedger, exportLedger, listLedgers, renameLedger, switchLedger, type LedgerEntry, LEDGER_NAME_MAX } from "../save/ledgers.ts";
import { exportSaveFile, saveFileName } from "./saveExport.ts";

export interface LedgerShelfOptions {
  onBack: () => void;
  /** The active ledger changed: reload the app into it. */
  onReload: () => void;
}

function el<K extends keyof HTMLElementTagNameMap>(tag: K, className?: string, text?: string): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function button(label: string, className: string, onClick: () => void, disabled = false): HTMLButtonElement {
  const b = el("button", className, label);
  b.type = "button";
  b.disabled = disabled;
  b.addEventListener("click", onClick);
  return b;
}

function lastPlayedText(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "never";
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

/** Mounts the shelf into `root` and returns a teardown function. */
export function mountLedgerShelfScreen(root: HTMLElement, options: LedgerShelfOptions): () => void {
  let torn = false;
  let status: string | null = null;
  let adding = false;
  let renamingId: string | null = null;
  let deletingId: string | null = null;

  function nameInput(label: string, value: string): HTMLInputElement {
    const input = el("input", "ledger-name-input");
    input.type = "text";
    input.value = value;
    input.maxLength = LEDGER_NAME_MAX;
    input.setAttribute("aria-label", label);
    return input;
  }

  function buildBook(entry: LedgerEntry, active: boolean): HTMLElement {
    const book = el("article", `ledger-book${active ? " ledger-book--active" : ""}`);
    book.dataset.ledgerId = entry.id;
    const head = el("div", "ledger-book-head");
    head.appendChild(el("h2", "ledger-book-name", entry.name));
    if (active) head.appendChild(el("span", "ledger-book-mark", "In use"));
    book.appendChild(head);
    book.appendChild(el("p", "ledger-book-title", entry.summary.title));
    book.appendChild(el("p", "ledger-book-stats", `${entry.summary.wins} ${entry.summary.wins === 1 ? "win" : "wins"} · ${entry.summary.collectionCount} cards collected`));
    book.appendChild(el("p", "ledger-book-played", `Last played ${lastPlayedText(entry.lastPlayedAt)}`));

    if (renamingId === entry.id) {
      const input = nameInput("New name", entry.name);
      const row = el("div", "ledger-book-actions");
      row.appendChild(input);
      row.appendChild(
        button("Save name", "action-button", () => {
          const result = renameLedger(entry.id, input.value);
          if (result.ok) {
            renamingId = null;
            status = null;
          } else status = result.error;
          render();
        }),
      );
      row.appendChild(button("Cancel", "action-button action-button--secondary", () => ((renamingId = null), render())));
      book.appendChild(row);
    } else if (deletingId === entry.id) {
      book.appendChild(el("p", "ledger-book-warning", `Deleting ${entry.name} cannot be undone. A backup file is saved first. Type the name to confirm.`));
      const input = nameInput("Type the ledger's name", "");
      const confirm = button("Back up and delete", "action-button ledger-delete-confirm", () => void doDelete(entry), true);
      input.addEventListener("input", () => {
        confirm.disabled = input.value.trim().toLowerCase() !== entry.name.toLowerCase();
      });
      const row = el("div", "ledger-book-actions");
      row.appendChild(input);
      row.appendChild(confirm);
      row.appendChild(button("Keep it", "action-button action-button--secondary", () => ((deletingId = null), render())));
      book.appendChild(row);
    } else {
      const row = el("div", "ledger-book-actions");
      if (!active) row.appendChild(button("Switch", "action-button", () => doSwitch(entry.id)));
      row.appendChild(button("Rename", "action-button action-button--secondary", () => ((renamingId = entry.id), (deletingId = null), (status = null), render())));
      row.appendChild(button("Delete", "action-button action-button--secondary", () => ((deletingId = entry.id), (renamingId = null), (status = null), render())));
      book.appendChild(row);
    }
    return book;
  }

  function doSwitch(id: string): void {
    const result = switchLedger(id);
    if (result.ok) options.onReload();
    else {
      status = result.error;
      render();
    }
  }

  async function doDelete(entry: LedgerEntry): Promise<void> {
    const file = exportLedger(entry.id);
    const exported = await exportSaveFile(file, saveFileName(new Date(), entry.name));
    const result = deleteLedger(entry.id, { backedUp: true });
    deletingId = null;
    if (!result.ok) status = result.error;
    else if (result.activeChanged) {
      options.onReload();
      return;
    } else status = `${exported.status} ${entry.name} is off the shelf.`;
    render();
  }

  function startNew(input: HTMLInputElement): void {
    const created = createLedger(input.value);
    if (!created.ok || !created.id) {
      status = created.ok ? "Could not start that ledger." : created.error;
      render();
      return;
    }
    const switched = switchLedger(created.id);
    if (switched.ok) options.onReload();
    else {
      status = switched.error;
      render();
    }
  }

  function render(): void {
    if (torn) return;
    root.replaceChildren();
    const { ledgers, activeId } = listLedgers();

    const screen = el("div", "deck-builder ledger-shelf");
    const header = el("div", "deck-builder-header");
    header.appendChild(button("Back", "action-button action-button--secondary", options.onBack));
    header.appendChild(el("h1", "deck-builder-title", "The Ledger Shelf"));
    screen.appendChild(header);
    screen.appendChild(el("p", "save-screen-copy", `Each ledger is a separate game with its own wins, cards and decks. The shelf holds ${MAX_LEDGERS}.`));

    const shelf = el("div", "ledger-books");
    for (const entry of [...ledgers].sort((a, b) => a.createdAt.localeCompare(b.createdAt))) shelf.appendChild(buildBook(entry, entry.id === activeId));
    screen.appendChild(shelf);

    if (adding) {
      const row = el("div", "ledger-book-actions");
      const input = nameInput("Name for the new ledger", "");
      row.appendChild(input);
      row.appendChild(button("Start ledger", "action-button", () => startNew(input)));
      row.appendChild(button("Cancel", "action-button action-button--secondary", () => ((adding = false), render())));
      screen.appendChild(row);
    } else {
      screen.appendChild(button("New ledger", "action-button", () => ((adding = true), (status = null), render()), !canCreateLedger()));
      if (!canCreateLedger()) screen.appendChild(el("p", "save-screen-copy", `The shelf is full (${MAX_LEDGERS}). Delete a ledger to start another.`));
    }

    if (status) screen.appendChild(el("p", "save-screen-status", status));
    root.appendChild(screen);
  }

  render();

  return () => {
    torn = true;
    root.replaceChildren();
  };
}
