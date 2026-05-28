import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080';
const api = axios.create({ baseURL: `${API_BASE}/api`, headers: { 'Content-Type': 'application/json' } });
const authApi = axios.create({ baseURL: API_BASE, headers: { 'Content-Type': 'application/json' } });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('jwt');
  if (token) config.headers.Token = token;
  return config;
});

export const getToken = () => localStorage.getItem('jwt');
export const setToken = (token) => localStorage.setItem('jwt', token);
export const clearAuth = () => {
  localStorage.removeItem('jwt');
  localStorage.removeItem('user_profile');
  localStorage.removeItem('isAuthenticated');
};

export const signupApi = (user) => authApi.post('/authservice/signup', user).then((r) => r.data);
export const signinApi = (username, password) =>
  authApi.post('/authservice/signin', { username, password }).then((r) => r.data);
export const fetchUserInfo = () => authApi.get('/authservice/uinfo', { headers: { Token: getToken() } }).then((r) => r.data);

export const getUserId = () => {
  const profile = JSON.parse(localStorage.getItem('user_profile') || '{}');
  return profile.email || '';
};

export const fetchResources = (params = {}) => api.get('/resources', { params }).then((r) => r.data);
export const ensureCatalogResource = (payload) =>
  api.post('/resources/from-catalog', payload).then((r) => r.data);
export const fetchCategories = () => api.get('/resources/categories').then((r) => r.data);
export const semanticSearch = (q, date, availableOnly = true) =>
  api.get('/resources/search', { params: { q, date, availableOnly } }).then((r) => r.data);
export const fetchRecommendations = (date) =>
  api.get('/resources/recommendations', { params: { date } }).then((r) => r.data);
export const fetchTimeSlots = (resourceId, date) =>
  api.get('/time-slots', { params: { resourceId, date } }).then((r) => r.data);
export const createBooking = (payload) => api.post('/bookings', payload).then((r) => r.data);
export const fetchBookings = () => api.get('/bookings').then((r) => r.data);
export const cancelBooking = (id) => api.delete(`/bookings/${id}`).then((r) => r.data);
export const createResource = (data) => api.post('/resources', data).then((r) => r.data);
export const updateResource = (id, data) => api.put(`/resources/${id}`, data).then((r) => r.data);
export const deleteResource = (id) => api.delete(`/resources/${id}`);

export default api;
