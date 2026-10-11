// Entry point. Restores the native save mirror before main.ts (and the
// modules it imports) read localStorage; a browser skips straight through.
import { initNative } from "./native/native.ts";

await initNative();
await import("./main.ts");
