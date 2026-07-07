export class HealthCheck {
  async getStatus() {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      components: {
        broker: { status: 'up' },
        database: { status: 'up' },
        api: { status: 'up' },
      },
    };
  }
}
