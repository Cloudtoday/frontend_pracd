export const API_URL = import.meta.env.VITE_API_URL;

// In-memory token with 1h persistence via localStorage
let authToken = null;
const TOKEN_KEY = 'auth_token';
const TOKEN_EXP_KEY = 'auth_token_exp';
const ONE_HOUR_MS = 60 * 60 * 1000;

export const setToken = (token) => {
  authToken = token || null;
  try {
    if (token) {
      const exp = Date.now() + ONE_HOUR_MS;
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(TOKEN_EXP_KEY, String(exp));
    } else {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(TOKEN_EXP_KEY);
    }
  } catch (err) {console.log(err)}
};

export const getToken = () => {
  if (authToken) return authToken;
  try {
    const stored = localStorage.getItem(TOKEN_KEY);
    const expStr = localStorage.getItem(TOKEN_EXP_KEY);
    const exp = expStr ? parseInt(expStr, 10) : 0;
    if (!stored || !exp || Number.isNaN(exp) || Date.now() > exp) {
      // expired or missing
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(TOKEN_EXP_KEY);
      authToken = null;
      return null;
    }
    authToken = stored;
    return authToken;
  } catch (_) {
    return authToken;
  }
};

export const clearToken = () => {
  authToken = null;
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(TOKEN_EXP_KEY);
  } catch (err) {console.log(err)}
};

// Auth APIs
export const loginRequest = async (data) => {
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  const responseData = await res.json();

  if (!res.ok) {
    throw new Error(responseData.message || "Login failed");
  }

  return responseData; // expected: { token }
};

export const registerRequest = async (data) => {
  const res = await fetch(`${API_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  const responseData = await res.json();

  if (!res.ok) {
    throw new Error(responseData.message || "Registration failed");
  }

  return responseData;
};

export const logoutRequest = async () => {
  const token = getToken();
  // If there's no token, nothing to revoke server-side
  if (!token) return { message: "No token present; cleared locally" };

  const res = await fetch(`${API_URL}/api/auth/logout`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  // Some backends may return no JSON on success
  let responseData = { message: "Logged out" };
  try {
    responseData = await res.json();
  } catch (err) {console.log(err)}

  if (!res.ok) {
    throw new Error(responseData.message || "Logout failed");
  }

  return responseData;
};

// Profile APIs
export const getProfileById = async (id) => {
  const token = getToken();
  if (!token) throw new Error("Not authenticated");
  const res = await fetch(`${API_URL}/api/profile/${id}`, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "Failed to load profile");
  return data;
};

// Public: Get a doctor's public profile by id
export const getPublicDoctorProfile = async (id) => {
  const res = await fetch(`${API_URL}/api/profile/doctor/${id}`, { method: "GET" });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "Failed to load doctor profile");
  // Support different backend envelope shapes
  if (data && typeof data === 'object') {
    if (data.doctor && typeof data.doctor === 'object') return data.doctor;
    if (data.data && typeof data.data === 'object') return data.data;
  }
  return data;
};

export const updateProfileById = async (id, payload) => {
  const token = getToken();
  if (!token) throw new Error("Not authenticated");
  const res = await fetch(`${API_URL}/api/profile/${id}`, {
    method: "PUT",
    headers: { 
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "Failed to update profile");
  return data;
};

// Appointments APIs
export const getAppointmentsByDoctor = async (doctorId) => {
  const token = getToken();
  if (!token) throw new Error("Not authenticated");
  const res = await fetch(`${API_URL}/api/appointment/doctor/${doctorId}`, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });

  let data = await res.json().catch(() => ({}));
  if (res.status === 404) {
    // No appointments for this doctor — return empty list
    return [];
  }
  if (!res.ok) {
    throw new Error(data.message || "Failed to fetch appointments");
  }
  const list = Array.isArray(data)
    ? data
    : data.appointments || data.results || data.items || [];
  return Array.isArray(list) ? list : [];
};

// Admin APIs
export const adminLoginRequest = async (data) => {
  // Accepts { useremail, password }
  const res = await fetch(`${API_URL}/api/auth/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const responseData = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(responseData.message || "Admin login failed");
  return responseData; // expected: { token }
};

export const getAdminStats = async () => {
  const token = getToken();
  if (!token) throw new Error("Not authenticated");
  // Try direct stats endpoint first
  try {
    const res = await fetch(`${API_URL}/api/admin/stats`, { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json().catch(() => ({}));
    if (res.ok && data) {
      return data;
    }
  } catch (err) {console.log(err)}
  // Fallback: derive from existing endpoints
  // - totalAppointments from /api/appointment/
  // - activeDoctors/activePatients from /api/profile?status=Active
  const [appts, profiles] = await Promise.all([
    (async () => {
      try {
        const r = await fetch(`${API_URL}/api/appointment/`, { headers: { Authorization: `Bearer ${token}` } });
        const j = await r.json().catch(() => ({}));
        const list = Array.isArray(j) ? j : j.appointments || [];
        return Array.isArray(list) ? list.length : 0;
      } catch (_) { return 0; }
    })(),
    (async () => {
      try {
        const r = await fetch(`${API_URL}/api/profile?status=Active`, { headers: { Authorization: `Bearer ${token}` } });
        const j = await r.json().catch(() => ({}));
        const list = Array.isArray(j) ? j : j.users || j.profiles || [];
        return Array.isArray(list) ? list : [];
      } catch (_) { return []; }
    })(),
  ]);
  const activeDoctors = profiles.filter((u) => (u.role || '').toLowerCase() === 'doctor').length;
  const activePatients = profiles.filter((u) => (u.role || '').toLowerCase() === 'patient').length;
  return { totalAppointments: appts, activeDoctors, activePatients };
};

export const getAdminUsers = async () => {
  const token = getToken();
  if (!token) throw new Error("Not authenticated");
  const res = await fetch(`${API_URL}/api/admin/users`, { headers: { Authorization: `Bearer ${token}` } });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "Failed to load users");
  return Array.isArray(data) ? data : data.users || [];
};

export const updateUserStatus = async (userId, status) => {
  const token = getToken();
  if (!token) throw new Error("Not authenticated");
  const res = await fetch(`${API_URL}/api/admin/users/${userId}/status`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "Failed to update status");
  return data;
};

export const getAdminAppointments = async () => {
  const token = getToken();
  if (!token) throw new Error("Not authenticated");
  const res = await fetch(`${API_URL}/api/appointment/`, { headers: { Authorization: `Bearer ${token}` } });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "Failed to load appointments");
  return Array.isArray(data) ? data : data.appointments || [];
};

export const updateAppointmentStatus = async (apptId, status) => {
  const token = getToken();
  if (!token) throw new Error("Not authenticated");
  const res = await fetch(`${API_URL}/api/appointment/status/${apptId}`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "Failed to update appointment");
  return data;
};

// Patient: Create a new appointment
export const createAppointment = async (payload) => {
  const token = getToken();
  if (!token) throw new Error("Not authenticated");
  const res = await fetch(`${API_URL}/api/appointment/`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "Failed to create appointment");
  return data;
};

export const getAdminEnquiries = async () => {
  const token = getToken();
  if (!token) throw new Error("Not authenticated");
  // Admin: Get all contact enquiries
  const res = await fetch(`${API_URL}/api/contact`, { headers: { Authorization: `Bearer ${token}` } });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "Failed to load enquiries");
  // Backend returns { total, contacts }
  const list = Array.isArray(data) ? data : data.contacts || data.results || [];
  return Array.isArray(list) ? list : [];
};

