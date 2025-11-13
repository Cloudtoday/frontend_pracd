import React, { Component } from 'react';
import { Container, Row, Col, Card, Button, ListGroup, Badge, Table, Form, Spinner, Alert, Modal } from 'react-bootstrap';
import { getProfileById, updateProfileById, getAppointmentsByDoctor, getAppointmentsByPatient, getAllProfilesAdmin, adminUpdateProfileStatus, getAdminAppointments, updateAppointmentStatus as adminUpdateAppointmentStatus, getAdminEnquiries, getAdminStats } from '../services/api';

// Format date as DD/MM/YYYY
const formatDate = (v) => {
  if (!v) return '-';
  const d = new Date(v);
  if (isNaN(d.getTime())) return '-';
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
};

class Dashboard extends Component {
  state = {
    // common
    active: 'overview', // overview | appointments | profile
    loading: false,
    error: '',
    success: '',
    saving: false,
    profile: null,
    // appointments
    apptLoading: false,
    apptError: '',
    appointments: [],
    showApptModal: false,
    selectedAppt: null,
    // admin
    adminActive: 'overview', // overview | users | appointments | enquiries
    adminUsers: [],
    adminUsersLoading: false,
    adminUsersError: '',
    adminUsersQuery: '',
    adminUserUpdating: {}, // map of userId -> boolean
    adminShowUserModal: false,
    adminSelectedUser: null,
    adminUserDetails: null,
    adminUserDetailsLoading: false,
    adminUserDetailsError: '',
    adminAppts: [],
    adminApptsLoading: false,
    adminApptsError: '',
    adminApptUpdating: {}, // map of apptId -> boolean
    adminEnquiries: [],
    adminEnquiriesLoading: false,
    adminEnquiriesError: '',
    adminStats: { totalAppointments: 0, activeDoctors: 0, activePatients: 0 },
    adminStatsLoading: false,
    adminStatsError: '',
  };

  componentDidMount() {
    const { user } = this.props;
    // If URL requests appointments view (e.g., /dashboard?view=appointments), switch tab
    try {
      const hash = window.location.hash || '';
      const qIndex = hash.indexOf('?');
      if (qIndex >= 0) {
        const qs = new URLSearchParams(hash.substring(qIndex + 1));
        const view = (qs.get('view') || '').toLowerCase();
        if (view === 'appointments') {
          this.setState({ active: 'appointments' });
        }
      }
    } catch (_) {}
    if (user?.role === 'patient') {
      this.loadAppointments();
      this.loadProfile();
    } else if (user?.role === 'doctor') {
      this.loadProfile();
      this.loadAppointments();
    } else if (user?.role === 'admin') {
      this.loadAdminStats();
    }
  }

  // Patient/Doctor nav
  handleNav = async (section) => {
    this.setState({ active: section, error: '', success: '' });
    if (section === 'profile') await this.loadProfile();
    else if (section === 'appointments') await this.loadAppointments();
  };

  handleAdminSetStatus = async (userId, status) => {
    if (!userId || !['Active', 'Inactive'].includes(status)) return;
    this.setState((prev) => ({ adminUserUpdating: { ...prev.adminUserUpdating, [userId]: true } }));
    try {
      await adminUpdateProfileStatus(userId, status);
      this.setState((prev) => ({
        adminUsers: prev.adminUsers.map((u) => (u._id === userId || u.id === userId ? { ...u, status } : u)),
      }));
    } catch (e) {
      alert(e?.message || 'Failed to update status');
    } finally {
      this.setState((prev) => ({ adminUserUpdating: { ...prev.adminUserUpdating, [userId]: false } }));
    }
  };

  handleAdminOpenUserModal = async (user) => {
    const id = user?._id || user?.id;
    this.setState({
      adminShowUserModal: true,
      adminSelectedUser: user || null,
      adminUserDetails: null,
      adminUserDetailsError: '',
      adminUserDetailsLoading: true,
    });
    if (!id) {
      this.setState({ adminUserDetailsLoading: false, adminUserDetailsError: 'Missing user id' });
      return;
    }
    try {
      // Admin will hit /api/profile/:id — ensure backend allows admin
      const details = await getProfileById(id);
      this.setState({ adminUserDetails: details });
    } catch (e) {
      this.setState({ adminUserDetailsError: e?.message || 'Failed to load user details' });
    } finally {
      this.setState({ adminUserDetailsLoading: false });
    }
  };

  handleAdminCloseUserModal = () => {
    this.setState({
      adminShowUserModal: false,
      adminSelectedUser: null,
      adminUserDetails: null,
      adminUserDetailsError: '',
      adminUserDetailsLoading: false,
    });
  };

  // Admin nav
  handleAdminNav = (section) => {
    this.setState({ adminActive: section }, async () => {
      if (section === 'users') {
        await this.loadAdminUsers();
      } else if (section === 'appointments') {
        await this.loadAdminAppointments();
      } else if (section === 'enquiries') {
        await this.loadAdminEnquiries();
      } else if (section === 'overview') {
        await this.loadAdminStats();
      }
    });
  };

