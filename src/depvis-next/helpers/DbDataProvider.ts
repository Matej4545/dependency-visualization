import { gql } from "@apollo/client";
import { Component, Dependency } from "../types/component";
import { Project, ProjectVersion, ProjectVersionDto } from "../types/project";
import { Vulnerability } from "../types/vulnerability";
import {
  sendGQLQuery,
  sendGQLMutation,
  AddProjectVersionConnectProject,
  BuildAddDependencyQuery,
  AddComponentsConnectProjectVersion,
  GetVulnerability,
  CreateVulnerability as CreateVulnerabilities,
} from "./DbDataHelper";
import { ProjectVersionInput } from "./ImportSbomHelper";

/**
 * Function will create new project with optional first component
 * @param project Project data
 * @returns List containing new project object
 */
export async function CreateProject(project: Project): Promise<Project> {
  if (!project) return;
  const mutation = gql`
    mutation CreateProject($project: [ProjectCreateInput!]!) {
      createProjects(input: $project) {
        projects {
          id
          name
          versions {
            id
            version
          }
        }
      }
    }
  `;
  const { data } = await sendGQLMutation(mutation, { project: [project] });
  return data.createProjects.projects[0];
}

/**
 * Get all projects that match provided name
 * @param projectName Project name
 * @returns List of projects that match given name
 */
export async function GetProjectByName(
  projectName: string
): Promise<Project[]> {
  const query = gql`
    query Project($projectName: String!) {
      projects(where: { name: $projectName }) {
        id
        name
        versions {
          id
          version
        }
      }
    }
  `;
  const { data } = await sendGQLQuery(query, { projectName: projectName });
  return data.projects;
}

/**
 * Get project by Id
 * @param projectId Project Id
 * @returns List of projects that match given Id
 */
export async function GetProjectById(projectId: string): Promise<Project[]> {
  const query = gql`
    query Project($projectName: String!) {
      projects(where: { id: $projectId }) {
        id
        name
        versions {
          id
          version
        }
      }
    }
  `;
  const { data } = await sendGQLQuery(query, { projectId: projectId });
  return data.projects;
}

/**
 * Creates new version for a given project
 * @param projectId Project ID
 * @param version new version identificator
 * @returns ID of the new project version
 */
export async function CreateProjectVersion(
  projectId,
  projectVersionInput: ProjectVersionInput
): Promise<string> {
  const { version, date } = projectVersionInput;
  if (!projectId || !version) {
    console.log(
      "AddProjectComponent is missing some inputs! %s, %s",
      projectId,
      version
    );
    return;
  }
  const mutation = gql`
    mutation AddProjectVersion($projectVersion: ProjectVersionCreateInput!) {
      createProjectVersions(input: [$projectVersion]) {
        info {
          nodesCreated
        }
        projectVersions {
          id
        }
      }
    }
  `;
  const projectVersion: ProjectVersionDto = {
    version: version,
    project: AddProjectVersionConnectProject(projectId),
    date: new Date(date),
  };
  const { data } = await sendGQLMutation(mutation, {
    projectVersion: projectVersion,
  });
  return data.createProjectVersions.projectVersions[0].id;
}

/**
 * Deletes project version with all its connected components, references and vulnerabilities
 * @param projectVersionId ID of the project version
 * @returns number of deleted nodes
 */
export async function DeleteProjectVersion(
  projectVersionId: string
): Promise<number> {
  const mutation = gql`
    mutation DeleteProjectVersion($projectVersionId: ID) {
      deleteProjectVersions(
        where: { id: $projectVersionId }
        delete: { component: { where: {} } }
      ) {
        nodesDeleted
      }
    }
  `;
  const { data } = await sendGQLMutation(mutation, {
    projectVersionId: projectVersionId,
  });
  return data.nodesDeleted;
}

/**
 * Creates components in database and connects them with projectVersion
 * @param components List of components
 * @param projectVersionId ID of the project version
 * @returns List of created components
 */
