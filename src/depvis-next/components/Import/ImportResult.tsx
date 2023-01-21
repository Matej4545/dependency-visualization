import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { Container, Spinner } from 'react-bootstrap';

const jobStatesRunning = ['active', 'waiting', 'paused', 'delayed'];

export const ImportResult = (props) => {
  const [status, setStatus] = useState('');
  const [isRunning, setIsRunning] = useState(true);

  const router = useRouter();

  const getJobStatus = async (id) => {
    console.log({ id: id, ir: isRunning });
    const res = await fetch(`/api/import/status?id=${id}`);
    const json = await res.json();
    setStatus(json.status);
    setIsRunning(jobStatesRunning.includes(json.status));
  };

  useEffect(() => {
    if (!props.jobId || !isRunning) {
      return;
    }
    const interval = setInterval(() => {
      getJobStatus(props.jobId);
    }, 500);
    return () => clearInterval(interval);
  }, [isRunning]);

  if (!isRunning && status == 'completed') {
    router.push('/');
  }
  return (
    <Container className="justify-content-center">
      <h3 className="text-center my-3">Your file was successfully submited and it will be parsed now!</h3>
      <p className="text-center my-3">This can take several minutes depending on the size of the input.</p>
      {isRunning ? (
        <Container className="d-flex justify-content-center ">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </Container>
      ) : (
        <p className="text-center my-3">
          <b>
            Completed (status {status}) <Link href="/">Go to the main app!</Link>
          </b>
        </p>
      )}
    </Container>
  );
};
