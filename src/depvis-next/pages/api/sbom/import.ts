import { XMLParser } from 'fast-xml-parser';
import {
  CreateComponents,
  CreateProject,
  CreateProjecty,
  DeleteAllData,
  ProjectExists,
  UpdateComponentDependencies,
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
    const result = await parseFile(req.body);
    return res.status(200).json(result);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'failed to load data', content: err });
  }
}

async function parseFile(body) {
  const parser = new XMLParser(XMLParserOptions);
  const xmlParsed = parser.parse(body);
  if (!xmlParsed.bom.metadata) {
    throw Error('Invalid file - project metadata are missing');
  }
  //console.log(xmlParsed.bom.dependencies);
  // Prepare project
  const project = {
    name: xmlParsed.bom.metadata.component.name,
    version: xmlParsed.bom.metadata.component.version || 1,
    date: xmlParsed.bom.metadata.timestamp || '1970-01-01',
  };

  // Prepare components
  let components = xmlParsed.bom.components.component;
  components.push(xmlParsed.bom.metadata.component);
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

  let dependencies = getDependencies(xmlParsed.bom.dependencies.dependency);
  // Currently there is no support for managing older projects - import overwrites all data that are in DB
  await DeleteAllData();
  await CreateProject(project);
  await CreateComponents(components);
  //dependencies = dependencies.slice(0, 50);
  await UpdateComponentDependencies(dependencies);
  console.log('Done');
  return xmlParsed;
}

function getDependencies(dependencies: any) {
  if (!dependencies) return;
  const res = dependencies
    .map((d) => {
      if (d.dependency != undefined) {
        if (!(d.dependency instanceof Array)) d.dependency = [d.dependency];
        return {
          purl: d.ref,
          dependsOn: d.dependency.map((d) => {
            return { purl: d.ref };
          }),
        };
      }
    })
    .filter((d) => {
      return d != undefined;
    });
  return res;
}
