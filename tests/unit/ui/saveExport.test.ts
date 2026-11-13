import { describe, expect, it, vi } from "vitest";
import { exportSaveFile, exportViaNativeShare, type NativeShareKit } from "../../../src/ui/saveExport.ts";
import type { LedgerFile } from "../../../src/save/saveFile.ts";

const file = { format: 1 } as unknown as LedgerFile;

function fakeKit(share: NativeShareKit["share"]): NativeShareKit & { removed: string[] } {
  const removed: string[] = [];
  return {
    removed,
    writeFile: vi.fn(async (name: string) => `file:///cache/${name}`),
    removeFile: vi.fn(async (uri: string) => void removed.push(uri)),
    share,
  };
}

describe("the iOS share path", () => {
  it("reports completed only when the share sheet resolves, and tidies the cache file", async () => {
    const kit = fakeKit(vi.fn(async () => ({ activityType: "x" })));
    const result = await exportViaNativeShare(file, "a.json", kit);
    expect(result.completed).toBe(true);
    expect(kit.share).toHaveBeenCalledWith({ title: "Wheatstone ledger", files: ["file:///cache/a.json"] });
    expect(kit.removed).toEqual(["file:///cache/a.json"]);
  });

  it("a cancelled share is not completed", async () => {
    const kit = fakeKit(vi.fn(async () => Promise.reject(new Error("Share canceled"))));
    const result = await exportViaNativeShare(file, "a.json", kit);
    expect(result).toEqual({ status: "The backup was not saved.", completed: false });
    expect(kit.removed).toHaveLength(1);
  });

  it("a failed file write is not completed and never shares", async () => {
    const kit = fakeKit(vi.fn(async () => ({})));
    kit.writeFile = vi.fn(async () => Promise.reject(new Error("disk full")));
    expect((await exportViaNativeShare(file, "a.json", kit)).completed).toBe(false);
    expect(kit.share).not.toHaveBeenCalled();
  });

  it("exportSaveFile uses a supplied kit instead of the web download", async () => {
    const kit = fakeKit(vi.fn(async () => Promise.reject(new Error("nope"))));
    expect((await exportSaveFile(file, "a.json", kit)).completed).toBe(false);
  });
});

describe("the web share path", () => {
  const ledger = { version: 2 } as unknown as LedgerFile;

  it("shares a .wheatstone file through the Web Share API when the browser can", async () => {
    const share = vi.fn(async () => undefined);
    Object.assign(navigator, { share, canShare: () => true });
    const result = await exportSaveFile(ledger, "sara-2026-11-13.wheatstone");
    expect(result.completed).toBe(true);
    const shared = (share.mock.calls[0] as unknown as [{ files: File[] }])[0];
    expect(shared.files[0]!.name).toBe("sara-2026-11-13.wheatstone");
    delete (navigator as unknown as Record<string, unknown>).share;
    delete (navigator as unknown as Record<string, unknown>).canShare;
  });

  it("falls back to a download when there is no file sharing, or the share fails", async () => {
    URL.createObjectURL = vi.fn(() => "blob:x");
    URL.revokeObjectURL = vi.fn();
    const clicked: string[] = [];
    const click = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(function (this: HTMLAnchorElement) {
      clicked.push(this.download);
    });
    const first = await exportSaveFile(ledger, "a.wheatstone");
    expect(first).toEqual({ status: "Downloaded a.wheatstone.", completed: true });
    Object.assign(navigator, { share: vi.fn(async () => Promise.reject(new Error("no"))), canShare: () => true });
    await exportSaveFile(ledger, "b.wheatstone");
    expect(clicked).toEqual(["a.wheatstone", "b.wheatstone"]);
    click.mockRestore();
    delete (navigator as unknown as Record<string, unknown>).share;
    delete (navigator as unknown as Record<string, unknown>).canShare;
  });
});
