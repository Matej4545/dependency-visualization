import { PackageURL } from "packageurl-js";
import { useState } from "react";
import { Button, Col, Container, Row, Stack } from "react-bootstrap";
import { ParsePurl } from "../components/Toolbox/ParsePurl";

const Toolbox = () => {
  const [purlString, setPurlString] = useState("");
  const [purlOutput, setPurlOutput] = useState("");
  const handlePurl = async () => {
    setPurlOutput(await JSON.stringify(PackageURL.fromString(purlString)));
    console.log(purlOutput);
  };
  const handleVuln = async () => {
    const res = await fetch("http://localhost:3000/api/vuln");
    console.log(res);
  };
  return (
    <Container className="mx-5 my-2">
      <Row>
        <Col xs="auto">
          <h3>Generic actions</h3>
          <Stack gap={2}>
            <Button onClick={() => handleVuln()}>Update vulnerabilities</Button>
          </Stack>
        </Col>
      </Row>

      <hr />
      <Row>
        <Col xs="auto">
          <ParsePurl />
        </Col>
      </Row>
    </Container>
  );
};
export default Toolbox;
