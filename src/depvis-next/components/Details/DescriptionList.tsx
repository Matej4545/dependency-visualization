import { OverlayTrigger, Stack, Tooltip } from "react-bootstrap";

const DL = (props) => {
  return <dl>{props.children}</dl>;
};

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
