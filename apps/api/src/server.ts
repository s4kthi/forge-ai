import { app } from "./app.ts";
import { env } from "./config/env.ts";
import { disconnectDatabase } from "./services/database.ts";

const host = "127.0.0.1";
const server = app.listen(env.port, host, () => {
  console.info("FORGE AI API listening on http://%s:%d", host, env.port);
});

let shuttingDown = false;

function shutdown(signal: NodeJS.Signals): void {
  if (shuttingDown) return;
  shuttingDown = true;
  console.info("Received %s. Shutting down.", signal);

  const deadline = setTimeout(() => {
    console.error("API shutdown timed out.");
    process.exit(1);
  }, 5000);
  deadline.unref();

  server.close(async (error) => {
    try {
      await disconnectDatabase();
      if (error) throw error;
    } catch {
      console.error("API shutdown failed.");
      process.exitCode = 1;
    } finally {
      clearTimeout(deadline);
    }
  });
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
