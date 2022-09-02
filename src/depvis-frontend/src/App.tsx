import React, { useState } from 'react';
import { Button, Col, Container, Form, Row } from 'react-bootstrap';
import { useLazyReadCypher, useReadCypher } from 'use-neo4j';
import './App.css';

const App = () => {
  const query = 'MATCH (n:Person)-[:KNOWS]->(m:Person) WHERE n.name = $name RETURN n,m';
  const [name, setName] = useState('Matej');
  const { loading, records, run } = useReadCypher(query);
  const [data, setData] = useState<any>();

  const runQuery = () => {
    run({ name: name });
  };

  return loading ? (
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
      {records ? (
        records.map((d: any) => (
          <Row>
            {/* <pre>{JSON.stringify(d._fields, null, 4)}</pre> */}
            <p>
              {d._fields[0].properties.name} knows {d._fields[1].properties.name}
            </p>
            <hr />
          </Row>
        ))
      ) : (
        <div>No data</div>
      )}
    </Container>
  );
};

export default App;
