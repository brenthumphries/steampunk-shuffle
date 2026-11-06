// The "Export save" path (Save & data screen), shared with the Ledger Shelf's
// delete-backup so there is one way a save file leaves the app: the Web Share
// API's file sharing where the browser has it, a plain download otherwise.

import type { SaveFile } from "../save/saveFile.ts";

type ShareNavigator = Navigator & {
  canShare?: (data: { files?: File[] }) => boolean;
  share?: (data: { files?: File[]; title?: string }) => Promise<void>;
};

export function saveFileName(now: Date, label?: string): string {
  const tag = label ? `-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}` : "";
  return `steampunk-shuffle-save${tag}-${now.toISOString().slice(0, 10)}.json`;
}

/** Returns a status line for the screen, or null if the share sheet was used. */
export async function exportSaveFile(file: SaveFile, name: string): Promise<{ status: string }> {
  const blob = new Blob([JSON.stringify(file, null, 2)], { type: "application/json" });
  const shareFile = new File([blob], name, { type: "application/json" });
  const nav = navigator as ShareNavigator;
  if (nav.share && nav.canShare?.({ files: [shareFile] })) {
    try {
      await nav.share({ files: [shareFile], title: "Steampunk Shuffle save" });
      return { status: "Shared." };
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
  return { status: `Downloaded ${name}.` };
}
