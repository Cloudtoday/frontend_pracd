import React from 'react';
import { Card, Button } from 'react-bootstrap';
import { FaMapMarkerAlt } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const DoctorCardItem = ({ doc, imageUrl, placeholderImage }) => {
  const safeImg = imageUrl || placeholderImage;
  const name = doc?.username || doc?.name || 'Doctor';
  const specialty = doc?.specialization || doc?.specialty || 'General Physician';
  const location = doc?.address || doc?.location || doc?.city || 'Location not specified';
  const fee = doc?.fees || doc?.fee || 'N/A';
  const linkId = doc?._id || doc?.id || '';

  return (
    <Card className="border-0 shadow-sm h-100 rounded-4">
      <Card.Img
        variant="top"
        src={safeImg}
        alt={name}
        onError={(e) => {
          if (placeholderImage && e.currentTarget.src !== placeholderImage) {
            e.currentTarget.src = placeholderImage;
          }
        }}
        style={{
          height: '220px',
          objectFit: 'cover',
          borderTopLeftRadius: '1rem',
          borderTopRightRadius: '1rem',
        }}
      />
      <Card.Body className="text-center">
        <h5 className="fw-bold">{name}</h5>
        <p className="text-primary fw-semibold mb-1">{specialty}</p>
        <p className="text-muted small mb-2">
          <FaMapMarkerAlt className="me-1" />
          {location}
        </p>
        <p className="fw-semibold text-dark mb-3">
          Consultation Fee: ₹{fee}
        </p>
        <Link to={`/doctor-details/${linkId}`} state={{ doc }}>
          <Button variant="primary" className="px-4">Book Now</Button>
        </Link>
      </Card.Body>
    </Card>
  );
};

export default DoctorCardItem;



