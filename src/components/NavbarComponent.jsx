import React, { Component } from 'react';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';


class NavbarComponent extends Component {
render() {
const { user, onShowLogin, onLogout } = this.props;
return (
<Navbar expand="lg" bg="white" className="shadow-sm py-3 sticky-top">
<Container>
<Navbar.Brand as={Link} to="/">Prac<span className="text-primary">D</span></Navbar.Brand>
<Navbar.Toggle aria-controls="main-nav" />
<Navbar.Collapse id="main-nav">
<Nav className="me-auto">
<Nav.Link as={Link} to="/">Home</Nav.Link>
<Nav.Link as={Link} to="/doctors">Doctors</Nav.Link>
<Nav.Link as={Link} to="/contact" href="#contact">Contact</Nav.Link>
</Nav>
<div className="d-flex gap-2">
{user ? (
<>
<Button as={Link} to="/dashboard" variant="outline-primary">Dashboard</Button>
<Button variant="outline-secondary" onClick={onLogout}>Logout</Button>
</>
) : (
<>
<Button variant="outline-primary" onClick={onShowLogin}>Login</Button>
</>
)}
</div>
</Navbar.Collapse>
</Container>
</Navbar>
);
}
}


export default NavbarComponent;
