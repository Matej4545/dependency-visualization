import Bull from "bull";
import { ImportQueueName } from "../../../queues/ImportQueue";

//Bull queue
const ImportQueue = new Bull(ImportQueueName);

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405);
  if (!("id" in req.query && !isNaN(req.query.id)))
    return res.status(400).json({
      error: "'id' parameter is missing or its value is not a number",
    });
  const result = await await ImportQueue.getJob(req.query.id);
  return res.status(200).json({ status: await result.getState() });
}
