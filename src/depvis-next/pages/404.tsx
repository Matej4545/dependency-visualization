import { Col, Container, Row } from 'react-bootstrap';
import Link from 'next/link';
import React from 'react';

const PageNotFound = () => {
  return (
    <Container className="p-5 mx-auto">
      <Row className="justify-content-md-center m-3">
        <Col md="auto">
          <h3>The requested page does not exist!</h3>
        </Col>
      </Row>
      <Row className="justify-content-md-center">
        <Col md="auto">
          <Link href="/">Go to homepage</Link>
        </Col>
      </Row>
    </Container>
  );
};

export default PageNotFound;
