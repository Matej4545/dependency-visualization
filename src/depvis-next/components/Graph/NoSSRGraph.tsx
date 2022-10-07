import dynamic from 'next/dynamic';
import { useQuery, gql } from '@apollo/client';
import { useState } from 'react';

const getAllComponentsQuery = gql`
  {
    components {
      name
      deps_count
      __typename
      purl
      version
      depends_on {
        purl
      }
    }
  }
`;

const NoSSRGraphComponent = dynamic(() => import('react-force-graph-2d'), { ssr: false });

const formatData = (data) => {
  const nodes = [];
  const links = [];
  console.log(data);
  if (!data.components) return { nodes, links };
  data.components.forEach((c) => {
    nodes.push({
      id: c.purl,
      name: c.name,
      deps_count: c.deps_count,
      __typename: c.__typename,
    });
    if (c.depends_on) {
      c.depends_on.forEach((d) => {
        links.push({
          source: c.purl,
          target: d.purl,
        });
      });
    }
  });

  return { nodes, links };
};

export default function NoSSRGraph(props) {
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });

  const { data } = useQuery(getAllComponentsQuery, {
    onCompleted: (data) => setGraphData(formatData(data)),
  });
  return (
    <NoSSRGraphComponent
      graphData={graphData}
      {...props}
      linkDirectionalArrowLength={3.5}
      linkDirectionalArrowRelPos={1}
      nodeLabel={'name'}
      nodeVal={'deps_count'}
      backgroundColor={'#f0f0f0'}
      linkColor={'#ff0000'}
    />
  );
}
