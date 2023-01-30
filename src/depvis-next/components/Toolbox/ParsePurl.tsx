import { PackageURL } from 'packageurl-js';
import { useState } from 'react';
import { Alert, Button, Col, Container, Form, Row, Stack } from 'react-bootstrap';
import Details from '../Details/Details';

export const ParsePurl = () => {
  const [purlString, setPurlString] = useState('');
  const [purlOutput, setPurlOutput] = useState<PackageURL>();
  const [error, setError] = useState('');
  const handlePurl = () => {
    setError('');
    try {
      setPurlOutput(PackageURL.fromString(purlString));
    } catch (e) {
      setError(e.message);
      setPurlOutput(null);
    }
  };
  return (
    <Container>
      <h3>Purl parser</h3>
      <p>
        Simple tool to show how <code>PackageUrl</code> parse PURL string
      </p>
      <Stack gap={2}>
        <Form>
          <Row>
            <Col>
              <Form.Control
                type="text"
                placeholder="Enter Purl identifier"
                onChange={(e) => {
                  setPurlString(e.target.value.trim());
                }}
                value={purlString}
              />
            </Col>
            <Col xs="auto">
              <Button
                onClick={() => {
                  handlePurl();
                }}
              >
                Submit
              </Button>
            </Col>
          </Row>
        </Form>
        {error && <Alert variant="danger">Parsing failed due to following error: {error}</Alert>}
        {purlOutput && <Details title="Parsed Purl" data={purlOutput} className="my-2" />}
      </Stack>
    </Container>
  );
};
