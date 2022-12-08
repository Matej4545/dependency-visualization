import { forceCollide, forceManyBody, forceX, forceY } from "d3-force";
import { useCallback, useEffect, useRef } from "react";
import ReactForceGraph2d, { ForceGraphMethods } from "react-force-graph-2d";
import { SonatypeOSSVulnProvider } from "../../vulnerability-mgmt/SonatypeOSSVulnProvider";

const my_map = (value, x1, y1, x2, y2) =>
  ((value - x1) * (y2 - x2)) / (y1 - x1) + x2;

export default function NoSSRGraph(props) {
  const maxDepsCount = 262;
  const graphRef = useRef<ForceGraphMethods>();
  const f = new SonatypeOSSVulnProvider();

  useEffect(() => {
    const r = graphRef.current;
    r.zoomToFit();
    r.d3Force("collide", forceCollide(4));
    r.d3Force("x", forceX());
    r.d3Force("y", forceY());
    r.d3Force("link")
      .distance(
        (link) => 1 * (link.source.deps_count + link.target.deps_count * 2)
      )
      // .distance((link) => 1000)
      .strength(1);
    r.d3Force("charge", forceManyBody().strength(-70));
  }, []);
  const handleClick = useCallback(
    (node) => {
      // Aim at node from outside it
      graphRef.current.centerAt(node.x, node.y, 500);
      let zoom_level = 3 - node.deps_count / 100;
      if (zoom_level < 0.5) zoom_level = 0.5;
      graphRef.current.zoom(zoom_level, 500);
      console.log(node.neighbors);
      // f.fetchInfo(node.id);
    },
    [graphRef]
  );
  return (
    <ReactForceGraph2d
      ref={graphRef}
      nodeCanvasObjectMode={() => "after"}
      nodeCanvasObject={(node, ctx, globalScale) => {
        const label = `${node.name} | ${node.deps_count}`;
        const fontSize = my_map(node.deps_count, 0, maxDepsCount, 5, 22);
        ctx.font = `${fontSize}px Sans-Serif`;
        ctx.fillStyle = "#121212";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(label, node.x, node.y);
      }}
      {...props}
      linkDirectionalArrowLength={5}
      linkDirectionalArrowRelPos={3}
      nodeAutoColorBy={"__typename"}
      nodeLabel={"name"}
      nodeVal={"deps_count"}
      // backgroundColor={'#f0f0f0'}
      linkColor={"#ff0000"}
      onNodeClick={(n) => {
        handleClick(n);
      }}
    />
  );
}
