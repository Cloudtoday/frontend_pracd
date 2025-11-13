import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import { Link } from "react-router-dom";
import {
  BsTelephone,
  BsEnvelope,
  BsGeoAlt,
  BsFacebook,
  BsTwitter,
  BsInstagram,
  BsLinkedin,
} from "react-icons/bs";

const Footer = () => {
  return (
    <footer
      className="pt-5"
      style={{
        background: "linear-gradient(180deg, #eef3f9 0%, #f5f8fb 100%)", // soft bluish gradient
        color: "#333",
        borderTop: "1px solid #dbe3ea",
      }}
    >
      <Container>
        <Row className="gy-4">
          {/* About Section */}
          <Col md={4}>
            <h5 className="fw-bold mb-3 text-primary">PracD</h5>
            <p className="text-secondary">
              We help you find trusted doctors and make appointments quickly and
              easily. Book your next visit and take control of your health.
            </p>
            <div className="d-flex gap-3 mt-3">
              <a href="#" className="text-secondary fs-5 hover-icon">
                <BsFacebook />
              </a>
              <a href="#" className="text-secondary fs-5 hover-icon">
                <BsTwitter />
              </a>
              <a href="#" className="text-secondary fs-5 hover-icon">
                <BsInstagram />
              </a>
              <a href="#" className="text-secondary fs-5 hover-icon">
                <BsLinkedin />
              </a>
            </div>
          </Col>

          {/* Quick Links */}
          <Col md={4}>
            <h5 className="fw-bold mb-3 text-primary">Quick Links</h5>
            <ul className="list-unstyled text-secondary">
              <li className="mb-2">
                <Link to="/" className="text-secondary text-decoration-none">
                  Home
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/doctors" className="text-secondary text-decoration-none">
                  Our Doctors
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/contact" className="text-secondary text-decoration-none">
                  Contact Us
                </Link>
              </li>
              <li className="mb-2">
                <a href="#" className="text-secondary text-decoration-none">
                  Privacy Policy
                </a>
              </li>
            </ul>
          </Col>

          {/* Contact Info */}
          <Col md={4}>
            <h5 className="fw-bold mb-3 text-primary">Contact Info</h5>
            <ul className="list-unstyled text-secondary">
              <li className="mb-2 d-flex align-items-center">
                <BsTelephone className="me-2 text-primary" /> +9865478521
              </li>
              <li className="mb-2 d-flex align-items-center">
                <BsEnvelope className="me-2 text-primary" /> pracd@example.com
              </li>
              <li className="d-flex align-items-center">
                <BsGeoAlt className="me-2 text-primary" /> Kolkata
              </li>
            </ul>
          </Col>
        </Row>

        {/* Copyright Bar */}
        <div
          className="mt-5 pt-3 text-center"
          style={{
            borderTop: "1px solid #dbe3ea",
            color: "#6b7280",
            fontSize: "14px",
          }}
        >
          © {new Date().getFullYear()} <strong className="text-primary">PracD</strong>. All Rights Reserved.
        </div>
      </Container>
    </footer>
  );
};

export default Footer;
