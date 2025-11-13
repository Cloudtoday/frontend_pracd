import React, { Component } from 'react';
import { Container, Row, Col, Button, Spinner, Alert } from 'react-bootstrap';
import { BsGeoAlt } from 'react-icons/bs';
import { Link } from 'react-router-dom';
import { getAllDoctors } from '../services/api';
import DoctorCardItem from './DoctorCardItem';

class TopDoctors extends Component {
  state = {
    loading: true,
    error: '',
    doctors: [],
  };

  async componentDidMount() {
    try {
      const data = await getAllDoctors();
      const list = Array.isArray(data) ? data : [];
      const active = list.filter(d => {
        const s = (d.status || '').toString().toLowerCase();
        return s === 'active';
      });
      active.sort((a,b) => {
        const ad = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bd = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return bd - ad;
      });
      this.setState({ doctors: active.slice(0,3), error: '' });
    } catch (e) {
      this.setState({ error: e?.message || 'Failed to load top doctors', doctors: [] });
    } finally {
      this.setState({ loading: false });
    }
  }

  render() {
    const { loading, error, doctors } = this.state;
    const placeholderImage = 'https://images.unsplash.com/photo-1607746882042-944635dfe10e?q=80&w=800&auto=format&fit=crop';

    return (
      <section className="py-5" style={{ backgroundColor: '#fafbfc' }}>
        <Container id="doctors">
          <div className="d-flex align-items-end justify-content-between mb-4">
            <div>
              <h2 className="section-title mb-1">Top Doctors</h2>
              <p className="section-subtitle mb-0 text-secondary">Browse top specialists recommended by patients near you.</p>
            </div>
            <Button as={Link} to="/doctors" variant="outline-secondary" size="sm" className="btn-soft">See More</Button>
          </div>

          <Row className="g-4">
            {loading && (
              <Col xs={12} className="text-center py-3"><Spinner animation="border" /></Col>
            )}
            {error && !loading && (
              <Col xs={12}><Alert variant="danger">{error}</Alert></Col>
            )}
            {!loading && !error && doctors.length === 0 && (
              <Col xs={12} className="text-center text-muted">No active doctors found.</Col>
            )}

            {doctors.map((doc, idx) => (
              <Col md={6} lg={4} key={doc._id || doc.id || idx}>
                <DoctorCardItem
                  doc={doc}
                  imageUrl={doc.profileImage || doc.img || placeholderImage}
                  placeholderImage={placeholderImage}
                />
              </Col>
            ))}
          </Row>
        </Container>
      </section>
    );
  }
}

export default TopDoctors;
