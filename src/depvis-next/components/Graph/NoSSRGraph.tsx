import { forceCollide, forceManyBody, forceX, forceY } from "d3-force";
import { useEffect, useRef } from "react";
import ReactForceGraph2d, { ForceGraphMethods } from "react-force-graph-2d";

export default function NoSSRGraph(props) {
  const graphRef = useRef<ForceGraphMethods>();

  useEffect(() => {
    const r = graphRef.current;
    if (props.selectedNode) {
      console.log(props.selectedNode);
      r.centerAt(props.selectedNode.x, props.selectedNode.y, 1000);
    }
    r.d3Force(
      "collide",
      forceCollide(10)
        .radius((node) => node.size | 1)
        .strength(0.1)
    );
    r.d3Force("x", forceX());
    r.d3Force("y", forceY());
    r.d3Force("link")
      .distance(
        (link) => link.source.size + link.target.size + props.linkLength
      )
      .strength(1);
    r.d3Force("charge", forceManyBody().strength(-50));
  }, [props, graphRef]);

  return <ReactForceGraph2d {...props} ref={graphRef} />;
}
