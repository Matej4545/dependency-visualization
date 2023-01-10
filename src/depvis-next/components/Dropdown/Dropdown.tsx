import { Form } from 'react-bootstrap';

export default function Dropdown(props) {
  return (
    <Form>
      {props.title && <Form.Label>{props.title}</Form.Label>}
      <Form.Select
        value={props.default || props.options[0] || ''}
        onChange={(e) => {
          props.onChange(e.target.value);
        }}
      >
        {props.options.map((v, i) => (
          <option key={i} value={v.id}>
            {v.name}
          </option>
        ))}
      </Form.Select>
    </Form>
  );
}
