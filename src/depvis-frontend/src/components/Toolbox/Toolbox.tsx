import { observer } from 'mobx-react-lite';
import React, { useEffect, useState } from 'react';
import { Container, Tab, Tabs } from 'react-bootstrap';
import { useSbomStore } from '../../providers/SbomProvider';
import { MyNode, INodeProps } from '../Node/MyNode';

export const Toolbox = observer(() => {
  const [query, setQuery] = useState('match (p) return p');
  const [nodes, setNodes] = useState<any>([]);
  const sbomStore = useSbomStore();

  const handleSubmit = () => {
    sbomStore.runQuery(query);
  };

  const matchNode = (node: INodeProps) => {
    if (!nodes.includes(node)) {
      setNodes([node, ...nodes]);
    }
  };
  console.log(sbomStore.projects);
  return (
    <Container>
      <h2>Test queries</h2>
      <input
        type="text"
        onChange={(e) => {
          setQuery(e.target.value || '');
        }}
        value={query}
      />
      <button
        onClick={() => {
          handleSubmit();
        }}
      >
        Send query
      </button>
      <Tabs>
        <Tab eventKey="json" title="Json">
          <pre>{sbomStore.json ? sbomStore.json : ''}</pre>
        </Tab>
        <Tab eventKey="node" title="Node" style={{ display: 'flex', flexWrap: 'wrap' }}>
          {sbomStore.projects &&
            sbomStore.projects.map((r: any) => {
              return <MyNode id={r.Id} name={r.name} properties={r.properties} type={r.label}></MyNode>;
            })}
        </Tab>
      </Tabs>
    </Container>
  );
});
