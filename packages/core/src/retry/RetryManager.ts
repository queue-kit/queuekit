import { Job } from '../types';

export class RetryManager {
  constructor(
    private maxAttempts = 5,
    private baseDelay = 1000,
    private maxDelay = 30000
  ) {}

  shouldRetry(job: Job): boolean {
    return job.attempts < this.maxAttempts;
  }

  getRetryDelay(attempts: number): number {
    const delay = this.baseDelay * Math.pow(2, attempts);
    return Math.min(delay, this.maxDelay);
  }

  async handleRetry(job: Job): Promise<void> {
    if (!this.shouldRetry(job)) {
      console.log(`Job ${job.id} exceeded max attempts, moving to DLQ`);
      return;
    }

    const delay = this.getRetryDelay(job.attempts);
    console.log(`Retrying job ${job.id} in ${delay}ms`);
    await new Promise((resolve) => setTimeout(resolve, delay));
  }
}
