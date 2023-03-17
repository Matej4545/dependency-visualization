import { useLazyQuery, useQuery } from "@apollo/client";
import Link from "next/link";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import { Container, Row } from "react-bootstrap";
import {
  formatData,
  getAllComponentsQuery,
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

const defaultGraphConfig: GraphConfig = {
  zoomLevel: 1,
  color: getNodeColor,
  label: "id",
  linkDirectionalArrowLength: 5,
  linkDirectionalRelPos: 0,
  linkLength: 10,
  nodeVal: getNodeValue,
  showOnlyVulnerable: false,
};

const Workspace = () => {
  const [node, setNode] = useState(undefined);
  const [graphConfig, setGraphConfig] =
    useState<GraphConfig>(defaultGraphConfig);
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
    console.log(`Detected change, val ${selectedProjectVersion}`);

    if (selectedProjectVersion) {
      console.log("Getting data");
      getGraphData({
        variables: { projectVersionId: selectedProjectVersion },
        pollInterval: 1000,
      });
    }
  }, [selectedProjectVersion]);
  useEffect(() => {
    handleShowOnlyVulnerableToggle();
  }, [graphConfig]);

  const handleNodeClick = (node) => {
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

  const handleNodeValToggle = (e) => {
    if (typeof graphConfig.nodeVal === "function") {
      setGraphConfig({ ...graphConfig, nodeVal: 1 });
      console.log(graphConfig);
    } else {
      setGraphConfig({ ...graphConfig, nodeVal: getNodeValue });
    }
  };

  const paintRing = useCallback(
    (currNode, ctx) => {
      ctx.beginPath();
      ctx.arc(
        currNode.x,
        currNode.y,
        (Math.sqrt(currNode.size) * 4 + 1) | 1,
        0,
        2 * Math.PI,
        false
      );
      ctx.fillStyle = currNode === node ? "red" : "";
      ctx.fill();
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

          <Details data={node} title="Development details" />
        </Sidebar>
        {!loading && (
          <GraphContainer
            nodeCanvasObject={paintRing}
            selectedNode={node}
            isLoading={loading}
            graphData={graphData}
            onNodeClick={(node) => handleNodeClick(node)}
            graphConfig={graphConfig}
          />
        )}
      </Row>
    </Container>
  );
};

export default Workspace;
