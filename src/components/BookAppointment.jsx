import React, { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Button,
  Breadcrumb,
  Card,
  Form,
  Alert,
  Spinner,
  Modal,
} from "react-bootstrap";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { Link, useParams, useLocation, useNavigate } from "react-router-dom";
import { BsGeoAlt, BsEnvelope, BsTelephone } from "react-icons/bs";
import { getPublicDoctorProfile, getToken, getProfileById, createAppointment } from "../services/api";
import { jwtDecode } from "jwt-decode";

const placeholderImage =
  "https://images.unsplash.com/photo-1607746882042-944635dfe10e?q=80&w=800&auto=format&fit=crop";

// Format date as DD/MM/YYYY
const formatDate = (d) => {
  if (!d) return '';
  const dt = new Date(d);
  if (isNaN(dt.getTime())) return '';
  const dd = String(dt.getDate()).padStart(2, '0');
  const mm = String(dt.getMonth() + 1).padStart(2, '0');
  const yyyy = dt.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
};

const BookAppointment = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const initialDoctor = location?.state?.doc || null;

  const [step, setStep] = useState("info"); // info | datetime | basic
  const [date, setDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState("");
  const [doctor, setDoctor] = useState(initialDoctor);
  const [loading, setLoading] = useState(!initialDoctor);
  const [error, setError] = useState("");
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [patientType, setPatientType] = useState("myself");
  const [userProfile, setUserProfile] = useState(null);
  const [form, setForm] = useState({ name: "", phone: "", email: "" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      if (!id) { setLoading(false); return; }
      setLoading(true);
      setError("");
      try {
        const d = await getPublicDoctorProfile(id);
        if (alive) setDoctor(d || initialDoctor || null);
      } catch (e) {
        if (alive) {
          if (initialDoctor) {
            setError("");
          } else {
            setError(e?.message || "Failed to load doctor");
          }
        }
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [id]);
  // Prefill from logged-in user's profile when 'Myself' is selected
  useEffect(() => {
    const token = getToken();
    if (!token) return;
    let mounted = true;
    try {
      const decoded = jwtDecode(token);
      const uid = decoded?.id || decoded?._id || decoded?.userId || decoded?.sub;
      if (!uid) return;
      (async () => {
        try {
          const profile = await getProfileById(uid);
          if (mounted) setUserProfile(profile || null);
        } catch (_) {}
      })();
    } catch (_) {}
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if ((patientType === 'Myself' || patientType === 'myself') && userProfile) {
      setForm({
        name: userProfile.username || userProfile.name || '',
        phone: userProfile.phone || '',
        email: userProfile.useremail || userProfile.email || '',
      });
    } else if (patientType && patientType.toLowerCase() !== 'myself') {
      setForm({ name: '', phone: '', email: '' });
    }
  }, [patientType, userProfile]);

  

  const requireAuth = (action) => {
    if (!getToken()) {
      setShowLoginPrompt(true);
      return;
    }
    if (typeof action === 'function') action();
  };

  const name = doctor?.username || doctor?.name || "Doctor";
  const specialization = doctor?.specialization || doctor?.specialty || "General Physician";
  const addressText = ([doctor?.address, doctor?.city, doctor?.state, doctor?.country].filter(Boolean).join(", ")) || doctor?.location || "Address not specified";
  const doctorEmail = doctor?.useremail || doctor?.email || "";
  const phone = doctor?.phone || "";
  const image = doctor?.profileImage || doctor?.img || placeholderImage;
  const fee = doctor?.fees || doctor?.fee || 0;
  const feeText = (() => {
    const n = Number(fee);
    if (!isNaN(n) && isFinite(n)) {
      try {
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);
      } catch (_) {
        return `₹${n}`;
      }
    }
    const s = String(fee);
    return s.startsWith('₹') ? s : `₹${s}`;
  })();

  const timeSlots = [
    "9:00 am","9:35 am","10:10 am","10:45 am","11:20 am","11:55 am",
    "12:30 pm","1:05 pm","1:40 pm","2:15 pm","2:50 pm","3:25 pm",
    "4:00 pm","4:35 pm","5:10 pm","5:45 pm","6:20 pm","6:55 pm",
    "7:30 pm","8:05 pm","8:40 pm",
  ];

  return (
    <>
      {/* === Breadcrumb Section === */}
      <section className="py-5 text-center" style={{ backgroundColor: "#e9eef5" }}>
        <Container>
          <h2 className="fw-semibold text-dark fs-2 mb-1">Book Appointment</h2>
          <div className="d-flex justify-content-center">
            <Breadcrumb className="mb-0">
              <Breadcrumb.Item linkAs={Link} linkProps={{ to: "/" }}>
                Home
              </Breadcrumb.Item>
              <Breadcrumb.Item active>Book Appointment</Breadcrumb.Item>
            </Breadcrumb>
          </div>
          <div className="mt-3">
            <img
              decoding="async"
              src="https://doccure-wp.dreamstechnologies.com/wp-content/uploads/2023/04/banner-img.png"
              alt="Doctor illustration"
              loading="lazy"
              className="img-fluid dr-img"
              referrerPolicy="no-referrer"
              onError={(e) => { if (e.currentTarget.src !== placeholderImage) e.currentTarget.src = placeholderImage; }}
              style={{ maxHeight: 220, width: '100%', height: 'auto', objectFit: 'contain', display: 'block', margin: '0 auto' }}
            />
          </div>
        </Container>
      </section>

      {/* === Step Progress Bar === */}
      <section className="py-4 text-center">
        <Container>
          <div className="d-flex justify-content-center align-items-center gap-3">
            <div className={`rounded-circle p-2 px-3 fw-bold ${step === "info" ? "bg-primary text-white" : "bg-light text-dark"}`}>1</div>
            <span className={step === "info" ? "fw-bold text-primary" : ""}>Appointment Info</span>
            <div className="border-bottom border-secondary flex-grow-1 mx-2"></div>
            <div className={`rounded-circle p-2 px-3 fw-bold ${step === "datetime" ? "bg-primary text-white" : "bg-light text-dark"}`}>2</div>
            <span className={step === "datetime" ? "fw-bold text-primary" : ""}>Date & Time</span>
            <div className="border-bottom border-secondary flex-grow-1 mx-2"></div>
            <div className={`rounded-circle p-2 px-3 fw-bold ${step === "basic" ? "bg-primary text-white" : "bg-light text-dark"}`}>3</div>
            <span className={step === "basic" ? "fw-bold text-primary" : ""}>Basic Information</span>
          </div>
        </Container>
      </section>

      {/* === Step 1: Appointment Info === */}
      {step === "info" && (
        <section className="py-5">
          <Container style={{ maxWidth: "900px" }}>
            <Card className="shadow-sm border-0">
              <Card.Body>
                <Row>
                  <Col md={2}>
                    {loading ? (
                      <div className="text-center py-3"><Spinner animation="border" size="sm" /></div>
                    ) : (
                      <img
                        src={image}
                        alt={name}
                        className="rounded-circle"
                        style={{ width: 120, height: 120, objectFit: 'cover' }}
                        onError={(e) => { if (e.currentTarget.src !== placeholderImage) e.currentTarget.src = placeholderImage; }}
                      />
                    )}
                  </Col>
                  <Col md={10}>
                    {error && (<Alert variant="danger" className="mb-2">{error}</Alert>)}
                    <h5 className="fw-bold mb-1">{name}</h5>
                    <p className="text-primary mb-1">{specialization}</p>
                    <p className="text-muted mb-1">
                      <BsGeoAlt className="me-2 text-primary" />
                      {addressText}
                    </p>
                    {doctorEmail && (
                      <p className="text-muted mb-0">
                        <BsEnvelope className="me-2 text-primary" />
                        {doctorEmail}
                      </p>
                    )}
                    {phone && (
                      <p className="text-muted mb-0 mt-1">
                        <BsTelephone className="me-2 text-primary" />
                        {phone}
                      </p>
                    )}
                  </Col>
                </Row>

                <hr />

                <Form.Group className="mb-3">
                  <Form.Label>Booking Type</Form.Label>
                  <Form.Control type="text" value="Online" readOnly className="bg-light" />
                </Form.Group>
                <h6 className="fw-semibold">Payment Info</h6>
                <div className="p-3 bg-light rounded-3 mb-3">
                  <Row>
                    <Col xs={8}>Consultation Fee</Col>
                    <Col xs={4} className="text-end">{feeText}</Col>
                  </Row>
                  <div className="bg-primary text-white mt-3 p-2 rounded-2 text-end">
                    <strong>Total: {feeText}</strong>
                  </div>
                </div>

                <div className="d-flex justify-content-end">
                  <Button variant="primary" onClick={() => requireAuth(() => setStep("datetime"))}>Select Date & Time</Button>
                </div>
              </Card.Body>
            </Card>
          </Container>
        </section>
      )}

      {/* === Step 2: Date & Time === */}
      {step === "datetime" && (
        <section className="py-5">
          <Container style={{ maxWidth: "900px" }}>
            <Card className="shadow-sm border-0">
              <Card.Body>
                <Row>
                  <Col md={2}>
                    <img
                      src={image}
                      alt={name}
                      className="rounded-circle"
                      style={{ width: 120, height: 120, objectFit: 'cover' }}
                      onError={(e) => { if (e.currentTarget.src !== placeholderImage) e.currentTarget.src = placeholderImage; }}
                    />
                  </Col>
                  <Col md={10}>
                    <h5 className="fw-bold mb-1">{name}</h5>
                    <p className="text-primary mb-1">{specialization}</p>
                    <p className="text-muted mb-1">
                      <BsGeoAlt className="me-2 text-primary" />
                      {addressText}
                    </p>
                    {doctorEmail && (
                      <p className="text-muted mb-0">
                        <BsEnvelope className="me-2 text-primary" />
                        {doctorEmail}
                      </p>
                    )}
                    {phone && (
                      <p className="text-muted mb-0 mt-1">
                        <BsTelephone className="me-2 text-primary" />
                        {phone}
                      </p>
                    )}
                  </Col>
                </Row>

                <hr />

                <Row>
                  <Col md={5}>
                    <h6 className="fw-semibold mb-3">Select Date</h6>
                    <Calendar onChange={setDate} value={date} />
                  </Col>

                  <Col md={7}>
                    <h6 className="fw-semibold mb-3">Available Time Slots</h6>
                    <div className="d-flex flex-wrap gap-2">
                      {timeSlots.map((time, idx) => (
                        <Button
                          key={idx}
                          variant={selectedTime === time ? "primary" : "outline-secondary"}
                          size="sm"
                          onClick={() => setSelectedTime(time)}
                        >
                          {time}
                        </Button>
                      ))}
                    </div>
                  </Col>
                </Row>

                <div className="d-flex justify-content-between mt-4">
                  <Button variant="secondary" onClick={() => setStep("info")}>Back</Button>
                  <Button
                    variant="primary"
                    disabled={!selectedTime}
                    onClick={() => requireAuth(() => setStep("basic"))}
                  >
                    Add Basic Information
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Container>
        </section>
      )}

      {/* === Step 3: Basic Information (Myself / Someone else) === */}
      {step === "basic" && (
        <section className="py-5">
          <Container style={{ maxWidth: "900px" }}>
            <Card className="shadow-sm border-0">
              <Card.Body>
                <Row className="mb-3">
                  <Col md={2} className="text-center">
                    <img
                      src={image}
                      alt={name}
                      className="rounded-circle"
                      style={{ width: 80, height: 80, objectFit: 'cover' }}
                      onError={(e) => { if (e.currentTarget.src !== placeholderImage) e.currentTarget.src = placeholderImage; }}
                    />
                  </Col>
                  <Col md={10}>
                    <h5 className="fw-bold mb-1">{name}</h5>
                    <p className="text-primary mb-1">{specialization}</p>
                    <div className="text-muted small">
                      {date && selectedTime ? `${formatDate(date)} • ${selectedTime}` : 'Select date and time first'}
                    </div>
                  </Col>
                </Row>

                <Form>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Select Patient</Form.Label>
                        <Form.Select value={patientType} onChange={(e) => setPatientType(e.target.value)}>
                          <option value="myself">Myself</option>
                          <option value="someoneelse">Someone else</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Name</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="Enter name"
                          value={form.name}
                          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Phone Number</Form.Label>
                        <Form.Control
                          type="tel"
                          placeholder="Enter phone number"
                          value={form.phone}
                          onChange={(e) => setForm((f) => ({ ...f, phone: (e.target.value || '').replace(/\D/g, '').slice(0, 10) }))}
                          inputMode="numeric"
                          maxLength={10}
                          pattern="[0-9]{10}"
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Email Address</Form.Label>
                        <Form.Control
                          type="email"
                          placeholder="Enter email address"
                          value={form.email}
                          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                  <Row className="mt-2">
                    <Col md={4}>
                      <Form.Group className="mb-3">
                        <Form.Label>Doctor Name</Form.Label>
                        <Form.Control type="text" value={name} readOnly />
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group className="mb-3">
                        <Form.Label>Doctor Email</Form.Label>
                        <Form.Control type="email" value={doctorEmail} readOnly />
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group className="mb-3">
                        <Form.Label>Fees</Form.Label>
                        <Form.Control type="text" value={feeText} readOnly />
                      </Form.Group>
                    </Col>
                  </Row>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Appointment Date</Form.Label>
                        <Form.Control type="text" value={date ? formatDate(date) : ''} readOnly />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Time Slot</Form.Label>
                        <Form.Control type="text" value={selectedTime} readOnly />
                      </Form.Group>
                    </Col>
                  </Row>
                  {/* Hidden fields: doctor_id, user_id */}
                  <input type="hidden" name="doctor_id" value={id || ''} />
                  <input type="hidden" name="user_id" value={(userProfile && (userProfile._id || userProfile.id)) || ''} />
                </Form>

                <div className="d-flex justify-content-between mt-3">
                  <Button variant="secondary" onClick={() => setStep("datetime")}>Back</Button>
                  <Button
                    variant="primary"
                    disabled={submitting || !selectedTime || !form.name || !form.phone || !form.email}
                    onClick={() => requireAuth(async () => {
                      try {
                        setSubmitting(true);
                        const token = getToken();
                        let uid = (userProfile && (userProfile._id || userProfile.id)) || '';
                        try {
                          if (!uid && token) {
                            const decoded = jwtDecode(token);
                            uid = decoded?.id || decoded?._id || decoded?.userId || decoded?.sub || '';
                          }
                        } catch (_) {}
                        const payload = {
                          patient_type: (patientType || 'myself').toString().toLowerCase(),
                          doctor_id: id,
                          user_id: uid,
                          name: form.name,
                          phone: form.phone,
                          email: form.email,
                          date: date ? new Date(date) : new Date(),
                          time_slot: selectedTime,
                          doctor_name: name,
                          doctor_email: doctorEmail || '',
                          fees: Number(doctor?.fees || doctor?.fee || 0) || 0,
                        };
                        await createAppointment(payload);
                        // Redirect to dashboard appointments
                        navigate('/dashboard?view=appointments');
                      } catch (e) {
                        alert(e?.message || 'Failed to submit appointment');
                      } finally {
                        setSubmitting(false);
                      }
                    })}
                  >
                    Confirm Booking
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Container>
        </section>
      )}
      <Modal show={showLoginPrompt} onHide={() => setShowLoginPrompt(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Login Required</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          You need to log in to book an appointment. Please log in and try again.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowLoginPrompt(false)}>Close</Button>
          <Button as={Link} to="/" variant="primary" onClick={() => setShowLoginPrompt(false)}>Go to Login</Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default BookAppointment;
