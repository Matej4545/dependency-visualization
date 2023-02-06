import { useState } from 'react';
import { Alert, Button, Container, Form } from 'react-bootstrap';
import { ImportResult } from './ImportResult';

const allowedExtensionsRegex = /(\.json|\.xml)$/i;

const ImportForm = () => {
  const [file, setFile] = useState<any>('');
  const [preview, setPreview] = useState<string>('');
  const [validated, setValidated] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [jobId, setJobId] = useState(null);
  const [projectName, setProjectName] = useState('');
  const [projectVersion, setProjectVersion] = useState('1.0.0');

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
    const formData = new FormData();
    formData.append('projectName', projectName);
    formData.append('projectVersion', projectVersion);
    formData.append('sbom', await file.text());
    const res = await fetch('/api/import', {
      body: formData,
      // headers: { 'Content-Type': 'application/xml' },
      method: 'POST',
    });
    const json = await res.json();
    setJobId(json.jobId);
    setIsSubmitted(true);
  };

  const handlePreview = async (e: any) => {
    e.preventDefault();
    file && setPreview(await file.text());
  };

  return isSubmitted ? (
    <ImportResult jobId={jobId} />
  ) : (
    <Container fluid="xxs">
      <Container className="p-3">
        <Alert variant="info">All data currently stored in DB will be overwritten.</Alert>
        <Container className="w-50">
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
                placeholder="Project version"
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
            <Button variant="secondary" onClick={(e) => handlePreview(e)} className="mx-1">
              Preview
            </Button>
          </Form>
        </Container>
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
