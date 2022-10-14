import dynamic from 'next/dynamic';

const NoSSRGraphComponent = dynamic(() => import('react-force-graph-2d'), { ssr: false });

export default function NoSSRGraph(props) {
  return (
    <NoSSRGraphComponent
      {...props}
      linkDirectionalArrowLength={3.5}
      linkDirectionalArrowRelPos={1}
      nodeLabel={'name'}
      nodeVal={'deps_count'}
      // backgroundColor={'#f0f0f0'}
      linkColor={'#ff0000'}
    />
  );
}
