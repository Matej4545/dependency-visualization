import Link from 'next/link';
import { Container } from 'react-bootstrap';

export default function NoProjectFoundError(props) {
  return (
    <Container className="mx-auto my-5 text-center">
      <p className="fs-4 fw-bold">No project found!</p>
      <Link href="/upload">Upload SBOM</Link>
    </Container>
  );
}
