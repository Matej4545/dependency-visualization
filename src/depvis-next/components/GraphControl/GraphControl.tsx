import { useEffect, useState } from "react";
import {
  Button,
  Container,
  Form,
  OverlayTrigger,
  Stack,
  Tooltip,
} from "react-bootstrap";
import { getNodeValue } from "../../helpers/GraphHelper";
import { GraphConfig } from "../Graph/GraphConfig";

const GraphControl = (props) => {
  const { defaultGraphConfig, onRefetchGraphClick } = props;

  const [graphConfig, setGraphConfig] =
    useState<GraphConfig>(defaultGraphConfig);
  const [vulnFetch, setVulnFetch] = useState(false);

  //Callback to parent component when the config change
  useEffect(() => {
    props.onGraphConfigChange(graphConfig);
  }, [graphConfig]);

  const handleNodeValToggle = (e) => {
    e.preventDefault();
    if (typeof graphConfig.nodeVal === "function") {
      setGraphConfig({ ...graphConfig, nodeVal: 1 });
    } else {
      setGraphConfig({ ...graphConfig, nodeVal: getNodeValue });
    }
  };

  const handleShowOnlyVulnerableToggle = (e) => {
    e.preventDefault();
    setGraphConfig({
      ...graphConfig,
      showOnlyVulnerable: !graphConfig.showOnlyVulnerable,
    });
  };

  const handleShowConnectNodesToRoot = (e) => {
    e.preventDefault();
    setGraphConfig({
      ...graphConfig,
      connectNodesToRoot: !graphConfig.connectNodesToRoot,
    });
  };
  async function onRefetchVulnsClick() {
    setVulnFetch(true);
    fetch("/api/vuln").then(() => {
      setVulnFetch(false);
    });
  }

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
      <OverlayTrigger
        placement="right"
        overlay={
          <Tooltip id="tooltip">
            This option will switch between all components and only those which
            contain vulnerability. In case there is no direct link between
            vulnerable component and root node this option might not work as
            expected.
          </Tooltip>
        }
      >
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
      </OverlayTrigger>
      <OverlayTrigger
        placement="right"
        overlay={
          <Tooltip id="tooltip">
            Useful if project does not contain root component. This option will
            connect any free floating component that has no dependents to root
            node.
          </Tooltip>
        }
      >
        <Stack direction="horizontal">
          <Form.Label>Connect all direct dependencies to root node</Form.Label>
          <Form.Check
            className="ms-auto"
            type="switch"
            onChange={(e) => {
              handleShowConnectNodesToRoot(e);
            }}
            checked={graphConfig.connectNodesToRoot as boolean}
          />
        </Stack>
      </OverlayTrigger>
      <OverlayTrigger
        placement="right"
        overlay={
          <Tooltip id="tooltip">
            Useful for complex graph. Determines the lengths of links between
            nodes.
          </Tooltip>
        }
      >
        <Stack direction="horizontal">
          <Form.Label>Length of links</Form.Label>
          <Form.Range
            onChange={(e) => {
              setGraphConfig({
                ...graphConfig,
                linkLength: parseInt(e.target.value, 10),
              });
            }}
            style={{ width: "50%" }}
            className="mx-2"
          />
          <span>{graphConfig.linkLength} %</span>
        </Stack>
      </OverlayTrigger>
      <OverlayTrigger
        placement="right"
        overlay={
          <Tooltip id="tooltip">
            Sets how much are nodes pulled to the centre of graph.
          </Tooltip>
        }
      >
        <Stack direction="horizontal">
          <Form.Label>Force strength</Form.Label>
          <Form.Range
            onChange={(e) => {
              setGraphConfig({
                ...graphConfig,
                graphForce: parseInt(e.target.value, 10),
              });
            }}
            style={{ width: "50%" }}
            className="mx-2"
          />
          <span>{graphConfig.graphForce} %</span>
        </Stack>
      </OverlayTrigger>
      <Stack gap={2}>
        <Button
          onClick={() => {
            onRefetchGraphClick();
          }}
        >
          Refetch graph
        </Button>
        <Button
          onClick={() => {
            onRefetchVulnsClick();
          }}
          disabled={vulnFetch}
        >
          {vulnFetch
            ? "Fetching..."
            : "Refetch vulnerabilities for all components"}
        </Button>
      </Stack>
    </Container>
  );
};

export default GraphControl;
