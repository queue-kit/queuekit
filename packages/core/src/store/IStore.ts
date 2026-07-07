import { Job } from '../types';

export interface IStore {
  initialize(): Promise<void>;
  saveJob(job: Job): Promise<void>;
  getJob(jobId: string): Promise<Job | null>;
  updateJob(jobId: string, status: string): Promise<void>;
  getAllJobs(status?: string, limit?: number): Promise<Job[]>;
}
