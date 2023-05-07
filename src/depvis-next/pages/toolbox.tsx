import { useRouter } from "next/router";
import { useEffect } from "react";
import {
  Button,
  Col,
  Container,
  ProgressBar,
  Row,
  Stack,
} from "react-bootstrap";
import { ParsePurl } from "../components/Toolbox/ParsePurl";
import ProjectSelector from "../components/Workspace/ProjectSelector";

const Toolbox = () => {
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
