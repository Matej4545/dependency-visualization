import { faCheck, faX } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";
import { Alert, Button, Form, Row } from "react-bootstrap";
import { parseXml } from "../../helpers/xmlParserHelper";
import { ImportFormData } from "./types";

const allowedExtensionsRegex = /(\.xml)$/i;

interface projectStats {
  componentsCount: number;
  dependenciesCount: number;
  error: boolean;
}

const ImportForm = (props) => {
  const { onSubmitCallback } = props;
  const [file, setFile] = useState<File>(undefined);
  const [preview, setPreview] = useState<string>("");
  const [validated, setValidated] = useState<boolean>(false);
  const [projectName, setProjectName] = useState<string>("");
  const [projectVersion, setProjectVersion] = useState<string>("1.0.0");
  const [projectStats, setProjectStats] = useState<projectStats>(undefined);
  const handleFiles = async (e: any) => {
    const files = e.target.files;
    if (!files || !files[0] || !allowedExtensionsRegex.exec(files[0].name)) {
      setFile(undefined);
      setValidated(true);
      e.target.value = "";
      return;
    }
    const file = files[0];
    setProjectStats(await tryParseFile(await file.text()));
    setFile(file);
  };

  const tryParseFile = async (fileXml): Promise<projectStats> => {
    try {
      const parsedXml = await parseXml(fileXml);
      const dependencies =
        parsedXml.bom.dependencies &&
        parsedXml.bom.dependencies.dependency
          .map((d) => (d.dependency ? d.dependency.length : 0))
          .reduce((sum, current) => sum + current, 0);
      console.log(dependencies);
      return {
        componentsCount: parsedXml.bom.components.component.length,
        dependenciesCount: dependencies,
        error: false,
      };
    } catch {
      return { componentsCount: 0, dependenciesCount: 0, error: true };
    }
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

  const renderInfo = () => {
    return (
      file && (
        <Alert variant="secondary">
          {projectStats && (
            <>
              <h4>
                File <b>{file.name}</b> information:
              </h4>
              <span>
                File can be parsed{" "}
                {projectStats.error ? (
                  <FontAwesomeIcon icon={faX} color="#A30015" />
                ) : (
                  <FontAwesomeIcon icon={faCheck} color="#34AD6C" />
                )}
              </span>
              <br />
              <span>Number of components: </span>
              <span>{projectStats.componentsCount}</span>
              <br />
              <span>Number of dependencies: </span>
              <span>{projectStats.dependenciesCount}</span>
              <br />
            </>
          )}
          {preview && (
            <>
              File Content:
              <hr />
              <pre className="import-preview">{preview}</pre>
            </>
          )}
        </Alert>
      )
    );
  };
  return (
    <Row className="justify-content-md-center">
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
          <Form.Control.Feedback type="invalid">
            Please select any XML / JSON file with SBOM.
          </Form.Control.Feedback>
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
          <Form.Control.Feedback type="invalid">
            Please select any XML / JSON file with SBOM.
          </Form.Control.Feedback>
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
          <Form.Control.Feedback type="invalid">
            Please select any XML / JSON file with SBOM.
          </Form.Control.Feedback>
        </Form.Group>
        <Button
          type="submit"
          onClick={(e) => handleSubmit(e)}
          className="my-3"
          disabled={
            projectName === "" ||
            projectVersion === "" ||
            file === undefined ||
            projectStats.error
          }
        >
          Submit form
        </Button>
        <Button
          variant="secondary"
          onClick={(e) => handlePreview(e)}
          className="mx-1"
        >
          Preview
        </Button>
      </Form>
      {renderInfo()}
    </Row>
  );
};

export default ImportForm;
