import { gql, useQuery } from "@apollo/client";
import List from "../../components/Listing/List";
import { Container, Modal, Table } from "react-bootstrap";
import ListItem from "../../components/Listing/ListItem";
import { useState } from "react";
import { DL, DLItem } from "../../components/Details/DescriptionList";
import Link from "next/link";
import { DeleteProject } from "../../helpers/DbDataProvider";

const projectsQuery = gql`
  query projectsQuery {
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
  const { loading, data, error, refetch } = useQuery(projectsQuery);
  const [showModal, setShowModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<any>(undefined);

  const projectVersionList = (projectVersions) => {
    return (
      <ul>
        {projectVersions.map((pv, i) => {
          const href = `/components?projectVersion=${pv.id}`;
          return (
            <li key={i}>
              <Link href={href}>{pv.version}</Link>
            </li>
          );
        })}
      </ul>
    );
  };

  const processItems = (projects) => {
    console.log(projects);
    return projects.map((p) => {
      return {
        id: p.id,
        name: p.name,
        detail: [projectVersionList(p.versions)],
      };
    });
  };

  const handleModalClose = () => setShowModal(false);
  const viewAction = (id) => {
    setSelectedProject(data.projects.find((p) => p.id === id));
    setShowModal(true);
  };

  const deleteAction = async (id) => {
    const response = await DeleteProject(id);
    refetch();
  };

  if (!loading)
    return (
      <Container>
        <h2 className="mt-2">Projects ({data.projects.length})</h2>
        <List detailHeaders={["Project Versions"]}>
          {processItems(data.projects).map((item, i) => (
            <ListItem
              key={i}
              item={item}
              viewAction={viewAction}
              deleteAction={deleteAction}
            />
          ))}
        </List>
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
                  value={projectVersionList(selectedProject.versions)}
                />
              </DL>
            </Modal.Body>
          </Modal>
        )}
      </Container>
    );
};
export default Projects;
