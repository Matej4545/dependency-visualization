import { OverlayTrigger, Tooltip } from "react-bootstrap";

const DL = (props) => {
  return <dl>{props.children}</dl>;
};

const DLItem = (props) => {
  const { label, value, alwaysShow, tooltipText } = props;
  if (!label || (!alwaysShow && !value)) return;
  return (
    <>
      {tooltipText ? (
        <OverlayTrigger
          placement="top"
          overlay={<Tooltip id="tooltip">{tooltipText}</Tooltip>}
        >
          <dt style={{ width: "fit-content", paddingRight: "0.2rem" }}>
            {label}
          </dt>
        </OverlayTrigger>
      ) : (
        <dt style={{ width: "fit-content", paddingRight: "0.2rem" }}>
          {label}
        </dt>
      )}

      <dd>{value}</dd>
    </>
  );
};

export { DL, DLItem };
