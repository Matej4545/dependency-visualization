import { XMLParser } from 'fast-xml-parser';
import {
  CreateComponents,
  CreateProject,
  CreateProjecty,
  DeleteAllData,
  ProjectExists,
} from '../../../helpers/DbDataHelper';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

const XMLParserOptions = {
  ignoreAttributes: false,
  attributeNamePrefix: '',
  ignoreDeclaration: true,
};

export default async function handler(req, res) {
  try {
    if (req.headers['content-type'] !== 'application/xml') {
      res.status(500).json({ error: "Content type must be 'application/xml'" });
      return;
    }
    const result = parseFile(req.body);
    return res.status(200).json({ status: 'file is being parsed.' });
  } catch (err) {
    return res.status(500).json({ error: 'failed to load data', content: err });
  }
}

async function parseFile(body) {
  const parser = new XMLParser(XMLParserOptions);
  const xmlParsed = parser.parse(body);
  if (!xmlParsed.bom.metadata) {
    throw Error('Invalid file - project metadata are missing');
  }
  // Prepare project
  const project = {
    name: xmlParsed.bom.metadata.component.name,
    version: xmlParsed.bom.metadata.component.version || 1,
    date: xmlParsed.bom.metadata.timestamp || '1970-01-01',
  };

  // Prepare components
  let components = xmlParsed.bom.components.component;
  // we need to transform the components data
  components = components.map((c) => {
    return {
      purl: c.purl,
      name: c.name,
      version: c.version,
      author: c.author,
      type: c.type,
    };
  });
  // Currently there is no support for managing older projects - import overwrites all data that are in DB
  await DeleteAllData();
  await CreateProject(project);
  await CreateComponents(components);
  console.log('Done');
  return xmlParsed;
}
