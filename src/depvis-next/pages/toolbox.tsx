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
import ListItem from "../components/Listing/ListItem";
import List from "../components/Listing/List";

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
      {/* <Row>
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
      </Row> */}
      <Row>
        <List listItems={demoItems(10)} />
        {/* <ListItem
          item={demoItems()}
          editAction={testFn}
          deleteAction={testFn}
          viewAction={testFn}
        /> */}
      </Row>
    </Container>
  );
};
export default Toolbox;

const demoItems = (length) => {
  const text = () => Math.random().toString(36).slice(2, 10);
  let res = [];
  for (let index = 0; index < length; index++) {
    res.push({ name: `test-${index}`, detail: text(), id: index });
  }
  return res;
};

const testFn = (input) => {
  alert(input);
};