  loadAdminUsers = async (status) => {
    this.setState({ adminUsersLoading: true, adminUsersError: '' });
    try {
      const list = await getAllProfilesAdmin(status);
      const arr = Array.isArray(list) ? list : [];
      const filtered = arr.filter((u) => (u.role || '').toString().toLowerCase() !== 'admin');
      this.setState({ adminUsers: filtered });
    } catch (e) {
      this.setState({ adminUsersError: e?.message || 'Failed to load users', adminUsers: [] });
    } finally {
      this.setState({ adminUsersLoading: false });
    }
  };

  loadAdminStats = async () => {
    this.setState({ adminStatsLoading: true, adminStatsError: '' });
    try {
      const stats = await getAdminStats();
      const sa = stats || {};
      this.setState({
        adminStats: {
          totalAppointments: Number(sa.totalAppointments ?? sa.total ?? 0),
          activeDoctors: Number(sa.activeDoctors ?? 0),
          activePatients: Number(sa.activePatients ?? 0),
        },
      });
    } catch (e) {
      this.setState({ adminStatsError: e?.message || 'Failed to load stats' });
    } finally {
      this.setState({ adminStatsLoading: false });
    }
  };

  loadAdminEnquiries = async () => {
    this.setState({ adminEnquiriesLoading: true, adminEnquiriesError: '' });
    try {
      const list = await getAdminEnquiries();
      this.setState({ adminEnquiries: Array.isArray(list) ? list : [] });
    } catch (e) {
      this.setState({ adminEnquiriesError: e?.message || 'Failed to load enquiries', adminEnquiries: [] });
    } finally {
      this.setState({ adminEnquiriesLoading: false });
    }
  };

  loadAdminAppointments = async () => {
    this.setState({ adminApptsLoading: true, adminApptsError: '' });
    try {
      const list = await getAdminAppointments();
      this.setState({ adminAppts: Array.isArray(list) ? list : [] });
    } catch (e) {
      this.setState({ adminApptsError: e?.message || 'Failed to load appointments', adminAppts: [] });
    } finally {
      this.setState({ adminApptsLoading: false });
    }
  };

  handleAdminSetApptStatus = async (apptId, status) => {
    if (!apptId || !['approved', 'rejected'].includes(status)) return;
    this.setState((prev) => ({ adminApptUpdating: { ...prev.adminApptUpdating, [apptId]: true } }));
    try {
      await adminUpdateAppointmentStatus(apptId, status);
      this.setState((prev) => ({
        adminAppts: prev.adminAppts.map((a) => (a._id === apptId || a.id === apptId ? { ...a, status } : a)),
      }));
    } catch (e) {
      alert(e?.message || 'Failed to update appointment');
    } finally {
      this.setState((prev) => ({ adminApptUpdating: { ...prev.adminApptUpdating, [apptId]: false } }));
    }
  };

  // Modal handlers (used by patient/doctor/admin appointment views)
  handleOpenApptModal = (appt) => {
    this.setState({ showApptModal: true, selectedAppt: appt });
  };
  handleCloseApptModal = () => {
    this.setState({ showApptModal: false, selectedAppt: null });
  };

  loadAppointments = async () => {
    const { user } = this.props;
    if (!user?.id) {
      this.setState({ apptError: 'Missing user id', appointments: [] });
      return;
    }
    this.setState({ apptLoading: true, apptError: '' });
    try {
      const list = user.role === 'doctor'
        ? await getAppointmentsByDoctor(user.id)
        : await getAppointmentsByPatient(user.id);
      this.setState({ appointments: Array.isArray(list) ? list : [] });
    } catch (e) {
      this.setState({ apptError: e?.message || 'Failed to load appointments', appointments: [] });
    } finally {
      this.setState({ apptLoading: false });
    }
  };

  loadProfile = async () => {
    const { user } = this.props;
    if (!user?.id) {
      this.setState({ error: 'Missing user id for profile', profile: null });
      return;
    }
    this.setState({ loading: true, error: '' });
    try {
      const data = await getProfileById(user.id);
      this.setState({ profile: data });
    } catch (e) {
      this.setState({ error: e?.message || 'Failed to load profile' });
    } finally {
      this.setState({ loading: false });
    }
  };

  handleProfileChange = (e) => {
    const { name, value } = e.target;
    if (name === 'phone') {
      const digits = (value || '').replace(/\D/g, '').slice(0, 10);
      this.setState((prev) => ({ profile: { ...prev.profile, [name]: digits } }));
    } else {
      this.setState((prev) => ({ profile: { ...prev.profile, [name]: value } }));
    }
  };

