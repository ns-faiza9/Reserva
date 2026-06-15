import { signinApi, signupApi, fetchUserInfo, setToken, clearAuth, getToken } from './api';

export const signup = async (formData) => {
  const res = await signupApi({
    fullname: formData.name || formData.fullname,
    email: formData.email,
    username: formData.username,
    password: formData.password,
    phone: formData.phone || formData.username || '',
    role: formData.role || 'USER',
  });
  if (res.code !== 200) throw new Error(res.message || 'Signup failed');
  return res;
};

export const login = async (email, password) => {
  const res = await signinApi(email, password);
  if (res.code !== 200) throw new Error(res.message || 'Invalid email or password.');
  setToken(res.jwt);
  const info = await fetchUserInfo();
  if (info.code === 200) {
    localStorage.setItem('user_profile', JSON.stringify(info));
    localStorage.setItem('isAuthenticated', 'true');
    return info;
  }
  return null;
};

export const logout = () => clearAuth();

export const isAuthenticated = () => !!getToken();

export const getUserProfile = () => JSON.parse(localStorage.getItem('user_profile') || 'null');

export const isAdmin = () => {
  const p = getUserProfile();
  return p && p.role === 2;
};
