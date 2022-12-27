import { gql, useQuery } from "@apollo/client";
import { useState } from "react";
import { Container, Spinner } from "react-bootstrap";
import GenericError from "../components/Error/GenericError";
import NoSSRGraphWrapper from "../components/Graph/NoSSRGraphWrapper";
import ImportForm from "../components/Import/ImportForm";

const getAllComponentsQuery = gql`
  {
    components {
      name
      __typename
      purl
      version
      dependsOnCount
      dependsOn {
        purl
      }
      vulnerabilities {
        cve
        name
        cvssScore
      }
    }
  }
`;

const formatData = (data) => {
  console.log(data);
  const nodes = [];
  const links = [];
  console.log(data);
  if (!data.components) return { nodes, links };
  data.components.forEach((c) => {
    nodes.push({
      id: c.purl,
      name: c.name,
      dependsOnCount: c.dependsOnCount,
      __typename: c.__typename,
    });
    if (c.dependsOn) {
      c.dependsOn.forEach((d) => {
        links.push({
          source: c.purl,
          target: d.purl,
        });
      });
    }
    if (c.vulnerabilities) {
      c.vulnerabilities.forEach((v) => {
        links.push({
          source: c.purl,
          target: v.cve,
        });
        nodes.push({
          id: v.cve,
          cve: v.cve,
          name: v.name,
          cvssScore: v.cvssScore,
          dependsOnCount: 100,
          __typename: v.__typename,
        });
      });
    }
  });
  console.log({ node: nodes, links: links });
  return { nodes, links };
};

function HomePage() {
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedNode, setSelectedNode] = useState("");

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
      <NoSSRGraphWrapper graphData={graphData} onNodeClick={selectedNode} />
      {/* <NodeDetail name={selectedNode} /> */}
    </>
  );
}

export default HomePage;
