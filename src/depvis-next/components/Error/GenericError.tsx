import Link from "next/link";
import { useRouter } from "next/router";
import { Container } from "react-bootstrap";

export default function GenericError(props) {
  const { error } = props;
  const router = useRouter();
  return (
    <Container className="mx-auto my-5 text-center">
      <p className="fs-4 fw-bold">{error.message || "Error occured!"}</p>
      <pre>{JSON.stringify(error, null, 2)}</pre>
      <Link href="/">Go to homepage</Link>
    </Container>
  );
}
