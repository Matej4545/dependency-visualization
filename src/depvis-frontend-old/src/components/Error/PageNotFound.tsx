import React from 'react';
import { Button, Col, Container, Row } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';

const PageNotFound = () => {
  let navigate = useNavigate();

  const onClick = () => {
    navigate('/', { replace: true });
  };
  return (
    <Container className="p-5 mx-auto">
      <Row className="justify-content-md-center m-3">
        <Col md="auto">
          <h3>The requested page does not exist!</h3>
        </Col>
      </Row>
      <Row className="justify-content-md-center">
        <Col md="auto">
          <Button onClick={() => onClick()} size="lg">
            Go to homepage
          </Button>
        </Col>
      </Row>
    </Container>
  );
};

export default PageNotFound;
