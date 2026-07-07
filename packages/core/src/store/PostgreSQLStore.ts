import { Pool } from 'pg';
import { IStore } from './IStore';
import { Job } from '../types';

export class PostgreSQLStore implements IStore {
  private pool: Pool;

  constructor() {
    const url = process.env.DATABASE_URL || 'postgres://localhost/queuekit';
    this.pool = new Pool({ connectionString: url });
  }

  async initialize(): Promise<void> {
    const query = `
      CREATE TABLE IF NOT EXISTS queuekit_jobs (
        id VARCHAR(255) PRIMARY KEY,
        event_name VARCHAR(255) NOT NULL,
        data JSONB NOT NULL,
        status VARCHAR(50) NOT NULL,
        attempts INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_status ON queuekit_jobs(status);
      CREATE INDEX IF NOT EXISTS idx_event ON queuekit_jobs(event_name);
    `;

    await this.pool.query(query);
    console.log('✅ PostgreSQL initialized');
  }

  async saveJob(job: Job): Promise<void> {
    const query = `
      INSERT INTO queuekit_jobs (id, event_name, data, status, attempts)
      VALUES ($1, $2, $3, $4, $5)
    `;

    await this.pool.query(query, [
      job.id,
      job.eventName,
      JSON.stringify(job.data),
      job.status,
      job.attempts,
    ]);
  }

  async getJob(jobId: string): Promise<Job | null> {
    const result = await this.pool.query(
      'SELECT * FROM queuekit_jobs WHERE id = $1',
      [jobId]
    );

    if (result.rows.length === 0) return null;

    const row = result.rows[0];
    return {
      id: row.id,
      eventName: row.event_name,
      data: row.data,
      status: row.status,
      attempts: row.attempts,
      createdAt: row.created_at,
    };
  }

  async updateJob(jobId: string, status: string): Promise<void> {
    await this.pool.query(
      'UPDATE queuekit_jobs SET status = $1, updated_at = NOW() WHERE id = $2',
      [status, jobId]
    );
  }

  async getAllJobs(status?: string, limit?: number): Promise<Job[]> {
    let query = 'SELECT * FROM queuekit_jobs';
    const params: any[] = [];

    if (status) {
      query += ' WHERE status = $1';
      params.push(status);
    }

    query += ' ORDER BY created_at DESC';

    if (limit) {
      query += ` LIMIT $${params.length + 1}`;
      params.push(limit);
    }

    const result = await this.pool.query(query, params);

    return result.rows.map((row) => ({
      id: row.id,
      eventName: row.event_name,
      data: row.data,
      status: row.status,
      attempts: row.attempts,
      createdAt: row.created_at,
    }));
  }
}
