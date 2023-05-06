import React, { useState } from "react";
import { Button, Container, Dropdown, Form } from "react-bootstrap";
import DropdownContext from "react-bootstrap/esm/DropdownContext";
import DropdownItem from "react-bootstrap/esm/DropdownItem";

const SearchComponent = (props) => {
  const [searchValue, setSearchValue] = useState("");
  const [filteredObjects, setFilteredObjects] = useState([]);

  const handleSearchInputChanges = (e) => {
    setSearchValue(e.target.value);
  };

  const callSearchFunction = (e) => {
    e.preventDefault();
    const { objects } = props;
    if (searchValue == "") {
      setFilteredObjects([]);
    } else {
      const filteredObjects = searchFunction(searchValue, objects);
      setFilteredObjects(filteredObjects);
    }
  };

  const handleObjectClick = (object) => {
    props.searchResultCallback(object);
    setFilteredObjects([]);
  };

  const renderResults = () => {
    if (filteredObjects.length > 0) {
      return (
        <Dropdown.Menu show className="search-results-container">
          <Container>Total results: {filteredObjects.length}</Container>
          {filteredObjects.map((object, index) => (
            <Dropdown.Item
              key={index}
              onClick={() => handleObjectClick(object)}
            >
              {object.name || object.id} <i>({object.__typename})</i>
            </Dropdown.Item>
          ))}
        </Dropdown.Menu>
      );
    }
  };

  return (
    <Container className="p-0">
      <Form className="d-flex" onSubmit={(e) => callSearchFunction(e)}>
        <Form.Control
          type="search"
          placeholder="Search component, vulnerability..."
          className="me-2"
          aria-label="Search"
          onChange={(e) => {
            handleSearchInputChanges(e);
          }}
        />
        <Button
          onClick={(e) => {
            callSearchFunction(e);
          }}
          variant="outline-success"
        >
          Search
        </Button>
      </Form>
      {renderResults()}
    </Container>
  );
};

const searchFunction = (searchValue, objects) => {
  const searchableProperties = ["id", "name", "description", "cve", "ghsa"];
  const filteredObjects = objects.filter((object) => {
    const objectProperties = Object.keys(object).filter((key) =>
      searchableProperties.includes(key)
    );
    return objectProperties.some((property) => {
      const propertyValue = object[property];
      return (
        typeof propertyValue === "string" &&
        propertyValue.toLowerCase().includes(searchValue.toLowerCase())
      );
    });
  });
  return filteredObjects;
};

export default SearchComponent;
