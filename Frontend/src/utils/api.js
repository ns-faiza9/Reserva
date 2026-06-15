import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const USE_DEMO_MODE =
  import.meta.env.VITE_USE_DEMO_MODE === 'true' || (import.meta.env.PROD && !import.meta.env.VITE_API_URL);

const DEMO_STORAGE_KEYS = {
  bookings: 'reserva_demo_bookings',
  currentUser: 'reserva_demo_current_user',
  resources: 'reserva_demo_resources',
  users: 'reserva_demo_users',
};

const api = axios.create({ baseURL: `${API_BASE}/api`, headers: { 'Content-Type': 'application/json' } });
const authApi = axios.create({ baseURL: API_BASE, headers: { 'Content-Type': 'application/json' } });

if (!USE_DEMO_MODE) {
  api.interceptors.request.use((config) => {
    const token = localStorage.getItem('jwt');
    if (token) config.headers.Token = token;
    return config;
  });

  api.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response && error.response.status === 401) {
        clearAuth();
        window.location.assign(`${import.meta.env.BASE_URL}login`);
      }
      return Promise.reject(error);
    }
  );
}

const readStoredJson = (storageKey, fallbackValue) => {
  try {
    const rawValue = localStorage.getItem(storageKey);
    return rawValue ? JSON.parse(rawValue) : fallbackValue;
  } catch {
    return fallbackValue;
  }
};

const writeStoredJson = (storageKey, value) => {
  localStorage.setItem(storageKey, JSON.stringify(value));
};

const cloneValue = (value) => JSON.parse(JSON.stringify(value));

const normalizeResource = (resource) => ({
  ...resource,
  id: resource.id,
  available: resource.available !== false,
  capacity: Number(resource.capacity) || 0,
  price_per_hour: Number(resource.price_per_hour) || 0,
  description: resource.description || '',
  image: resource.image || '',
  hasProjector: Boolean(resource.hasProjector),
  hasGpu: Boolean(resource.hasGpu),
});

const getDemoUserSeed = () => [
  {
    fullname: 'Admin User',
    email: 'admin@reserva.com',
    username: 'admin',
    password: 'admin123',
    phone: '9999999999',
    role: 2,
    roleName: 'ADMIN',
    status: 1,
    statusText: 'Active',
  },
  {
    fullname: 'Demo User',
    email: 'user@reserva.com',
    username: 'user',
    password: 'user12345',
    phone: '9999999998',
    role: 1,
    roleName: 'USER',
    status: 1,
    statusText: 'Active',
  },
];

const getDemoUsers = () => {
  const storedUsers = readStoredJson(DEMO_STORAGE_KEYS.users, null);
  if (Array.isArray(storedUsers) && storedUsers.length > 0) return storedUsers;
  const seededUsers = getDemoUserSeed();
  writeStoredJson(DEMO_STORAGE_KEYS.users, seededUsers);
  return seededUsers;
};

let demoResourcesPromise = null;
const getDemoResources = async () => {
  const storedResources = readStoredJson(DEMO_STORAGE_KEYS.resources, null);
  if (Array.isArray(storedResources) && storedResources.length > 0) return storedResources;

  if (!demoResourcesPromise) {
    const resourceUrl = `${import.meta.env.BASE_URL}mock-resources.json`;
    demoResourcesPromise = fetch(resourceUrl)
      .then((response) => {
        if (!response.ok) throw new Error(`Unable to load ${resourceUrl}`);
        return response.json();
      })
      .then((resources) => {
        const normalizedResources = Array.isArray(resources)
          ? resources.map(normalizeResource)
          : [];
        writeStoredJson(DEMO_STORAGE_KEYS.resources, normalizedResources);
        return normalizedResources;
      })
      .catch(() => []);
  }

  return demoResourcesPromise;
};

const saveDemoResources = async (resources) => {
  const normalizedResources = resources.map(normalizeResource);
  writeStoredJson(DEMO_STORAGE_KEYS.resources, normalizedResources);
  return normalizedResources;
};

const getDemoBookings = () => readStoredJson(DEMO_STORAGE_KEYS.bookings, []);
const saveDemoBookings = (bookings) => writeStoredJson(DEMO_STORAGE_KEYS.bookings, bookings);

const getCurrentDemoUser = () => {
  const token = getToken();
  if (!token) return null;
  const tokenValue = token.startsWith('demo:') ? decodeURIComponent(token.slice(5)) : token;
  return getDemoUsers().find((user) => user.email === tokenValue || user.username === tokenValue) || null;
};

