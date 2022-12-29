import { useEffect, useRef, useState } from "react";
import { Col } from "react-bootstrap";
import { getNodeColor, getNodeValue } from "../../helpers/GraphHelper";
import NoSSRGraphWrapper from "../Graph/NoSSRGraphWrapper";
import Loading from "../Loading/Loading";
const GraphContainer = (props) => {
  const [graphDimensions, setGraphDimensions] = useState({
    width: 0,
    height: 0,
  });
  const graphRef = useRef<HTMLElement>();

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
    <Col className="workspace-graph-nospace" ref={graphRef}>
      {props.isLoading && <Loading detail="Retrieving data from server" />}
      {!props.isLoading && (
        <NoSSRGraphWrapper
          {...props}
          width={graphDimensions.width}
          height={graphDimensions.height}
          nodeColor={(node) => getNodeColor(node)}
          nodeVal={(node) => getNodeValue(node)}
        />
      )}
    </Col>
  );
};

export default GraphContainer;
