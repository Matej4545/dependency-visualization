import { Queue, RedisOptions } from "bullmq";
import IORedis from "ioredis";

export const emptyQueue = async (q: Queue) => {
  q.drain();
};

const REDIS_OPTIONS: RedisOptions = {
  host: process.env.REDIS_HOST,
  port: +process.env.REDIS_PORT!,
  password: process.env.REDIS_PASSWORD,
  enableOfflineQueue: false,
  showFriendlyErrorStack: true,
  enableReadyCheck: true,
  maxRetriesPerRequest: null,
};
export const defaultBullConfig = {
  connection: new IORedis(REDIS_OPTIONS),
};
