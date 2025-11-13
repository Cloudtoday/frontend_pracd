import React, { useEffect, useState } from "react";
import { Container, Row, Col, Button, Breadcrumb, Spinner, Alert, Modal } from "react-bootstrap";
import { BsGeoAlt, BsEnvelope } from "react-icons/bs";
import { Link, useParams, useLocation } from "react-router-dom";
import { getPublicDoctorProfile, getToken, getProfileById } from "../services/api";
import { jwtDecode } from "jwt-decode";

const DoctorDetails = () => {
  const { id } = useParams();
  const location = useLocation();
  const initialDoctor = (location && location.state && location.state.doc) ? location.state.doc : null;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [doctor, setDoctor] = useState(initialDoctor);
  const [userRole, setUserRole] = useState("");
  const [userInactive, setUserInactive] = useState(false);
  const [showForbidden, setShowForbidden] = useState(false);
  const [forbiddenMsg, setForbiddenMsg] = useState("You are not allowed to Book an appointment.");

  const placeholderImage =
    "https://images.unsplash.com/photo-1607746882042-944635dfe10e?q=80&w=800&auto=format&fit=crop";

  useEffect(() => {
    let isMounted = true;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const data = await getPublicDoctorProfile(id);
        if (isMounted) setDoctor(data || initialDoctor || null);
      } catch (e) {
        const msg = e?.message || "Failed to load doctor profile";
        // If we already have doctor data (from route state), suppress the error alert
        if (isMounted) {
          if (initialDoctor) {
            setError("");
          } else {
            setError(msg);
          }
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    })();
    return () => { isMounted = false; };
  }, [id]);

  useEffect(() => {
    try {
      const token = getToken();
      if (!token) return;
      const decoded = jwtDecode(token);
      const role = (decoded?.role || "").toString().toLowerCase();
      setUserRole(role);
      const uid = decoded?.id || decoded?._id || decoded?.userId || decoded?.sub;
      if (role === 'patient' && uid) {
        (async () => {
          try {
            const prof = await getProfileById(uid);
            const st = (prof?.status || '').toString().toLowerCase();
            setUserInactive(st === 'inactive');
          } catch (_) {}
        })();
      }
    } catch (_) {}
  }, []);

  const name = doctor?.username || doctor?.name || "Doctor";
  const specialization = doctor?.specialization || doctor?.specialty || "General Physician";
  const addressText = (
    [doctor?.address, doctor?.city, doctor?.state, doctor?.country]
      .filter(Boolean)
      .join(", ")
  ) || doctor?.address || "Address not specified";
  const fee = doctor?.fees || doctor?.fee || "N/A";
  const experience = doctor?.experience; // years (optional)
  const feeText = (() => {
    const n = Number(fee);
    if (!isNaN(n) && isFinite(n)) {
      try {
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);
      } catch (_) {
        return `₹${n}`;
      }
    }
    return String(fee).startsWith('₹') ? String(fee) : `₹${fee}`;
  })();
  const imageUrl = doctor?.profileImage || doctor?.img || placeholderImage;
  const overview = doctor?.doctor_description || doctor?.bio || doctor?.about || "";
  const email = doctor?.useremail || doctor?.email || "";

  return (
    <>
      {/* === Breadcrumb Section === */}
      <section className="py-5 text-center" style={{ backgroundColor: "#e9eef5" }}>
        <Container>
          <h2 className="fw-semibold text-dark fs-2 mb-1">Doctor Profile</h2>
          <div className="d-flex justify-content-center">
            <Breadcrumb className="mb-0">
              <Breadcrumb.Item linkAs={Link} linkProps={{ to: "/" }}>
                Home
              </Breadcrumb.Item>
              <Breadcrumb.Item active>{name}</Breadcrumb.Item>
            </Breadcrumb>
          </div>
        </Container>
      </section>

      {/* === Doctor Info Section === */}
      <section className="py-5 bg-white">
        <Container>
          {loading && (
            <div className="text-center py-4"><Spinner animation="border" /></div>
          )}
          {error && !loading && (
            <Alert variant="danger">{error}</Alert>
          )}
          {!loading && !error && (
            <Row className="align-items-center">
              {/* Doctor Image */}
              <Col md={4} className="text-center mb-4 mb-md-0">
                <img
                  src={imageUrl}
                  alt={name}
                  className="img-fluid rounded-4 shadow-sm"
                  onError={(e) => { if (e.currentTarget.src !== placeholderImage) e.currentTarget.src = placeholderImage; }}
                  style={{ maxHeight: "380px", objectFit: "cover" }}
                />
              </Col>

              {/* Doctor Details */}
              <Col md={{ span: 7, offset: 1 }}>
                <div className="p-4 rounded-4 shadow-sm bg-white border" style={{ maxWidth: 560 }}>
                  <div className="d-flex justify-content-between align-items-center">
                    <h2 className="fw-bold mb-1 mb-md-0">{name}</h2>
                    {(experience !== undefined && experience !== null && String(experience).trim() !== '') && (
                      <div className="text-muted small ms-3">Experience: {String(experience)} {Number(experience) === 1 ? 'year' : 'years'}</div>
                    )}
                  </div>
                  <h5 className="text-primary mb-3">{specialization}</h5>
                <p className="mb-2 text-muted">
                  <BsGeoAlt className="me-2 text-primary" /> {addressText}
                </p>
                  {email && (
                    <p className="mb-2 text-muted">
                      <BsEnvelope className="me-2 text-primary" /> {email}
                    </p>
                  )}
                  <p className="mb-4">
                    <strong>Consultation Fee:</strong> {" "}
                    <span className="text-success">{feeText}</span>
                  </p>
                  {/* Status intentionally hidden per request */}

                  <Button
                    as={Link}
                    to={`/book-appointment/${id}`}
                    state={{ doc: doctor }}
                    variant="primary"
                    size="lg"
                    className="px-4"
                    style={{ borderRadius: "10px" }}
                    onClick={(e) => {
                      if (userRole === 'admin' || userRole === 'doctor') {
                        e.preventDefault();
                        setForbiddenMsg('You are not allowed to Book an appointment.');
                        setShowForbidden(true);
                      } else if (userRole === 'patient' && userInactive) {
                        e.preventDefault();
                        setForbiddenMsg('User is Inactive. You cannot Book appointment');
                        setShowForbidden(true);
                      }
                    }}
                  >
                    Book Appointment
                  </Button>
                </div>
              </Col>
            </Row>
          )}
        </Container>
      </section>

      {/* === Overview Section === */}
      {!loading && !error && (
        <section
          className="py-5"
          style={{ backgroundColor: "#f9fbfd", borderTop: "1px solid #e3e7ed" }}
        >
          <Container>
            <h4 className="fw-bold mb-3">Overview</h4>
            <p style={{ maxWidth: "800px", lineHeight: "1.7", color: "#555" }}>
              {overview || "No description available for this doctor."}
            </p>
          </Container>
        </section>
      )}
      <Modal show={showForbidden} onHide={() => setShowForbidden(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Notice</Modal.Title>
        </Modal.Header>
        <Modal.Body>{forbiddenMsg}</Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={() => setShowForbidden(false)}>OK</Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default DoctorDetails;
