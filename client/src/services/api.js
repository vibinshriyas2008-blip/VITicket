import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('viticket_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If unauthorized and has token, clear session
      if (localStorage.getItem('viticket_token')) {
        localStorage.removeItem('viticket_token');
        localStorage.removeItem('viticket_user');
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me'),
};

export const eventAPI = {
  getAll: (params) => api.get('/events', { params }),
  getById: (id) => api.get(`/events/${id}`),
  create: (eventData) => api.post('/events', eventData),
  update: (id, eventData) => api.put(`/events/${id}`, eventData),
  delete: (id) => api.delete(`/events/${id}`),
  registerForEvent: (eventId) => api.post(`/events/${eventId}/register`),
  getEventCheckins: (eventId) => api.get(`/events/${eventId}/checkins`),
  getEventStats: (eventId) => api.get(`/events/${eventId}/statistics`),
};

export const ticketAPI = {
  getMyRegistrations: () => api.get('/my-registrations'),
  getTicketById: (ticketId) => api.get(`/tickets/${ticketId}`),
};

export const checkinAPI = {
  verifyTicket: (data) => api.post('/checkin/verify', data),
};

export const devAPI = {
  getLastEmail: () => api.get('/dev/last-email'),
};

export default api;
