export {};

// import path from 'path';
// const { XMLParser } = require('fast-xml-parser');

// const options = {
//   ignoreAttributes: false,
//   attributeNamePrefix: 'A_',
// };
// const parser = new XMLParser(options);

// const ParseSBOM = async (file: File) => {
//   const obj = parser.parse(file);
//   console.log(createMap(obj));
// };

// async function createMap(input: any) {
//   let components = input.bom.components.component;
//   let dependencies = input.bom.dependencies.dependency;
//   const p = input.bom.metadata.component;

//   const res = n4j.writeQuery(`MERGE (n:Dependency {
//         name: '${p.name}',
//         version: '${p.version}',
//         purl: '${p['A_bom-ref']}'
//     })`);
//   components.forEach(async (component) => {
//     const res = n4j.writeQuery(
//       `MERGE (n:Dependency {
//               name: '${component.name}',
//               version: '${component.version}',
//               purl: '${component.purl}'
//           })`
//     );
//   });
//   let deps = Array();
//   dependencies.forEach(async (dependency: any) => {
//     if ('dependency' in dependency) {
//       const trans_dep: any = dependency.dependency;
//       if (!(trans_dep instanceof Array)) {
//         const res = n4j.writeQuery(
//           `MATCH (d1:Dependency {purl: '${dependency.A_ref}'}) MATCH (d2:Dependency {purl: '${trans_dep.A_ref}'}) MERGE (d1)-[:depends_on]->(d2) RETURN d1, d2`
//         );
//         deps.push(`${dependency.A_ref} <- ${trans_dep.A_ref}`);
//       } else {
//         trans_dep.forEach(async (d) => {
//           const res = n4j.writeQuery(
//             `MATCH (d1:Dependency {purl: '${dependency.A_ref}'}) MATCH (d2:Dependency {purl: '${d.A_ref}'}) MERGE (d1)-[:depends_on]->(d2) RETURN d1, d2`
//           );
//           deps.push(`${dependency.A_ref} <- ${d.A_ref}`);
//         });
//       }
//     }
//   });
//   console.log(deps);
//   const result = { components: components, dependencies: dependencies };
//   return JSON.stringify(result);
// }
