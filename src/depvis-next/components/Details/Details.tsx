import { useState } from 'react';
import { Container, Table } from 'react-bootstrap';

export default function Details(props) {
  const [data, setData] = useState(props.data || {});

  return (
    <Container>
      Details:
      <Table striped hover>
        not implemented
      </Table>
    </Container>
  );
}
