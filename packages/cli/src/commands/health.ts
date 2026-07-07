/**
 * Hits the running QueueKit HTTP API (see packages/core/src/server/createServer.ts)
 * and prints a human-readable health + stats summary.
 */
export async function health(
  url = process.env.QUEUEKIT_API_URL || "http://localhost:3000",
) {
  try {
    const [healthRes, statsRes]: [any, any] = await Promise.all([
      fetch(`${url}/queuekit/health`).then((r) => r.json()),
      fetch(`${url}/queuekit/stats`).then((r) => r.json()),
    ]);

    console.log(`✅ QueueKit API reachable at ${url}`);
    console.log(`   Status:   ${healthRes.status}`);
    console.log(
      `   Broker:   ${healthRes.components?.broker?.status ?? "unknown"}`,
    );
    console.log(
      `   Database: ${healthRes.components?.database?.status ?? "unknown"}`,
    );
    console.log("");
    console.log("Job stats:");
    console.log(`   Pending:    ${statsRes.jobs?.pending ?? 0}`);
    console.log(`   Processing: ${statsRes.jobs?.processing ?? 0}`);
    console.log(`   Completed:  ${statsRes.jobs?.completed ?? 0}`);
    console.log(`   Failed:     ${statsRes.jobs?.failed ?? 0}`);
    console.log(`   Total:      ${statsRes.total ?? 0}`);
  } catch (err: any) {
    console.error(`❌ Could not reach QueueKit API at ${url}`);
    console.error("   Is your QueueKit server running?");
    console.error(`   Error: ${err.message}`);
    process.exitCode = 1;
  }
}
