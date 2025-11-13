import React, { Component } from 'react';
import { Modal, Tabs, Tab, Row, Col } from 'react-bootstrap';
import { BsShieldCheck, BsClock, BsHeart } from 'react-icons/bs';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';


class AuthModal extends Component {
constructor(props) {
super(props);
this.state = { key: this.props.initialTab || 'login' };
}


render() {
const { show, onHide, onSubmit } = this.props;
return (
<Modal show={show} onHide={onHide} centered size="xl">
<Modal.Header closeButton>
<Modal.Title>Welcome to PracD</Modal.Title>
</Modal.Header>
<Modal.Body>
  <Row className="g-0">
    <Col md={5}
      className="d-none d-md-flex flex-column justify-content-center text-white p-4"
      style={{
        background: 'linear-gradient(135deg, #0d6efd 0%, #6610f2 100%)',
        borderRadius: '0.5rem'
      }}
    >
      <div className="mb-4">
        <h3 className="fw-bold mb-2">PracD</h3>
        <p className="opacity-75 mb-0">Your trusted healthcare companion.</p>
      </div>
      <ul className="list-unstyled small m-0">
        <li className="d-flex align-items-center mb-2"><BsShieldCheck className="me-2"/> Secure accounts and data</li>
        <li className="d-flex align-items-center mb-2"><BsClock className="me-2"/> Quick appointments and reminders</li>
        <li className="d-flex align-items-center"><BsHeart className="me-2"/> Top doctors, patient-first experience</li>
      </ul>
    </Col>
    <Col md={7} className="p-3 p-md-4">
      <Tabs
        activeKey={this.state.key}
        onSelect={(k) => this.setState({ key: k })}
        className="nav-pills mb-3"
      >
        <Tab eventKey="login" title="Login">
          <div className="p-1 p-md-2">
            <h4 className="fw-semibold mb-3">Welcome back</h4>
            <LoginForm onSubmit={onSubmit} />
          </div>
        </Tab>
        <Tab eventKey="register" title="Register">
          <div className="p-1 p-md-2">
            <h4 className="fw-semibold mb-3">Create your account</h4>
            <RegisterForm onSuccess={() => this.setState({ key: 'login' })} />
          </div>
        </Tab>
      </Tabs>
    </Col>
  </Row>
</Modal.Body>
</Modal>
);
}
}


export default AuthModal;
