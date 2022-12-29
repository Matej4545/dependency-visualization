import { useState } from "react";
import { Button, Form } from "react-bootstrap";

const Search = (props) => {
  const [searchText, setSearchText] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    console.log(searchText);
  };

  const handleSearchTextChange = (input) => {
    setSearchText(input);
  };
  return (
    <Form className="d-flex" onSubmit={(e) => handleSubmit(e)}>
      <Form.Control
        type="search"
        placeholder="Search component, vulnerability..."
        className="me-2"
        aria-label="Search"
        onChange={(e) => {
          handleSearchTextChange(e.target.value);
        }}
      />
      <Button
        onClick={(e) => {
          handleSubmit(e);
        }}
        variant="outline-success"
      >
        Search
      </Button>
    </Form>
  );
};

export default Search;
