import React from 'react';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import { Link } from 'react-router-dom';
const MainNavbar = () => {
  return (
    <Navbar bg="dark" expand="lg" variant="dark">
      <Container>
        <Navbar.Brand as={Link} to="/">
          DepVis
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse className="justify-content-end">
          <Nav className="justify-content-end">
            <Nav.Link as={Link} to="/upload">
              Upload
            </Nav.Link>
            <Nav.Link as={Link} to="/toolbox">
              Toolbox
            </Nav.Link>
            <NavDropdown title="Other" id="basic-nav-dropdown">
              <NavDropdown.Item href="/update-db">Update Database</NavDropdown.Item>
              <NavDropdown.Item href="/projects">Manage Projects</NavDropdown.Item>
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
