import Bull from "bull";
import { ImportSbom } from "../helpers/ImportSbomHelper";

export const ImportQueueName = "import-queue";

export const ImportQueueOptions = {
  redis: {
    port: process.env.REDIS_PORT,
    host: process.env.REDIS_HOST,
    password: process.env.REDIS_PASSWORD,
  },
  limiter: { max: 2, duration: 3600 },
};

console.log(ImportQueueOptions);
const ImportQueue = new Bull(ImportQueueName, ImportQueueOptions);

ImportQueue.process(async (job) => {
  try {
    const res = ImportSbom(job.data.bom);
    return res;
  } catch (e) {
    console.error(e);
  }
});
