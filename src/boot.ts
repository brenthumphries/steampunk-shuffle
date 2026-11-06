// Entry point. Restores the native save mirror before main.ts (and the
// modules it imports) read localStorage; a browser skips straight through.
// Then the ledger registry (src/save/ledgers.ts) is settled the same way.
import { initNative } from "./native/native.ts";

await initNative();
// Picks (or creates, or migrates into) the active ledger before any module reads a per-game key.
const { initLedgers } = await import("./save/ledgers.ts");
initLedgers();
await import("./main.ts");
