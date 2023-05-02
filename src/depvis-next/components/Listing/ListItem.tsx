import { faEye, faPen, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Row, Col, Stack, Button, ButtonGroup } from "react-bootstrap";
import { deleteRed, graphUIGrey } from "../../types/colorPalette";

export type Item = {
  name: string;
  detail: any[];
  [key: string]: any;
};
type ListItemProps = {
  item: Item;
  deleteAction?: Function;
  editAction?: Function;
  viewAction?: Function;
};
const ListItem = (props: ListItemProps) => {
  const { item, deleteAction, viewAction, editAction } = props;

  const getActions = () => {
    return (
      <ButtonGroup className="float-end">
        <Button
          variant="light"
          disabled={deleteAction === undefined}
          onClick={() => deleteAction(item.id)}
        >
          <FontAwesomeIcon icon={faTrash} color={deleteRed} />
        </Button>
        <Button
          variant="light"
          disabled={editAction === undefined}
          onClick={() => editAction(item.id)}
        >
          <FontAwesomeIcon icon={faPen} color={graphUIGrey} />
        </Button>
        <Button
          variant="light"
          disabled={viewAction === undefined}
          onClick={() => viewAction(item.id)}
        >
          <FontAwesomeIcon icon={faEye} color={graphUIGrey} />
        </Button>
      </ButtonGroup>
    );
  };
  return (
    <tr>
      <td id="name" className="col-md-4">
        {item.name}
      </td>
      {item.detail.map((i) => (
        <td>{i}</td>
      ))}
      <td id="actions" className="col-md-1">
        {getActions()}
      </td>
    </tr>
  );
};

export default ListItem;
