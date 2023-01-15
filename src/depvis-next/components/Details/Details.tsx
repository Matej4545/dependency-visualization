import { isArray } from '@apollo/client/cache/inmemory/helpers';
import { Container, Table } from 'react-bootstrap';

export default function Details(props) {
  return (
    <Container className="my-1">
      <h5>{props.title}</h5>
      <Table bordered hover className={props.className || ''}>
        <tbody>
          {props.data &&
            Object.entries(props.data).map(([key, value]) => (
              <tr>
                <td>
                  <b>{key}</b>
                </td>
                <td>{typeof value === 'object' ? JSON.stringify(value) : (value as String)}</td>
              </tr>
            ))}
        </tbody>
      </Table>
    </Container>
  );
}
