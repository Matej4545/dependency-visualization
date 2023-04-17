import { faCaretDown, faCaretUp } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { useState } from "react";
import { Col, Collapse, Container, Stack } from "react-bootstrap";
import { graphUIGrey } from "../../types/colorPalette";

const Sidebar = (props) => (
  <Col className="workspace-sidebar px-0" xl={3} md={4} sm={5}>
    {props.children}
  </Col>
);

export const SidebarItem = (props) => {
  const { title, collapse, fixed } = props;
  const [open, setOpen] = useState<boolean>(!collapse);
  return (
    <Container>
      {fixed ? (
        <>
          <h6>{title}</h6>
          {props.children}
        </>
      ) : (
        <>
          <Stack
            direction="horizontal"
            onClick={() => {
              setOpen(!open);
            }}
          >
            <h6>{title}</h6>
            <FontAwesomeIcon
              icon={open ? faCaretUp : faCaretDown}
              className="ms-auto"
              color={graphUIGrey}
            />
          </Stack>

          <Collapse in={open}>
            <div>{props.children}</div>
          </Collapse>
        </>
      )}
    </Container>
  );
};
export default Sidebar;
