import { Container } from "react-bootstrap";

const About = () => {
  return (
    <Container className="my-5" fluid="sm">
      <h3>About DepVis</h3>
      <p>
        Welcome to DepVis tool. DepVis is a open source third party dependencies
        and vulnerabilities visualization tool, which was developed as part of a
        Master's thesis.
      </p>
      <p>
        Main goal is to help developers and security professionals with open
        source dependency management. The DepVis tool accepts input in{" "}
        <strong>CycloneDX</strong> format called Software Bill of Materials
        (SBOM). This file can be generated using existing tools or some repos
        even generate it and publicly offer it.
      </p>
      <p>
        For visualization DepVis is using D3 library wrapper for React called{" "}
        <a
          href="https://github.com/vasturiano/react-force-graph"
          target="_blank"
        >
          react-force-graph
        </a>
        , data are stored in Neo4J Library and queried using GraphQL.
      </p>
      <h4>About Author</h4>
      <p>
        My name is Matěj Groman and I study of Software Security Management at{" "}
        <a href="https://www.fi.muni.cz/" target="_blank">
          FI MUNI
        </a>
        . I created this application as part of my Master's thesis
      </p>
      <strong>
        Visualization of Vulnerabilities in Open Source Software Dependencies
      </strong>
      <p>
        If you have any questions or want to contact me, please write an email
        at <a href="mailto:469485@mail.muni.cz">469485@mail.muni.cz</a>
      </p>
    </Container>
  );
};

export default About;
