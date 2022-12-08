import { useRouter } from "next/router";
import { Button, Container } from "react-bootstrap";

export default function GenericError(props) {
  const router = useRouter();
  return (
    <Container className="mx-auto my-5 text-center">
      <p className="fs-4 fw-bold">{props.error.message || "Error occured!"}</p>
      <pre>{JSON.stringify(props.error)}</pre>
      <Button
        onClick={() => {
          router.reload(window.location.pathname);
        }}
        variant="primary"
      >
        Refresh page
      </Button>
    </Container>
  );
}
