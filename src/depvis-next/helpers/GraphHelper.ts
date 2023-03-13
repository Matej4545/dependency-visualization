import { gql } from "@apollo/client";

/**
 * Function responsible for transforming the data to format that can be visualized
 * @param components List of components
 * @returns Object containing list of nodes and links
 */
export const formatData = (components) => {
  const nodes = [];
  let links = [];
  if (!components) return { nodes, links };
  const componentsCount = components.length / 20;
  components.forEach((c) => {
    nodes.push({
      id: c.purl,
      name: c.name,
      dependsOnCount: c.dependsOnCount,
      size: 1 + c.dependsOnCount / componentsCount,
      __typename: c.__typename,
    });
    if (c.dependsOn) {
      c.dependsOn.forEach((d) => {
        links.push({
          source: c.purl,
          target: d.purl,
          sourceDependsOnCount: c.dependsOnCount,
          toVuln: false,
        });
      });
    }
    if (c.vulnerabilities) {
      c.vulnerabilities.forEach((v) => {
        links.push({
          source: c.purl,
          target: v.id,
          toVuln: true,
        });
        nodes.push({
          size: 1 + v.cvssScore,
          id: v.id,
          cve: v.cve,
          name: v.name,
          cvssScore: v.cvssScore,
          __typename: v.__typename,
          references: v.references,
        });
        // if (v.references) {
        //   v.references.forEach((r) => {
        //     links.push({
        //       source: v.id,
        //       target: r.url,
        //     });
        //     nodes.push({
        //       id: r.url,
        //       __typename: r.__typename,
        //     });
        //   });
        // }
      });
    }
  });
  //Filter out links that are not connected
  links = links.filter((l) => {
    if (l.toVuln || nodes.find((n) => n.id === l.target)) return true;
  });
  return { nodes, links };
};

export const getAllComponentsQuery = gql`
  query getProjectComponents($projectVersionId: ID) {
    projectVersions(where: { id: $projectVersionId }) {
      allVulnerableComponents {
        id
        name
        version
        __typename
        purl
        dependsOnCount
        dependsOn {
          purl
        }
        vulnerabilities {
          __typename
          id
          cve
          name
          description
          cvssScore
          references {
            __typename
            url
          }
        }
      }
      allComponents {
        id
        name
        version
        __typename
        purl
        dependsOnCount
        dependsOn {
          purl
        }
        vulnerabilities {
          __typename
          id
          cve
          name
          description
          cvssScore
          references {
            __typename
            url
          }
        }
      }
    }
  }
`;
export const getProjectsQuery = gql`
  query Project {
    projects {
      id
      name
      versions {
        id
        version
      }
    }
  }
`;

export const getProjectVersionsQuery = gql`
  {
    projectVersions {
      id
      version
      project {
        name
        id
      }
    }
  }
`;
const componentColor = "#005f73";
const vulnColor = "#ee9b00";
const otherColor = "#001219";
const severeVulnColor = "#bb3e03";
const systemComponent = "#0f0f0f";

export const getNodeColor = (node) => {
  if (!node) return otherColor;
  if (node.__typename === "Vulnerability")
    return node.cvssScore > 5 ? severeVulnColor : vulnColor;
  if (node.selected) return "#6500ff";
  if (node.name && node.name.toLowerCase().includes("system"))
    return systemComponent;
  if (node.__typename === "Component") return componentColor;
  return otherColor;
};

const getNodeTier = (
  score: number,
  tresholds: { 1: 10; 0.75: 7; 0.5: 5; 0.25: 3; 0.1: 1 }
) => {
  const limits = Object.keys(tresholds);
  limits.forEach((l) => {
    if (score < Number.parseFloat(l)) return tresholds[l];
  });
};
export const getNodeValue = (node) => {
  if (!node) return 1;
  // if (node.__typename === 'Vulnerability') return node.cvssScore * 3 || 5;
  // return node.dependsOnCount || 1;\
  return node.size;
};

/**
 * Can be used for graph testing purposes
 */
function genGraphTree() {
  return {
    nodes: [{ id: "A" }, { id: "B" }, { id: "C" }, { id: "D" }],
    links: [
      { source: "A", target: "B" },
      { source: "A", target: "C" },
      { source: "B", target: "D" },
      { source: "D", target: "C" },
      { source: "C", target: "B" },
    ],
  };
}
