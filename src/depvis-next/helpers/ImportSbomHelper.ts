import { Component } from '../types/component';
import { Project } from '../types/project';
import { VulnFetcherHandler } from '../vulnerability-mgmt/VulnFetcherHandler';
import { processBatch } from './BatchHelper';
import {
  CreateComponents,
  CreateProject,
  UpdateComponentDependencies,
  UpdateProjectDependencies,
} from './DbDataHelper';

export async function ImportSbom(bom: any, projectName, projectVersion) {
  // Prepare main component if exists
  const mainComponentParsed = bom.metadata.component;
  const mainComponent: Component | undefined = mainComponentParsed
    ? {
        type: mainComponentParsed.type,
        name: mainComponentParsed.name,
        purl: mainComponentParsed.purl || `${mainComponentParsed.name}@${mainComponentParsed.version}`,
        version: mainComponentParsed.version,
        author: mainComponentParsed.author,
        publisher: mainComponentParsed.publisher,
      }
    : undefined;

  // Prepare project
  let project: Project = {
    name: projectName || bom.metadata.component.name,
    version: projectVersion || bom.metadata.component.version || '1.0.0',
    date: bom.metadata.timestamp || '1970-01-01',
  };
  console.log(project);

  // Prepare dependencies
  let dependencies = GetDependencies(bom.dependencies.dependency);

  // Currently there is no support for managing older projects - we first need to clear the DB
  //await DeleteAllData();
  // Create all objects in DB
  const projectResponse = await CreateProject(project);
  const projectId = projectResponse.createProjects.projects[0].id;

  // Prepare components
  let components: [Component] = GetComponents(bom);
  mainComponent && components.push(mainComponent);
  console.log(components);

  await CreateComponents(components, projectId);
  await UpdateProjectDependencies(projectId, [mainComponent]);
  await UpdateComponentDependencies(dependencies, projectId);

  //Vulnerabilities
  const purlList = components.map((c) => {
    return c.purl;
  });
  await processBatch(purlList, VulnFetcherHandler);
}
function GetComponents(bom: any) {
  let components = bom.components.component;
  // Component data transformation
  components = components.map((c) => {
    return {
      type: c.type,
      name: c.name,
      purl: c.purl,
      version: `${c.version}`,
      author: c.author,
      publisher: c.publisher,
    };
  });
  return components;
}

function GetDependencies(dependencies: any) {
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
