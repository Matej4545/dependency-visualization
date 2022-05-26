import express from 'express';
const fs = require('fs');
import path from 'path';
import { Neo4jClient } from './neo4j-helper';
const n4j = new Neo4jClient();
const { XMLParser } = require('fast-xml-parser');

const options = {
  ignoreAttributes: false,
  attributeNamePrefix: 'A_',
};
const parser = new XMLParser(options);
const app = express();
const port = 3000;

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.get('/parse/:path', (req, res) => {
  console.log(req.params.path);
  const p = path.join('./data/', req.params.path);
  fs.readFile(p, { encoding: 'utf-8' }, function (err, data) {
    if (!err) {
      const obj = parser.parse(data);
      res.setHeader('Content-Type', 'application/json');
      res.send(createMap(obj));
    } else {
      console.log(err);
      res.sendStatus(500);
    }
  });
});

app.listen(port, () => {
  return console.log(`Express is listening at http://localhost:${port}`);
});

async function createMap(input: any) {
  let components = input.bom.components.component;
  let dependencies = input.bom.dependencies.dependency;
  const p = input.bom.metadata.component;

  const res = n4j.writeQuery(`MERGE (n:Dependency {
        name: '${p.name}',
        version: '${p.version}',
        purl: '${p['A_bom-ref']}'
    })`);
  components.forEach(async (component) => {
    const res = n4j.writeQuery(
      `MERGE (n:Dependency {
              name: '${component.name}',
              version: '${component.version}',
              purl: '${component.purl}'
          })`
    );
  });
  let deps = Array();
  dependencies.forEach(async (dependency: any) => {
    if ('dependency' in dependency) {
      const trans_dep: any = dependency.dependency;
      if (!(trans_dep instanceof Array)) {
        const res = n4j.writeQuery(
          `MATCH (d1:Dependency {purl: '${dependency.A_ref}'}) MATCH (d2:Dependency {purl: '${trans_dep.A_ref}'}) MERGE (d1)-[:depends_on]->(d2) RETURN d1, d2`
        );
        deps.push(`${dependency.A_ref} <- ${trans_dep.A_ref}`);
      } else {
        trans_dep.forEach(async (d) => {
          const res = n4j.writeQuery(
            `MATCH (d1:Dependency {purl: '${dependency.A_ref}'}) MATCH (d2:Dependency {purl: '${d.A_ref}'}) MERGE (d1)-[:depends_on]->(d2) RETURN d1, d2`
          );
          deps.push(`${dependency.A_ref} <- ${d.A_ref}`);
        });
      }
    }
  });
  console.log(deps);
  const result = { components: components, dependencies: dependencies };
  return JSON.stringify(result);
}
