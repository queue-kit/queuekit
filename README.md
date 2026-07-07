# 🚀 QueueKit

Zero-config job queue for Node.js

## Features

- ✅ Zero configuration
- ✅ Multiple brokers (RabbitMQ, Kafka, Redis, SQS)
- ✅ Multiple stores (PostgreSQL, MongoDB, SQLite)
- ✅ Automatic retry with exponential backoff
- ✅ Dead letter queue (DLQ)
- ✅ TypeScript support

## Quick Start

```bash
npm install queuekit
npm start
```

## Monorepo Structure

```
packages/
  core/       -> queuekit core library (publish/subscribe, brokers, stores, retry, DLQ)
  cli/        -> queuekit CLI (init, health, config, setup:*)
  dashboard/  -> basic web dashboard (CORE)
  plugins/    -> PRO plugins (private)
```

## Documentation

https://docs.queuekit.dev

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md)

## License

MIT — see [LICENSE](./LICENSE)
