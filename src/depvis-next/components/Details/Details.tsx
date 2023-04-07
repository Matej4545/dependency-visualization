import { useState } from "react";
import {
  Button,
  Col,
  Collapse,
  Container,
  Row,
  Stack,
  Table,
} from "react-bootstrap";

export default function Details(props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Stack direction="horizontal">
        <h5>{props.title}</h5>

        <Button
          className="ms-auto"
          variant="outline-secondary"
          onClick={() => {
            setOpen(!open);
          }}
        >
          Expand
        </Button>
      </Stack>
      <Collapse in={open}>
        <Table bordered hover className={props.className || ""}>
          <tbody>
            {props.data &&
              Object.entries(props.data).map(([key, value]) => (
                <tr key={key}>
                  <td style={{ wordBreak: "break-all" }}>
                    <b>{key}</b>
                  </td>
                  <td style={{ wordBreak: "break-all" }}>
                    {typeof value === "boolean"
                      ? String(value)
                      : typeof value === "object"
                      ? JSON.stringify(value)
                      : (value as String)}
                  </td>
                </tr>
              ))}
          </tbody>
        </Table>
      </Collapse>
    </>
  );
}
