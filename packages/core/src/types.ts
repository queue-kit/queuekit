export type BrokerType = "in-memory" | "rabbitmq" | "redis";
export type StoreType = "in-memory" | "sqlite" | "postgres";

export interface QueuewayConfig {
  broker: BrokerType;
  store: StoreType;
  retry?: {
    maxAttempts: number;
    strategy: string;
    baseDelay?: number;
    maxDelay?: number;
  };
}

export type JobStatus =
  | "pending"
  | "processing"
  | "completed"
  | "failed"
  | "retrying"
  | "archived";

export interface Job {
  id: string;
  eventName: string;
  data: any;
  status: JobStatus;
  attempts: number;
  createdAt: Date;
}
