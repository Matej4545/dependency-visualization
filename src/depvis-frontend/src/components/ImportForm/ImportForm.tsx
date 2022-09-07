import React, { useState } from 'react';
import { Button, Container, Form } from 'react-bootstrap';
import fs from 'fs';

const ImportForm = () => {
  const [file, setFile] = useState<File>();
  const [projectName, setProjectName] = useState('');

  const handleFiles = (e: any) => {
    const files = e.target.files;
    if (!files) return;
    setFile(files[0]);
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();
    console.log({ name: projectName, file: file });
    const fileReader = new FileReader();
    console.log(fileReader.readAsText(file!));
  };

  return (
    <Container className="p-3">
      <Form>
        <Form.Group controlId="projectName">
          <Form.Label>Project name</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter project name"
            onChange={(e) => {
              setProjectName(e.target.value);
            }}
          ></Form.Control>
        </Form.Group>
        <Form.Group controlId="file">
          <Form.Label>SBOM File</Form.Label>
          <Form.Control
            type="file"
            placeholder="Select SBOM file"
            onChange={(e) => {
              handleFiles(e);
            }}
          ></Form.Control>
        </Form.Group>
        <Button type="submit" onClick={(e) => handleSubmit(e)} className="my-3">
          Submit form
        </Button>
      </Form>
    </Container>
  );
};

export default ImportForm;
