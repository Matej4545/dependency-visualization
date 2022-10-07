import { XMLParser } from 'fast-xml-parser';
import { CreateComponents, ProjectExists } from '../../../helpers/DbDataHelper';

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
    const result = await parseFile(req.body);
    res.status(200).json({ result });
  } catch (err) {
    res.status(500).json({ error: 'failed to load data', content: err });
  }
}

async function parseFile(body) {
  const parser = new XMLParser(XMLParserOptions);
  const xmlParsed = parser.parse(body);
  //console.log(xmlParsed.bom);

  //tmp
  let components = xmlParsed.bom.components.component;
  // we need to clean the components data
  components = components.map((c) => {
    return {
      purl: c.purl,
      name: c.name,
      version: c.version,
      author: c.author,
      type: c.type,
    };
  });
  console.log(components);
  await CreateComponents(components);
  return xmlParsed;
}
