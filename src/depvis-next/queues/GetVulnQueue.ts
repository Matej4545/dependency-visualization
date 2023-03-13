import { Job, Worker } from "bullmq";
import { CreateUpdateVulnerability } from "../helpers/DbDataProvider";
import { defaultBullConfig } from "../helpers/QueueHelper";
import { VulnFetcherHandler } from "../vulnerability-mgmt/VulnFetcherHandler";
export const GetVulnQueueName = "get-vuln-queue";

const worker = new Worker(
  GetVulnQueueName,
  async (job) => {
    console.log(`Processing Vuln ${job.data.purl}`);
    const vulnerabilityList = await VulnFetcherHandler(job.data.purl);
    if (vulnerabilityList.length == 0) return;
    return await CreateUpdateVulnerability(job.data.purl, vulnerabilityList);
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
