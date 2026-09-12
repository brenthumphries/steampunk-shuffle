// "Save & data" screen (plan step 2.6, design.md §12.4): export the whole
// save as one JSON file — via the Web Share API's file-sharing where the
// browser supports it, falling back to a plain download otherwise — and
// import one back. There's no native Capacitor wrap yet (that's Phase 4,
// where the plan calls for Capacitor Preferences + a real Share sheet);
// this is the web equivalent for now. Same DOM-glue/full-rebuild pattern
// as the other screens.

import { applySaveFile, buildSaveFile } from "../save/saveFile.ts";

export interface SaveScreenOptions {
  onBack: () => void;
}

function el<K extends keyof HTMLElementTagNameMap>(tag: K, className?: string, text?: string): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function fileNameFor(now: Date): string {
  return `steampunk-shuffle-save-${now.toISOString().slice(0, 10)}.json`;
}

type ShareNavigator = Navigator & {
  canShare?: (data: { files?: File[] }) => boolean;
  share?: (data: { files?: File[]; title?: string }) => Promise<void>;
};

/** Mounts the save/data screen into `root` and returns a teardown function. */
export function mountSaveScreen(root: HTMLElement, options: SaveScreenOptions): () => void {
  let status: string | null = null;
  let torn = false;

  async function handleExport(): Promise<void> {
    const file = buildSaveFile();
    const name = fileNameFor(new Date());
    const blob = new Blob([JSON.stringify(file, null, 2)], { type: "application/json" });

    const shareFile = new File([blob], name, { type: "application/json" });
    const nav = navigator as ShareNavigator;
    if (nav.share && nav.canShare?.({ files: [shareFile] })) {
      try {
        await nav.share({ files: [shareFile], title: "Steampunk Shuffle save" });
        status = "Shared.";
        render();
        return;
      } catch {
        // Cancelled, or the share sheet failed mid-flight — fall through to a download.
      }
    }

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = name;
    link.click();
    URL.revokeObjectURL(url);
    status = `Downloaded ${name}.`;
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

    if (status) screen.appendChild(el("p", "save-screen-status", status));

    root.appendChild(screen);
  }

  render();

  return () => {
    torn = true;
    root.replaceChildren();
  };
}
