import { Queue } from 'bullmq';

export const emptyQueue = async (q: Queue) => {
  q.drain();
};

export const defaultBullConfig = {
  connection: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    password: process.env.REDIS_PASSWORD,
    enableOfflineQueue: false,
  },
};