const buildUserInfo = (user) => ({
  code: 200,
  fullname: user.fullname,
  name: user.fullname,
  email: user.email,
  username: user.username,
  phone: user.phone || '',
  role: user.role,
  roleName: user.roleName,
  status: user.status,
  statusText: user.statusText,
});

const buildDemoBooking = async (payload) => {
  const resources = await getDemoResources();
  const currentUser = getCurrentDemoUser();
  const selectedResource = resources.find(
    (resource) => String(resource.id) === String(payload.resourceId)
  );
  const bookings = getDemoBookings();
  const nextId = bookings.reduce((maxId, booking) => Math.max(maxId, Number(booking.id) || 0), 0) + 1;

  return {
    id: nextId,
    resourceId: payload.resourceId,
    resourceName: selectedResource?.name || 'Booked resource',
    resourceLocation: selectedResource?.location || '',
    fromDate: payload.fromDate,
    toDate: payload.toDate,
    fromTime: payload.fromTime,
    toTime: payload.toTime,
    purpose: payload.purpose,
    bookedBy: currentUser?.email || 'demo@reserva.com',
    status: 'CONFIRMED',
  };
};

export const getToken = () => localStorage.getItem('jwt');
export const setToken = (token) => localStorage.setItem('jwt', token);
export const clearAuth = () => {
  localStorage.removeItem('jwt');
  localStorage.removeItem('user_profile');
  localStorage.removeItem('isAuthenticated');
  localStorage.removeItem(DEMO_STORAGE_KEYS.currentUser);
};

export const signupApi = async (user) => {
  if (!USE_DEMO_MODE) return authApi.post('/authservice/signup', user).then((response) => response.data);

  const users = getDemoUsers();
  const email = (user.email || '').trim().toLowerCase();
  const username = (user.username || '').trim().toLowerCase();
  if (!email || !username || !user.password) {
    return { code: 400, message: 'Missing signup details.' };
  }
  if (
    users.some(
      (existingUser) =>
        existingUser.email.toLowerCase() === email || existingUser.username.toLowerCase() === username
    )
  ) {
    return { code: 409, message: 'Account already exists.' };
  }

  const newUser = {
    fullname: user.fullname || user.name || username,
    email,
    username,
    password: user.password,
    phone: user.phone || username,
    role: user.role === 'ADMIN' || user.role === 2 ? 2 : 1,
    roleName: user.role === 'ADMIN' || user.role === 2 ? 'ADMIN' : 'USER',
    status: 1,
    statusText: 'Active',
  };

  users.push(newUser);
  writeStoredJson(DEMO_STORAGE_KEYS.users, users);
  return { code: 200, message: 'Signup successful.' };
};

export const signinApi = async (username, password) => {
  if (!USE_DEMO_MODE) {
    return authApi.post('/authservice/signin', { username, password }).then((response) => response.data);
  }

  const users = getDemoUsers();
  const normalizedLogin = String(username || '').trim().toLowerCase();
  const matchedUser = users.find(
    (user) =>
      (user.email || '').toLowerCase() === normalizedLogin ||
      (user.username || '').toLowerCase() === normalizedLogin
  );

  if (!matchedUser || matchedUser.password !== password) {
    return { code: 401, message: 'Invalid email or password.' };
  }

  writeStoredJson(DEMO_STORAGE_KEYS.currentUser, matchedUser.email);
  return {
    code: 200,
    jwt: `demo:${encodeURIComponent(matchedUser.email)}`,
    user: buildUserInfo(matchedUser),
  };
};

export const fetchUserInfo = async () => {
  if (!USE_DEMO_MODE) {
    return authApi
      .get('/authservice/uinfo', { headers: { Token: getToken() } })
      .then((response) => response.data);
  }

  const currentUser = getCurrentDemoUser();
  if (!currentUser) return { code: 401, message: 'Unauthorized' };
  return buildUserInfo(currentUser);
};

export const getUserId = () => {
  const profile = JSON.parse(localStorage.getItem('user_profile') || '{}');
  return profile.email || '';
};

export const fetchResources = async (params = {}) => {
  if (!USE_DEMO_MODE) {
    return api.get('/resources', { params }).then((response) => response.data);
  }

  return getDemoResources();
};

export const ensureCatalogResource = async (payload) => {
  if (!USE_DEMO_MODE) {
    return api.post('/resources/from-catalog', payload).then((response) => response.data);
  }

  const resources = await getDemoResources();
  const existingResource = resources.find(
    (resource) => String(resource.id) === String(payload.catalogId)
  );
  if (existingResource) return existingResource;

  const nextId = resources.reduce((maxId, resource) => Math.max(maxId, Number(resource.id) || 0), 0) + 1;
  const newResource = normalizeResource({
    id: nextId,
    catalogId: payload.catalogId,
    name: payload.name,
    type: payload.type,
    location: payload.location,
    capacity: payload.capacity,
    price_per_hour: payload.price_per_hour || 0,
    image: payload.image || '',
    description: payload.description || '',
    available: true,
    hasProjector: Boolean(payload.hasProjector),
    hasGpu: Boolean(payload.hasGpu),
  });

  const updatedResources = [...resources, newResource];
  await saveDemoResources(updatedResources);
  return newResource;
};

