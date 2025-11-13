import React, { Component } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// import { Container, Button } from 'react-bootstrap';
import NavbarComponent from './components/NavbarComponent.jsx';
import HeroSection from './components/HeroSection.jsx';
import ServiceSection from "./components/ServiceSection.jsx";
import TopDoctors from './components/TopDoctors.jsx';
import Footer from './components/Footer.jsx';
import AuthModal from './components/AuthModal.jsx';
import Dashboard from './components/Dashboard.jsx';
import Guarded from './components/Guarded.jsx';
import DoctorList from "./components/DoctorList.jsx";
import ContactPage from "./components/ContactPage.jsx";
import BookAppointment from "./components/BookAppointment.jsx";
import DoctorDetails from "./components/DoctorDetails.jsx";
import { logoutRequest, clearToken, getToken } from './services/api';
import { jwtDecode } from 'jwt-decode';
import AdminLogin from './components/AdminLogin.jsx';


class Home extends Component {
  render() {
    return (
      <>
        <HeroSection />
        <ServiceSection />
        <TopDoctors />
      </>
    );
  }
}

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user: null,
      showAuth: false,
      initialTab: 'login'
    };
  }

  componentDidMount() {
    // Restore session from persisted token (valid for up to 1 hour)
    try {
      const token = getToken();
      if (token) {
        const decoded = jwtDecode(token);
        const user = {
          token,
          role: decoded?.role,
          id: decoded?.id || decoded?._id || decoded?.userId || decoded?.sub,
          email: decoded?.email,
          name: decoded?.name,
        };
        this.setState({ user });
      }
    } catch (_) {
      // ignore
    }
  }

  handleLogin = (user) => {
    this.setState({ user, showAuth: false });
  };

  handleLogout = async () => {
    try {
      await logoutRequest();
    } catch (_) {
      // Ignore network/server errors; proceed with local logout
    } finally {
      this.setState({ user: null });
      clearToken();
    }
  };

  openLogin = () => this.setState({ showAuth: true, initialTab: 'login' });

  guard = (Component, props = {}) => {
    return this.state.user ? (
      <Component {...props} user={this.state.user} onLogout={this.handleLogout} />
    ) : (
      <Guarded openLogin={this.openLogin} />
    );
  };

  render() {
    return (
      <Router basename="/pracd">
        <NavbarComponent
          user={this.state.user}
          onShowLogin={this.openLogin}
          onLogout={this.handleLogout}
        />

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/admin/login" element={<AdminLogin onLogin={this.handleLogin} />} />
          <Route path="/doctors" element={<DoctorList />} />
          <Route path="/book-appointment" element={<BookAppointment />} />
          <Route path="/book-appointment/:id" element={<BookAppointment />} />
          <Route
            path="/dashboard"
            element={this.guard(Dashboard)}
          />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/doctor-details/:id" element={<DoctorDetails />} />
          {/* Removed duplicate book-appointment route */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>

        <Footer />

        <AuthModal
          show={this.state.showAuth}
          onHide={() => this.setState({ showAuth: false })}
          initialTab={this.state.initialTab}
          onSubmit={this.handleLogin}
        />
      </Router>
    );
  }
}

export default App;
