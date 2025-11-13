import React, { Component } from 'react';
import { Form, Button, Row, Col, Alert, InputGroup } from 'react-bootstrap';
import { BsPerson, BsEnvelope, BsLock, BsPersonBadge } from 'react-icons/bs';
import { registerRequest } from '../services/api';

class RegisterForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      name: '',
      email: '',
      password: '',
      role: 'patient',
      error: ''
    };
  }

  handleChange = (e) => {
    this.setState({ [e.target.name]: e.target.value });
  };

  handleSubmit = async (e) => {
    e.preventDefault();

    const { name, email, password, role } = this.state;

    if (!name || !email || !password) {
      this.setState({ error: 'All fields are required.' });
      return;
    }

    // Password must contain at least 8 characters, one uppercase letter,
    // one lowercase letter, one number, and one special character.
    const strongPwd = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]).{8,}$/;
    if (!strongPwd.test(password)) {
      this.setState({
        error:
          'Password must be at least 8 characters and include uppercase, lowercase, number, and special character.'
      });
      return;
    }

    try {
      await registerRequest({ username: name, useremail: email, password, role });
      // Do not auto-login after registration. Switch to login tab instead.
      this.setState({ error: '' });
      if (typeof this.props.onSuccess === 'function') {
        this.props.onSuccess();
      }
    } catch (err) {
      this.setState({ error: err.message || 'Registration failed' });
    }
  };

  render() {
    const { name, email, password, role, error } = this.state;

    return (
      <Form onSubmit={this.handleSubmit}>
        {error && <Alert variant="danger">{error}</Alert>}

        <Row className="g-2">
          <Col md={6}>
            <Form.Group>
              <Form.Label>Full Name</Form.Label>
              <InputGroup>
                <InputGroup.Text><BsPerson /></InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Enter your full name"
                  name="name"
                  value={name}
                  onChange={this.handleChange}
                />
              </InputGroup>
            </Form.Group>
          </Col>

          <Col md={6}>
            <Form.Group>
              <Form.Label>Email</Form.Label>
              <InputGroup>
                <InputGroup.Text><BsEnvelope /></InputGroup.Text>
                <Form.Control
                  type="email"
                  placeholder="Enter your email"
                  name="email"
                  value={email}
                  onChange={this.handleChange}
                />
              </InputGroup>
            </Form.Group>
          </Col>
        </Row>

        <Row className="g-2 mt-2">
          <Col md={12}>
            <Form.Group>
              <Form.Label>Password</Form.Label>
              <InputGroup size="sm">
                <InputGroup.Text><BsLock /></InputGroup.Text>
                <Form.Control
                  type="password"
                  placeholder="Create a strong password"
                  name="password"
                  value={password}
                  onChange={this.handleChange}
                  minLength={8}
                />
              </InputGroup>
              <Form.Text className="text-muted">
                Use 8+ characters with at least one uppercase, one lowercase, one number, and one special character
                (e.g., Aaagh$#678).
              </Form.Text>
            </Form.Group>
          </Col>
        </Row>

        <Form.Group className="mt-3">
          <Form.Label>Register As</Form.Label>
          <InputGroup>
            <InputGroup.Text><BsPersonBadge /></InputGroup.Text>
            <Form.Select name="role" value={role} onChange={this.handleChange}>
              <option value="patient">Patient</option>
              <option value="doctor">Doctor</option>
            </Form.Select>
          </InputGroup>
        </Form.Group>

        <Button type="submit" className="mt-3 w-100 py-2">
          Create Account
        </Button>
      </Form>
    );
  }
}

export default RegisterForm;
