import { useQuery } from "@apollo/client";
import { useState } from "react";
import { Container, Spinner } from "react-bootstrap";
import GenericError from "../components/Error/GenericError";
import NoSSRGraphWrapper from "../components/Graph/NoSSRGraphWrapper";
import ImportForm from "../components/Import/ImportForm";
import { formatData, getAllComponentsQuery } from "../helpers/GraphHelper";

function HomePage() {
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { data } = useQuery(getAllComponentsQuery, {
    onCompleted: (data) => {
      setLoading(false);
      setGraphData(formatData(data));
    },
    onError: (err) => {
      setLoading(false);
      console.error(err);
      setError(err);
    },
  });
  return (
    <>
      {graphData.nodes.length == 0 && (
        <Container className="mx-auto my-5">
          {loading ? (
            <>
              <Container className="d-flex justify-content-center">
                <Spinner animation="border" role="status">
                  <span className="visually-hidden">Loading...</span>
                </Spinner>
              </Container>
              <p className="text-center fs-4 my-3">Loading data</p>
            </>
          ) : error ? (
            <GenericError error={error} />
          ) : (
            <>
              <p className="text-center fs-2 fw-bold">No data!</p>
              <p className="text-center fs-5">
                Please try importing SBOM file first.
              </p>
              <Container className="w-50">
                <ImportForm />
              </Container>
            </>
          )}
        </Container>
      )}
      <NoSSRGraphWrapper graphData={graphData} />
      {/* <NodeDetail name={selectedNode} /> */}
    </>
  );
}

export default HomePage;
