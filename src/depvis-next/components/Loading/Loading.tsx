import { Container, Spinner } from "react-bootstrap";

const Loading = (props) => {
  return (
    <>
      <Container className="d-flex justify-content-center my-2">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading</span>
        </Spinner>
      </Container>
      <p className="text-center fs-4 my-3">{props.detail}</p>
    </>
  );
};

export default Loading;
