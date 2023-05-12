import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Alert, Container, ProgressBar, Row } from "react-bootstrap";
import { ImportStatusReponse } from "../../pages/api/import/status";

const fetchInterval = 500;
export const ImportResult = (props) => {
  const [response, setResponse] = useState<ImportStatusReponse>(undefined);
  const { jobId } = props;
  const router = useRouter();

  const getJobStatus = async (id) => {
    const res = await fetch(`/api/import/status?id=${id}`);
    setResponse(await res.json());
  };

  useEffect(() => {
    if (!jobId || (response && !response.continueQuery)) {
      return;
    }
    const interval = setInterval(() => {
      getJobStatus(jobId);
    }, fetchInterval);
    return () => clearInterval(interval);
  }, [response]);

  if (!response) return <></>;
  if (response.status == "completed") {
    const url = response.projectName
      ? `/?projectName=${response.projectName}`
      : "/";
    router.push(url);
  }

  const getPercent = () => {
    if (!response.progress || !response.progress.percent) return 0;
    return response.progress!.percent;
  };
  return (
    <Container className="justify-content-md-center">
      <h3 className="text-center my-3">
        Importing project {response.projectName}
      </h3>
      <h4 className="text-center my-3">
        {response.progress && response.progress.message}
      </h4>
      <p className="text-center my-3">
        This can take several minutes depending on the size of the input.
      </p>
      {response.continueQuery ? (
        <ProgressBar animated now={getPercent()} label={`${getPercent()} %`} />
      ) : (
        <Row lg={2} className="justify-content-md-center">
          {response.status == "completed" ? (
            <Alert variant="success">
              Import completed! Redirecting to your graph...
            </Alert>
          ) : (
            <Alert variant="danger">
              <strong>{response.status}</strong> - {response.message}
            </Alert>
          )}
        </Row>
      )}
    </Container>
  );
};
