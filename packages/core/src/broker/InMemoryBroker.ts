import { IBroker } from './IBroker';
import { Job } from '../types';

export class InMemoryBroker implements IBroker {
  private jobs: Map<string, Job[]> = new Map();
  private handlers: Map<string, Array<(job: Job) => Promise<void>>> = new Map();

  async connect(): Promise<void> {
    console.log('✅ In-Memory broker ready');
  }

  async publish(eventName: string, job: Job): Promise<void> {
    if (!this.jobs.has(eventName)) {
      this.jobs.set(eventName, []);
    }
    this.jobs.get(eventName)!.push(job);

    const handlers = this.handlers.get(eventName) || [];
    for (const handler of handlers) {
      await handler(job);
    }
  }

  subscribe(eventName: string, handler: (job: Job) => Promise<void>): void {
    if (!this.handlers.has(eventName)) {
      this.handlers.set(eventName, []);
    }
    this.handlers.get(eventName)!.push(handler);
  }

  async disconnect(): Promise<void> {
    // no-op
  }
}
