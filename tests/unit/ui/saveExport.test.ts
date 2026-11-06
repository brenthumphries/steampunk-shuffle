import { describe, expect, it, vi } from "vitest";
import { exportSaveFile, exportViaNativeShare, type NativeShareKit } from "../../../src/ui/saveExport.ts";
import type { SaveFile } from "../../../src/save/saveFile.ts";

const file = { format: 1 } as unknown as SaveFile;

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
    expect(kit.share).toHaveBeenCalledWith({ title: "Steampunk Shuffle save", files: ["file:///cache/a.json"] });
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
