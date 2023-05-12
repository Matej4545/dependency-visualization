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
  vulnerabilityHighlightedColor,
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
  // Process components
  components.forEach((c) => {
    nodes.push({
      id: c.purl,
      name: c.name,
      version: c.version,
      dependsOnCount: c.dependsOnCount,
      size: 1 + c.dependsOnCount / componentsCount,
      isDirectDependency: c.isDirectDependency,
      __typename: c.__typename,
    });
    if (connectDirect && c.isDirectDependency) {
      links.push({ source: root.id, target: c.purl, isFake: true });
    }
    // Add link to dependency
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
    // Process vulnerability
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

// Get components for a project specified as $projectVersionId
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

// Get all project versions
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

// Assign colors based on the CVSS score
export const vulnerabilityColorByCVSS = (cvssScore: number) => {
  if (cvssScore >= 9) return vulnerabilityCriticalColor;
  if (cvssScore >= 7) return vulnerabilityHighColor;
  if (cvssScore >= 4) return vulnerabilityMediumColor;
  return vulnerabilityLowColor;
};

// Regex for excluded components
const nodeExcludeRegex = new RegExp(
  process.env.NEXT_PUBLIC_GRAPH_EXCLUDED_REGEX
);

// Assign color for the component node
const componentColor = (node) => {
  if (
    node.name &&
    process.env.NEXT_PUBLIC_GRAPH_EXCLUDED_REGEX &&
    nodeExcludeRegex.test(node.name)
  )
    return graphExcludedNode;
  if (node.isDirectDependency) return graphMainComponentNode;
  if (node.highlight) return graphHighlightedNode;
  return graphNode;
};

// Assign color for any node
export const getNodeColor = (node) => {
  if (!node) return graphUIGrey;
  if (node.__typename === "Vulnerability")
    return vulnerabilityColorByCVSS(node.cvssScore);
  if (node.__typename === "Component") return componentColor(node);
  return graphUIGrey;
};

// Assign color for a link
export const getLinkColor = (link) => {
  if (link.target && link.target.highlight) return graphHighlightedLink;
  return graphLink;
};

// Return link weight size if highlighted
export const getLinkSize = (link) => {
  if (link.target && link.target.highlight) return 4;
  return 1;
};

// Return the value of node if defined, otherwise 1
export const getNodeValue = (node) => {
  if (!node) return 1;
  return node.size;
};

// Function will return a set of parent nodes for a given node
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

// Function will generate label based on node type
export const generateLabel = (node) => {
  if (node.__typename === "Component") {
    return `<div><span>Name: ${node.name}</span><br> \
  <span>Version: ${node.version}</span><br> \
  <span># of Dependencies: ${node.dependsOnCount}</span><br> \
  <i>Click to see details</i></div>`;
  } else {
    return `<div><span>Name: ${node.name}</span><br> \
  <span>CVSS: ${node.cvssScore}</span><br> \
  <i>Click to see details</i></div>`;
  }
};

// Return highlight color based on node type
export const getHighlightedColor = (currNode, node) => {
  if (currNode !== node) return "";
  return currNode.__typename === "Component"
    ? graphSelectedNode
    : vulnerabilityHighlightedColor;
};

// Reset the fixation of a nodes position
export const resetNodeFix = (node) => {
  node.fx = undefined;
  node.fy = undefined;
};

// Reset highlight for nodes
export const resetHighlight = (nodes: any[]) => {
  for (let index = 0; index < nodes.length; index++) {
    nodes[index].highlight = false;
  }
};
