import { Queueway } from "../src/Queueway";

describe("Queueway", () => {
  it("should initialize", () => {
    const q = new Queueway({ broker: "in-memory" });
    expect(q).toBeDefined();
  });

  it("should publish a job and return a job id", async () => {
    const q = new Queueway({ broker: "in-memory" });
    const jobId = await q.publish("test.event", { data: "test" });
    expect(jobId).toBeDefined();
    expect(typeof jobId).toBe("string");
  });

  it("should deliver published job to subscriber", async () => {
    const q = new Queueway({ broker: "in-memory" });
    await q.start();

    const received: any[] = [];
    q.subscribe("order.created", async (job) => {
      received.push(job.data);
    });

    await q.publish("order.created", { orderId: 42 });
    expect(received).toEqual([{ orderId: 42 }]);
  });

  it("should track job stats after processing", async () => {
    const q = new Queueway({ broker: "in-memory", store: "in-memory" });
    await q.start();

    q.subscribe("stats.test", async () => {
      /* succeeds */
    });

    await q.publish("stats.test", {});

    // publish triggers subscribe handlers synchronously via InMemoryBroker
    const stats = await q.getStats();
    expect(stats.total).toBe(1);
    expect(stats.jobs.completed).toBe(1);
  });

  it("should actually redeliver a failed job and eventually mark it completed", async () => {
    const q = new Queueway({
      broker: "in-memory",
      store: "in-memory",
      retry: {
        maxAttempts: 3,
        strategy: "exponential",
        baseDelay: 5,
        maxDelay: 20,
      },
    });
    await q.start();

    let attemptCount = 0;
    q.subscribe("flaky.job", async () => {
      attemptCount += 1;
      if (attemptCount < 3) {
        throw new Error("simulated failure");
      }
    });

    const jobId = await q.publish("flaky.job", {});
    await new Promise((resolve) => setTimeout(resolve, 200));

    expect(attemptCount).toBe(3);
    const job = await q.getJob(jobId);
    expect(job?.status).toBe("completed");
    expect(job?.attempts).toBe(2);
  });

  it("should move a job to the DLQ after exhausting retries", async () => {
    const q = new Queueway({
      broker: "in-memory",
      store: "in-memory",
      retry: {
        maxAttempts: 1,
        strategy: "exponential",
        baseDelay: 5,
        maxDelay: 10,
      },
    });
    await q.start();

    q.subscribe("always.fails", async () => {
      throw new Error("always fails");
    });

    const jobId = await q.publish("always.fails", {});
    await new Promise((resolve) => setTimeout(resolve, 100));

    const job = await q.getJob(jobId);
    expect(job?.status).toBe("failed");

    const dlq = await q.getDLQ();
    expect(dlq.some((j) => j.id === jobId)).toBe(true);
  });
});
