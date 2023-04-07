import { OverlayTrigger, Stack, Tooltip } from "react-bootstrap";
import {
  graphExcludedNode,
  graphHighlightedLink,
  graphHighlightedNode,
  graphLink,
  graphNode,
  graphSelectedNode,
  vulnerabilityCriticalColor,
  vulnerabilityHighColor,
  vulnerabilityLowColor,
  vulnerabilityMediumColor,
} from "../../types/colorPalette";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircle } from "@fortawesome/free-solid-svg-icons";

const Legend = () => {
  const vulnItems = [
    { color: vulnerabilityCriticalColor, label: "Critical vulnerability" },
    { color: vulnerabilityHighColor, label: "High vulnerability" },
    { color: vulnerabilityMediumColor, label: "Medium vulnerability" },
    { color: vulnerabilityLowColor, label: "Low vulnerability" },
  ];
  const nodeItems = [
    { color: graphNode, label: "Node" },
    { color: graphSelectedNode, label: "Selected node" },
    { color: graphHighlightedNode, label: "Highlighted node" },
    { color: graphExcludedNode, label: "Excluded node" },
  ];
  const linkItems = [
    { color: graphLink, label: "Link" },
    { color: graphHighlightedLink, label: "Highlighted Link" },
  ];

  const controlItems = [
    { action: "Zoom In / Out", command: "Mouse wheel up / down" },
    {
      action: "Move node",
      command: "Mouse click and drag",
      tooltip:
        "Node will stay in a fixed spot. You can unfix it by clicking on it.",
    },
    {
      action: "Open information",
      command: "Mouse click",
      tooltip:
        "By clicking on node, a path from the node to root node will be highlighted.",
    },
  ];

  const mapItems = (items) => {
    return items.map((n) => {
      return (
        <Stack id={n.color} direction="horizontal">
          <FontAwesomeIcon
            icon={faCircle}
            color={n.color}
            className="mx-2 my-1"
            size="lg"
          />
          <span>{n.label}</span>
        </Stack>
      );
    });
  };

  const mapControlItems = () => {
    return controlItems.map((c) => {
      return (
        <OverlayTrigger
          placement="right"
          overlay={
            c.tooltip ? <Tooltip id="tooltip">{c.tooltip}</Tooltip> : <></>
          }
        >
          <Stack id={c.action} direction="horizontal">
            <span style={{ fontWeight: "600" }} className="mx-`">
              {c.action}:
            </span>
            <span>{c.command}</span>
          </Stack>
        </OverlayTrigger>
      );
    });
  };
  return (
    <>
      <strong>Nodes</strong>
      {mapItems(nodeItems)}
      <strong>Links</strong>
      {mapItems(linkItems)}
      <strong>Vulnerabilities</strong>
      {mapItems(vulnItems)}
      <strong>Navigating graph</strong>
      {mapControlItems()}
    </>
  );
};
export default Legend;
