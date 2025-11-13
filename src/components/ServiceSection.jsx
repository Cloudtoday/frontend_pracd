import React from "react";
import { Container, Row, Col } from "react-bootstrap";

const ServiceSection = () => {
  const services = [
    {
      img: "https://doccure-wp.dreamstechnologies.com/wp-content/uploads/2022/03/clinic-14.jpg",
      title: "Heart Specialist",
    },
    {
      img: "https://doccure-wp.dreamstechnologies.com/wp-content/uploads/2022/03/clinic-13.jpg",
      title: "Dental Care",
    },
    {
      img: "https://doccure-wp.dreamstechnologies.com/wp-content/uploads/2022/03/clinic-17.jpg",
      title: "Laboratory Test",
    },
    {
      img: "https://doccure-wp.dreamstechnologies.com/wp-content/uploads/2022/03/clinic-16.jpg",
      title: "Radiology Imaging",
    },
  ];

  return (
    <section
      className="service-section py-3"
      style={{ backgroundColor: "#ffffff" }}
    >
      <Container className="text-center">
        <h2
          className="fw-bold mb-2 service-title"
          style={{ backgroundColor: "#ffffff", display: "inline-block", padding: "8px 16px", borderRadius: "12px" }}
        >
          High Quality Service for You
        </h2>
        <p className="text-secondary mb-2 section-subtitle" style={{ maxWidth: "560px", margin: "0 auto" }}>
          Search specialists, compare profiles,<br />
          and book appointments in minutes.
        </p>

        <Row className="g-1 justify-content-center">
          {services.map((service, index) => (
            <Col
              key={index}
              xs={12}
              sm={6}
              md={3}
              className="d-flex justify-content-center"
            >
              <div
                className="service-card text-center p-2 bg-white shadow-sm rounded-4"
                style={{
                  transition: "all 0.3s ease",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-5px)";
                  e.currentTarget.style.boxShadow = "0 6px 15px rgba(0,0,0,0.15)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 2px 10px rgba(0,0,0,0.05)";
                }}
              >
                <img
                  src={service.img}
                  alt={service.title}
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.src = "https://images.unsplash.com/photo-1600959907703-125ba1374a12?q=80&w=1200&auto=format&fit=crop";
                  }}
                  className="img-fluid rounded-3 mb-2 service-img"
                  style={{ height: "180px", objectFit: "cover", width: "100%" }}
                />
                <h6 className="fw-semibold text-dark">{service.title}</h6>
              </div>
            </Col>
          ))}
        </Row>
      </Container>
      
    </section>
    
  );
};

export default ServiceSection;
