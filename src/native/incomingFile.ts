// A .wheatstone file arriving from outside the app (plan 14 §2.2): iOS "Open
// in" / the Files app, the web File Handling API (installed PWA), and later an
// Android intent. Every route ends in `deliverIncomingLedger(text)`, which holds
// the text until the app has a screen to show it on.

import { Capacitor } from "@capacitor/core";

type Handler = (text: string) => void;

let handler: Handler | null = null;
const pending: string[] = [];

export function deliverIncomingLedger(text: string): void {
  if (handler) handler(text);
  else pending.push(text);
}

/** main.ts registers the screen that shows an incoming ledger; anything that arrived earlier is delivered now. */
export function setIncomingLedgerHandler(next: Handler | null): void {
  handler = next;
  while (handler && pending.length > 0) handler(pending.shift()!);
}

/**
 * TODO(X-B2): the Android shell's intent filter for .wheatstone files calls this
 * (`window.wheatstoneReceiveLedger(text)`) with the file's text. X-B2 had not
 * merged when this was written, so nothing calls it from Android yet; the same
 * hook is what tests use to stand in for "opened from outside".
 */
declare global {
  interface Window {
    wheatstoneReceiveLedger?: (text: string) => void;
    launchQueue?: { setConsumer(consumer: (params: { files?: { getFile(): Promise<File> }[] }) => void): void };
  }
}

async function readNativeFile(url: string): Promise<string | null> {
  try {
    const { Filesystem, Encoding } = await import("@capacitor/filesystem");
    const result = await Filesystem.readFile({ path: url, encoding: Encoding.UTF8 });
    const data = result.data;
    return typeof data === "string" ? data : await (data as Blob).text();
  } catch {
    return null;
  }
}

/** Wires every way a file can be opened from outside. Safe to call in any build; a browser without the APIs skips them. */
export function initIncomingFiles(): void {
  window.wheatstoneReceiveLedger = deliverIncomingLedger;

  if (window.launchQueue) {
    window.launchQueue.setConsumer(async (params) => {
      for (const handle of params.files ?? []) deliverIncomingLedger(await (await handle.getFile()).text());
    });
  }

  if (Capacitor.isNativePlatform()) {
    void import("@capacitor/app").then(({ App }) => {
      void App.addListener("appUrlOpen", async (event) => {
        if (!/\.wheatstone$/i.test(event.url.split("?")[0] ?? "")) return;
        const text = await readNativeFile(event.url);
        if (text !== null) deliverIncomingLedger(text);
      });
    }).catch(() => {});
  }
}
