import React, { useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Breadcrumb,
  Alert,
  Toast,
  ToastContainer,
} from "react-bootstrap";
import { FaPhoneAlt, FaEnvelope, FaMapMarkerAlt } from "react-icons/fa";
import { submitContact } from "../services/api";

const ContactPage = () => {
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    mobile_number: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showToast, setShowToast] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'mobile_number') {
      const digits = value.replace(/\D/g, '').slice(0, 10);
      setForm((prev) => ({ ...prev, [name]: digits }));
      return;
    }
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!form.first_name || !form.email || !form.mobile_number) {
      setError("Please fill all required fields");
      return;
    }
    if (!/^\d{10}$/.test(form.mobile_number)) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }
    try {
      setSubmitting(true);
      const res = await submitContact(form);
      const msg = res?.message || "Enquiry is successfully submitted";
      setSuccess(msg);
      setShowToast(true);
      setForm({ first_name: "", last_name: "", email: "", mobile_number: "", message: "" });
    } catch (err) {
      setError(err?.message || "Failed to submit");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* ===== Breadcrumb Section ===== */}
      <section
        className="py-5 text-center contact-breadcrumb"
        style={{ backgroundColor: "#e9eef5" }}
      >
        <Container>
          <h2 className="fw-semibold text-dark fs-2 mb-1">Contact Us</h2>
          <div className="d-flex justify-content-center">
            <Breadcrumb className="mb-0">
              <Breadcrumb.Item href="/">Home</Breadcrumb.Item>
              <Breadcrumb.Item active>Contact Us</Breadcrumb.Item>
            </Breadcrumb>
          </div>
        </Container>
      </section>

      {/* ===== Contact Info Cards ===== */}
      <section className="py-5 bg-white">
        <Container>
          <div className="text-center mb-5">
            <h2 className="fs-3 fw-semibold text-dark mb-2">Contact Us</h2>
            <p className="text-secondary mt-1 fw-normal" style={{ maxWidth: "760px", margin: "0 auto" }}>
              Great doctor if you need your family member to get effective
              immediate assistance, emergency treatment, or simple consultation.
            </p>
          </div>

          <Row className="justify-content-center g-4">
            <Col md={4}>
              <Card className="text-center border-0 shadow-sm rounded-3 contact-card p-4">
                <div
                  className="icon-circle mx-auto mb-3"
                  style={{
                    backgroundColor: "#0d6efd",
                    color: "#fff",
                    width: "60px",
                    height: "60px",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <FaPhoneAlt size={24} />
                </div>
                <h6 className="fw-bold text-dark">Phone Number</h6>
                <p className="text-secondary mb-0">+9865478521</p>
              </Card>
            </Col>

            <Col md={4}>
              <Card className="text-center border-0 shadow-sm rounded-3 contact-card p-4">
                <div
                  className="icon-circle mx-auto mb-3"
                  style={{
                    backgroundColor: "#0d6efd",
                    color: "#fff",
                    width: "60px",
                    height: "60px",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <FaEnvelope size={24} />
                </div>
                <h6 className="fw-bold text-dark">Email</h6>
                <p className="text-secondary mb-0">pracd@example.com</p>
              </Card>
            </Col>

            <Col md={4}>
              <Card className="text-center border-0 shadow-sm rounded-3 contact-card p-4">
                <div
                  className="icon-circle mx-auto mb-3"
                  style={{
                    backgroundColor: "#0d6efd",
                    color: "#fff",
                    width: "60px",
                    height: "60px",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <FaMapMarkerAlt size={24} />
                </div>
                <h6 className="fw-bold text-dark">Location</h6>
                <p className="text-secondary mb-0">Kolkata</p>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>

      {/* ===== Map and Contact Form ===== */}
      <section className="py-5 bg-light">
        <Container>
          <Row className="align-items-start g-4">
            {/* --- Map --- */}
            <Col md={6}>
              <div className="ratio ratio-4x3 shadow rounded-4 overflow-hidden">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3023.646961145218!2d-74.00601598459756!3d40.71277527933027!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDDCsDQyJzQ2LjAiTiA3NMKwMDAnMjAuMCJX!5e0!3m2!1sen!2sus!4v1618880421965!5m2!1sen!2sus"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  title="Google Map"
                ></iframe>
              </div>
            </Col>

            {/* --- Contact Form --- */}
            <Col md={6}>
              <div>
                <h6 className="text-uppercase text-primary fw-semibold">
                  Get in Touch
                </h6>
                <h3 className="fw-bold mb-4">Contact Details</h3>

                {error && <Alert variant="danger">{error}</Alert>}
                {success && <Alert variant="success">{success}</Alert>}
                <Form onSubmit={handleSubmit}>
                  <Row className="mb-3">
                    <Col md={6}>
                      <Form.Label className="mb-1">First Name <span className="text-danger">*</span></Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Enter First Name"
                        name="first_name"
                        value={form.first_name}
                        onChange={handleChange}
                        className="py-3"
                        required
                      />
                    </Col>
                    <Col md={6}>
                      <Form.Label className="mb-1">Last Name</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Enter Last Name"
                        name="last_name"
                        value={form.last_name}
                        onChange={handleChange}
                        className="py-3"
                      />
                    </Col>
                  </Row>

                  <Row className="mb-3">
                    <Col md={6}>
                      <Form.Label className="mb-1">Email <span className="text-danger">*</span></Form.Label>
                      <Form.Control
                        type="email"
                        placeholder="Email Address"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        className="py-3"
                        required
                      />
                    </Col>
                    <Col md={6}>
                      <Form.Label className="mb-1">Mobile Number <span className="text-danger">*</span></Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Mobile Number"
                        name="mobile_number"
                        value={form.mobile_number}
                        onChange={handleChange}
                        inputMode="numeric"
                        maxLength={10}
                        pattern="[0-9]{10}"
                        className="py-3"
                        required
                      />
                    </Col>
                  </Row>

                  <Form.Group className="mb-3">
                    <Form.Label className="mb-1">Message</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={4}
                      placeholder="Enter Message"
                      name="message"
                      value={form.message}
                      onChange={handleChange}
                      className="py-3"
                    />
                  </Form.Group>

                  <Button
                    variant="primary"
                    size="lg"
                    type="submit"
                    disabled={submitting}
                    className="px-5 rounded-pill"
                  >
                    {submitting ? "Submitting..." : "Submit"}
                  </Button>
                </Form>
              </div>
            </Col>
          </Row>
        </Container>
      </section>
      {/* Toast notification */}
      <ToastContainer position="bottom-end" className="p-3">
        <Toast bg="success" onClose={() => setShowToast(false)} show={showToast} delay={3000} autohide>
          <Toast.Header closeButton>
            <strong className="me-auto">Success</strong>
          </Toast.Header>
          <Toast.Body className="text-white">{success || "Enquiry is successfully submitted"}</Toast.Body>
        </Toast>
      </ToastContainer>
    </>
  );
};

export default ContactPage;
