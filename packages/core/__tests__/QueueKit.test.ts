import { QueueKit } from '../src/QueueKit';

describe('QueueKit', () => {
  it('should initialize', () => {
    const q = new QueueKit({ broker: 'in-memory' });
    expect(q).toBeDefined();
  });

  it('should publish a job and return a job id', async () => {
    const q = new QueueKit({ broker: 'in-memory' });
    const jobId = await q.publish('test.event', { data: 'test' });
    expect(jobId).toBeDefined();
    expect(typeof jobId).toBe('string');
  });

  it('should deliver published job to subscriber', async () => {
    const q = new QueueKit({ broker: 'in-memory' });
    await q.start();

    const received: any[] = [];
    q.subscribe('order.created', async (job) => {
      received.push(job.data);
    });

    await q.publish('order.created', { orderId: 42 });
    expect(received).toEqual([{ orderId: 42 }]);
  });
});
