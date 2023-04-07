import { useEffect, useState } from "react";
import { Button, Container, Form, Stack } from "react-bootstrap";
import { getNodeValue } from "../../helpers/GraphHelper";
import { GraphConfig } from "../Graph/GraphConfig";

const GraphControl = (props) => {
  const { defaultGraphConfig, onRefetchGraphClick } = props;

  const [graphConfig, setGraphConfig] =
    useState<GraphConfig>(defaultGraphConfig);

  useEffect(() => {
    props.onGraphConfigChange(graphConfig);
    console.log(graphConfig);
  }, [graphConfig]);

  const handleNodeValToggle = (e) => {
    console.log(e);
    if (typeof graphConfig.nodeVal === "function") {
      setGraphConfig({ ...graphConfig, nodeVal: 1 });
    } else {
      setGraphConfig({ ...graphConfig, nodeVal: getNodeValue });
    }
  };

  const handleShowOnlyVulnerableToggle = (e) => {
    setGraphConfig({
      ...graphConfig,
      showOnlyVulnerable: !graphConfig.showOnlyVulnerable,
    });
  };

  return (
    <Container id="control" className="px-0">
      <Stack direction="horizontal">
        <Form.Label>Size by dependencies</Form.Label>
        <Form.Check
          className="ms-auto"
          type="switch"
          onChange={(e) => {
            handleNodeValToggle(e);
          }}
          checked={typeof graphConfig.nodeVal === "function"}
        />
      </Stack>
      <Stack direction="horizontal">
        <Form.Label>Show only affected components</Form.Label>
        <Form.Check
          className="ms-auto"
          type="switch"
          onChange={(e) => {
            handleShowOnlyVulnerableToggle(e);
          }}
          checked={graphConfig.showOnlyVulnerable as boolean}
        />
      </Stack>
      <Form.Label>Length of links</Form.Label>
      <Form.Range
        onChange={(e) => {
          setGraphConfig({
            ...graphConfig,
            linkLength: parseInt(e.target.value, 10),
          });
        }}
      />
      <Stack gap={2}>
        <Button
          onClick={() => {
            onRefetchGraphClick();
          }}
        >
          Refetch graph
        </Button>
      </Stack>
    </Container>
  );
};

export default GraphControl;
