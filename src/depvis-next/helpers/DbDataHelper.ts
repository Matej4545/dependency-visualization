import { DocumentNode, gql } from '@apollo/client';
import { randomBytes } from 'crypto';
import { Component, ComponentDto } from '../types/component';
import { Project } from '../types/project';
import { Vulnerability } from '../types/vulnerability';
import { createApolloClient } from './ApolloClientHelper';
const chunkSize = 100;

/**
 * Function wrapper responsible for sending GraphQL queries.
 * @param query GraphQL query
 * @param variables Optional variables that will be used in query
 * @returns Data from successful query
 * @throws Error if there were some error during fetch
 */
export async function sendGQLQuery(query: DocumentNode, variables?: Object) {
  console.log(`GQL Query: ${query} with variables ${await JSON.stringify(variables)}`);
  console.dir({query: query, variables: variables})
  const client = createApolloClient();
  const res = await client.query({ query: query, variables: variables });
  if (res.errors) {
    throw Error(res.errors.toString());
  }
  return res;
}

export async function sendGQLMutation(mutation: DocumentNode, variables?: Object) {
  console.log(`GQL Mutation: ${mutation} with variables ${await JSON.stringify(variables)}`);
  console.dir({mutation: mutation, variables: variables})
  const client = createApolloClient();
  const res = await client.mutate({ mutation: mutation, variables: variables });
  if (res.errors) {
    console.error(res.errors.map((e) => e.message).toString());
    throw Error(res.errors.toString());
  }
  return res;
}

export async function TryGetProjectByName(projectName: string) {
  const query = gql`
    query Project($projectName: String!) {
      projects(where: { name_CONTAINS: $projectName }) {
        id
        name
        versions {
          version
        }
      }
    }
  `;
  const { data } = await sendGQLQuery(query, { projectName: projectName });
  return data.projects;
}

export async function ComponentExists(componentName: string) {
  const query = gql`
    query Component($componentName: String!) {
      components(where: { name_CONTAINS: $componentName }) {
        id
        name
        version
      }
    }
  `;
  const { data } = await sendGQLQuery(query, { componentName: componentName });
  return data.projects.length > 0;
}

export async function CreateComponents(components: [Component?], projectId: string) {
  if (!components || components.length == 0) return;
  const mutation = gql`
    mutation CreateComponent($components: [ComponentCreateInput!]!) {
      createComponents(input: $components) {
        __typename
        components {
          purl
        }
      }
    }
  `;

  const res = [];

  for (let i = 0; i < components.length; i += chunkSize) {
    const chunk = components.slice(i, i + chunkSize);
    const chunkWithProjectId = AddProjectToComponents(chunk, projectId);
    const { data } = await sendGQLMutation(mutation, { components: chunkWithProjectId });
    res.concat(data.components);
  }
  return res;
}

function AddProjectToComponents(components: Component[], projectId: string) {
  const res = components.map((c) => {
    return { ...c, project: { connect: { where: { node: { id: projectId } } } } };
  });
  console.log(res);
  return res;
}

/**
 * Function will create new project with optional first component
 * @param project Project data
 * @returns Data contained in server response
 */
export async function CreateProject(project: Project) {
  if (!project) return;
  const mutation = gql`
    mutation CreateProject($project: [ProjectCreateInput!]!) {
      createProjects(input: $project) {
        projects {
          id
        }
      }
    }
  `;
  const { data } = await sendGQLMutation(mutation, { project: [project] });
  return data;
}

function generateName() {
  return 'gql' + randomBytes(8).toString('hex');
}

export async function GetVulnerability(vulnerabilityId) {
  const query = gql`
    query getVuln($vulnerabilityId: String) {
      vulnerabilities(where: { id_CONTAINS: $vulnerabilityId }) {
        id
        name
      }
    }
  `;
  const { data } = await sendGQLQuery(query, { vulnerabilityId: vulnerabilityId });
  return data.vulnerabilities;
}
export async function CreateUpdateVulnerability(purl: string, vulnerabilities: [Vulnerability?]) {
  console.log('Creating vulnerability for package %s', purl);
  if (!vulnerabilities || vulnerabilities.length == 0 || !purl) return;

  const vulnExistsList = await Promise.all(
    vulnerabilities.map(async (v) => {
      const getVuln = await GetVulnerability(v.id);
      return getVuln.length == 0;
    })
  );
  const newVulnerabilities = vulnerabilities.filter((_v, index) => vulnExistsList[index]);

  if (newVulnerabilities.length == 0) {
    console.log('All vulnerabilities for component %s already exists in DB', purl);
    return;
  }
  const mutation = gql`
    mutation CreateVulnerability($purl: String, $vuln_array: [ComponentVulnerabilitiesCreateFieldInput!]) {
      updateComponents(where: { purl: $purl }, update: { vulnerabilities: { create: $vuln_array } }) {
        info {
          nodesCreated
          relationshipsCreated
        }
      }
    }
  `;

  //Tranform for mutation compatibility
  const vulnArray = newVulnerabilities.map((v) => {
    return { node: PrepareVulnAsGQL(v) };
  });
  const { data } = await sendGQLMutation(mutation, {
    purl: purl,
    vuln_array: vulnArray,
  });
  console.log(data);
}

