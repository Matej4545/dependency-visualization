import Link from "next/link";
import { Button, Container } from "react-bootstrap";

export default function NoProjectFoundError() {
  return (
    <Container className="mx-auto my-5 text-center">
      <p className="fs-4 fw-bold">No project found!</p>
      <Link href="/upload">
        <Button>Upload SBOM</Button>
      </Link>
    </Container>
  );
}
