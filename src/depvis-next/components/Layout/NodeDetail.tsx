import { Container } from "react-bootstrap";
import Details from "../Details/Details";

export default function NodeDetail(props) {
  const node = { name: props.name, ...props };
  return (
    <Container className="overlay position-absolute bottom-0 start-0">
      (node && <h2>{node.name}</h2>
      <Details data={node} />)
    </Container>
  );
}
