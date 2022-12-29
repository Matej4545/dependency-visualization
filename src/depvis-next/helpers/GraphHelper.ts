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
          target: v.id,
        });
        nodes.push({
          id: v.id,
          cve: v.cve,
          name: v.name,
          cvssScore: v.cvssScore,
          __typename: v.__typename,
        });
        if (v.references) {
          v.references.forEach((r) => {
            links.push({
              source: v.id,
              target: r.url,
            });
            nodes.push({
              id: r.url,
              __typename: r.__typename,
            });
          });
        }
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
        __typename
        id
        cve
        name
        cvssScore
        references {
          __typename
          url
        }
      }
    }
  }
`;

const componentColor = "#005f73";
const vulnColor = "#ee9b00";
const otherColor = "#001219";
const severeVulnColor = "#bb3e03";

export const getNodeColor = (node) => {
  if (!node) return otherColor;
  if (node.__typename === "Vulnerability") return vulnColor;
  if (node.__typename === "Component") return componentColor;
  return otherColor;
};

export const getNodeValue = (node) => {
  if (!node) return 1;
  if (node.__typename === "Vulnerability") return node.cvssScore * 3 || 5;
  return node.dependsOnCount || 1;
};
