import { gql } from "@apollo/client";
import { Component } from "../types/component";
import { Project, ProjectVersion, ProjectVersionDto } from "../types/project";
import {
  sendGQLQuery,
  sendGQLMutation,
  AddProjectVersionConnectProject,
  BuildAddDependencyQuery,
  AddComponentsConnectProjectVersion,
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
}

export async function updateComponentDependency(
  dependencies: any[],
  projectVersionId: string,
  mainComponentPurl: string
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
  for (let index = 0; index < dependencyQueryList.length; index++) {
    const { data } = await sendGQLMutation(mutation, {
      where: dependencyQueryList[index].where,
      connect: dependencyQueryList[index].connect,
    });
    console.log(data);
    console.log(
      "Created %s relationships",
      data.name.info.relationshipsCreated
    );
  }
}
