import { useState } from "react";
import { Container, Form } from "react-bootstrap";

export type DropdownItem = {
  displayName: string;
  id: string;
};

/**
 * Dropdown component, renders set of options and fires a callback on change
 * @param props one of title, onChange, defaultValue, options, disabled
 * @returns
 */
export default function Dropdown(props) {
  const { title, onChange, defaultValue, options, disabled } = props;
  const [selectedId, setSelectedId] = useState(defaultValue);
  return (
    <Container>
      <Form>
        {title && <Form.Label>{title}</Form.Label>}
        <Form.Select
          value={selectedId}
          disabled={disabled}
          onChange={(e) => {
            setSelectedId(e.target.value);
            onChange(e.target.value);
          }}
        >
          {options &&
            options.map((v: DropdownItem, i: number) => (
              <option key={i} value={v.id}>
                {v.displayName}
              </option>
            ))}
        </Form.Select>
      </Form>
    </Container>
  );
}
