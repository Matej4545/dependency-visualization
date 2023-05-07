import Link from "next/link";
import { useRouter } from "next/router";
import { Button } from "react-bootstrap";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import NavDropdown from "react-bootstrap/NavDropdown";
import Navbar from "react-bootstrap/Navbar";
import { DeleteAllData } from "../../helpers/DbDataHelper";
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
            {process.env.NODE_ENV === "development" && (
              <Link href={"/api/graphql"} passHref>
                <Nav.Link>GraphQL Playground</Nav.Link>
              </Link>
            )}

            <NavDropdown title="Other actions" id="basic-nav-dropdown">
              <NavDropdown.Item
                as={Button}
                onClick={() => {
                  handleDeleteAllData();
                }}
              >
                Delete all data in DB
              </NavDropdown.Item>
            </NavDropdown>
            <Link href="/about" passHref>
              <Nav.Link>About</Nav.Link>
            </Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default MainNavbar;
