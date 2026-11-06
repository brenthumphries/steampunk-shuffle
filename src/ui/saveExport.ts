// The "Export save" path (Save & data screen), shared with the Ledger Shelf's
// delete-backup so there is one way a save file leaves the app: the Web Share
// API's file sharing where the browser has it, a plain download otherwise.

import { Capacitor } from "@capacitor/core";
import type { SaveFile } from "../save/saveFile.ts";

type ShareNavigator = Navigator & {
  canShare?: (data: { files?: File[] }) => boolean;
  share?: (data: { files?: File[]; title?: string }) => Promise<void>;
};

export function saveFileName(now: Date, label?: string): string {
  const tag = label ? `-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}` : "";
  return `steampunk-shuffle-save${tag}-${now.toISOString().slice(0, 10)}.json`;
}

export interface NativeShareKit {
  /** Writes `data` to a temporary file and returns its file:// uri. */
  writeFile(name: string, data: string): Promise<string>;
  removeFile(uri: string): Promise<void>;
  /** Resolves once the share sheet has completed; rejects if the player cancels or it fails. */
  share(options: { title: string; files: string[] }): Promise<unknown>;
}

async function capacitorShareKit(): Promise<NativeShareKit> {
  const [{ Filesystem, Directory, Encoding }, { Share }] = await Promise.all([import("@capacitor/filesystem"), import("@capacitor/share")]);
  return {
    writeFile: async (name, data) => (await Filesystem.writeFile({ path: name, data, directory: Directory.Cache, encoding: Encoding.UTF8 })).uri,
    removeFile: async (uri) => {
      await Filesystem.deleteFile({ path: uri });
    },
    share: (options) => Share.share(options),
  };
}

/**
 * The iOS app: write the save to a cache file and hand it to the share sheet.
 * `completed` is true only when the share promise resolves, so a caller about to
 * delete something can rely on it; a cancel or failure never falls back to a
 * download, which a WKWebView cannot do.
 */
export async function exportViaNativeShare(file: SaveFile, name: string, kit: NativeShareKit): Promise<{ status: string; completed: boolean }> {
  let uri: string | null = null;
  try {
    uri = await kit.writeFile(name, JSON.stringify(file, null, 2));
    await kit.share({ title: "Steampunk Shuffle save", files: [uri] });
    return { status: "Shared.", completed: true };
  } catch {
    return { status: "The backup was not saved.", completed: false };
  } finally {
    if (uri) await kit.removeFile(uri).catch(() => {});
  }
}

/**
 * Returns a status line for the screen and whether the file really left the app
 * (`completed`). `native` is a test seam; by default the Capacitor plugins are
 * used in the iOS build only, and the web build never loads them.
 */
export async function exportSaveFile(file: SaveFile, name: string, native?: NativeShareKit): Promise<{ status: string; completed: boolean }> {
  if (native ?? Capacitor.isNativePlatform()) {
    try {
      return await exportViaNativeShare(file, name, native ?? (await capacitorShareKit()));
    } catch {
      return { status: "The backup was not saved.", completed: false };
    }
  }
  const blob = new Blob([JSON.stringify(file, null, 2)], { type: "application/json" });
  const shareFile = new File([blob], name, { type: "application/json" });
  const nav = navigator as ShareNavigator;
  if (nav.share && nav.canShare?.({ files: [shareFile] })) {
    try {
      await nav.share({ files: [shareFile], title: "Steampunk Shuffle save" });
      return { status: "Shared.", completed: true };
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
  return { status: `Downloaded ${name}.`, completed: true };
}
