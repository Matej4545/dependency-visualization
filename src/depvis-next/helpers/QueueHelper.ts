import { Queue, RedisOptions } from "bullmq";
import IORedis from "ioredis";

// Method to remove all tasks from a queue
export const emptyQueue = async (q: Queue) => {
  q.drain();
};

// Options for Redis configuration
const REDIS_OPTIONS: RedisOptions = {
  host: process.env.REDIS_HOST,
  port: +process.env.REDIS_PORT!,
  password: process.env.REDIS_PASSWORD,
  enableOfflineQueue: false,
  showFriendlyErrorStack: true,
  enableReadyCheck: true,
  maxRetriesPerRequest: null,
};

// Return config options for Bull Queue
export const defaultBullConfig = {
  connection: new IORedis(REDIS_OPTIONS),
};
