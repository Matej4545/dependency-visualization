import Link from "next/link";
import { Container } from "react-bootstrap";

export default function GenericError(props) {
  return (
    <Container className="mx-auto my-5 text-center">
      <p className="fs-4 fw-bold">{props.error.message || "Error occured!"}</p>
      <pre>{JSON.stringify(props.error)}</pre>
      <Link href="/">Go to homepage</Link>
    </Container>
  );
}
