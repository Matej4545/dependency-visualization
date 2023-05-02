import { Table } from "react-bootstrap";

const List = (props) => {
  const { children, detailHeaders } = props;
  return (
    <Table bordered hover>
      <thead>
        <tr>
          <th>Name</th>
          {detailHeaders.map((dh) => (
            <th>{dh}</th>
          ))}
          <th className="text-end">Actions</th>
        </tr>
      </thead>
      <tbody>{children}</tbody>
    </Table>
  );
};
export default List;
