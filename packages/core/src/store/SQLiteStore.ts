import { IStore } from './IStore';
import { Job } from '../types';

/**
 * SQLite-backed store — same schema/behavior as PostgreSQLStore,
 * useful for local dev / single-file deployments.
 * TODO: implement with sqlite3 in Month 1-2 (see START_GUIDE Phase 1).
 */
export class SQLiteStore implements IStore {
  async initialize(): Promise<void> {
    // TODO
  }

  async saveJob(_job: Job): Promise<void> {
    // TODO
  }

  async getJob(_jobId: string): Promise<Job | null> {
    // TODO
    return null;
  }

  async updateJob(_jobId: string, _status: string): Promise<void> {
    // TODO
  }

  async getAllJobs(_status?: string, _limit?: number): Promise<Job[]> {
    // TODO
    return [];
  }
}
