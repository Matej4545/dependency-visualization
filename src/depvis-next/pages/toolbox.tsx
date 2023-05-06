import Link from "next/link";
import { useRouter } from "next/router";
import { PackageURL } from "packageurl-js";
import { useEffect, useState } from "react";
import {
  Button,
  Col,
  Container,
  Form,
  ProgressBar,
  Row,
  Stack,
} from "react-bootstrap";
import { ParsePurl } from "../components/Toolbox/ParsePurl";
import ProjectSelector from "../components/Workspace/ProjectSelector";

const Toolbox = () => {
  const [purlString, setPurlString] = useState("");
  const [purlOutput, setPurlOutput] = useState("");
  const handlePurl = async () => {
    setPurlOutput(JSON.stringify(PackageURL.fromString(purlString)));
    console.log(purlOutput);
  };
  const handleVuln = async () => {
    const res = await fetch("/api/vuln");
    console.log(res);
  };

  const router = useRouter();
  useEffect(() => {
    console.log(router);
    console.log(router.query);
  }, [router]);
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
      <Row>Query param is {router.query.test}</Row>
      <Row>
        <ProgressBar className="" animated now={45} label={`${45}%`} />
      </Row>
      <Row>
        <ProjectSelector />
      </Row>
    </Container>
  );
};
export default Toolbox;
