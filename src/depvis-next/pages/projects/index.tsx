import { gql, useQuery } from "@apollo/client";
import List from "../../components/Listing/List";
import { Container, Modal, Table } from "react-bootstrap";
import ListItem from "../../components/Listing/ListItem";
import { useState } from "react";
import { DL, DLItem } from "../../components/Details/DescriptionList";

const projectsQuery = gql`
  query ExampleQuery {
    projects {
      id
      name
      versions {
        id
        version
      }
    }
  }
`;

const Projects = () => {
  const { loading, data, error } = useQuery(projectsQuery);
  const [showModal, setShowModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<any>(undefined);

  const processItems = (projects) => {
    console.log(projects);
    return projects.map((p) => {
      return { id: p.id, name: p.name, detail: p.versions.length };
    });
  };

  const handleModalClose = () => setShowModal(false);
  const viewAction = (id) => {
    setSelectedProject(data.projects.find((p) => p.id === id));
    setShowModal(true);
  };

  const deleteAction = (id) => {};

  const generateVersionsList = (versions) => {
    if (!versions) return;
    return (
      <ul>
        {versions.map((v) => {
          return <li key={v.id}>v.version</li>;
        })}
      </ul>
    );
  };
  if (!loading)
    return (
      <Container>
        <h2>Projects</h2>
        <Table hover bordered>
          {processItems(data.projects).map((item, i) => (
            <ListItem
              key={i}
              item={item}
              viewAction={viewAction}
              deleteAction={deleteAction}
            />
          ))}
        </Table>
        {selectedProject && (
          <Modal show={showModal} onHide={handleModalClose}>
            <Modal.Header closeButton>
              <Modal.Title>{selectedProject.name}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <DL>
                <DLItem label="Id" value={selectedProject.id} />
                <DLItem
                  label="Versions"
                  value={generateVersionsList(selectedProject.versions)}
                />
              </DL>
            </Modal.Body>
          </Modal>
        )}
      </Container>
    );
};
export default Projects;
