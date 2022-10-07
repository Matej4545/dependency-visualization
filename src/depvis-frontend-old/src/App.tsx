import { observer } from 'mobx-react-lite';
import React, { useState } from 'react';
import { Button, Col, Container, Form, Row } from 'react-bootstrap';
import './App.css';

import { useSbomStore } from './providers/SbomProvider';

const App = observer(() => {
  const query = 'MATCH (n:Person) WHERE n.name = $name RETURN n';
  const [name, setName] = useState('Matej');
  const [response, setResponse] = useState('');
  const sbomStore = useSbomStore();

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
          <Button variant="secondary" onClick={() => {}}>
            Run query
          </Button>
        </Col>
      </Row>
      <Row>{response}</Row>
      {sbomStore.project ? (
        sbomStore.project.map((d: any) => (
          <Row>
            <pre>{d}</pre>
            <hr />
          </Row>
        ))
      ) : (
        <div>No data</div>
      )}
    </Container>
  );
});

export default App;
