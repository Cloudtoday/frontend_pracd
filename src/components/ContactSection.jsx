import React, { Component } from 'react';
import { Container, Row, Col, Form, Button, Badge } from 'react-bootstrap';
import { BsTelephone, BsEnvelope, BsGeoAlt, BsClock, BsFacebook, BsTwitter, BsInstagram } from 'react-icons/bs';


class ContactSection extends Component {
  render() {

    return (
      <section id="contact" className="contact-section py-5">
        <Container>
          <Row className="g-4 align-items-stretch">
            {/* Left: Get in touch info card */}
            <Col md={5}>
              <div className="contact-card p-4 rounded-4 h-100">
                <h3 className="mb-2">Get in touch</h3>
                <p className="text-secondary mb-4">We'd love to hear from you.</p>

                <div className="d-flex flex-column gap-3">
                  <div className="d-flex align-items-start">
                    <div className="contact-icon me-3"><BsTelephone /></div>
                    <div>
                      <div className="fw-semibold">Phone</div>
                      <div className="text-secondary">+91 98765 43210</div>
                    </div>
                  </div>

                  <div className="d-flex align-items-start">
                    <div className="contact-icon me-3"><BsEnvelope /></div>
                    <div>
                      <div className="fw-semibold">Email</div>
                      <div className="text-secondary">support@PracD.app</div>
                    </div>
                  </div>

                  <div className="d-flex align-items-start">
                    <div className="contact-icon me-3"><BsGeoAlt /></div>
                    <div>
                      <div className="fw-semibold">Address</div>
                      <div className="text-secondary">123 Health Street, Mumbai, MH 400001</div>
                    </div>
                  </div>

                  <div className="d-flex align-items-start">
                    <div className="contact-icon me-3"><BsClock /></div>
                    <div>
                      <div className="fw-semibold">Office Hours</div>
                      <div className="text-secondary">Mon–Sat: 9:00 AM – 6:00 PM</div>
                    </div>
                  </div>
                </div>

                <div className="d-flex align-items-center gap-3 mt-4">
                  <a href="https://facebook.com/" target="_blank" rel="noopener noreferrer" className="text-secondary fs-5"><BsFacebook /></a>
                  <a href="https://twitter.com/" target="_blank" rel="noopener noreferrer" className="text-secondary fs-5"><BsTwitter /></a>
                  <a href="https://instagram.com/" target="_blank" rel="noopener noreferrer" className="text-secondary fs-5"><BsInstagram /></a>
                </div>
              </div>
            </Col>

            {/* Right: Modern contact form */}
            <Col md={7}>
              <Form className="contact-form bg-white p-4 rounded-4 h-100">
                <h5 className="mb-3">Send us a message</h5>
                <Row className="g-3">
                  <Col md={6}>
                    <Form.Label className="mb-1">Your Name <span className="text-danger">*</span></Form.Label>
                    <Form.Control size="lg" placeholder="Enter your name" required />
                  </Col>
                  <Col md={6}>
                    <Form.Label className="mb-1">Email <span className="text-danger">*</span></Form.Label>
                    <Form.Control size="lg" placeholder="Enter your email" type="email" required />
                  </Col>
                  <Col md={12}>
                    <Form.Label className="mb-1">Subject</Form.Label>
                    <Form.Control size="lg" placeholder="Subject (optional)" />
                  </Col>
                  <Col md={12}>
                    <Form.Label className="mb-1">Message <span className="text-danger">*</span></Form.Label>
                    <Form.Control size="lg" as="textarea" rows={5} placeholder="Write your message" required />
                  </Col>
                  <Col md={12}><Button size="lg">Send Message</Button></Col>
                </Row>
              </Form>
            </Col>
          </Row>
        </Container>
      </section>
    );
  }
}


export default ContactSection;
