import { gql } from "@apollo/client";
import {
  graphExcludedNode,
  graphHighlightedLink,
  graphHighlightedNode,
  graphLink,
  graphMainComponentNode,
  graphNode,
  graphSelectedNode,
  graphUIGrey,
  vulnerabilityCriticalColor,
  vulnerabilityHighColor,
  vulnerabilityLowColor,
  vulnerabilityMediumColor,
} from "../types/colorPalette";

/**
 * Function responsible for transforming the data to format that can be visualized
 * @param components List of components
 * @returns Object containing list of nodes and links
 */
export const formatData = (components, connectDirect = false) => {
  const nodes = [];
  let links = [];
  if (!components) return { nodes, links };
  const componentsCount = components.length / 20;
  // Create root component
  const root = {
    id: "root",
    name: "Project root component",
    size: 20,
    dependsOnCount: componentsCount,
    __typename: "Root",
  };
  connectDirect && nodes.push(root);
  components.forEach((c) => {
    nodes.push({
      id: c.purl,
      name: c.name,
      dependsOnCount: c.dependsOnCount,
      size: 1 + c.dependsOnCount / componentsCount,
      isDirectDependency: c.isDirectDependency,
      __typename: c.__typename,
    });
    if (connectDirect && c.isDirectDependency) {
      links.push({ source: root.id, target: c.purl, isFake: true });
    }
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
      project {
        name
      }
      version
      allVulnerableComponents {
        id
        name
        version
        isDirectDependency
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
        isDirectDependency
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
// const componentColor = "#005f73";
// const vulnColor = "#ee9b00";
// const otherColor = "#001219";
// const severeVulnColor = "#bb3e03";
// const systemComponent = "#0f0f0f";

export const vulnerabilityColorByCVSS = (cvssScore: number) => {
  if (cvssScore >= 9) return vulnerabilityCriticalColor;
  if (cvssScore >= 7) return vulnerabilityHighColor;
  if (cvssScore >= 4) return vulnerabilityMediumColor;
  return vulnerabilityLowColor;
};

const componentColor = (node) => {
  console.log(node);
  if (node.name && nodeExcludeRegex.test(node.name)) return graphExcludedNode;
  if (node.isDirectDependency) return graphMainComponentNode;
  if (node.highlight) return graphHighlightedNode;
  return graphNode;
};
const nodeExcludeRegex = new RegExp(
  process.env.NEXT_PUBLIC_GRAPH_EXCLUDED_REGEX
);
export const getNodeColor = (node) => {
  if (!node) return graphUIGrey;
  if (node.__typename === "Vulnerability")
    return vulnerabilityColorByCVSS(node.cvssScore);
  if (node.__typename === "Component") return componentColor(node);
  return graphUIGrey;
};

export const getLinkColor = (link) => {
  if (link.target && link.target.highlight) return graphHighlightedLink;
  return graphLink;
};

export const getLinkSize = (link) => {
  if (link.target && link.target.highlight) return 4;
  return 1;
};

// const getNodeTier = (
//   score: number,
//   tresholds: { 1: 10; 0.75: 7; 0.5: 5; 0.25: 3; 0.1: 1 }
// ) => {
//   const limits = Object.keys(tresholds);
//   limits.forEach((l) => {
//     if (score < Number.parseFloat(l)) return tresholds[l];
//   });
// };

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

export const findParentNodes = (links: any, nodeId: string) => {
  const parentNodes = new Set<string>();
  const queue = [nodeId];
  while (queue.length > 0) {
    const currNodeId = queue.shift()!;

    links.forEach((link) => {
      if (link.target.id === currNodeId) {
        const sourceNodeId = link.source.id;
        if (!parentNodes.has(sourceNodeId)) {
          parentNodes.add(sourceNodeId);
          queue.push(sourceNodeId);
        }
      }
    });
  }

  return parentNodes;
};
