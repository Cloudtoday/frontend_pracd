import React, { Component } from "react";
import { Container, Row, Col, Button, Form } from "react-bootstrap";
import { BsSearch, BsCheckCircle } from "react-icons/bs";

class HeroSection extends Component {
  constructor(props) {
    super(props);
    this.state = {
      location: "",
      query: "",
    };
  }

  handleInputChange = (e) => {
    this.setState({ query: e.target.value });
  };

  handleLocationChange = (e) => {
    this.setState({ location: e.target.value });
  };

  render() {
    return (
      <section
        className="hero-section d-flex align-items-center"
        style={{
          width: "100%",
          minHeight: "100vh",
          backgroundColor: "#e9f3ff",
          overflow: "hidden",
        }}
      >
        <Container>
          <Row className="align-items-center">
            {/* Left Side */}
            <Col md={6} className="text-start">
              <h1 className="fw-bold display-5">
                Search Doctor, <br />
                <span className="text-primary">Make an Appointment</span>
              </h1>

              <div className="mt-4">
                <Button variant="primary" className="me-3">
                  <BsCheckCircle className="me-2" />
                  Instant Operation & Appointment
                </Button>
                <Button variant="primary">
                  <BsCheckCircle className="me-2" />
                  100% Expert Doctors
                </Button>
              </div>

              <p className="text-secondary mt-4">
                Discover the best doctors, clinics, and hospitals nearest to
                you. Book appointments instantly and manage your health
                conveniently.
              </p>

              </Col>

            {/* Right Side (Doctor Image) */}
            <Col
              md={6}
              className="text-center d-flex justify-content-center align-items-center mt-5 mt-md-0"
            >
              <img
                src="https://doccure-wp.dreamstechnologies.com/wp-content/uploads/2023/04/banner-img.png"
                alt="Doctor illustration"
                className="img-fluid"
                style={{
                  maxHeight: "85vh",
                  objectFit: "contain",
                }}
              />
            </Col>
          </Row>
        </Container>
      </section>
    );
  }
}

export default HeroSection;
