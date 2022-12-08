import Bull from "bull";
import { VulnFetcherHandler } from "../vulnerability-mgmt/VulnFetcherHandler";
export const GetVulnQueueName = "get-vuln-queue";

export const GetVulnQueueOptions = {
  redis: {
    port: process.env.REDIS_PORT,
    host: process.env.REDIS_HOST,
    password: process.env.REDIS_PASSWORD,
  },
  limiter: { max: 3, duration: 1000 },
};

const GetVulnQueue = new Bull(GetVulnQueueName, GetVulnQueueOptions);

GetVulnQueue.process(async (job) => {
  console.log(`Processing Vuln ${job.data.purl}`);
  const vulnerabilityList = await VulnFetcherHandler(job.data.purl);
  //   if (vulnerabilitiesList.length == 0) return;
  //return await CreateUpdateVulnerability(job.data.purl, vulnerabilitiesList);
});
