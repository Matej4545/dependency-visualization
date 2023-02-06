import { Worker } from 'bullmq';
import { ImportSbom } from '../helpers/ImportSbomHelper';
import { defaultBullConfig } from '../helpers/QueueHelper';

export const ImportQueueName = 'import-queue';

const worker = new Worker(
  ImportQueueName,
  async (job) => {
    const res = ImportSbom(job.data.bom);
    return res;
  },
  defaultBullConfig
);

worker.on('failed', (job, error) => {
  console.log('Job %d failed with error %s', job.id, error.message);
  console.error(error);
});

worker.on('completed', (job) => {
  console.log('Job %d completed successfully!', job.id);
});
