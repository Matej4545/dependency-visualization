import { gql } from '@apollo/client';
import { Component } from '../types/component';
import { Project, ProjectVersion, ProjectVersionDto } from '../types/project';
import { sendGQLQuery, sendGQLMutation, AddProjectVersionConnectProject } from './DbDataHelper';
import { ProjectVersionInput } from './ImportSbomHelper';

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
export async function GetProjectByName(projectName: string): Promise<Project[]> {
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
  console.log(projectName)
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
export async function CreateProjectVersion(projectId, projectVersionInput: ProjectVersionInput): Promise<string> {
  const { version, date } = projectVersionInput;
  if (!projectId || !version) {
    console.log('AddProjectComponent is missing some inputs! %s, %s', projectId, version);
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
  const { data } = await sendGQLMutation(mutation, { projectVersion: projectVersion });
  console.log(data)
  return data.createProjectVersions.projectVersions[0].id;
}

/**
 * Deletes project version with all its connected components, references and vulnerabilities
 * @param projectVersionId ID of the project version
 * @returns number of deleted nodes
 */
export async function DeleteProjectVersion(projectVersionId: string): Promise<number> {
  const mutation = gql`
    mutation DeleteProjectVersion($projectVersionId: ID) {
      deleteProjectVersions(where: { id: $projectVersionId }, delete: { component: { where: {} } }) {
        nodesDeleted
      }
    }
  `;
  const { data } = await sendGQLMutation(mutation, { projectVersionId: projectVersionId });
  return data.nodesDeleted;
}

export async function CreateComponents(components: Component[], projectVersionId: string) {
  if (!components || components.length == 0) {
    console.log('CreateComponents - No components provided!');
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
  const { data } = await sendGQLMutation(mutation, { components: projectVersionId });
}
