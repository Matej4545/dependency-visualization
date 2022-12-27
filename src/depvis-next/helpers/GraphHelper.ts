import { gql } from "@apollo/client";

export const formatData = (data) => {
  console.log(data);
  const nodes = [];
  const links = [];
  console.log(data);
  if (!data.components) return { nodes, links };
  data.components.forEach((c) => {
    nodes.push({
      id: c.purl,
      name: c.name,
      dependsOnCount: c.dependsOnCount,
      __typename: c.__typename,
    });
    if (c.dependsOn) {
      c.dependsOn.forEach((d) => {
        links.push({
          source: c.purl,
          target: d.purl,
        });
      });
    }
    if (c.vulnerabilities) {
      c.vulnerabilities.forEach((v) => {
        links.push({
          source: c.purl,
          target: v.cve,
        });
        nodes.push({
          id: v.cve,
          cve: v.cve,
          name: v.name,
          cvssScore: v.cvssScore,
          dependsOnCount: 100,
          __typename: v.__typename,
        });
      });
    }
  });
  console.log({ node: nodes, links: links });
  return { nodes, links };
};

export const getAllComponentsQuery = gql`
  {
    components {
      name
      __typename
      purl
      version
      dependsOnCount
      dependsOn {
        purl
      }
      vulnerabilities {
        cve
        name
        cvssScore
      }
    }
  }
`;
