import { useState } from 'react';
import { Container, Table } from 'react-bootstrap';

const Toolbox = () => {
  return <DetailsList></DetailsList>;
};
export default Toolbox;

const mockupData = [
  { Key: 'a', value: '1' },
  { Key: 'b', value: '1' },
  { Key: 'c', value: '1' },
];

const DetailsList = () => {
  const [data, setData] = useState(mockupData);

  return (
    <Container>
      Details:
      <Table striped hover>
        {data.map((d) => {
          return (
            <tr>
              <td>{d.Key}</td>
              <td>{d.value}</td>
            </tr>
          );
        })}
      </Table>
    </Container>
  );
};
