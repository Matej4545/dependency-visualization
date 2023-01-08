import { Col } from "react-bootstrap";

const Sidebar = (props) => (
  <Col className="workspace-sidebar" xl={3} md={4} sm={5}>
    {props.children}
  </Col>
);

export default Sidebar;