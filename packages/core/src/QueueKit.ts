import { randomUUID } from 'crypto';
import { QueueKitConfig, Job } from './types';
import { IBroker } from './broker/IBroker';
import { InMemoryBroker } from './broker/InMemoryBroker';
import { RabbitMQBroker } from './broker/RabbitMQBroker';
import { RetryManager } from './retry/RetryManager';

export class QueueKit {
  private config: QueueKitConfig;
  private broker: IBroker;
  private retryManager: RetryManager;

  constructor(config?: Partial<QueueKitConfig>) {
    // Default production-safe config
    this.config = {
      broker: 'rabbitmq',
      store: 'postgres',
      retry: {
        maxAttempts: 5,
        strategy: 'exponential',
      },
      ...config,
    };

    this.broker = this.createBroker(this.config.broker);
    this.retryManager = new RetryManager(
      this.config.retry?.maxAttempts,
      this.config.retry?.baseDelay,
      this.config.retry?.maxDelay
    );
  }

  private createBroker(type: string): IBroker {
    switch (type) {
      case 'rabbitmq':
        return new RabbitMQBroker();
      case 'in-memory':
        return new InMemoryBroker();
      default:
        console.warn(`Broker "${type}" not yet wired up, falling back to in-memory`);
        return new InMemoryBroker();
    }
  }

  async publish(eventName: string, data: any): Promise<string> {
    const job: Job = {
      id: randomUUID(),
      eventName,
      data,
      status: 'pending',
      attempts: 0,
      createdAt: new Date(),
    };

    await this.broker.publish(eventName, job);
    return job.id;
  }

  subscribe(eventName: string, handler: (job: Job) => Promise<void>) {
    this.broker.subscribe(eventName, async (job) => {
      try {
        await handler(job);
      } catch (err) {
        await this.retryManager.handleRetry(job);
        throw err;
      }
    });
  }

  async start() {
    await this.broker.connect();
    console.log('QueueKit started');
  }

  async stop() {
    await this.broker.disconnect();
  }
}
