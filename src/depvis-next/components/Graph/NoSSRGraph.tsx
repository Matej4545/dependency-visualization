import { forceCollide, forceManyBody, forceX, forceY } from "d3-force";
import { useEffect, useRef } from "react";
import ReactForceGraph2d, { ForceGraphMethods } from "react-force-graph-2d";

export default function NoSSRGraph(props) {
  const graphRef = useRef<ForceGraphMethods>();
  useEffect(() => {
    const r = graphRef.current;
    r.d3ReheatSimulation();
    if (props.selectedNode) {
      r.centerAt(props.selectedNode.x, props.selectedNode.y, 1000);
    }
    r.d3Force(
      "collide",
      forceCollide()
        .radius((node) => node.size | 1)
        .strength(0.1)
    );
    r.d3Force("x", forceX().strength(0.1));
    r.d3Force("y", forceY().strength(0.1));
    r.d3Force("link")
      .distance((link) => link.source.size + link.target.size)
      .strength(1 - props.linkLength / 100);
    r.d3Force("charge", forceManyBody().strength(-40));
  }, [props, graphRef]);
  return <ReactForceGraph2d {...props} ref={graphRef} warmupTicks={100} />;
}
