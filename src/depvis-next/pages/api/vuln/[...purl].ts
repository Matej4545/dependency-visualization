import Bull from "bull";
import { GetVulnQueueName } from "../../../queues/GetVulnQueue";

const VulnQueue = new Bull(GetVulnQueueName);

export default async function handler(req, res) {
  const { purl } = req.query;
  const purl_j = purl.join("/");
  try {
    const job = await VulnQueue.add({ purl: purl_j });
    return res.status(200).json({ jobId: job.id });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: error.message });
  }
}
