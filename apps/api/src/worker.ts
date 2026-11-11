import { disconnectDatabase } from "./services/database.ts";
import { runPlanningWorker } from "./services/planning-worker.ts";

const stop = new AbortController();
function shutdown() {
  if (stop.signal.aborted) return;
  stop.abort();
  setTimeout(() => process.exit(1), 10_000).unref();
}
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

console.info("FORGE AI planning worker started (2 slots).");
try {
  await runPlanningWorker(stop.signal);
} finally {
  await disconnectDatabase();
}
