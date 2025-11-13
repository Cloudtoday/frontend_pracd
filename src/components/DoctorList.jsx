import React, { useEffect, useState } from "react";
import { Container, Row, Col, Breadcrumb, Spinner, Alert } from "react-bootstrap";
import DoctorCardItem from "./DoctorCardItem";
import { Link } from "react-router-dom";
import { getAllDoctors } from "../services/api"; // adjust import path

const DoctorList = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch doctor profiles from API
  useEffect(() => {
    const loadDoctors = async () => {
      try {
        const data = await getAllDoctors();
        setDoctors(Array.isArray(data) ? data : []);
        setError("");
      } catch (err) {
        console.error("Error loading doctors:", err);
        setError(err?.message || "Unable to load doctors");
      } finally {
        setLoading(false);
      }
    };
    loadDoctors();
  }, []);

  // Static image URLs (remote to avoid missing local assets)
  const placeholderImage =
      "https://images.unsplash.com/photo-1607746882042-944635dfe10e?q=80&w=800&auto=format&fit=crop";
  const staticImages = [
    "https://images.unsplash.com/photo-1607746882042-944635dfe10e?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1550831107-1553da8c8464?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1537368910025-700350fe46c7?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1551601651-2a8555f1a136?q=80&w=800&auto=format&fit=crop",
    placeholderImage,
  ];

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" />
        <p>Loading doctors...</p>
      </div>
    );
  }

  return (
    <>
      {/* ======= Breadcrumb Section ======= */}
      <section className="py-5 text-center" style={{ backgroundColor: "#e9eef5" }}>
        <Container>
          <h2 className="fw-semibold text-dark fs-2 mb-1">Our Doctors</h2>
          <div className="d-flex justify-content-center">
            <Breadcrumb className="mb-0">
              <Breadcrumb.Item href="/">Home</Breadcrumb.Item>
              <Breadcrumb.Item active>Doctors</Breadcrumb.Item>
            </Breadcrumb>
          </div>
        </Container>
      </section>

      {/* ======= Doctor List ======= */}
      <section className="py-5 bg-light">
        <Container>
          <Row className="gy-4">
            {error && (
              <Col xs={12}>
                <Alert variant="danger">{error}</Alert>
              </Col>
            )}
            {doctors.length > 0 ? (
              doctors.map((doc, index) => (
                <Col key={doc._id || doc.id || index} xs={12} md={6} lg={3}>
                  <DoctorCardItem
                    doc={doc}
                    imageUrl={doc.profileImage || doc.img || staticImages[index % staticImages.length]}
                    placeholderImage={placeholderImage}
                  />
                </Col>
              ))
            ) : (
              <p className="text-center text-muted">No doctors found.</p>
            )}
          </Row>
        </Container>
      </section>
    </>
  );
};

export default DoctorList;
