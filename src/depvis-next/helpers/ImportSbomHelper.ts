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

export async function ImportSbom(bom: any, projectName, projectVersion, updateProgressCallback) {
  try {
    // Prepare main component if exists
    const updateProgress = async (percent, message) => {
      console.log(message);

      await updateProgressCallback({ message: message, percent: percent });
      console.log(message);
    };
    await updateProgress(1, 'Parsing main component');
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
    await updateProgress(2, 'Preparing project');
    // Prepare project
    let project: Project = {
      name: projectName || bom.metadata.component.name,
      version: projectVersion || bom.metadata.component.version || '1.0.0',
      date: bom.metadata.timestamp || '1970-01-01',
    };
    console.log(project);
    await updateProgress(3, 'Preparing dependencies');
    // Prepare dependencies
    let dependencies = GetDependencies(bom.dependencies.dependency);

    // Currently there is no support for managing older projects - we first need to clear the DB
    //await DeleteAllData();
    await updateProgress(4, 'Creating project in DB');
    // Create all objects in DB
    const projectResponse = await CreateProject(project);
    const projectId = projectResponse.createProjects.projects[0].id;

    await updateProgress(3, 'Preparing components');
    // Prepare components
    let components: [Component] = GetComponents(bom);
    mainComponent && components.push(mainComponent);
    console.log(components);

    await updateProgress(10, 'Creating components');
    await CreateComponents(components, projectId);
    await updateProgress(50, 'Updating dependencies');

    await UpdateProjectDependencies(projectId, [mainComponent]);
    await UpdateComponentDependencies(dependencies, projectId);
    await updateProgress(70, 'Fetching vulnerabilities');

    //Vulnerabilities
    const purlList = components.map((c) => {
      return c.purl;
    });
    const r = await processBatch(purlList, VulnFetcherHandler);
    await updateProgress(90, 'Creating vulnerabilities in DB');

    r.forEach(async (component) => {
      if (component.vulnerabilities.length > 0) {
        console.log('Creating %d vulns for %s', component.vulnerabilities.length, component.purl);
        await CreateUpdateVulnerability(component.purl, component.vulnerabilities);
      }
    });
    await updateProgress(90, 'Creating vulnerabilities in DB');
  } catch {
    console.error('Recovery needed');
  }
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

/**
 * Function will find project with highest version number in format 1.2.3
 * Note: all project must have the same version length
 * @param projects List of projects
 * @returns The largest project
 */
export function getLatestProjectVersion(projects) {
  return projects.reduce((highestVersionObj, currentObj) => {
    if (!highestVersionObj || compareVersions(currentObj.version, highestVersionObj.version) > 0) {
      return currentObj;
    } else {
      return highestVersionObj;
    }
  }, undefined);
}

/**
 * Function will parse the versions from format '1.2.3' and compare them
 * @param version1 version of project 1
 * @param version2  version of project 2
 * @returns 1 if version1 > version2, -1 if version1 < version2, 0 if they are equal
 */
export function compareVersions(version1: string, version2: string): number {
  const arr1 = version1.split('.').map((num) => parseInt(num, 10));
  const arr2 = version2.split('.').map((num) => parseInt(num, 10));
  const num1 = parseInt(arr1.join(''), 10);
  const num2 = parseInt(arr2.join(''), 10);
  if (num1 > num2) {
    return 1;
  } else if (num1 < num2) {
    return -1;
  }
  return 0;
}
