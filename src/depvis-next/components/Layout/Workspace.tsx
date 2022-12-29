import { useQuery } from "@apollo/client";
import { useState } from "react";
import { Button, Container, Row } from "react-bootstrap";
import { formatData, getAllComponentsQuery } from "../../helpers/GraphHelper";
import Details from "../Details/Details";
import GraphContainer from "./GraphContainer";
import Sidebar from "./Sidebar";

function genRandomTree() {
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

const Workspace = () => {
  const [node, setNode] = useState(undefined);
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { data, refetch } = useQuery(getAllComponentsQuery, {
    onCompleted: (data) => {
      setLoading(false);
      setGraphData(formatData(data));
    },
    onError: (err) => {
      setLoading(false);
      console.error(err);
      setError(err);
    },
  });

  const handleVuln = async () => {
    const res = await fetch("http://localhost:3000/api/vuln");
    console.log(res);
  };

  const handleRefetch = async () => {
    refetch();
  };

  return (
    <Container fluid>
      <Row className="workspace-main">
        <Sidebar>
          <Row fluid id="control">
            <p>Select project</p>
            <p>Filter views</p>
            <Button
              onClick={() => {
                handleVuln();
              }}
            >
              Update Vulnerabilities
            </Button>
            <Button
              onClick={() => {
                handleRefetch();
              }}
            >
              Refetch graph
            </Button>
          </Row>
          <Row>
            <Details data={node} />
          </Row>
        </Sidebar>
        <GraphContainer
          isLoading={loading}
          graphData={graphData}
          onNodeClick={(node) => setNode(node)}
        />
      </Row>
    </Container>
  );
};

export default Workspace;
