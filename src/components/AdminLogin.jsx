import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Breadcrumb } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { adminLoginRequest, setToken } from '../services/api';
import { jwtDecode } from 'jwt-decode';

const AdminLogin = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }
    try {
      setLoading(true);
      const { token } = await adminLoginRequest({ useremail: email, password });
      setToken(token);
      const decoded = jwtDecode(token);
      const user = {
        email,
        token,
        role: decoded.role || 'admin',
        id: decoded.id || decoded._id || decoded.userId || decoded.sub,
        name: decoded.name || 'Admin',
      };
      if (typeof onLogin === 'function') onLogin(user);
    } catch (err) {
      setError(err?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <section className="py-5 text-center" style={{ backgroundColor: '#e9eef5' }}>
        <Container>
          <h2 className="fw-semibold text-dark fs-2 mb-1">Admin Login</h2>
          <div className="d-flex justify-content-center">
            <Breadcrumb className="mb-0">
              <Breadcrumb.Item linkAs={Link} linkProps={{ to: "/" }}>Home</Breadcrumb.Item>
              <Breadcrumb.Item active>Admin Login</Breadcrumb.Item>
            </Breadcrumb>
          </div>
        </Container>
      </section>

      <section className="py-5 bg-light">
        <Container>
          <Row className="justify-content-center">
            <Col md={6} lg={5}>
              <Card className="shadow-sm border-0 rounded-4">
                <Card.Body className="p-4">
                  <h4 className="mb-3">Sign in</h4>
                  {error && <Alert variant="danger">{error}</Alert>}
                  <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                      <Form.Label>Email</Form.Label>
                      <Form.Control
                        type="email"
                        placeholder="Enter admin email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Password</Form.Label>
                      <Form.Control
                        type="password"
                        placeholder="Enter password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </Form.Group>
                    <Button type="submit" className="w-100" disabled={loading}>
                      {loading ? 'Signing in...' : 'Login'}
                    </Button>
                  </Form>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>
    </>
  );
};

export default AdminLogin;
