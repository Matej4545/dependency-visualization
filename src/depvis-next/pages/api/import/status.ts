import { Queue } from 'bullmq';
import { defaultBullConfig } from '../../../helpers/QueueHelper';
import { ImportQueueName } from '../../../queues/ImportQueue';

//Bull queue
const ImportQueue = new Queue(ImportQueueName, defaultBullConfig);

export type ImportStatusReponse = {
  status: string;
  progress?: any;
  message: string;
  continueQuery: boolean;
  projectName?: string;
};
export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405);
  if (!('id' in req.query && !isNaN(req.query.id))) {
    const response: ImportStatusReponse = {
      status: 'Server Error',
      message: 'The jobId was not provided or the value was null!',
      continueQuery: false,
    };
    return res.status(400).json(response);
  }
  try {
    const result = await await ImportQueue.getJob(req.query.id);
    const status = await result.getState();
    const projectName = result.data.projectName;
    const response: ImportStatusReponse = {
      status: status,
      progress: result.progress,
      message: '',
      continueQuery: result.finishedOn === undefined,
      projectName: projectName,
    };
    return res.status(200).json(response);
  } catch (err) {
    console.error(err);
    const response: ImportStatusReponse = {
      status: 'Server Error',
      message: 'There was an error while processing the request. See server log for more information.',
      continueQuery: false,
    };
    return res.status(500).json(response);
  }
}
