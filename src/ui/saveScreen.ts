// "Save & data" screen (plan step 2.6, design.md §12.4): export the whole
// save as one JSON file — via the Web Share API's file-sharing where the
// browser supports it, falling back to a plain download otherwise — and
// import one back. There's no native Capacitor wrap yet (that's Phase 4,
// where the plan calls for Capacitor Preferences + a real Share sheet);
// this is the web equivalent for now. Same DOM-glue/full-rebuild pattern
// as the other screens.

import { applySaveFile, buildSaveFile } from "../save/saveFile.ts";
import { cellarCopyAvailable, restoreCellarCopy } from "../save/ledgers.ts";
import { exportSaveFile, saveFileName } from "./saveExport.ts";

export interface SaveScreenOptions {
  onBack: () => void;
  onOpenLedgers: () => void;
  /** After "Restore the cellar copy" has put the old save back: the app reloads into it. */
  onRestored: () => void;
}

function el<K extends keyof HTMLElementTagNameMap>(tag: K, className?: string, text?: string): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

/** Mounts the save/data screen into `root` and returns a teardown function. */
export function mountSaveScreen(root: HTMLElement, options: SaveScreenOptions): () => void {
  let status: string | null = null;
  let torn = false;
  let confirmingRestore = false;

  async function handleExport(): Promise<void> {
    const now = new Date();
    status = (await exportSaveFile(buildSaveFile(now), saveFileName(now))).status;
    render();
  }

  function handleImportFile(file: File): void {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed: unknown = JSON.parse(String(reader.result));
        const result = applySaveFile(parsed);
        status = result.ok ? "Save imported — reopen the app to see everything." : (result.error ?? "That save file couldn't be read.");
      } catch {
        status = "That file isn't valid JSON.";
      }
      render();
    };
    reader.onerror = () => {
      status = "Couldn't read that file.";
      render();
    };
    reader.readAsText(file);
  }

  function render(): void {
    if (torn) return;
    root.replaceChildren();

    const screen = el("div", "deck-builder save-screen");

    const header = el("div", "deck-builder-header");
    const backBtn = el("button", "action-button action-button--secondary", "Back to the taproom");
    backBtn.type = "button";
    backBtn.addEventListener("click", options.onBack);
    header.appendChild(backBtn);
    header.appendChild(el("h1", "deck-builder-title", "Save & data"));
    screen.appendChild(header);

    screen.appendChild(el("p", "save-screen-copy", "Export your whole save as one file to keep safe or move to another device, or import one back."));

    const actions = el("div", "save-screen-actions");

    const exportBtn = el("button", "action-button", "Export save");
    exportBtn.type = "button";
    exportBtn.addEventListener("click", () => void handleExport());
    actions.appendChild(exportBtn);

    const importLabel = el("label", "action-button action-button--secondary", "Import save");
    const importInput = document.createElement("input");
    importInput.type = "file";
    importInput.accept = "application/json";
    importInput.className = "save-screen-file-input";
    importInput.addEventListener("change", () => {
      const file = importInput.files?.[0];
      if (file) handleImportFile(file);
      importInput.value = "";
    });
    importLabel.appendChild(importInput);
    actions.appendChild(importLabel);

    screen.appendChild(actions);

    const shelfBtn = el("button", "action-button action-button--secondary", "The Ledger Shelf");
    shelfBtn.type = "button";
    shelfBtn.addEventListener("click", options.onOpenLedgers);
    screen.appendChild(shelfBtn);

    if (cellarCopyAvailable()) {
      const cellar = el("div", "save-screen-cellar");
      cellar.appendChild(el("p", "save-screen-copy", "There is a copy of your save from before the ledgers were put on a shelf, kept in the cellar for 30 days. Restoring it puts that copy back and replaces what you have played since."));
      const restoreBtn = el("button", "action-button action-button--secondary", "Restore the cellar copy");
      restoreBtn.type = "button";
      restoreBtn.addEventListener("click", () => {
        confirmingRestore = true;
        render();
      });
      if (!confirmingRestore) cellar.appendChild(restoreBtn);
      else {
        cellar.appendChild(el("p", "save-screen-status", "Anything played since the move is replaced. Restore it?"));
        const yes = el("button", "action-button", "Yes, restore it");
        yes.type = "button";
        yes.addEventListener("click", () => {
          const result = restoreCellarCopy();
          if (result.ok) options.onRestored();
          else {
            status = result.error;
            confirmingRestore = false;
            render();
          }
        });
        const no = el("button", "action-button action-button--secondary", "Leave it");
        no.type = "button";
        no.addEventListener("click", () => {
          confirmingRestore = false;
          render();
        });
        cellar.append(yes, no);
      }
      screen.appendChild(cellar);
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
