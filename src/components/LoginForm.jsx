import React, { Component } from 'react';
import { Form, Button, Alert, InputGroup } from 'react-bootstrap';
import { BsEnvelope, BsLock } from 'react-icons/bs';
import { loginRequest, setToken } from '../services/api';
import PropTypes from 'prop-types';
import { jwtDecode } from "jwt-decode";

class LoginForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      email: '',
      password: '',
      error: ''
    };
  }

  handleChange = (e) => {
    this.setState({ [e.target.name]: e.target.value });
  };

  handleSubmit = async (e) => {
    e.preventDefault();

    const { email, password } = this.state;

    if (!email || !password) {
      this.setState({ error: 'Please fill in all fields.' });
      return;
    }

    try {
      const { token } = await loginRequest({ useremail: email, password });
      setToken(token);
      const decoded = jwtDecode(token); 
      const user = { 
        email, 
        token, 
        role: decoded.role, 
        id: decoded.id || decoded._id || decoded.userId || decoded.sub 
      };
      if (typeof this.props.onSubmit === 'function') {
        this.props.onSubmit(user);
      }
    } catch (err) {
      this.setState({ error: err.message || 'Login failed' });
    }
  };

  render() {
    const { email, password, error } = this.state;

    return (
      <Form onSubmit={this.handleSubmit}>
        {error && <Alert variant="danger">{error}</Alert>}

        <Form.Group className="mb-3">
          <Form.Label>Email address</Form.Label>
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

        <Form.Group className="mb-3">
          <Form.Label>Password</Form.Label>
          <InputGroup>
            <InputGroup.Text><BsLock /></InputGroup.Text>
            <Form.Control
              type="password"
              placeholder="Enter your password"
              name="password"
              value={password}
              onChange={this.handleChange}
            />
          </InputGroup>
        </Form.Group>

        <Button variant="primary" type="submit" className="w-100 py-2">
          Login
        </Button>

        {/* Removed 'Forgot password?' link as requested */}
      </Form>
    );
  }
}

export default LoginForm;

LoginForm.propTypes = {
  onSubmit: PropTypes.func,
};

LoginForm.defaultProps = {
  onSubmit: undefined,
};
