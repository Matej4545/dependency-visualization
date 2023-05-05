import { Queue } from "bullmq";
import { XMLParser } from "fast-xml-parser";
import { GetProjectByName } from "../../../helpers/DbDataProvider";
import {
  compareVersions,
  getLatestProjectVersion,
  ImportSbom,
} from "../../../helpers/ImportSbomHelper";
import { defaultBullConfig, emptyQueue } from "../../../helpers/QueueHelper";
import { GetVulnQueueName } from "../../../queues/GetVulnQueue";
import {
  ImportQueueName,
  ImportSbomJobData,
} from "../../../queues/ImportQueue";
import { parseXml } from "../../../helpers/xmlParserHelper";

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "10mb",
    },
  },
};

//Bull queue
const ImportQueue = new Queue(ImportQueueName, defaultBullConfig);
const GetVulnQueue = new Queue(GetVulnQueueName, defaultBullConfig);

type ImportRequestBody = {
  projectName: string;
  projectVersion: string;
  sbom: string;
};

export default async function handler(req, res) {
  try {
    //Validate request
    if (req.headers["content-type"] !== "application/json") {
      res
        .status(500)
        .json({ error: "Content-type must be 'application/json'" });
      return;
    }
    const body: ImportRequestBody = req.body;
    if (!validateImportRequestBody(body)) {
      return res
        .status(400)
        .json({ isError: true, error: "Request body is malformed!" });
    }
    const projects = await GetProjectByName(body.projectName);
    if (projects.length != 0 && projects[0].versions) {
      const highestVersionProject = getLatestProjectVersion(
        projects[0].versions
      );
      if (
        highestVersionProject &&
        compareVersions(body.projectVersion, highestVersionProject.version) != 1
      ) {
        return res.status(400).json({
          isError: true,
          errorMessage: `Project must have higher version than ${highestVersionProject.version}`,
        });
      }
    }

    // Parse sbom
    const result = validateSbomXml(await parseXml(body.sbom));
    if (result.isError) {
      console.log("Import failed with %s", result.errorMessage);
      return res.status(400).json(result);
    }

    //Clear vuln queue
    emptyQueue(GetVulnQueue);
    // Create new job
    const job = await ImportQueue.add(body.projectName.toString(), {
      sbom: result.sbom,
      projectName: body.projectName,
      projectVersion: body.projectVersion,
    } as ImportSbomJobData);

    //Return response
    const response = { jobId: job.id, isError: false, bom: result.sbom };
    return res.status(200).json(response);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "failed to load data", content: err });
  }
}

function validateImportRequestBody(body: ImportRequestBody) {
  if (!body || !body.projectName || !body.projectVersion || !body.sbom)
    return false;
  return true;
}
// Function validates that object contains required properties
function validateSbomXml(parsedXml) {
  const sbom = parsedXml.bom;
  if (!sbom)
    return {
      isError: true,
      errorMessage: "Validation failed - Missing 'bom' parameter in the file.",
    };
  if (!sbom.metadata)
    return {
      isError: true,
      errorMessage:
        "Validation failed - Missing 'metadata' parameter in the file.",
    };
  return { isError: false, sbom: sbom };
}