  // Compress image on client to avoid 413 (Payload Too Large)
  compressImageFile = (file, maxDim = 640, quality = 0.7) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let { width, height } = img;
          const scale = Math.min(1, maxDim / Math.max(width, height));
          width = Math.round(width * scale);
          height = Math.round(height * scale);
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, width, height);
          try {
            const out = canvas.toDataURL("image/jpeg", quality);
            resolve(out);
          } catch (err) { reject(err); }
        };
        img.onerror = () => reject(new Error("Invalid image"));
        img.src = reader.result;
      };
      reader.onerror = () => reject(new Error("Failed to read image"));
      reader.readAsDataURL(file);
    });
  };

  handleProfileImage = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      this.setState({ error: "Please choose a valid image file" });
      return;
    }
    try {
      this.setState({ error: "" });
      const dataUrl = await this.compressImageFile(file, 640, 0.7);
      this.setState((prev) => ({ profile: { ...prev.profile, profileImage: dataUrl } }));
    } catch (err) {
      this.setState({ error: err?.message || "Failed to process image" });
    }
  };

  submitProfile = async (e) => {
    e.preventDefault();
    const { user } = this.props;
    const { profile } = this.state;
    if (!user?.id || !profile) return;
    if (profile.phone && !/^\d{10}$/.test(String(profile.phone))) {
      this.setState({ error: 'Please enter a valid 10-digit phone number' });
      return;
    }
    const payload = {
      username: profile.username,
      useremail: profile.useremail,
      address: profile.address,
      phone: profile.phone,
    };
    if (profile.age !== undefined && profile.age !== null && profile.age !== '') {
      payload.age = Number(profile.age);
    }
    if (user.role === 'doctor') {
      payload.specialization = profile.specialization;
      payload.doctor_description = profile.doctor_description;
      if (profile.fees) payload.fees = Number(profile.fees);
      if (profile.experience !== undefined && profile.experience !== null && profile.experience !== '') {
        const n = Number(profile.experience);
        payload.experience = Number.isFinite(n) ? n : profile.experience;
      }
      if (profile.profileImage) payload.profileImage = profile.profileImage;
    }
    this.setState({ saving: true, error: '', success: '' });
    try {
      await updateProfileById(user.id, payload);
      this.setState({ success: 'Profile updated successfully', active: 'appointments' });
    } catch (e) {
      this.setState({ error: e?.message || 'Failed to update profile' });
    } finally {
      this.setState({ saving: false });
    }
  };

  renderDoctorLayout(user) {
    const displayName = user?.name || user?.username || user?.email || 'Doctor';
    const projectName = 'PracD';
    const appts = this.state.appointments || [];
    const totalAppts = appts.length;
    const upcomingCount = appts.filter(a => a.date && new Date(a.date) >= new Date()).length;
    const earningsNum = appts.reduce((sum, a) => sum + (typeof a.fees === 'number' ? a.fees : 0), 0);
    const earningsStr = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(earningsNum);
    return (
      <Container className="py-4">
        <h2 className="fw-semibold">Dashboard</h2>
        <p className="text-muted">Home / Dashboard</p>
        <Row className="g-3">
          <Col md={4} lg={3}>
            <Card className="shadow-sm">
              <Card.Body className="text-center">
                <div className="mb-3">
                  <img src="https://doccure-wp.dreamstechnologies.com/wp-content/uploads/2022/08/doctor-thumb-07.jpg" alt="Doctor Avatar" className="rounded-circle" width={96} height={96} />
                </div>
                <h5 className="mb-1">{displayName}</h5>
                <Badge bg="secondary" className="mb-1">Doctor</Badge>
                <div className="mb-2">
                  <Badge bg={(this.state.profile?.status || 'Active') === 'Active' ? 'success' : 'secondary'}>{this.state.profile?.status || 'Active'}</Badge>
                </div>
                <div className="small text-muted mb-3">{projectName}</div>
                <ListGroup className="text-start">
                  <ListGroup.Item action active={this.state.active==='overview'} onClick={() => this.handleNav('overview')}>Dashboard</ListGroup.Item>
                  <ListGroup.Item action active={this.state.active==='appointments'} onClick={() => this.handleNav('appointments')}>Appointments</ListGroup.Item>
                  <ListGroup.Item action active={this.state.active==='profile'} onClick={() => this.handleNav('profile')}>Profile Settings</ListGroup.Item>
                  <ListGroup.Item action onClick={this.props.onLogout}>Logout</ListGroup.Item>
                </ListGroup>
              </Card.Body>
            </Card>
          </Col>
          <Col md={8} lg={9}>
            {this.state.active === 'profile' ? (
              <Card className="shadow-sm">
                <Card.Header className="bg-white fw-semibold">Profile Settings</Card.Header>
                <Card.Body>
                  {this.state.error && <Alert variant="danger">{this.state.error}</Alert>}
                  {this.state.success && <Alert variant="success">{this.state.success}</Alert>}
                  {this.state.loading ? (
                    <div className="text-center py-4"><Spinner animation="border" /></div>
                  ) : (
                    <Form onSubmit={this.submitProfile}>
                      <Row className="g-3">
                        <Col md={6}><Form.Group><Form.Label>Username</Form.Label><Form.Control name="username" value={this.state.profile?.username || ''} onChange={this.handleProfileChange} /></Form.Group></Col>
                        <Col md={6}><Form.Group><Form.Label>Email</Form.Label><Form.Control name="useremail" value={this.state.profile?.useremail || ''} onChange={this.handleProfileChange} disabled /></Form.Group></Col>
                        {this.props.user?.role === 'doctor' && (
                          <Col md={12}>
                            <Form.Group>
                              <Form.Label>Profile Image</Form.Label>
                              <Form.Control type="file" accept="image/*" onChange={this.handleProfileImage} />
                              {this.state.profile?.profileImage && (
                                <div className="mt-2">
                                  <img src={this.state.profile.profileImage} alt="Preview" style={{ maxHeight: 120, borderRadius: 8 }} />
                                </div>
                              )}
                            </Form.Group>
                          </Col>
                        )}
                        <Col md={6}><Form.Group><Form.Label>Address</Form.Label><Form.Control name="address" value={this.state.profile?.address || ''} onChange={this.handleProfileChange} /></Form.Group></Col>
                        <Col md={6}><Form.Group><Form.Label>Experience (years)</Form.Label><Form.Control type="number" min="0" step="1" name="experience" value={this.state.profile?.experience ?? ''} onChange={this.handleProfileChange} placeholder="e.g., 5" /></Form.Group></Col>
<Col md={6}><Form.Group><Form.Label>Phone</Form.Label><Form.Control name="phone" value={this.state.profile?.phone || ''} onChange={this.handleProfileChange} inputMode="numeric" maxLength={10} pattern="[0-9]{10}" /></Form.Group></Col>
                        <Col md={6}><Form.Group><Form.Label>Age</Form.Label><Form.Control type="number" name="age" value={this.state.profile?.age ?? ''} onChange={this.handleProfileChange} /></Form.Group></Col>
                        <Col md={6}><Form.Group><Form.Label>Specialization</Form.Label><Form.Control name="specialization" value={this.state.profile?.specialization || ''} onChange={this.handleProfileChange} /></Form.Group></Col>
                        
                        <Col md={6}><Form.Group><Form.Label>Fees</Form.Label><Form.Control type="number" name="fees" value={this.state.profile?.fees ?? ''} onChange={this.handleProfileChange} /></Form.Group></Col>
                        <Col md={12}><Form.Group><Form.Label>Doctor Details</Form.Label><Form.Control as="textarea" rows={4} name="doctor_description" value={this.state.profile?.doctor_description || ''} onChange={this.handleProfileChange} placeholder="Brief bio, qualifications, and experience" /></Form.Group></Col>
                        <Col md={6}><Form.Group><Form.Label>Status</Form.Label><div><Badge bg={(this.state.profile?.status || 'Active') === 'Active' ? 'success' : 'secondary'}>{this.state.profile?.status || 'Active'}</Badge></div></Form.Group></Col>
                      </Row>
                      <div className="mt-3"><Button type="submit" disabled={this.state.saving}>{this.state.saving ? 'Saving...' : 'Save Changes'}</Button></div>
                    </Form>
                  )}
                </Card.Body>
              </Card>
            ) : this.state.active === 'appointments' ? (
              <Card className="shadow-sm">
                <Card.Header className="bg-white fw-semibold">Patient Appointments</Card.Header>
                <Card.Body>
                  {this.state.apptError && <Alert variant="danger">{this.state.apptError}</Alert>}
                  {this.state.apptLoading ? (
                    <div className="text-center py-4"><Spinner animation="border" /></div>
                  ) : this.state.appointments.length === 0 ? (
                    <div className="text-center text-muted py-3">No appointments found.</div>
                  ) : (
                    <Table responsive hover className="mb-0">
                      <thead><tr><th>Patient Name</th><th>Date</th><th>Time Slot</th><th>Status</th><th>Fee</th><th></th></tr></thead>
                      <tbody>
                        {this.state.appointments.map((a) => (
                          <tr key={a._id}>
                            <td>{a.name}</td>
                            <td>{formatDate(a.date)}</td>
                            <td>{a.time_slot}</td>
                            <td>{a.status}</td>
                            <td>{typeof a.fees === 'number' ? `?${a.fees.toFixed(2)}` : '-'}</td>
                            <td><Button size="sm" variant="primary" onClick={() => this.handleOpenApptModal(a)}>View</Button></td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  )}
                </Card.Body>
              </Card>
            ) : (
              <Row className="g-3 mb-3">
                <Col md={4}><StatCard title="Total Appointments" value={String(totalAppts)} /></Col>
                <Col md={4}><StatCard title="Upcoming" value={String(upcomingCount)} /></Col>
                <Col md={4}><StatCard title="Earnings" value={earningsStr} /></Col>
              </Row>
            )}
          </Col>
        </Row>
        {this.renderApptModal(true)}
      </Container>
    );
  }

  // Patient layout
  renderPatientLayout(user) {
    const displayName = user?.name || user?.username || user?.email || 'User';
    const projectName = 'PracD';
    const total = this.state.appointments.length;
    const upcoming = this.state.appointments.filter(a => a.date && new Date(a.date) >= new Date()).length;
    const nextDate = this.state.appointments.filter(a => a.date && new Date(a.date) >= new Date()).map(a => new Date(a.date).getTime()).sort((a,b)=>a-b)[0];
    const nextDateStr = formatDate(nextDate);
    return (
      <Container className="py-4">
        <h2 className="fw-semibold">Dashboard</h2>
        <p className="text-muted">Home / Dashboard</p>
        <Row className="g-3">
          <Col md={4} lg={3}>
            <Card className="shadow-sm">
              <Card.Body className="text-center">
                <div className="mb-3"><img src="https://randomuser.me/api/portraits/women/65.jpg" alt="User Avatar" className="rounded-circle" width={96} height={96} /></div>
                <h5 className="mb-1">{displayName}</h5>
                <Badge bg="secondary" className="mb-1">User</Badge>
                <div className="mb-2">
                  <Badge bg={(this.state.profile?.status || 'Active') === 'Active' ? 'success' : 'secondary'}>{this.state.profile?.status || 'Active'}</Badge>
                </div>
                <div className="small text-muted mb-3">{projectName}</div>
                <ListGroup className="text-start">
                  <ListGroup.Item action active={this.state.active==='overview'} onClick={() => this.handleNav('overview')}>Dashboard</ListGroup.Item>
                  <ListGroup.Item action active={this.state.active==='appointments'} onClick={() => this.handleNav('appointments')}>Appointments</ListGroup.Item>
                  <ListGroup.Item action active={this.state.active==='profile'} onClick={() => this.handleNav('profile')}>Profile Settings</ListGroup.Item>
                  <ListGroup.Item action onClick={this.props.onLogout}>Logout</ListGroup.Item>
                </ListGroup>
              </Card.Body>
            </Card>
          </Col>
          <Col md={8} lg={9}>
            {this.state.active === 'profile' ? (
              <Card className="shadow-sm">
                <Card.Header className="bg-white fw-semibold">Profile Settings</Card.Header>
                <Card.Body>
                  {this.state.error && <Alert variant="danger">{this.state.error}</Alert>}
                  {this.state.success && <Alert variant="success">{this.state.success}</Alert>}
                  {this.state.loading ? (
                    <div className="text-center py-4"><Spinner animation="border" /></div>
                  ) : (
                    <Form onSubmit={this.submitProfile}>
                      <Row className="g-3">
                        <Col md={6}><Form.Group><Form.Label>Username</Form.Label><Form.Control name="username" value={this.state.profile?.username || ''} onChange={this.handleProfileChange} /></Form.Group></Col>
                        <Col md={6}><Form.Group><Form.Label>Email</Form.Label><Form.Control name="useremail" value={this.state.profile?.useremail || ''} onChange={this.handleProfileChange} disabled /></Form.Group></Col>
                        <Col md={6}><Form.Group><Form.Label>Address</Form.Label><Form.Control name="address" value={this.state.profile?.address || ''} onChange={this.handleProfileChange} /></Form.Group></Col>
                        <Col md={6}><Form.Group><Form.Label>Phone</Form.Label><Form.Control name="phone" value={this.state.profile?.phone || ''} onChange={this.handleProfileChange} /></Form.Group></Col>
                        <Col md={6}><Form.Group><Form.Label>Age</Form.Label><Form.Control type="number" name="age" value={this.state.profile?.age ?? ''} onChange={this.handleProfileChange} /></Form.Group></Col>
                        <Col md={6}><Form.Group><Form.Label>Status</Form.Label><div><Badge bg={(this.state.profile?.status || 'Active') === 'Active' ? 'success' : 'secondary'}>{this.state.profile?.status || 'Active'}</Badge></div></Form.Group></Col>
                      </Row>
                      <div className="mt-3"><Button type="submit" disabled={this.state.saving}>{this.state.saving ? 'Saving...' : 'Save Changes'}</Button></div>
                    </Form>
                  )}
                </Card.Body>
              </Card>
            ) : this.state.active === 'appointments' ? (
              <Card className="shadow-sm">
                <Card.Header className="bg-white fw-semibold">My Appointments</Card.Header>
                <Card.Body>
                  {this.state.apptError && <Alert variant="danger">{this.state.apptError}</Alert>}
                  {this.state.apptLoading ? (
                    <div className="text-center py-4"><Spinner animation="border" /></div>
                  ) : this.state.appointments.length === 0 ? (
                    <div className="text-center text-muted py-3">No appointments found.</div>
                  ) : (
                    <Table responsive hover className="mb-0">
                      <thead><tr><th>Doctor Name</th><th>Date</th><th>Time Slot</th><th>Status</th><th>Fee</th><th></th></tr></thead>
                      <tbody>
                        {this.state.appointments.map((a) => (
                          <tr key={a._id}>
                            <td>{a.doctor_name}</td>
                            <td>{formatDate(a.date)}</td>
                            <td>{a.time_slot}</td>
                            <td>{a.status}</td>
                            <td>{typeof a.fees === 'number' ? `?${a.fees.toFixed(2)}` : (a.fee || '-')}</td>
                            <td><Button size="sm" variant="primary" onClick={() => this.handleOpenApptModal(a)}>View</Button></td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  )}
                </Card.Body>
              </Card>
            ) : (
              <Row className="g-3 mb-3">
                <Col md={4}><StatCard title="Total Appointments" value={String(total)} /></Col>
                <Col md={4}><StatCard title="Upcoming" value={String(upcoming)} /></Col>
                <Col md={4}><StatCard title="Next Date" value={nextDateStr} /></Col>
              </Row>
            )}
          </Col>
        </Row>
        {this.renderApptModal(true)}
      </Container>
    );
  }

  // Admin layout - no Profile Settings, add User List and Enquiry List
  renderAdminLayout(user) {
    const displayName = user?.name || user?.username || user?.email || 'Admin';
    const projectName = 'PracD';
    return (
      <Container className="py-4">
        <h2 className="fw-semibold">Dashboard</h2>
        <p className="text-muted">Home / Dashboard</p>
        <Row className="g-3">
          <Col md={4} lg={3}>
            <Card className="shadow-sm">
              <Card.Body className="text-center">
                <div className="mb-3"><img src="https://randomuser.me/api/portraits/men/40.jpg" alt="Admin Avatar" className="rounded-circle" width={96} height={96} /></div>
                <h5 className="mb-1">{displayName}</h5>
                <Badge bg="dark" className="mb-3">Admin</Badge>
                <div className="small text-muted mb-3">{projectName}</div>
                <ListGroup className="text-start">
                  <ListGroup.Item action active={this.state.adminActive==='overview'} onClick={() => this.handleAdminNav('overview')}>Dashboard</ListGroup.Item>
                  <ListGroup.Item action active={this.state.adminActive==='users'} onClick={() => this.handleAdminNav('users')}>User List</ListGroup.Item>
                  <ListGroup.Item action active={this.state.adminActive==='appointments'} onClick={() => this.handleAdminNav('appointments')}>Appointments</ListGroup.Item>
                  <ListGroup.Item action active={this.state.adminActive==='enquiries'} onClick={() => this.handleAdminNav('enquiries')}>Enquiry List</ListGroup.Item>
                  <ListGroup.Item action onClick={this.props.onLogout}>Logout</ListGroup.Item>
                </ListGroup>
              </Card.Body>
            </Card>
          </Col>
          <Col md={8} lg={9}>
            {this.state.adminActive === 'overview' && (
              <>
                {this.state.adminStatsError && <Alert variant="danger">{this.state.adminStatsError}</Alert>}
                {this.state.adminStatsLoading ? (
                  <div className="text-center py-4"><Spinner animation="border" /></div>
                ) : (
                  <Row className="g-3 mb-3">
                    <Col md={4}><StatCard title="Total Appointments" value={String(this.state.adminStats.totalAppointments)} /></Col>
                    <Col md={4}><StatCard title="Active Doctors" value={String(this.state.adminStats.activeDoctors)} /></Col>
                    <Col md={4}><StatCard title="Active Patients" value={String(this.state.adminStats.activePatients)} /></Col>
                  </Row>
                )}
              </>
            )}
            {this.state.adminActive === 'users' && (
              <Card className="shadow-sm">
                <Card.Header className="bg-white fw-semibold d-flex align-items-center justify-content-between">
                  <span>Users</span>
                  <Form.Control
                    size="sm"
                    style={{ maxWidth: 260 }}
                    type="search"
                    placeholder="Search users..."
                    value={this.state.adminUsersQuery}
                    onChange={(e) => this.setState({ adminUsersQuery: e.target.value })}
                  />
                </Card.Header>
                <Card.Body>
                  {this.state.adminUsersError && <Alert variant="danger">{this.state.adminUsersError}</Alert>}
                  {this.state.adminUsersLoading ? (
                    <div className="text-center py-4"><Spinner animation="border" /></div>
                  ) : (
                    <Table responsive hover className="mb-0">
                      <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th></tr></thead>
                      <tbody>
                        {(() => {
                          const q = (this.state.adminUsersQuery || '').toLowerCase().trim();
                          const rows = this.state.adminUsers.filter((u) => {
                            if (!q) return true;
                            const fields = [u.username, u.name, u.useremail, u.email, u.role, u.status].map((x) => (x || '').toString().toLowerCase());
                            return fields.some((f) => f.includes(q));
                          });
                          if (rows.length === 0) {
                            return (<tr><td colSpan={4} className="text-center text-muted">No users found</td></tr>);
                          }
                          return rows.map((u) => {
                            const id = u._id || u.id;
                            const status = (u.status || '').toString();
                            const updating = !!this.state.adminUserUpdating[id];
                            return (
                              <tr key={id}>
                                <td>{u.username || u.name || '-'}</td>
                                <td>{u.useremail || u.email || '-'}</td>
                                <td><Badge bg={u.role === 'admin' ? 'dark' : u.role === 'doctor' ? 'primary' : 'secondary'}>{u.role || '-'}</Badge></td>
                                <td>
                                  <div className="d-flex align-items-center gap-2">
                                    <Badge bg={status === 'Active' ? 'success' : 'secondary'}>{status || '-'}</Badge>
                                    <div className="d-flex gap-1">
                                      <Button size="sm" variant="primary" onClick={() => this.handleAdminOpenUserModal(u)}>View</Button>
                                      <Button size="sm" variant="outline-success" disabled={updating || status === 'Active'} onClick={() => this.handleAdminSetStatus(id, 'Active')}>
                                        {updating && status !== 'Active' ? '...' : 'Active'}
                                      </Button>
                                      <Button size="sm" variant="outline-secondary" disabled={updating || status === 'Inactive'} onClick={() => this.handleAdminSetStatus(id, 'Inactive')}>
                                        {updating && status !== 'Inactive' ? '...' : 'Inactive'}
                                      </Button>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            );
                          });
                        })()}
                      </tbody>
                    </Table>
                  )}
                </Card.Body>
              </Card>
            )}
            {this.state.adminActive === 'appointments' && (
              <Card className="shadow-sm">
                <Card.Header className="bg-white fw-semibold">Appointments</Card.Header>
                <Card.Body>
                  {this.state.adminApptsError && <Alert variant="danger">{this.state.adminApptsError}</Alert>}
                  {this.state.adminApptsLoading ? (
                    <div className="text-center py-4"><Spinner animation="border" /></div>
                  ) : (
                    <Table responsive hover className="mb-0">
                      <thead><tr><th>Patient</th><th>Doctor</th><th>Date</th><th>Time</th><th>Status</th><th>Fee</th><th>Actions</th></tr></thead>
                      <tbody>
                        {this.state.adminAppts.length === 0 ? (
                          <tr><td colSpan={7} className="text-center text-muted">No appointments found</td></tr>
                        ) : (
                          this.state.adminAppts.map((a) => {
                            const id = a._id || a.id;
                            const updating = !!this.state.adminApptUpdating[id];
                            const dateStr = formatDate(a.date);
                            const timeStr = a.time_slot || a.time || '-';
                            const feeStr = typeof a.fees === 'number' ? `?${a.fees.toFixed(2)}` : (a.fee || '-');
                            return (
                              <tr key={id}>
                                <td>{a.name || a.patient_name || '-'}</td>
                                <td>{a.doctor_name || a.doctor?.username || a.doctor?.name || '-'}</td>
                                <td>{dateStr}</td>
                                <td>{timeStr}</td>
                                <td><Badge bg={a.status === 'approved' || a.status === 'Confirmed' ? 'success' : a.status === 'rejected' ? 'danger' : 'secondary'}>{a.status || '-'}</Badge></td>
                                <td>{feeStr}</td>
                                <td>
                                  <div className="d-flex gap-2">
                                    <Button size="sm" variant="primary" onClick={() => this.handleOpenApptModal(a)}>View</Button>
                                    <Button size="sm" variant="outline-success" disabled={updating || a.status === 'approved'} onClick={() => this.handleAdminSetApptStatus(id, 'approved')}>
                                      {updating && a.status !== 'approved' ? '...' : 'Approve'}
                                    </Button>
                                    <Button size="sm" variant="outline-danger" disabled={updating || a.status === 'rejected'} onClick={() => this.handleAdminSetApptStatus(id, 'rejected')}>
                                      {updating && a.status !== 'rejected' ? '...' : 'Reject'}
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </Table>
                  )}
                </Card.Body>
              </Card>
            )}
            {this.state.adminActive === 'enquiries' && (
              <Card className="shadow-sm">
                <Card.Header className="bg-white fw-semibold">Enquiries</Card.Header>
                <Card.Body>
                  {this.state.adminEnquiriesError && <Alert variant="danger">{this.state.adminEnquiriesError}</Alert>}
                  {this.state.adminEnquiriesLoading ? (
                    <div className="text-center py-4"><Spinner animation="border" /></div>
                  ) : (
                    <Table responsive hover className="mb-0">
                      <thead><tr><th>First Name</th><th>Last Name</th><th>Email</th><th>Mobile</th><th>Message</th></tr></thead>
                      <tbody>
                        {this.state.adminEnquiries.length === 0 ? (
                          <tr><td colSpan={5} className="text-center text-muted">No enquiries found</td></tr>
                        ) : (
                          this.state.adminEnquiries.map((c, idx) => (
                            <tr key={c._id || c.id || idx}>
                              <td>{c.first_name || '-'}</td>
                              <td>{c.last_name || '-'}</td>
                              <td>{c.email || '-'}</td>
                              <td>{c.mobile_number || c.mobile || '-'}</td>
                              <td>{c.message || '-'}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </Table>
                  )}
                </Card.Body>
              </Card>
            )}
          </Col>
        </Row>
      </Container>
    );
  }

  renderAdminUserModal() {
    const loading = this.state.adminUserDetailsLoading;
    const error = this.state.adminUserDetailsError;
    const u = this.state.adminUserDetails || this.state.adminSelectedUser;
    const roleLower = (u?.role || '').toString().toLowerCase();
    const formatINR = (n) =>
      typeof n === 'number'
        ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(n)
        : (n ?? '-');

    return (
      <Modal show={this.state.adminShowUserModal} onHide={this.handleAdminCloseUserModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>{u ? (u.username || u.name || u.useremail || 'User Details') : 'User Details'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          {loading ? (
            <div className="text-center py-3"><Spinner animation="border" /></div>
          ) : u ? (
            <div>
              <Row className="g-3">
                {[
                  { label: 'Username', value: (x) => x.username || x.name || '-' },
                  { label: 'Email', value: (x) => x.useremail || x.email || '-' },
                  ...(roleLower !== 'patient' ? [ { label: 'Status', value: (x) => x.status || '-', isStatus: true } ] : []),
                  // Hide Age if role is doctor
                  ...(roleLower !== 'doctor' ? [ { label: 'Age', value: (x) => (x.age ?? '-') } ] : []),
                  { label: 'Phone', value: (x) => x.phone || '-' },
                  // Hide doctor-specific fields if patient
                  ...(roleLower !== 'patient' ? [
                    { label: 'Specialization', value: (x) => x.specialization || '-' },
                    ...(roleLower === 'doctor' ? [ { label: 'Experience (years)', value: (x) => (x.experience ?? '-') } ] : []),
                    { label: 'Fees', value: (x) => formatINR(typeof x.fees === 'number' ? x.fees : (typeof x.fee === 'number' ? x.fee : null)) },
                    { label: 'Doctor Description', value: (x) => x.doctor_description || '-', full: true },
                  ] : []),
                  { label: 'Address', value: (x) => x.address || '-', full: true },
                ].map((item, idx) => {
                  const v = item.value(u);
                  const col = item.full ? 12 : 6;
                  return (
                    <Col md={col} key={idx}>
                      <div className="p-3 rounded border bg-light h-100">
                        <div className="text-muted small mb-1">{item.label}</div>
                        <div className="fw-semibold">
                          {item.isStatus
                            ? <Badge bg={(v || '') === 'Active' ? 'success' : 'secondary'}>{v || '-'}</Badge>
                            : (v || '-')}
                        </div>
                      </div>
                    </Col>
                  );
                })}
              </Row>
            </div>
          ) : (
            <div className="text-muted">No data</div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={this.handleAdminCloseUserModal}>Close</Button>
        </Modal.Footer>
      </Modal>
    );
  }

  renderApptModal() {
    const a = this.state.selectedAppt;
    const isAdmin = (this.props.user?.role === 'admin');
    return (
      <Modal show={this.state.showApptModal} onHide={this.handleCloseApptModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>{a ? `Appointment – ${a.name || a.patient_name || ''}` : 'Appointment Details'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {a ? (
            <div>
              <Row className="g-3">
                {[
                  { label: 'Patient Name', value: (x) => x.name || x.patient_name || '-' },
                  { label: 'Patient Type', value: (x) => x.patient_type || '-' },
                  { label: 'Date', value: (x) => formatDate(x.date) },
                  { label: 'Time Slot', value: (x) => x.time_slot || x.time || '-' },
                  { label: 'Phone', value: (x) => x.phone || '-' },
                  { label: 'Email', value: (x) => x.email || '-' },
                  { label: 'Doctor Name', value: (x) => x.doctor_name || x.doctor?.username || x.doctor?.name || '-' },
                  { label: 'Doctor Email', value: (x) => x.doctor_email || x.doctor?.useremail || '-' },
                  { label: 'Fee', value: (x) => (typeof x.fees === 'number' ? `?${x.fees.toFixed(2)}` : (x.fee || '-')) },
                  { label: 'Status', value: (x) => x.status, isStatus: true },
                  // Admin-only extended fields
                    ...(isAdmin ? [
                      { label: 'Booking Type', value: () => 'Online' },
                    ] : [])
                ].map((item, idx) => {
                  const v = item.value(a);
                  return (
                    <Col md={6} key={idx}>
                      <div className="p-3 rounded border bg-light h-100">
                        <div className="text-muted small mb-1">{item.label}</div>
                        <div className="fw-semibold">
                          {item.isStatus
                            ? <Badge bg={v === 'approved' || v === 'Confirmed' ? 'success' : v === 'rejected' ? 'danger' : 'secondary'}>{v || '-'}</Badge>
                            : (v || '-')}
                        </div>
                      </div>
                    </Col>
                  );
                })}
              </Row>
            </div>
          ) : (
            <div className="text-muted">No data</div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={this.handleCloseApptModal}>Close</Button>
        </Modal.Footer>
      </Modal>
    );
  }

  render() {
    const { user } = this.props;
    if (user?.role === 'doctor') return this.renderDoctorLayout(user);
    if (user?.role === 'admin') return (
      <>
        {this.renderAdminLayout(user)}
        {this.renderAdminUserModal()}
        {this.renderApptModal(false)}
      </>
    );
    return this.renderPatientLayout(user);
  }
}

class StatCard extends Component {
  render() {
    return (
      <Card className="h-100 shadow-sm">
        <Card.Body>
          <div className="text-secondary">{this.props.title}</div>
          <div className="display-6 fw-bold">{this.props.value}</div>
        </Card.Body>
      </Card>
    );
  }
}



  export default Dashboard;






