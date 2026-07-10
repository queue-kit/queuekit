import { logger } from "../../logging/Logger";

/**
 * Hits the running Queueway HTTP API (see packages/core/src/server/createServer.ts)
 * and prints a human-readable health + stats summary.
 */
export async function health(
  url = process.env.QUEUEWAY_API_URL || "http://localhost:4287",
) {
  try {
    const [healthResRaw, statsResRaw] = await Promise.all([
      fetch(`${url}/queueway/health`),
      fetch(`${url}/queueway/stats`),
    ]);

    if (healthResRaw.status === 401 || statsResRaw.status === 401) {
      logger.info(`✅ Queueway API reachable at ${url}`);
      logger.info(
        "   The server is up, but health/stats details now require dashboard login.",
      );
      logger.info(`   Log in at ${url} to see full details.`);
      return;
    }

    const healthRes: any = await healthResRaw.json();
    const statsRes: any = await statsResRaw.json();

    logger.info(`✅ Queueway API reachable at ${url}`);
    logger.info(`   Status:   ${healthRes.status}`);
    logger.info(
      `   Broker:   ${healthRes.components?.broker?.status ?? "unknown"}`,
    );
    logger.info(
      `   Database: ${healthRes.components?.database?.status ?? "unknown"}`,
    );
    logger.info("");
    logger.info("Job stats:");
    logger.info(`   Pending:    ${statsRes.jobs?.pending ?? 0}`);
    logger.info(`   Processing: ${statsRes.jobs?.processing ?? 0}`);
    logger.info(`   Completed:  ${statsRes.jobs?.completed ?? 0}`);
    logger.info(`   Failed:     ${statsRes.jobs?.failed ?? 0}`);
    logger.info(`   Total:      ${statsRes.total ?? 0}`);
  } catch (err: any) {
    logger.error(`❌ Could not reach Queueway API at ${url}`);
    logger.error("   Is your Queueway server running?");
    logger.error(`   Error: ${err.message}`);
    process.exitCode = 1;
  }
}
