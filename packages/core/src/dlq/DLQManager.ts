import { logger } from "../logging/Logger";
import { IStore } from "../store/IStore";
import { Job } from "../types";

export class DLQManager {
  constructor(private store: IStore) {}

  async moveToDLQ(job: Job): Promise<void> {
    await this.store.updateJob(job.id, "failed", job.attempts);
    logger.info(`Job ${job.id} moved to DLQ`);
  }

  async getFailedJobs(limit = 50): Promise<Job[]> {
    return this.store.getAllJobs("failed", limit);
  }

  async retryFromDLQ(jobId: string): Promise<void> {
    await this.store.updateJob(jobId, "pending", 0);
    logger.info(`Job ${jobId} re-queued from DLQ`);
  }
}
