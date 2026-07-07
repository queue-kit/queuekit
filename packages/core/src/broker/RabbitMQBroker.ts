import amqp from 'amqplib';
import { IBroker } from './IBroker';
import { Job } from '../types';

export class RabbitMQBroker implements IBroker {
  private connection: amqp.Connection | null = null;
  private channel: amqp.Channel | null = null;
  private readonly exchange = 'queuekit';

  async connect(): Promise<void> {
    const url = process.env.RABBITMQ_URL || 'amqp://localhost';
    this.connection = await amqp.connect(url);
    this.channel = await this.connection.createChannel();
    await this.channel.assertExchange(this.exchange, 'topic', { durable: true });
    console.log('✅ RabbitMQ connected');
  }

  async publish(eventName: string, job: Job): Promise<void> {
    if (!this.channel) throw new Error('Channel not initialized. Call connect() first.');

    this.channel.publish(
      this.exchange,
      eventName,
      Buffer.from(JSON.stringify(job)),
      { persistent: true }
    );
  }

  subscribe(eventName: string, handler: (job: Job) => Promise<void>): void {
    if (!this.channel) throw new Error('Channel not initialized. Call connect() first.');

    const queueName = `queuekit.${eventName}`;
    this.channel.assertQueue(queueName, { durable: true }).then(() => {
      this.channel!.bindQueue(queueName, this.exchange, eventName);
      this.channel!.consume(queueName, async (msg) => {
        if (!msg) return;
        const job: Job = JSON.parse(msg.content.toString());
        try {
          await handler(job);
          this.channel!.ack(msg);
        } catch (err) {
          this.channel!.nack(msg, false, false);
        }
      });
    });
  }

  async disconnect(): Promise<void> {
    if (this.connection) await this.connection.close();
  }
}
