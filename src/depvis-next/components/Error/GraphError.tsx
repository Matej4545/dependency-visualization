import { Container } from "react-bootstrap";

export default function GraphError(props) {
  const { message } = props;
  return (
    <Container className="mx-auto my-5 text-center">
      <strong className="fs-4 fw-bold">Graph could not be loaded.</strong>
      <p>{message}</p>
    </Container>
  );
}
