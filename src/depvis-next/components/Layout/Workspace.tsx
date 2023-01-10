import { useLazyQuery, useQuery } from '@apollo/client';
import { useEffect, useState } from 'react';
import { Button, Container, Form, Row } from 'react-bootstrap';
import { formatData, getAllComponentsQuery, getProjectsQuery } from '../../helpers/GraphHelper';
import Details from '../Details/Details';
import Dropdown from '../Dropdown/Dropdown';
import ImportForm from '../Import/ImportForm';
import Loading from '../Loading/Loading';
import Search from '../Search/Search';
import GraphContainer from './GraphContainer';
import Sidebar from './Sidebar';

const Workspace = () => {
  const [node, setNode] = useState(undefined);
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [selectedProject, setSelectedProject] = useState<string | undefined>();
  const [getGraphData, { loading, error, data }] = useLazyQuery(getAllComponentsQuery);
  const { data: projects, loading: projectsLoading } = useQuery(getProjectsQuery, {
    onCompleted: (data) => {
      if (data.projects.length > 0) {
        setSelectedProject(data.projects[0].id);
      } else {
        setSelectedProject(undefined);
      }
    },
  });

  useEffect(() => {
    if (data) {
      setGraphData(formatData(data));
    }
  }, [data]);
  useEffect(() => {
    console.log(`Detected change, val ${selectedProject}`);

    if (selectedProject) {
      console.log('Getting data');
      getGraphData({ variables: { projectId: selectedProject } });
    }
  }, [selectedProject]);

  const handleVuln = async () => {
    const res = await fetch('http://localhost:3000/api/vuln');
    console.log(res);
  };

  // const handleRefetch = async () => {
  //   refetch();
  // };
  if (projectsLoading) return <Loading details="Loading projects" />;
  if (!selectedProject) return <ImportForm />;
  return (
    <Container fluid>
      <Row className="workspace-main">
        <Sidebar>
          <Container fluid id="control">
            <Search />

            <Dropdown title="Project" options={projects.projects} onChange={(e) => setSelectedProject(e)} />
            <Button
              onClick={() => {
                handleVuln();
              }}
            >
              Update Vulnerabilities
            </Button>
            <Button
              onClick={() => {
                getGraphData({
                  variables: { projectId: selectedProject },
                  fetchPolicy: 'no-cache',
                });
              }}
            >
              Refetch graph
            </Button>
          </Container>
          <Row>
            <Details data={node} />
          </Row>
        </Sidebar>
        {!loading && <GraphContainer isLoading={loading} graphData={graphData} onNodeClick={(node) => setNode(node)} />}
      </Row>
    </Container>
  );
};

export default Workspace;
