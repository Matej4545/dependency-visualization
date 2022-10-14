import { XMLParser } from 'fast-xml-parser';
import { CreateComponents, DeleteAllData, ProjectExists } from '../../../helpers/DbDataHelper';

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
    res.status(200).json({ status: 'file is being parsed.' });
  } catch (err) {
    res.status(500).json({ error: 'failed to load data', content: err });
  }
}

async function parseFile(body) {
  const parser = new XMLParser(XMLParserOptions);
  const xmlParsed = parser.parse(body);
  // Create project
  let project = {
    name: xmlParsed.bom.metadata.component.name,
    version: xmlParsed.bom.metadata.component.version,
    date: xmlParsed.metadata.timestamp,
  };
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
  await CreateComponents(components);

  return xmlParsed;
}
