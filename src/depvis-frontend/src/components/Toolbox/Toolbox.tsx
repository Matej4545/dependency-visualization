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
          <button>Prepare data</button>
          {sbomStore.projects.records &&
            sbomStore.projects.records.map((r: any) => {
              return (
                <MyNode
                  id={r._fields[0].elementId}
                  name={r._fields[0].properties.name}
                  properties={r._fields[0].properties}
                  type={r._fields[0].labels[0]}
                ></MyNode>
              );
            })}
        </Tab>
      </Tabs>
    </Container>
  );
});
