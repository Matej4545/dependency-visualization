import { useLazyQuery, useQuery } from "@apollo/client";
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
import Dropdown from "../Dropdown/Dropdown";
import { GraphConfig } from "../Graph/GraphConfig";
import GraphControl from "../GraphControl/GraphControl";
import ImportForm from "../Import/ImportForm";
import Loading from "../Loading/Loading";
import Search from "../Search/Search";
import GraphContainer from "./GraphContainer";
import Sidebar from "./Sidebar";

const defaultGraphConfig: GraphConfig = {
  zoomLevel: 1,
  color: getNodeColor,
  label: "id",
  linkDirectionalArrowLength: 5,
  linkDirectionalRelPos: 0,
  linkLength: 10,
  nodeVal: getNodeValue,
};

const Workspace = () => {
  const [node, setNode] = useState(undefined);
  const [graphConfig, setGraphConfig] =
    useState<GraphConfig>(defaultGraphConfig);
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [selectedProject, setSelectedProject] = useState<string | undefined>();
  const [getGraphData, { loading, error, data }] = useLazyQuery(
    getAllComponentsQuery
  );
  const { data: projects, loading: projectsLoading } = useQuery(
    getProjectsQuery,
    {
      onCompleted: (data) => {
        if (data.projects.length > 0) {
          setSelectedProject(data.projects[0].id);
        } else {
          setSelectedProject(undefined);
        }
      },
    }
  );

  useEffect(() => {
    if (data) {
      setGraphData(formatData(data));
    }
  }, [data]);
  useEffect(() => {
    console.log(`Detected change, val ${selectedProject}`);

    if (selectedProject) {
      console.log("Getting data");
      getGraphData({ variables: { projectId: selectedProject } });
    }
  }, [selectedProject]);

  const handleNodeClick = (node) => {
    setNode(node);
  };

  const handleVuln = async () => {
    const res = await fetch("http://localhost:3000/api/vuln");
    console.log(res);
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
      if (node) {
        // add ring just for highlighted nodes
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.size | 1, 0, 2 * Math.PI, false);
        ctx.fillStyle = currNode === node ? "red" : "orange";
        ctx.fill();
      }
    },
    [node]
  );

  if (projectsLoading) return <Loading details="Loading projects" />;
  if (!selectedProject) return <ImportForm />;
  return (
    <Container fluid>
      <Row className="workspace-main">
        <Sidebar>
          <Dropdown
            title="Selected project"
            options={projects.projects}
            onChange={(e) => setSelectedProject(e)}
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
                variables: { projectId: selectedProject },
                fetchPolicy: "no-cache",
              });
            }}
          />
          {node && node.__typename === "Component" && (
            <ComponentDetails
              componentId={node.id}
              projectId={selectedProject}
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
