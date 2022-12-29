import { useQuery } from "@apollo/client";
import { useEffect, useRef, useState } from "react";
import { Button, Col, Container, Row } from "react-bootstrap";
import {
  formatData,
  getAllComponentsQuery,
  getNodeColor,
  getNodeValue,
} from "../../helpers/GraphHelper";
import Details from "../Details/Details";
import NoSSRGraphWrapper from "../Graph/NoSSRGraphWrapper";

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
  const [graphDimensions, setGraphDimensions] = useState({
    width: 0,
    height: 0,
  });
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

  const graphRef = useRef();

  const setSize = () => {
    setGraphDimensions({
      width: graphRef.current && graphRef.current.clientWidth,
      height: window.innerHeight - 56,
    });
  };

  useEffect(() => {
    setSize();
    window.addEventListener("resize", setSize);
    return () => {
      window.removeEventListener("resize", setSize);
    };
  }, []);

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
        <Col
          className="workspace-fullscreen workspace-sidebar"
          xl={3}
          md={4}
          sm={5}
        >
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
        </Col>
        <Col className="workspace-graph-nospace" ref={graphRef}>
          {!loading && (
            <NoSSRGraphWrapper
              graphData={graphData}
              backgroundColor={"--bs-red"}
              width={graphDimensions.width}
              height={graphDimensions.height}
              nodeColor={(node) => {
                return getNodeColor(node);
              }}
              nodeVal={(node) => getNodeValue(node)}
              // nodeAutoColorBy={"__typename"}
              onNodeClick={(node) => {
                setNode(node);
              }}
            />
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default Workspace;