export async function CreateComponents(
  components: Component[],
  projectVersionId: string
) {
  if (!components || components.length == 0) {
    console.log("CreateComponents - No components provided!");
    return;
  }
  const mutation = gql`
    mutation CreateComponents($components: [ComponentCreateInput!]!) {
      createComponents(input: $components) {
        info {
          nodesCreated
        }
        components {
          id
          name
          purl
        }
      }
    }
  `;
  const componentsWithConnect = AddComponentsConnectProjectVersion(
    components,
    projectVersionId
  );
  const { data } = await sendGQLMutation(mutation, {
    components: componentsWithConnect,
  });
  return data.createComponents.components;
}

/**
 * Adds dependency relationship for components and connects main component to project version
 * @param dependencies List of dependencies
 * @param projectVersionId ID of the project version
 * @param mainComponentPurl purl of the main component that will be connected to projectVersion
 * @returns number of dependencies created
 */
export async function updateComponentDependency(
  dependencies: Dependency[],
  projectVersionId: string,
  mainComponentPurl: string,
  progressUpdateFn: Function
) {
  if (!dependencies || dependencies.length == 0) {
    console.log("Updating dependencies - No dependencies provided!");
    return;
  }
  const mainComponentsMutation = gql`
    mutation UpdateProjectVersion($projectVersionId: ID, $purl: String) {
      updateProjectVersions(
        where: { id: $projectVersionId }
        connect: {
          component: {
            where: {
              node: { purl: $purl, projectVersion: { id: $projectVersionId } }
            }
          }
        }
      ) {
        info {
          relationshipsCreated
        }
      }
    }
  `;
  const mutation = gql`
    mutation UpdateDependencies(
      $where: ComponentWhere
      $connect: ComponentConnectInput
    ) {
      name: updateComponents(where: $where, connect: $connect) {
        info {
          relationshipsCreated
        }
      }
    }
  `;
  // Connect main component
  const mainComponentRes = await sendGQLMutation(mainComponentsMutation, {
    projectVersionId: projectVersionId,
    purl: mainComponentPurl,
  });
  const dependencyQueryList: any[] = BuildAddDependencyQuery(
    dependencies,
    projectVersionId
  );
  let dependencyCount = 0;
  for (let index = 0; index < dependencyQueryList.length; index++) {
    const { data } = await sendGQLMutation(mutation, {
      where: dependencyQueryList[index].where,
      connect: dependencyQueryList[index].connect,
    });
    dependencyCount += data.name.info.relationshipsCreated;
    progressUpdateFn(index / dependencies.length);
  }
  console.log("Created %s relationships", dependencyCount);
  return dependencyCount;
}

export async function CreateUpdateVulnerability(
  purl: string,
  vulnerabilities: Vulnerability[]
) {
  console.log("Creating vulnerability for package %s", purl);
  if (!vulnerabilities || vulnerabilities.length == 0 || !purl) return;

  const vulnExistsList = await Promise.all(
    vulnerabilities.map(async (v) => {
      const getVuln = await GetVulnerability(v.id);
      return getVuln.length == 0;
    })
  );
  const newVulnerabilities = vulnerabilities.filter(
    (_v, index) => vulnExistsList[index]
  );
  const newVulnsUnique = newVulnerabilities.filter(
    (v, index, arr) => arr.indexOf(v) == index
  );
  //Create new vulnerabilities
  await CreateVulnerabilities(newVulnsUnique);

  const mutation = gql`
    mutation CreateVulnerability(
      $purl: String
      $vuln_array: [ComponentVulnerabilitiesConnectFieldInput!]
    ) {
      updateComponents(
        where: { purl: $purl }
        connect: { vulnerabilities: $vuln_array }
      ) {
        info {
          nodesCreated
          relationshipsCreated
        }
      }
    }
  `;

  //Connect vulnerabilities to component
  const vulnArray = vulnerabilities.map((v) => {
    return { where: { node: { id: v.id } } };
  });
  const { data } = await sendGQLMutation(mutation, {
    purl: purl,
    vuln_array: vulnArray,
  });
  return data;
}
