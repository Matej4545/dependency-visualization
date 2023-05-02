import { gql, useQuery } from "@apollo/client";
import List from "../../components/Listing/List";
import { Container, Modal, Pagination } from "react-bootstrap";
import ListItem from "../../components/Listing/ListItem";
import { useEffect, useState } from "react";
import { DL, DLItem } from "../../components/Details/DescriptionList";
import Link from "next/link";
import { useRouter } from "next/router";
import GenericError from "../../components/Error/GenericError";
import ComponentDetails from "../../components/Details/ComponentDetails";

const projectVersionQuery = gql`
  query ProjectVersions($id: ID) {
    projectVersions(where: { id: $id }) {
      allComponents {
        id
      }
    }
  }
`;
const componentsQuery = gql`
  query Components($projectVersionId: ID, $options: ComponentOptions) {
    components(
      where: { projectVersion: { id: $projectVersionId } }
      options: $options
    ) {
      name
      author
      id
      publisher
      purl
      ref
      type
      version
      vulnerabilities {
        id
        name
      }
    }
  }
`;
const itemsPerPage = 15;

const Components = () => {
  const router = useRouter();
  const [page, setPage] = useState(0);
  const [itemsCount, setItemsCount] = useState(0);
  const {
    loading: pvLoading,
    data: pvData,
    error: pvError,
  } = useQuery(projectVersionQuery, {
    variables: {
      id: router.query.projectVersion || null,
    },
    onCompleted: (data) => {
      setItemsCount(data.projectVersions[0].allComponents.length);
    },
  });
  const { loading, data, error, refetch } = useQuery(componentsQuery, {
    variables: {
      projectVersionId: router.query.projectVersion || null,
      options: {
        limit: itemsPerPage,
        offset: page * itemsPerPage,
        sort: [
          {
            name: "ASC",
          },
        ],
      },
    },
  });
  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(undefined);

  useEffect(() => {
    refetch({
      projectVersionId: router.query.projectVersion || null,
      options: {
        limit: itemsPerPage,
        offset: page * itemsPerPage,
        sort: [
          {
            name: "ASC",
          },
        ],
      },
    });
  }, [page]);

  const processItems = (items) => {
    return items.map((i) => {
      return {
        id: i.id,
        name: i.name,
        detail: [i.version, i.vulnerabilities.length, i.purl],
      };
    });
  };

  const handleModalClose = () => setShowModal(false);
  const viewAction = (id) => {
    setSelectedItem(data.components.find((p) => p.id === id));
    setShowModal(true);
  };

  const vulnerabilityList = (vulnerabilities) => {
    return (
      <ul>
        {vulnerabilities.map((v, i) => {
          const href = `/vulnerabilities/${v.id}`;
          return (
            <li key={i}>
              <Link href={href}>{v.name}</Link>
            </li>
          );
        })}
      </ul>
    );
  };

  const generatePagination = () => {
    const maxPage = Math.floor(itemsCount / itemsPerPage) + 1;
    const range = 5;
    return (
      <>
        {page != 0 && <Pagination.Prev onClick={() => setPage(page - 1)} />}
        {Array.from({ length: maxPage }).map((_, i) => {
          if (i < page + range && i > page - range)
            return (
              <Pagination.Item
                key={i}
                active={page == i}
                onClick={() => {
                  setPage(i);
                }}
              >
                {i + 1}
              </Pagination.Item>
            );
        })}
        {page != maxPage && (
          <Pagination.Next onClick={() => setPage(page + 1)} />
        )}
      </>
    );
  };

  if (error || pvError) return <GenericError />;
  if (!loading && !pvLoading)
    return (
      <Container>
        <h2 className="mt-2">Components ({itemsCount})</h2>
        <List
          detailHeaders={["Version", "Vulnerabilities count", "Package URL"]}
        >
          {processItems(data.components).map((item, i) => (
            <ListItem key={i} item={item} viewAction={viewAction} />
          ))}
        </List>
        {selectedItem && (
          <Modal show={showModal} onHide={handleModalClose}>
            <Modal.Header closeButton>
              <Modal.Title>{selectedItem.name}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <ComponentDetails
                componentId={selectedItem.purl}
                projectId={router.query.projectVersion}
              />
              {/* <DL>
                <DLItem label="Author" value={selectedItem.author} />
                <DLItem label="Publisher" value={selectedItem.publisher} />
                <DLItem label="Version" value={selectedItem.version} />
                <DLItem label="Type" value={selectedItem.type} />
                <DLItem label="Package URL (PURL)" value={selectedItem.purl} />
                <DLItem
                  label="Vulnerabilities"
                  value={vulnerabilityList(selectedItem.vulnerabilities)}
                />

                <DLItem label="Id" value={selectedItem.id} />
              </DL> */}
            </Modal.Body>
          </Modal>
        )}
        <Pagination className="d-flex justify-content-end">
          {generatePagination()}
        </Pagination>
      </Container>
    );
};
export default Components;
