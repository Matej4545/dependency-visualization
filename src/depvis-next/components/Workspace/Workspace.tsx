import { useLazyQuery, useQuery } from "@apollo/client";
import Link from "next/link";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import { Container, Row } from "react-bootstrap";
import {
  findParentNodes,
  formatData,
  getAllComponentsQuery,
  getLinkColor,
  getLinkSize,
  getNodeColor,
  getNodeValue,
  getProjectsQuery,
} from "../../helpers/GraphHelper";
import ComponentDetails from "../Details/ComponentDetails";
import Details from "../Details/Details";
import VulnerabilityDetails from "../Details/VulnerabilityDetails";
import NoProjectFoundError from "../Error/NoProjectFoundError";
import { GraphConfig } from "../Graph/GraphConfig";
import GraphControl from "../GraphControl/GraphControl";
import ImportForm from "../Import/ImportForm";
import Loading from "../Loading/Loading";
import Search from "../Search/Search";
import GraphContainer from "../Layout/GraphContainer";
import Sidebar from "../Layout/Sidebar";
import ProjectSelector from "./ProjectSelector";
import { DropdownItem } from "../Dropdown/Dropdown";
import ProjectVersionSelector from "./ProjectVersionSelector";
import { graphSelectedNode } from "../../types/colorPalette";
import usePrevious from "../../helpers/usePreviousHook";

const defaultGraphConfig: GraphConfig = {
  zoomLevel: 1,
  color: getNodeColor,
  label: "id",
  linkDirectionalArrowLength: 5,
  linkDirectionalRelPos: 0,
  linkLength: 10,
  nodeVal: 1,
  showOnlyVulnerable: false,
};

const Workspace = () => {
  const [node, setNode] = useState(undefined);
  const [graphConfig, setGraphConfig] =
    useState<GraphConfig>(defaultGraphConfig);
  const prevGraphConfig = usePrevious<GraphConfig>(graphConfig);
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [selectedProjectVersion, setSelectedProjectVersion] = useState<
    string | undefined
  >();
  const [getGraphData, { loading, error, data }] = useLazyQuery(
    getAllComponentsQuery
  );
  const router = useRouter();

  useEffect(() => {
    if (data) {
      console.log(data);
      setGraphData(formatData(data.projectVersions[0].allComponents));
    }
  }, [data]);
  useEffect(() => {
    console.log({
      event: "Workspace detected projectVersion change",
      data: selectedProjectVersion,
    });

    if (selectedProjectVersion) {
      console.log("Getting data");
      getGraphData({
        variables: { projectVersionId: selectedProjectVersion },
        // pollInterval: 1000,
      });
    }
  }, [selectedProjectVersion]);

  useEffect(() => {
    if (
      prevGraphConfig &&
      prevGraphConfig.showOnlyVulnerable !== graphConfig.showOnlyVulnerable
    )
      handleShowOnlyVulnerableToggle();
  }, [graphConfig]);

  const resetHighlight = (nodes: any[]) => {
    for (let index = 0; index < nodes.length; index++) {
      nodes[index].highlight = false;
    }
  };
  const handleNodeClick = (node) => {
    const p = findParentNodes(graphData.links, node.id);
    p.add(node.id);
    console.log(p);
    resetHighlight(graphData.nodes);
    p.forEach((item) => {
      const index = graphData.nodes.findIndex((n) => n.id == item);
      console.log({ item: item, index: index });
      if (index >= 0) graphData.nodes[index].highlight = true;
    });
    // Reset position
    node.fx = undefined;
    node.fy = undefined;
    setNode(node);
  };

  const handleShowOnlyVulnerableToggle = () => {
    if (!data) return;
    if (graphConfig.showOnlyVulnerable) {
      setGraphData(formatData(data.projectVersions[0].allVulnerableComponents));
    } else {
      setGraphData(formatData(data.projectVersions[0].allComponents));
    }
  };

  const handleSelectedSearchResult = (object) => {
    setNode(object);
  };

  const paintRing = useCallback(
    (currNode, ctx) => {
      if (node && node.id === currNode.id) {
        ctx.beginPath();
        ctx.arc(
          currNode.x,
          currNode.y,
          (Math.sqrt(currNode.size) * 4 + 1) | 1,
          0,
          2 * Math.PI,
          false
        );
        ctx.fillStyle = currNode === node ? graphSelectedNode : "";
        ctx.fill();
      }
    },
    [node]
  );

  const handleProjectVersion = (projectVersion: string) => {
    setSelectedProjectVersion(projectVersion);
  };

  if (!selectedProjectVersion)
    return (
      <ProjectVersionSelector onProjectVersionSelect={handleProjectVersion} />
    );
  return (
    <Container fluid>
      <Row className="workspace-main">
        <Sidebar>
          <ProjectVersionSelector
            onProjectVersionSelect={handleProjectVersion}
          />
          <Search
            objects={graphData.nodes}
            searchResultCallback={(obj) => handleSelectedSearchResult(obj)}
          />
          <GraphControl
            defaultGraphConfig={defaultGraphConfig}
            onGraphConfigChange={(val) => {
              setGraphConfig(val);
            }}
            onRefetchGraphClick={() => {
              getGraphData({
                variables: { projectId: selectedProjectVersion },
                fetchPolicy: "no-cache",
              });
            }}
          />
          {node && node.__typename === "Component" && (
            <ComponentDetails
              componentId={node.id}
              projectId={selectedProjectVersion}
            />
          )}
          {node && node.__typename === "Vulnerability" && (
            <VulnerabilityDetails vulnerabilityId={node.id} />
          )}

          {process.env.NODE_ENV === "development" && (
            <Details data={node} title="Development details" />
          )}
        </Sidebar>

        <GraphContainer
          nodeCanvasObject={paintRing}
          selectedNode={node}
          isLoading={loading}
          graphData={graphData}
          onNodeClick={(node) => handleNodeClick(node)}
          linkColor={(link) => getLinkColor(link)}
          linkWidth={(link) => getLinkSize(link)}
          graphConfig={graphConfig}
          onNodeDragEnd={(node) => {
            node.fx = node.x;
            node.fy = node.y;
          }}
        />
      </Row>
    </Container>
  );
};

export default Workspace;
