import { useEffect, useRef, useState } from "react";
import { Col, Container } from "react-bootstrap";
import GraphError from "../Error/GraphError";
import { GraphConfig } from "../Graph/GraphConfig";
import NoSSRGraphWrapper from "../Graph/NoSSRGraphWrapper";
import Loading from "../Loading/Loading";
const GraphContainer = (props) => {
  const [graphDimensions, setGraphDimensions] = useState({
    width: 0,
    height: 0,
  });
  const graphContainerRef = useRef<HTMLElement>();

  const setSize = () => {
    const size = {
      width: graphContainerRef.current
        ? graphContainerRef.current.clientWidth
        : window.innerWidth - document.getElementById("sidebar").offsetWidth,
      height: window.innerHeight - 56,
    };
    console.log(size);
    setGraphDimensions(size);
  };

  useEffect(() => {
    setSize();
    window.addEventListener("resize", setSize);
    return () => {
      window.removeEventListener("resize", setSize);
    };
  }, []);

  const graphConfig: GraphConfig = props.graphConfig;
  if (
    !props.isLoading &&
    (!props.graphData ||
      !props.graphData.nodes ||
      props.graphData.nodes.length == 0)
  )
    return (
      <Col>
        <GraphError message="No data" />
      </Col>
    );
  return (
    <Col className="workspace-graph-nospace" ref={graphContainerRef}>
      {props.isLoading && (
        <Container className="py-5">
          <Loading detail="Retrieving data from server" />
        </Container>
      )}
      {!props.isLoading && (
        <NoSSRGraphWrapper
          nodeCanvasObjectMode={() => "after"}
          linkLength={graphConfig.linkLength}
          {...props}
          width={graphDimensions.width}
          height={graphDimensions.height}
          nodeColor={graphConfig.color}
          nodeVal={graphConfig.nodeVal}
          linkDirectionalArrowLength={graphConfig.linkDirectionalArrowLength}
          linkDirectionalArrowRelPos={graphConfig.linkDirectionalArrowLength}
          label={graphConfig.label}
        />
      )}
    </Col>
  );
};

export default GraphContainer;
