import Bull from "bull";
import { XMLParser } from "fast-xml-parser";
import { ImportQueueName } from "../../../queues/ImportQueue";

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "10mb",
    },
  },
};

const XMLParserOptions = {
  ignoreAttributes: false,
  attributeNamePrefix: "",
  ignoreDeclaration: true,
};

//Bull queue
const ImportQueue = new Bull(ImportQueueName);

interface IImportResult {
  isError: boolean;
  errorMessage?: string;
  jobId?: string;
}

export default async function handler(req, res) {
  try {
    if (req.headers["content-type"] !== "application/xml") {
      res.status(500).json({ error: "Content-type must be 'application/xml'" });
      return;
    }
    //TODO: check if XML is even valid
    const result = await parseXml(req.body);
    return res.status(200).json(result);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "failed to load data", content: err });
  }
}

// Function validates that object contains required properties
function validateSbomXml(parsedXml): IImportResult {
  const bom = parsedXml.bom;
  if (!bom)
    return {
      isError: true,
      errorMessage: "Validation failed - Missing 'bom' parameter in the file.",
    };
  if (!bom.metadata)
    return {
      isError: true,
      errorMessage:
        "Validation failed - Missing 'metadata' parameter in the file.",
    };
  if (!bom.components)
    return {
      isError: true,
      errorMessage:
        "Validation failed - Missing 'components' parameter in the file.",
    };

  return { isError: false };
}

// Function takes XML in plain text and transforms it into object
async function parseXml(inputXml: string) {
  const parser = new XMLParser(XMLParserOptions);
  const xmlParsed = parser.parse(inputXml);

  const validateResult = validateSbomXml(xmlParsed);
  if (validateResult.isError) return validateResult;

  const job = await ImportQueue.add({ bom: xmlParsed.bom });
  return { job: job };
}
