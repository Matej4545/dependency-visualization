import { useState } from 'react';
import { Container, Form } from 'react-bootstrap';

export default function Dropdown(props) {
  const [selected, setSelected] = useState(props.default);
  return (
    <Container>
      <Form>
        {props.title && <Form.Label>{props.title}</Form.Label>}
        <Form.Select
          value={selected}
          onChange={(e) => {
            props.onChange(e.target.value);
            setSelected(e.target.value);
          }}
        >
          {props.options.map((v, i) => (
            <option key={i} value={v.id}>
              {v.name}
            </option>
          ))}
        </Form.Select>
      </Form>
    </Container>
  );
}
