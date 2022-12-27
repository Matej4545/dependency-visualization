import { useQuery } from "@apollo/client";
import { useEffect, useRef, useState } from "react";
import { Col, Container, Row } from "react-bootstrap";
import { formatData, getAllComponentsQuery } from "../../helpers/GraphHelper";
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

  const { data } = useQuery(getAllComponentsQuery, {
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
  return (
    <Container fluid>
      <Row>
        <Col className="border-box" xl={3} md={4} sm={5}>
          <Container fluid>
            <h5>Sidebar</h5>
            <p>Search</p>
            <p>Select project</p>
            <p>Filter views</p>
            <Container>
              <Details data={node} />
            </Container>
          </Container>
        </Col>
        <Col className="border-box" ref={graphRef}>
          <Container fluid>
            {!loading && (
              <NoSSRGraphWrapper
                graphData={graphData}
                backgroundColor={"#cccccc"}
                width={graphDimensions.width}
                height={graphDimensions.height}
                onNodeClick={(node) => {
                  setNode(node);
                }}
              />
            )}
          </Container>
        </Col>
      </Row>
    </Container>
  );
};

export default Workspace;
