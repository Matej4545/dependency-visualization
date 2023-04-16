import { Container, Table } from "react-bootstrap";
import ListItem, { Item } from "./ListItem";
type ListProps = {
  listItems: Item;
  editAction?: Function;
  viewAction?: Function;
  deleteAction?: Function;
};
const List = (props: ListProps) => {
  const { listItems, editAction, viewAction, deleteAction } = props;
  return (
    <Table bordered hover>
      <tr>
        <th>Name</th>
        <th>Detail</th>
        <th>Actions</th>
      </tr>
    </Table>
  );
};
export default List;
