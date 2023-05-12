import { OverlayTrigger, Stack, Tooltip } from "react-bootstrap";

/**
 * DataItem Wrapper
 * @param props React children
 * @returns
 */
const DL = (props) => {
  return <dl>{props.children}</dl>;
};

/**
 * Data Item which creates a text with label component
 * @param props a props object containing label, value, alwaysShow, tooltipText, horizontal attributes
 * @returns
 */
const DLItem = (props) => {
  const { label, value, alwaysShow, tooltipText, horizontal } = props;
  if (!label || (!alwaysShow && !value)) return;
  return (
    <Stack
      direction={horizontal ? "horizontal" : "vertical"}
      style={{ alignItems: "unset" }}
    >
      {tooltipText ? (
        <OverlayTrigger
          placement="top"
          overlay={<Tooltip id="tooltip">{tooltipText}</Tooltip>}
        >
          <dt
            style={{
              width: "fit-content",
              paddingRight: "0.2rem",
            }}
          >
            {label}
          </dt>
        </OverlayTrigger>
      ) : (
        <dt
          style={{
            width: "fit-content",
            paddingRight: "0.2rem",
          }}
        >
          {label}
        </dt>
      )}
      {horizontal && ":"}

      <dd className={horizontal ? "mx-2" : ""}>{value}</dd>
    </Stack>
  );
};

export { DL, DLItem };
