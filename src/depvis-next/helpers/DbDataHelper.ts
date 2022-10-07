import { gql } from '@apollo/client';
import { createApolloClient } from './ApolloClientHelper';

const chunkSize = 100;

export async function ProjectExists(projectName: string) {
  console.log(projectName);

  const query = gql`
    query Project($projectName: String!) {
      projects(where: { name_CONTAINS: $projectName }) {
        id
        name
        version
      }
    }
  `;
  const client = createApolloClient();
  const { data } = await client.query({ query: query, variables: { projectName: projectName } });
  console.log(data);
  return data.projects.length > 0;
}

export async function ComponentExists(componentName: string) {
  console.log(componentName);

  const query = gql`
    query Component($componentName: String!) {
      components(where: { name_CONTAINS: $componentName }) {
        id
        name
        version
      }
    }
  `;
  const client = createApolloClient();
  const { data } = await client.query({ query: query, variables: { componentName: componentName } });
  console.log(data);
  return data.projects.length > 0;
}

export async function CreateComponents(components: [any]) {
  //if (components == null || components.length > 0) return;
  console.log(`Creating components (len ${components.length})`);
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
  const client = createApolloClient();
  for (let i = 0; i < components.length; i += chunkSize) {
    const chunk = components.slice(i, i + chunkSize);
    const { data } = await client.mutate({ mutation: mutation, variables: { components: chunk } });
    console.log({ chunk: i, result: data });
  }
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
  const client = createApolloClient();
  const { data } = await client.mutate({ mutation: mutation });
  console.log(data);
}