function PrepareVulnAsGQL(vuln: Vulnerability) {
  const refs = vuln.references
    ? {
        connectOrCreate: [
          ...vuln.references.map((r) => {
            return {
              where: { node: { url: r.url } },
              onCreate: { node: { url: r.url } },
            };
          }),
        ],
      }
    : {};
  return { ...vuln, references: refs };
}

export async function UpdateProjectDependencies(projectId: string, components: [Component?]) {
  if (!projectId || components.length == 0) return;
  const mutation = gql`
    mutation UpdateProjectDependencies($projectId: ID, $componentsPurl: [ComponentWhere!]!) {
      updateProjects(
        where: { id: $projectId }
        update: { component: { connect: { where: { node: { OR: $componentsPurl } } } } }
      ) {
        __typename
        info {
          relationshipsCreated
        }
      }
    }
  `;

  const { data } = await sendGQLMutation(mutation, {
    projectId: projectId,
    componentsPurl: components.map((c) => {
      return { purl: c.purl };
    }),
  });
}

export async function UpdateComponentDependencies(dependencies, projectId: string) {
  if (dependencies == null || dependencies.length == 0) return;
  for (let i = 0; i < dependencies.length; i += chunkSize) {
    //TODO: rewrite using variables
    const chunk = dependencies.slice(i, i + chunkSize);
    const chunkMutation = chunk
      .map((dependency) => {
        return getComponentUpdateGQLQuery(dependency, dependency.dependsOn, generateName());
      })
      .join('\n');
    const mutation = gql`
      mutation UpdateComponents ($projectId: ID){
        ${chunkMutation}
      }
    `;
    const { data } = await sendGQLMutation(mutation, { projectId: projectId });
    console.log(data);
  }
}
export async function GetComponents() {
  const query = gql`
    {
      components {
        purl
      }
    }
  `;
  const { data } = await sendGQLQuery(query);
  return data;
}

function getComponentWherePurlPart(array: [Component?]) {
  const res = array.map((c) => {
    return `{purl: \"${c.purl}\", project_SINGLE: {id: $projectId}}`;
  });
  return `[${res.join(',')}]`;
}

function getComponentUpdateGQLQuery(dependency, dependsOn, name = 'updateComponent') {
  const mutation_content = getComponentWherePurlPart(dependsOn);

  const mutation_part = `${name}: updateComponents(
    where: { purl: \"${dependency.purl}\", project_SINGLE: {id: $projectId}}
    update: {
      dependsOn: {
        connect: {
          where: { node: { OR: ${mutation_content} } }
        }
      }
    }
  ) {
    info {
      relationshipsCreated
    }
  }`;
  console.log(mutation_part);
  return mutation_part;
}

export async function DeleteAllData() {
  const mutation = gql`
    mutation DeleteAll {
      deleteProjects(where: {}) {
        nodesDeleted
      }
      deleteComponents(where: {}) {
        nodesDeleted
      }
      deleteReferences(where: {}) {
        nodesDeleted
      }
      deleteVulnerabilities(where: {}) {
        nodesDeleted
      }
    }
  `;
  const { data } = await sendGQLMutation(mutation);
  console.log(data);
}

export function AddProjectVersionConnectProject(projectId: string) {
  return { connect: { where: { node: { id: projectId } } } };
}

export function CreateComponentsConnectProjectVersion(components: [ComponentDto], projectVersionId: string) {
  const ConnectProjectVersion = { connect: { where: { node: { id: projectVersionId } } } };
  return components.map((c) => {
    return { ...c, projectVersion: ConnectProjectVersion };
  });
}
