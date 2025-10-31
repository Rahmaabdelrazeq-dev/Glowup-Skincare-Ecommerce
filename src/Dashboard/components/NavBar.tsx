import React from "react";
import { Navbar, Container, Nav } from "react-bootstrap";
import { Link } from "react-router-dom";
import NotificationBell from "../pages/Orders/components/notifcation";

export default function MainNavbar() {
  return (
    <Navbar expand="lg" className="py-1">
      <Container>
        <h3 className="mb-0 ms-4" style={{ color: "#483B32" }}>
          Overview
        </h3>

        <Navbar.Toggle aria-controls="navbar-nav" />
        <Navbar.Collapse id="navbar-nav">
          <Nav className="ms-auto align-items-center gap-3 flex-row p-3">
            <Nav.Link as={Link} to="/" className="fs-4 p-0">
              <i className="bi bi-house-door-fill" style={{ color: "#483B32" }}></i>
            </Nav.Link>
            <Nav.Link className="p-0">
              <NotificationBell />
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
