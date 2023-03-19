import Link from "next/link";
import { useRouter } from "next/router";
import { Button } from "react-bootstrap";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import NavDropdown from "react-bootstrap/NavDropdown";
import { DeleteAllData } from "../../helpers/DbDataHelper";
import { gqlUrlPath } from "../../pages/api/graphql";
const MainNavbar = () => {
  const router = useRouter();

  const handleDeleteAllData = async () => {
    await DeleteAllData();
    router.reload();
  };
  return (
    <Navbar bg="dark" expand="lg" variant="dark">
      <Container>
        <Link href="/" passHref>
          <Navbar.Brand>DepVis</Navbar.Brand>
        </Link>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse className="justify-content-end">
          <Nav className="justify-content-end">
            <Link href="/upload" passHref>
              <Nav.Link>Upload</Nav.Link>
            </Link>
            <Link href="/toolbox" passHref>
              <Nav.Link>Toolbox</Nav.Link>
            </Link>
            <Link href={gqlUrlPath} passHref>
              <Nav.Link>GraphQL Playground</Nav.Link>
            </Link>
            <NavDropdown title="Other" id="basic-nav-dropdown">
              <Button
                className="mx-3"
                variant="danger"
                onClick={() => {
                  handleDeleteAllData();
                }}
              >
                Delete all data in DB
              </Button>
              <NavDropdown.Item href="/update-db">
                Update Database
              </NavDropdown.Item>
              <NavDropdown.Item href="/projects">
                Manage Projects
              </NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item href="/about">About</NavDropdown.Item>
            </NavDropdown>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default MainNavbar;
