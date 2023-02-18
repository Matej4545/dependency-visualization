import { useLazyQuery, useQuery } from '@apollo/client';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useState } from 'react';
import { Container, Row } from 'react-bootstrap';
import {
  formatData,
  getAllComponentsQuery,
  getNodeColor,
  getNodeValue,
  getProjectsQuery,
} from '../../helpers/GraphHelper';
import ComponentDetails from '../Details/ComponentDetails';
import Details from '../Details/Details';
import VulnerabilityDetails from '../Details/VulnerabilityDetails';
import Dropdown from '../Dropdown/Dropdown';
import NoProjectFoundError from '../Error/NoProjectFoundError';
import { GraphConfig } from '../Graph/GraphConfig';
import GraphControl from '../GraphControl/GraphControl';
import ImportForm from '../Import/ImportForm';
import Loading from '../Loading/Loading';
import Search from '../Search/Search';
import GraphContainer from './GraphContainer';
import Sidebar from './Sidebar';

const defaultGraphConfig: GraphConfig = {
  zoomLevel: 1,
  color: getNodeColor,
  label: 'id',
  linkDirectionalArrowLength: 5,
  linkDirectionalRelPos: 0,
  linkLength: 10,
  nodeVal: getNodeValue,
  showOnlyVulnerable: false,
};

const Workspace = () => {
  const [node, setNode] = useState(undefined);
  const [graphConfig, setGraphConfig] = useState<GraphConfig>(defaultGraphConfig);
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [selectedProject, setSelectedProject] = useState<string | undefined>();
  const [getGraphData, { loading, error, data }] = useLazyQuery(getAllComponentsQuery);
  const { data: projects, loading: projectsLoading } = useQuery(getProjectsQuery, {
    onCompleted: (data) => {
      const project = selectProject(data.projects, router.query.projectName);
      console.log(project);
      setSelectedProject(project);
    },
  });
  const router = useRouter();

  useEffect(() => {
    if (data) {
      setGraphData(formatData(data.projects[0].allComponents));
    }
  }, [data]);
  useEffect(() => {
    console.log(`Detected change, val ${selectedProject}`);

    if (selectedProject) {
      console.log('Getting data');
      getGraphData({ variables: { projectId: selectedProject }, pollInterval: 1000 });
    }
  }, [selectedProject]);
  useEffect(() => {
    handleShowOnlyVulnerableToggle();
  }, [graphConfig]);

  const handleNodeClick = (node) => {
    setNode(node);
  };

  const handleShowOnlyVulnerableToggle = () => {
    if (!data) return;
    if (graphConfig.showOnlyVulnerable) {
      setGraphData(formatData(data.projects[0].allVulnerableComponents));
    } else {
      setGraphData(formatData(data.projects[0].allComponents));
    }
  };

  const handleSelectedSearchResult = (object) => {
    setNode(object);
  };

  const handleNodeValToggle = (e) => {
    if (typeof graphConfig.nodeVal === 'function') {
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
        ctx.fillStyle = currNode === node ? 'red' : 'orange';
        ctx.fill();
      }
    },
    [node]
  );

  if (projectsLoading) return <Loading details="Loading projects" />;
  if (!selectedProject) return <NoProjectFoundError />;
  return (
    <Container fluid>
      <Row className="workspace-main">
        <Sidebar>
          <Dropdown
            title="Selected project"
            options={projects.projects}
            onChange={(e) => setSelectedProject(e)}
            default={selectedProject}
          />

          <Search objects={graphData.nodes} searchResultCallback={(obj) => handleSelectedSearchResult(obj)} />
          <GraphControl
            defaultGraphConfig={defaultGraphConfig}
            onGraphConfigChange={(val) => {
              setGraphConfig(val);
            }}
            onRefetchGraphClick={() => {
              getGraphData({
                variables: { projectId: selectedProject },
                fetchPolicy: 'no-cache',
              });
            }}
          />
          {node && node.__typename === 'Component' && (
            <ComponentDetails componentId={node.id} projectId={selectedProject} />
          )}
          {node && node.__typename === 'Vulnerability' && <VulnerabilityDetails vulnerabilityId={node.id} />}

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

const selectProject = (projects, queryProjectName) => {
  if (!queryProjectName || projects.filter((p) => p.name === queryProjectName).length == 0) return projects[0].id;
  return projects.filter((p) => p.name === queryProjectName)[0].id;
};
