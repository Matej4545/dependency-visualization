import { Component, Dependency } from "../types/component";
import { Project, ProjectVersion } from "../types/project";
import { VulnFetcherHandler } from "../vulnerability-mgmt/VulnFetcherHandler";
import { processBatchAsync } from "./BatchHelper";
import {
  CreateProject,
  CreateProjectVersion,
  DeleteProjectVersion,
  GetProjectById,
  GetProjectByName,
  CreateComponents,
  updateComponentDependency,
  CreateUpdateVulnerability,
} from "./DbDataProvider";

type ProjectInput = {
  name?: string;
  id?: string;
};

export type ProjectVersionInput = {
  version: string;
  date: string;
};

const NotKnownPlaceholder = "n/a";

export async function ImportSbom(
  bom: any,
  projectInput: ProjectInput,
  projectVersion: string,
  updateProgressCallback
) {
  const importInfo = {
    project: undefined,
    projectVersion: undefined,
    createdComponents: [],
    createdVulnerabilitiesIds: [],
    currentPhase: ImportPhase.Init,
  };

  /**
   * Simple wrapper function that is responsible for updating status for job worker
   * @param percent Status in percent (0-100)
   */
  const updateProgress = async (percent) => {
    const obj = {
      message: importInfo.currentPhase,
      percent: CalculateProgress(importInfo.currentPhase, percent),
    };
    console.log(obj);
    await updateProgressCallback(obj);
  };

  try {
    // Get project & project version
    // Both project and project version will be created if it does not exist yet
    importInfo.currentPhase = ImportPhase.CreateProject;
    await updateProgress(0);
    importInfo.project = await GetProject(projectInput);
    const tmpProjectVersion = projectVersion
      ? projectVersion
      : bom.metadata.component
      ? (bom.metadata.component.version as string)
      : NotKnownPlaceholder;
    const projectVersionInput: ProjectVersionInput = {
      version: tmpProjectVersion,
      date: bom.metadata.timestamp || Date.now().toLocaleString(),
    };
    importInfo.projectVersion = await GetProjectVersionId(
      importInfo.project,
      projectVersionInput
    );
    updateProgress(5);

    // Prepare necessary objects - if it fails, no objects in DB are created yet
    let dependencies = GetDependencies(bom.dependencies.dependency);
    const mainComponent: Component = createMainComponent(
      bom.metadata.component
    );
    let components: Component[] = GetComponents(bom);
    components.push(mainComponent);

    // Create components in DB
    importInfo.currentPhase = ImportPhase.CreateComponents;

    importInfo.createdComponents = await processBatchAsync(
      components,
      CreateComponents,
      {
        chunkSize: 5,
        updateProgressFn: updateProgress,
        fnArg2: importInfo.projectVersion,
      }
    );

    // Connect dependencies
    importInfo.currentPhase = ImportPhase.ConnectDependencies;
    const dependenciesResult = await updateComponentDependency(
      dependencies,
      importInfo.projectVersion,
      mainComponent.purl,
      updateProgress
    );

    // Find vulnerabilities
    importInfo.currentPhase = ImportPhase.FindVulnerabilities;
    const purlList = components.map((c) => {
      return c.purl;
    });
    const r = await processBatchAsync<any[]>(purlList, VulnFetcherHandler, {
      chunkSize: 10,
      updateProgressFn: updateProgress,
    });

    // Create or connect vulnerabilities
    r.forEach(async (component, index) => {
      updateProgress(index / r.length);
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
    importInfo.currentPhase = ImportPhase.Completed;
  } catch (error) {
    console.error("Recovery needed");
    console.error(error);
    if (importInfo.projectVersion) {
      await DeleteProjectVersion(importInfo.projectVersion);
    }
  }
}
function GetComponents(bom: any) {
  let components: any[] = bom.components.component;
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

function GetDependencies(dependencies: any): Dependency[] {
  if (!dependencies) return;
  const res: Dependency[] = dependencies
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
export function getLatestProjectVersion(
  ProjectVersionList: ProjectVersion[]
): ProjectVersion {
  return ProjectVersionList.reduce((highestVersionObj, currentObj) => {
    if (
      !highestVersionObj ||
      compareVersions(currentObj.version, highestVersionObj.version) > 0
    ) {
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
  const arr1 = version1.split(".").map((num) => parseInt(num, 10));
  const arr2 = version2.split(".").map((num) => parseInt(num, 10));
  const num1 = parseInt(arr1.join(""), 10);
  const num2 = parseInt(arr2.join(""), 10);
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
    console.log("Creating new project with name %s", name);
    const newProjectObj: Project = { name: name };
    const newProject = await CreateProject(newProjectObj);
    console.log("Project created with id: %s", newProject!.id);
    return newProject;
  }
  // Project exist, so we just return it
  // Because there might be more projects, return the first one
  const currentProject = existingProjects[0];
  if (existingProjects.length > 1) {
    console.warn(
      "Multiple project was found for the name %s\nReturning the first one with id %s",
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
async function GetProjectVersionId(
  project: Project,
  projectVersionInput: ProjectVersionInput
) {
  const { version, date } = projectVersionInput;
  if (!project || !version) {
    throw Error("Invalid information - missing project or project version");
  }

  const existingProjectVersion = project.versions.find((pv) => {
    pv.version === version;
  });
  if (existingProjectVersion) {
    console.log(
      "Version %s for project %s already exists with id %s, it will be removed.",
      version,
      project.name,
      existingProjectVersion.id
    );
    await DeleteProjectVersion(existingProjectVersion.id);
  }
  const newVersionId = await CreateProjectVersion(
    project.id,
    projectVersionInput
  );
  console.log(
    "New version (%s) for project %s created with id %s",
    projectVersionInput.version,
    project.name,
    newVersionId
  );
  return newVersionId;
}

function createMainComponent(inputComponent) {
  if (!inputComponent) {
    throw Error("No main component was provided!");
  }
  const purl =
    inputComponent.purl || `${inputComponent.name}@${inputComponent.version}`;
  return {
    type: inputComponent.type,
    name: inputComponent.name,
    purl: purl,
    version: inputComponent.version,
    author: inputComponent.author,
    publisher: inputComponent.publisher,
  };
}

enum ImportPhase {
  CreateProject = "Creating project version",
  CreateComponents = "Creating components",
  ConnectDependencies = "Connecting dependencies",
  FindVulnerabilities = "Looking for vulnerabilities",
  CreateVulnerabilities = "Adding vulnerabilities",
  Completed = "Import is completed",
  Init = "Starting import",
}

const CalculateProgress = (importPhase: ImportPhase, phasePercent: number) => {
  switch (importPhase) {
    case ImportPhase.CreateProject:
      return CalculateProgressFn(0, 5, phasePercent);
    case ImportPhase.CreateComponents:
      return CalculateProgressFn(5, 40, phasePercent);
    case ImportPhase.ConnectDependencies:
      return CalculateProgressFn(40, 60, phasePercent);
    case ImportPhase.FindVulnerabilities:
      return CalculateProgressFn(60, 85, phasePercent);
    case ImportPhase.CreateVulnerabilities:
      return CalculateProgressFn(85, 100, phasePercent);
    default:
      return 0;
  }
};

const CalculateProgressFn = (
  offset: number,
  maximum: number,
  percent: number
): number => {
  const multiplier = percent > 100 ? 100 : percent;
  const result = offset + (maximum - offset) * multiplier;
  if (result < 0) return 0;
  return Number.parseInt(result.toFixed(0));
};
