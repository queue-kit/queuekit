/**
 * Runs inside a forked child process (see commands/start.ts). Kept separate
 * from the parent CLI process so that if THIS crashes, the parent can
 * detect the exit and automatically restart it (auto-heal).
 */

import { logger } from "../logging/Logger";

function errMeta(err: any) {
  return { error: err?.message ?? String(err), stack: err?.stack };
}

async function main() {
  const { Queueway, startServer } = require("../index");

  const configPath = process.env.QUEUEWAY_CONFIG_PATH;
  const port = Number(process.env.QUEUEWAY_PORT || 4287);

  const config = configPath
    ? require(configPath)
    : { broker: "in-memory", store: "in-memory" };

  const queue = new Queueway(config);

  // Note: queue.start() auto-loads queueway.jobs.js itself (from cwd) —
  // don't also require() it here, or every handler ends up registered
  // twice and every job gets processed twice.
  await queue.start();
  await startServer(queue, port);

  logger.info(
    `✅ Queueway running — dashboard/API at http://localhost:${port}`,
  );
}

main().catch((err) => {
  logger.error("❌ Queueway server crashed during startup", errMeta(err));
  process.exit(1); // non-zero exit tells the parent process to auto-restart
});

process.on("uncaughtException", (err: any) => {
  logger.error("❌ Uncaught exception", errMeta(err));
  process.exit(1);
});
process.on("unhandledRejection", (err: any) => {
  logger.error("❌ Unhandled rejection", errMeta(err));
  process.exit(1);
});
