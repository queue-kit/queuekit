import { IStore } from '../store/IStore';
import { Job } from '../types';

export class DLQManager {
  constructor(private store: IStore) {}

  async moveToDLQ(job: Job): Promise<void> {
    await this.store.updateJob(job.id, 'failed');
    console.log(`Job ${job.id} moved to DLQ`);
  }

  async getFailedJobs(limit = 50): Promise<Job[]> {
    return this.store.getAllJobs('failed', limit);
  }

  async retryFromDLQ(jobId: string): Promise<void> {
    await this.store.updateJob(jobId, 'pending');
    console.log(`Job ${jobId} re-queued from DLQ`);
  }
}
