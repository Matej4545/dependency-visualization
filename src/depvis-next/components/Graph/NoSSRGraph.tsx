import dynamic from 'next/dynamic';
import { useCallback, useRef } from 'react';
import { Button } from 'react-bootstrap';
import ReactForceGraph2d, { ForceGraphMethods } from 'react-force-graph-2d';

export default function NoSSRGraph(props) {
  const graphRef = useRef<ForceGraphMethods>();

  const handleClick = useCallback(
    (node) => {
      // Aim at node from outside it
      console.log(node);
      graphRef.current.centerAt(node.x, node.y, 500);
      let zoom_level = 3 - node.deps_count / 100;
      if (zoom_level < 0.5) zoom_level = 0.5;
      graphRef.current.zoom(zoom_level, 500);
      console.log(zoom_level);
    },
    [graphRef]
  );
  return (
    <ReactForceGraph2d
      ref={graphRef}
      {...props}
      linkDirectionalArrowLength={5}
      linkDirectionalArrowRelPos={3}
      nodeLabel={'name'}
      nodeVal={'deps_count'}
      // backgroundColor={'#f0f0f0'}
      linkColor={'#ff0000'}
      onNodeClick={handleClick}
    />
  );
}
