import { Worker } from "bullmq";
import { ImportSbom } from "../helpers/ImportSbomHelper";
import { defaultBullConfig } from "../helpers/QueueHelper";

export const ImportQueueName = "import-queue";

export type ImportSbomJobData = {
  projectName: string;
  projectVersion: string;
  sbom: string;
};

const worker = new Worker(
  ImportQueueName,
  async (job) => {
    const updateProgress = async (input) => {
      await job.updateProgress(input);
    };
    const data = job.data;
    const res = await ImportSbom(
      data.sbom,
      { name: data.projectName },
      data.projectVersion,
      updateProgress
    );
    return res;
  },
  defaultBullConfig
);

worker.on("failed", (job, error) => {
  console.log("Job %d failed with error %s", job.id, error.message);
  console.error(error);
});

worker.on("completed", (job) => {
  console.log("Job %d completed successfully!", job.id);
});
