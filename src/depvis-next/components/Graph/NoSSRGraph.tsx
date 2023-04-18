import { forceCollide, forceManyBody, forceX, forceY } from "d3-force";
import { useEffect, useRef, useState } from "react";
import ReactForceGraph2d, { ForceGraphMethods } from "react-force-graph-2d";
import GraphFloatControl from "./GraphFloatControl";
import { Button } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEarth,
  faLocationCrosshairs,
  faMagnifyingGlassMinus,
  faMagnifyingGlassPlus,
} from "@fortawesome/free-solid-svg-icons";

export default function NoSSRGraph(props) {
  const graphRef = useRef<ForceGraphMethods>();
  const [currentZoom, setCurrentZoom] = useState({ k: 1, x: 0, y: 0 });
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
    const force = props.graphConfig.graphForce / 1000;
    r.d3Force("x", forceX().strength(force));
    r.d3Force("y", forceY().strength(force));
    r.d3Force("link")
      .distance((link) => link.source.size + link.target.size + 20)
      .strength(1 - props.linkLength / 100);
    r.d3Force("charge", forceManyBody().strength(-35));
  }, [props, graphRef]);

  const zoomToFit = () => {
    graphRef.current && graphRef.current.zoomToFit(500, 50);
  };

  return (
    <>
      <GraphFloatControl>
        <Button
          variant="hidden"
          onClick={() => {
            graphRef.current &&
              props.selectedNode &&
              graphRef.current.centerAt(
                props.selectedNode.x,
                props.selectedNode.y,
                500
              );
          }}
        >
          <FontAwesomeIcon icon={faLocationCrosshairs} />
        </Button>
        <Button
          variant="hidden"
          onClick={() => {
            const delta = currentZoom.k > 1 ? 2 : 0.2;
            graphRef.current &&
              graphRef.current.zoom(currentZoom.k + delta, 200);
          }}
        >
          <FontAwesomeIcon icon={faMagnifyingGlassPlus} />
        </Button>
        <Button
          variant="hidden"
          onClick={() => {
            const delta = currentZoom.k < 3 ? 0.2 : 2;
            graphRef.current &&
              graphRef.current.zoom(currentZoom.k - delta, 200);
          }}
        >
          <FontAwesomeIcon icon={faMagnifyingGlassMinus} />
        </Button>
        <Button
          variant="hidden"
          onClick={() => {
            zoomToFit();
          }}
        >
          <FontAwesomeIcon icon={faEarth} />
        </Button>
      </GraphFloatControl>
      <ReactForceGraph2d
        {...props}
        ref={graphRef}
        warmupTicks={100}
        onZoomEnd={(v) => {
          if (v.k != currentZoom.k) setCurrentZoom(v);
        }}
      />
    </>
  );
}
