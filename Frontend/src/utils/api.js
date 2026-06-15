import axios from 'axios';

const RESOURCE_API_BASE = import.meta.env.VITE_RESOURCE_API_URL || 'http://127.0.0.1:8000';

const api = axios.create({
  baseURL: `${RESOURCE_API_BASE}/api`,
  headers: { 'Content-Type': 'application/json' },
});

const authApi = axios.create({
  baseURL: RESOURCE_API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

const attachToken = (config) => {
  const token = localStorage.getItem('jwt');
  if (token) config.headers.Token = token;
  return config;
};

const handleUnauthorized = (error) => {
  if (error.response && error.response.status === 401) {
    clearAuth();
    window.location.assign(`${import.meta.env.BASE_URL}login`);
  }
  return Promise.reject(error);
};

api.interceptors.request.use(attachToken);
authApi.interceptors.request.use(attachToken);
api.interceptors.response.use((response) => response, handleUnauthorized);
authApi.interceptors.response.use((response) => response, handleUnauthorized);

export const getToken = () => localStorage.getItem('jwt');
export const setToken = (token) => localStorage.setItem('jwt', token);

export const clearAuth = () => {
  localStorage.removeItem('jwt');
  localStorage.removeItem('user_profile');
  localStorage.removeItem('isAuthenticated');
};

export const signupApi = async (user) =>
  authApi.post('/authservice/signup', user).then((response) => response.data);

export const signinApi = async (username, password) =>
  authApi.post('/authservice/signin', { username, password }).then((response) => response.data);

export const fetchUserInfo = async () =>
  authApi.get('/authservice/uinfo').then((response) => response.data);

export const logoutApi = async () => ({ code: 200, message: 'Logged out successfully' });

export const getUserId = () => {
  const profile = JSON.parse(localStorage.getItem('user_profile') || '{}');
  return profile.email || '';
};

export const fetchResources = async (params = {}) =>
  api.get('/resources', { params }).then((response) => response.data);

export const ensureCatalogResource = async (payload) =>
  api.post('/resources/from-catalog', payload).then((response) => response.data);

export const fetchCategories = async () =>
  api.get('/resources/categories').then((response) => response.data);

export const semanticSearch = async (q, date, availableOnly = true) =>
  api.get('/resources/search', { params: { q, date, availableOnly } }).then((response) => response.data);

export const fetchRecommendations = async (date) =>
  api.get('/resources/recommendations', { params: { date } }).then((response) => response.data);

export const fetchTimeSlots = async (resourceId, date) =>
  api.get('/time-slots', { params: { resourceId, date } }).then((response) => response.data);

export const createBooking = async (payload) =>
  api.post('/bookings', payload).then((response) => response.data);

export const fetchBookings = async () =>
  api.get('/bookings').then((response) => response.data);

export const cancelBooking = async (id) =>
  api.delete(`/bookings/${id}`).then((response) => response.data);

export const createResource = async (data) =>
  api.post('/resources', data).then((response) => response.data);

export const updateResource = async (id, data) =>
  api.put(`/resources/${id}`, data).then((response) => response.data);

export const deleteResource = async (id) =>
  api.delete(`/resources/${id}`).then((response) => response.data);

export default api;
