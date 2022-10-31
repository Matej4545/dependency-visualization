import React, { useState } from 'react';
import { Alert, Button, Container, Form } from 'react-bootstrap';

const allowedExtensionsRegex = /(\.json|\.xml)$/i;

const ImportForm = () => {
  const [file, setFile] = useState<any>('');
  const [preview, setPreview] = useState<string>('');
  const [validated, setValidated] = useState(false);

  const handleFiles = (e: any) => {
    const files = e.target.files;
    if (!files) return;
    const file = files[0];
    console.log(file);
    if (!allowedExtensionsRegex.exec(file.name)) {
      alert('This extension is not allowed!');
      setFile('');
      return;
    }
    setFile(file);
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const form = e.currentTarget;
    if (form.checkValidity() === false) {
      e.preventDefault();
      e.stopPropagation();
    }

    setValidated(true);
    console.log({ file: typeof file });
    const res = await fetch('/api/sbom/import', {
      body: await file.text(),
      headers: { 'Content-Type': 'application/xml' },
      method: 'POST',
    });
    console.log(res);
    const res2 = await JSON.parse(await res.text());
    console.log(res2);
    setPreview(await JSON.stringify(res2, null, 2));
  };

  const handlePreview = async (e: any) => {
    e.preventDefault();
    file && setPreview(await file.text());
  };

  return (
    <Container fluid="xxs">
      <Container className="p-3">
        <Alert variant="info">All data currently stored in DB will be overwritten.</Alert>
        <Form noValidate validated={validated}>
          <Form.Group controlId="file">
            <Form.Label>SBOM File</Form.Label>
            <Form.Control
              required
              type="file"
              placeholder="Select SBOM file"
              onChange={(e) => {
                handleFiles(e);
              }}
            ></Form.Control>
            <Form.Control.Feedback type="invalid">Please select any XML / JSON file with SBOM.</Form.Control.Feedback>
          </Form.Group>
          <Button type="submit" onClick={(e) => handleSubmit(e)} className="my-3">
            Submit form
          </Button>
          <Button variant="secondary" onClick={(e) => handlePreview(e)}>
            Preview
          </Button>
        </Form>
      </Container>
      {preview && (
        <Container>
          <h2>Preview - {file.name}</h2>
          <pre>{preview}</pre>
        </Container>
      )}
    </Container>
  );
};

export default ImportForm;
