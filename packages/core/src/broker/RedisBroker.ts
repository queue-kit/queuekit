import { IBroker } from './IBroker';
import { Job } from '../types';

/**
 * Redis-backed broker (using lists/pub-sub).
 * TODO: implement with ioredis in Month 1-2 (see START_GUIDE Phase 1).
 */
export class RedisBroker implements IBroker {
  async connect(): Promise<void> {
    console.log('✅ Redis connected');
  }

  async publish(_eventName: string, _job: Job): Promise<void> {
    // TODO
  }

  subscribe(_eventName: string, _handler: (job: Job) => Promise<void>): void {
    // TODO
  }

  async disconnect(): Promise<void> {
    // TODO
  }
}
