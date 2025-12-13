import axios from 'axios';

// Create axios instance with base configuration
const defaultBaseURL = (import.meta.env.MODE === 'production')
  ? 'https://grind-up-v1.vercel.app/api'
  : 'http://localhost:3000/api';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || defaultBaseURL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Remove Content-Type header for FormData to allow multipart/form-data with boundary
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    // Log error for debugging
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Auth API endpoints
export const authAPI = {
  // Login
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  // College Registration
  registerCollege: async (collegeData) => {
    const response = await api.post('/auth/register/college', collegeData);
    return response.data;
  },

  // Company Registration
  registerCompany: async (companyData) => {
    const response = await api.post('/auth/register/company', companyData);
    return response.data;
  },

  // Logout
  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },

  // Get current user
  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  // Check profile completion status
  checkProfileCompletion: async () => {
    const response = await api.get('/auth/check-profile-completion');
    return response.data;
  },

  // Refresh token
  refreshToken: async () => {
    const response = await api.post('/auth/refresh');
    return response.data;
  },
};

// Placements API endpoints
export const placementsAPI = {
  // Get all placements
  getPlacements: async () => {
    const response = await api.get('/placements');
    return response.data;
  },

  // Get placement by ID
  getPlacementById: async (id) => {
    const response = await api.get(`/placements/${id}`);
    return response.data;
  },

  // Apply for placement
  applyForPlacement: async (placementId, applicationData) => {
    const response = await api.post(`/placements/${placementId}/apply`, applicationData);
    return response.data;
  },
};

// Invites API endpoints
export const invitesAPI = {
  // Get invites
  getInvites: async () => {
    const response = await api.get('/invites');
    return response.data;
  },

  // Accept invite
  acceptInvite: async (inviteId) => {
    const response = await api.post(`/invites/${inviteId}/accept`);
    return response.data;
  },

  // Decline invite
  declineInvite: async (inviteId) => {
    const response = await api.post(`/invites/${inviteId}/decline`);
    return response.data;
  },
};

// Profile API endpoints
export const profileAPI = {
  // Get profile
  getProfile: async () => {
    const response = await api.get('/profile/me');
    return response.data;
  },

  // Update profile
  updateProfile: async (profileData) => {
    const response = await api.put('/profile', profileData);
    return response.data;
  },

  // Upload profile picture
  uploadProfilePicture: async (file) => {
    const formData = new FormData();
    formData.append('profilePicture', file);
    // Let the browser set the Content-Type (with boundary) for multipart requests
    const response = await api.post('/profile/picture', formData);
    return response.data;
  },

  // Upload placement records (Excel file)
  uploadPlacementRecords: async (file) => {
    const formData = new FormData();
    formData.append('placementRecords', file);
    // Let the browser set the Content-Type (with boundary) for multipart requests
    const response = await api.post('/profile/placement-records/upload', formData);
    return response.data;
  },

  // Delete placement records
  deletePlacementRecords: async () => {
    const response = await api.delete('/profile/placement-records');
    return response.data;
  },
};

export default api;

