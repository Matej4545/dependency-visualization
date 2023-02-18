import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { Alert, Container } from 'react-bootstrap';
import ImportForm from '../components/Import/ImportForm';
import { ImportResult } from '../components/Import/ImportResult';

const ImportApiUrl = '/api/import';

const Upload = () => {
  const router = useRouter();
  const [serverResponse, setServerResponse] = useState<any>();

  const handleSubmit = async (data) => {
    const res = await fetch(ImportApiUrl, {
      body: await JSON.stringify(data),
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
    });
    if (res.status == 200) {
      const json = await res.json();
      router.push(`?jobId=${json.jobId}`, undefined, { shallow: true });
    } else {
      setServerResponse(await res.json());
    }
  };

  if (router.query.jobId) {
    return <ImportResult jobId={router.query.jobId} />;
  }
  return (
    <Container>
      {serverResponse && <Alert variant="danger">Form can not be submitted - {serverResponse.error}</Alert>}
      <Alert variant="info" className="mt-3">
        <h3>How to create SBOM for project</h3>
        <ol>
          <li>
            Go to <Link href={'https://cyclonedx.org/tool-center/'}>CycloneDX Tool Center</Link> and find a tool to
            generate SBOM according to your programming language
          </li>
          <li>Create the SBOM file according to the documentation for a given tool - Choose XML as output file.</li>
          <li>Upload generated file here</li>
        </ol>
      </Alert>
      <ImportForm
        onSubmitCallback={(data) => {
          console.log(data);
          handleSubmit(data);
        }}
      />
    </Container>
  );
};
export default Upload;
