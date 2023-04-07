import { useEffect, useRef, useState } from "react";
import { Col, Container } from "react-bootstrap";
import { ForceGraphMethods } from "react-force-graph-2d";
import { getNodeColor, getNodeValue } from "../../helpers/GraphHelper";
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
    setGraphDimensions({
      width: graphContainerRef.current && graphContainerRef.current.clientWidth,
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

  const graphConfig: GraphConfig = props.graphConfig;
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