// Admin: Get all profiles with optional status filter (Active/Inactive)
export const getAllProfilesAdmin = async (status) => {
  const token = getToken();
  if (!token) throw new Error("Not authenticated");
  const qs = status ? `?status=${encodeURIComponent(status)}` : '';
  const res = await fetch(`${API_URL}/api/profile${qs}`, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "Failed to load profiles");
  const list = Array.isArray(data) ? data : data.users || data.profiles || data.results || [];
  return Array.isArray(list) ? list : [];
};

// Admin: Update user status via /api/profile/status/:id
export const adminUpdateProfileStatus = async (id, status) => {
  const token = getToken();
  if (!token) throw new Error("Not authenticated");
  const res = await fetch(`${API_URL}/api/profile/status/${id}`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "Failed to update user status");
  return data;
};

export const getAppointmentsByPatient = async (patientId) => {
  const token = getToken();
  if (!token) throw new Error("Not authenticated");
  const res = await fetch(`${API_URL}/api/appointment/patient/${patientId}`, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });
  let data = await res.json().catch(() => ({}));
  if (res.status === 404) return [];
  if (!res.ok) throw new Error(data.message || "Failed to fetch appointments");
  const list = Array.isArray(data) ? data : data.appointments || data.results || data.items || [];
  return Array.isArray(list) ? list : [];
};

export const getAllDoctors = async () => {
  // Public endpoint: no authentication header
  const res = await fetch(`${API_URL}/api/profile/all/doctors`, { method: "GET" });

  // Parse JSON safely
  let responseData;
  try {
    responseData = await res.json();
  } catch (_) {
    responseData = null;
  }

  if (!res.ok) {
    const message = (responseData && responseData.message) || "Failed to fetch doctors";
    throw new Error(message);
  }

  // Normalize to an array regardless of backend shape
  const list = Array.isArray(responseData)
    ? responseData
    : responseData?.data || responseData?.doctors || responseData?.results || responseData?.items || [];

  return Array.isArray(list) ? list : [];
};

// Public: Submit contact form
export const submitContact = async (payload) => {
  const res = await fetch(`${API_URL}/api/contact`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "Failed to submit contact form");
  return data;
};
