import { logger } from "../../logging/Logger";
import { readPidFile, removePidFile, isProcessAlive } from "../lib/daemon";

export async function stop() {
  const pidInfo = readPidFile();

  if (!pidInfo) {
    logger.info("ℹ️  No background Queueway server found.");
    logger.info(
      "   If it's running in the foreground, just press Ctrl+C in its terminal.",
    );
    return;
  }

  if (!isProcessAlive(pidInfo.pid)) {
    logger.info(
      "ℹ️  pidfile found but that process is no longer running — cleaning up.",
    );
    removePidFile();
    return;
  }

  process.kill(pidInfo.pid, "SIGTERM");
  logger.info(`🛑 Stop signal sent to PID ${pidInfo.pid}...`);

  await new Promise((resolve) => setTimeout(resolve, 2000));

  if (isProcessAlive(pidInfo.pid)) {
    logger.info(
      "⚠️  Still running — it may need another moment, or try again.",
    );
  } else {
    removePidFile();
    logger.info("✅ Queueway server stopped.");
  }
}