export const fetchCategories = async () => {
  if (!USE_DEMO_MODE) return api.get('/resources/categories').then((response) => response.data);
  const resources = await getDemoResources();
  return [...new Set(resources.map((resource) => resource.type).filter(Boolean))].sort();
};

export const semanticSearch = async (q, date, availableOnly = true) => {
  if (!USE_DEMO_MODE) {
    return api.get('/resources/search', { params: { q, date, availableOnly } }).then((response) => response.data);
  }

  const resources = await getDemoResources();
  const query = String(q || '').trim().toLowerCase();
  return resources.filter((resource) => {
    if (availableOnly && resource.available === false) return false;
    if (!query) return true;
    return [resource.name, resource.type, resource.location]
      .filter(Boolean)
      .some((field) => String(field).toLowerCase().includes(query));
  });
};

export const fetchRecommendations = async (date) => {
  if (!USE_DEMO_MODE) {
    return api.get('/resources/recommendations', { params: { date } }).then((response) => response.data);
  }

  const resources = await getDemoResources();
  return resources.filter((resource) => resource.available !== false).slice(0, 8);
};

export const fetchTimeSlots = async (resourceId, date) => {
  if (!USE_DEMO_MODE) {
    return api.get('/time-slots', { params: { resourceId, date } }).then((response) => response.data);
  }

  const blockedBookings = getDemoBookings().filter(
    (booking) =>
      String(booking.resourceId) === String(resourceId) &&
      booking.fromDate === date &&
      booking.status !== 'CANCELLED'
  );
  const defaultSlots = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];
  if (blockedBookings.length === 0) return defaultSlots;
  const blockedStartTimes = new Set(blockedBookings.map((booking) => booking.fromTime));
  return defaultSlots.filter((slot) => !blockedStartTimes.has(slot));
};

export const createBooking = async (payload) => {
  if (!USE_DEMO_MODE) return api.post('/bookings', payload).then((response) => response.data);

  const booking = await buildDemoBooking(payload);
  const bookings = getDemoBookings();
  bookings.unshift(booking);
  saveDemoBookings(bookings);
  return booking;
};

export const fetchBookings = async () => {
  if (!USE_DEMO_MODE) return api.get('/bookings').then((response) => response.data);

  const currentUser = getCurrentDemoUser();
  const bookings = getDemoBookings();
  if (!currentUser) return [];
  return bookings.filter((booking) => booking.bookedBy === currentUser.email);
};

export const cancelBooking = async (id) => {
  if (!USE_DEMO_MODE) return api.delete(`/bookings/${id}`).then((response) => response.data);

  const bookings = getDemoBookings().map((booking) =>
    String(booking.id) === String(id) ? { ...booking, status: 'CANCELLED' } : booking
  );
  saveDemoBookings(bookings);
  return { code: 200, message: 'Booking cancelled' };
};

export const createResource = async (data) => {
  if (!USE_DEMO_MODE) return api.post('/resources', data).then((response) => response.data);

  const resources = await getDemoResources();
  const nextId = resources.reduce((maxId, resource) => Math.max(maxId, Number(resource.id) || 0), 0) + 1;
  const createdResource = normalizeResource({ id: nextId, ...cloneValue(data) });
  const updatedResources = [...resources, createdResource];
  await saveDemoResources(updatedResources);
  return createdResource;
};

export const updateResource = async (id, data) => {
  if (!USE_DEMO_MODE) return api.put(`/resources/${id}`, data).then((response) => response.data);

  const resources = await getDemoResources();
  const updatedResources = resources.map((resource) =>
    String(resource.id) === String(id)
      ? normalizeResource({ ...resource, ...cloneValue(data), id: resource.id })
      : resource
  );
  await saveDemoResources(updatedResources);
  return updatedResources.find((resource) => String(resource.id) === String(id));
};

export const deleteResource = async (id) => {
  if (!USE_DEMO_MODE) return api.delete(`/resources/${id}`);

  const resources = await getDemoResources();
  await saveDemoResources(resources.filter((resource) => String(resource.id) !== String(id)));
  return { code: 200, message: 'Resource deleted' };
};

export default api;
