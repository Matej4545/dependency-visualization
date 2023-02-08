import { Component } from '../types/component';
import { Project } from '../types/project';
import { VulnFetcherHandler } from '../vulnerability-mgmt/VulnFetcherHandler';
import { processBatch } from './BatchHelper';
import {
  CreateComponents,
  CreateProject,
  CreateUpdateVulnerability,
  UpdateComponentDependencies,
  UpdateProjectDependencies,
} from './DbDataHelper';

export async function ImportSbom(bom: any) {
  // Prepare main component if exists
  console.log("Preparing Import data")
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
    name: bom.metadata.component.name,
    version: bom.metadata.component.version || 'n/a',
    date: bom.metadata.timestamp || '1970-01-01',
  };

  // Prepare dependencies
  let dependencies = GetDependencies(bom.dependencies.dependency);

  // Currently there is no support for managing older projects - we first need to clear the DB
  //await DeleteAllData();
  // Create all objects in DB  
  console.log("Creating project...")
  const projectResponse = await CreateProject(project);
  const projectId = projectResponse.createProjects.projects[0].id;
  console.log("New project created with id %d", projectId)

  // Prepare components
  let components: [Component] = GetComponents(bom);
  mainComponent && components.push(mainComponent);
  console.log("Creating components...");

  await CreateComponents(components, projectId);
  console.log("Components created");
  console.log("Updating dependencies...");
  await UpdateProjectDependencies(projectId, [mainComponent]);
  await UpdateComponentDependencies(dependencies, projectId);
  console.log("Dependencies updated")

  console.log("Fetching vulnerabilities")
  //Vulnerabilities
  const purlList = components.map((c) => {
    return c.purl;
  });
  const v = await processBatch(purlList, VulnFetcherHandler, 100);
  v.forEach(async (component) => {
    if (component.vulnerabilities.length > 0) {
      console.log(
        "Creating %d vulns for %s",
        component.vulnerabilities.length,
        component.purl
      );
      await CreateUpdateVulnerability(
        component.purl,
        component.vulnerabilities
      );
    }
  });
  console.log("All done!")
}
function GetComponents(bom: any) {
  let components = bom.components.component;
  // Component data transformation
  components = components.map((c) => {
    return {
      type: c.type,
      name: c.name,
      purl: c.purl,
      version: c.version && c.version.toString(),
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
