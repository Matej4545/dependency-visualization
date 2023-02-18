import { useRouter } from 'next/router';
import { useState } from 'react';
import { Alert, Button, Container, Form, Row } from 'react-bootstrap';
import { ImportResult } from './ImportResult';
import { ImportFormData } from './types';

const allowedExtensionsRegex = /(\.json|\.xml)$/i;

const ImportForm = (props) => {
  const { onSubmitCallback } = props;
  const [file, setFile] = useState<File>(undefined);
  const [preview, setPreview] = useState<string>('');
  const [validated, setValidated] = useState<boolean>(false);
  const [projectName, setProjectName] = useState<string>('');
  const [projectVersion, setProjectVersion] = useState<string>('1.0.0');

  const handleFiles = (e: any) => {
    const files = e.target.files;
    if (!files) return;
    const file = files[0];
    console.log(file);
    if (!allowedExtensionsRegex.exec(file.name)) {
      setFile(undefined);
      setValidated(true);
      e.target.value = '';
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
    const body: ImportFormData = {
      projectName: projectName,
      projectVersion: projectVersion,
      sbom: await file.text(),
    };
    await onSubmitCallback(body);
  };

  const handlePreview = async (e: any) => {
    e.preventDefault();
    if (!file) return;
    preview ? setPreview(undefined) : setPreview(await file.text());
  };

  return (
    <Row lg={2} className="justify-content-md-center">
      <Form noValidate validated={validated}>
        <Form.Group controlId="file">
          <Form.Label>Project name</Form.Label>
          <Form.Control
            required
            type="text"
            placeholder="Project name"
            onChange={(e) => {
              setProjectName(e.target.value);
            }}
            value={projectName}
          ></Form.Control>
          <Form.Control.Feedback type="invalid">Please select any XML / JSON file with SBOM.</Form.Control.Feedback>
        </Form.Group>
        <Form.Group controlId="file">
          <Form.Label>Project version</Form.Label>
          <Form.Control
            required
            type="text"
            placeholder="1.0.0"
            onChange={(e) => {
              setProjectVersion(e.target.value);
            }}
            value={projectVersion}
          ></Form.Control>
          <Form.Control.Feedback type="invalid">Please select any XML / JSON file with SBOM.</Form.Control.Feedback>
        </Form.Group>
        <Form.Group controlId="file">
          <Form.Label>SBOM File</Form.Label>
          <Form.Control
            required
            type="file"
            accept=".xml"
            placeholder="Select SBOM file"
            isInvalid={validated && file === undefined}
            onChange={(e) => {
              handleFiles(e);
            }}
          ></Form.Control>
          <Form.Control.Feedback type="invalid">Please select any XML / JSON file with SBOM.</Form.Control.Feedback>
        </Form.Group>
        <Button
          type="submit"
          onClick={(e) => handleSubmit(e)}
          className="my-3"
          disabled={projectName === '' || projectVersion === '' || file === undefined}
        >
          Submit form
        </Button>
        <Button variant="secondary" onClick={(e) => handlePreview(e)} className="mx-1">
          Preview
        </Button>
      </Form>
      {preview && (
        <Alert variant="secondary">
          Contents of file <b>{file.name}</b>
          <hr />
          <pre className="import-preview">{preview}</pre>
        </Alert>
      )}
    </Row>
  );
};

export default ImportForm;
