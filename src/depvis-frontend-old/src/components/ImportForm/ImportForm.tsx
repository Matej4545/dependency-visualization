import React, { useState } from 'react';
import { Alert, Button, Container, Form } from 'react-bootstrap';
import { useSbomStore } from '../../providers/SbomProvider';
import { observer } from 'mobx-react-lite';
import { useNotification } from '../../providers/NotificationProvider';
import { Notification } from '../Notification/Notification';
import { useNavigate } from 'react-router-dom';

const allowedExtensionsRegex = /(\.json|\.xml)$/i;

const ImportForm = observer(() => {
  const [file, setFile] = useState<any>('');
  const [preview, setPreview] = useState<string>('');
  const [projectName, setProjectName] = useState<string>('');
  const [validated, setValidated] = useState(false);
  const sbomStore = useSbomStore();
  let navigate = useNavigate();
  const notification = useNotification();
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
    const form = e.currentTarget;
    if (form.checkValidity() === false) {
      e.preventDefault();
      e.stopPropagation();
    }

    setValidated(true);
    e.preventDefault();
    console.log({ name: projectName, file: typeof file });
    await sbomStore.parseProject(file);
    //navigate('/');
  };

  const handlePreview = async (e: any) => {
    e.preventDefault();
    file && setPreview(await file.text());
  };

  return (
    <Container fluid="xxs">
      <Container className="p-3">
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
      <Alert>{sbomStore.state}</Alert>
    </Container>
  );
});

export default ImportForm;
