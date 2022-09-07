import React, { useState } from 'react';
import { Button, Col, Container, Form, Row } from 'react-bootstrap';
import { useLazyReadCypher, useReadCypher } from 'use-neo4j';
import './App.css';

import { useSbomStore } from './providers/SbomProvider';

const App = () => {
  const query = 'MATCH (n:Person)-[:KNOWS]->(m:Person) WHERE n.name = $name RETURN n,m';
  const [name, setName] = useState('Matej');
  const [response, setResponse] = useState('');
  const sbomStore = useSbomStore();
  const runQuery = () => {
    setResponse(sbomStore.executeReadQuery(name));
  };

  return sbomStore.isLoading ? (
    <div>Loading</div>
  ) : (
    <Container className="p-5">
      <Row>
        <Col xs={10}>
          <Form.Control
            type="text"
            onChange={(e) => setName(e.target.value)}
            placeholder="Write query here..."
            value={name}
          ></Form.Control>
        </Col>
        <Col xs={2}>
          <Button variant="secondary" onClick={() => runQuery()}>
            Run query
          </Button>
        </Col>
      </Row>
      <Row>{response}</Row>
      {/* {records ? (
        records.map((d: any) => (
          <Row>
            <p>
              {d._fields[0].properties.name} knows {d._fields[1].properties.name}
            </p>
            <hr />
          </Row>
        ))
      ) : (
        <div>No data</div>
      )} */}
    </Container>
  );
};

export default App;
