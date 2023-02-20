import { Component } from '../types/component';
import { Project, ProjectVersion } from '../types/project';
import { VulnFetcherHandler } from '../vulnerability-mgmt/VulnFetcherHandler';
import { processBatch } from './BatchHelper';
import {
  CreateUpdateVulnerability,
  TryGetProjectByName,
  UpdateComponentDependencies,
  UpdateProjectDependencies,
} from './DbDataHelper';
import {
  CreateProject,
  CreateProjectVersion,
  DeleteProjectVersion,
  GetProjectById,
  GetProjectByName,
} from './DbDataProvider';

type ProjectInput = {
  name: string;
  id: string;
};

export type ProjectVersionInput = {
  version: string;
  date: string;
};

const NotKnownPlaceholder = "n/a"

export async function ImportSbom(bom: any, projectInput: ProjectInput, projectVersion: string, updateProgressCallback) {
  try {
    /**
     * Simple wrapper function that is responsible for updating status for job worker
     * @param percent Status in percent (0-100)
     * @param message Short description what is happening
     */
    const updateProgress = async (percent, message) => {
      console.log(message);
      await updateProgressCallback({ message: message, percent: percent });
      console.log(message);
    };

    // Find project information on backend
    const project = await GetProject(projectInput);
    const projectVersionInput: ProjectVersionInput = {
      version: projectVersion || bom.metadata.component ? bom.metadata.component.version || NotKnownPlaceholder,
      date: bom.metadata.timestamp || Date.now().toLocaleString()
    }
    const projectVersionId = GetProjectVersionId(project, projectVersionInput);

    // Create components for new version
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

    await updateProgress(3, 'Preparing dependencies');
    // Prepare dependencies
    let dependencies = GetDependencies(bom.dependencies.dependency);
    await updateProgress(4, 'Creating project in DB');
    // Create all objects in DB
    await updateProgress(3, 'Preparing components');
    // Prepare components
    let components: Component[] = GetComponents(bom);
    mainComponent && components.push(mainComponent);
    await updateProgress(10, 'Creating components');
    // TODO: rewrite this using component IDs, not purl
    
    //   await CreateComponents(components, projectId);
    //   await updateProgress(50, 'Updating dependencies');
    //   await UpdateProjectDependencies(projectId, [mainComponent]);
    //   await UpdateComponentDependencies(dependencies, projectId);
    await updateProgress(70, 'Fetching vulnerabilities');
    //Vulnerabilities
    //  const purlList = components.map((c) => {
    //     return c.purl;
    //   });
    //   const r = await processBatch(purlList, VulnFetcherHandler);
    //   await updateProgress(90, 'Creating vulnerabilities in DB');
    //   r.forEach(async (component) => {
    //     if (component.vulnerabilities.length > 0) {
    //       console.log('Creating %d vulns for %s', component.vulnerabilities.length, component.purl);
    //       await CreateUpdateVulnerability(component.purl, component.vulnerabilities);
    //     }
    //   });
    //   await updateProgress(90, 'Creating vulnerabilities in DB');
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
 * @param ProjectVersionList List of projects
 * @returns The largest project
 */
export function getLatestProjectVersion(ProjectVersionList: ProjectVersion[]): ProjectVersion {
  return ProjectVersionList.reduce((highestVersionObj, currentObj) => {
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

/**
 * Function will return correct project.
 * If the project exists, it will return corresponding object with additional info
 * If the project does not exists, it will be created
 * @param project Project Input data
 * @returns Project
 */
async function GetProject(project: ProjectInput): Promise<Project> {
  const { name, id } = project;
  //We know exact ID
  let existingProjects = [];
  if (id) {
    existingProjects = await GetProjectById(id);
  } else {
    existingProjects = await GetProjectByName(name);
  }
  // Project does not exist yet, so we need to create it first
  if (existingProjects.length == 0) {
    console.log('Creating new project with name %s', name);
    const newProjectObj: Project = { name: name };
    const newProject = await CreateProject(newProjectObj);
    console.log('Project created with id: %s', newProject!.id);
    return newProject;
  }
  // Project exist, so we just return it
  // Because there might be more projects, return the first one
  const currentProject = existingProjects[0];
  if (existingProjects.length > 1) {
    console.warn(
      'Multiple project was found for the name %s\nReturning the first one with id %s',
      name,
      currentProject.id
    );
  }
  return currentProject;
}

/**
 * Function will return Id of correct Project Version.
 * If the same version already exists, it will be removed,
 * then a new version will be created.
 * @param project Project object
 * @param projectVersion Version represented as string, e.g. "1.0.0"
 * @returns ProjectVersion Id
 */
async function GetProjectVersionId(project: Project, projectVersionInput: ProjectVersionInput) {
  const {version, date } = projectVersionInput;
  if (!project || !version) {
    throw Error('Invalid information - missing project or project version');
  }

  if (!project.versions || project.versions.length == 0) {
  }

  //Version already exists
  const existingProjectVersion = project.versions.find((pv) => {
    pv.version === version;
  });
  if (existingProjectVersion) {
    console.log(
      'Version %s for project %s already exists with id %s, it will be removed.',
      version,
      project.name,
      existingProjectVersion.id
    );
    await DeleteProjectVersion(existingProjectVersion.id);
  }

  const newVersionId = await CreateProjectVersion(project.id, version);
  console.log('New version for project %s created with id %s', project.name, newVersionId);
  return newVersionId;
}
