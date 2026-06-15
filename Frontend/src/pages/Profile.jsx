import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserProfile } from '../utils/auth';
import { fetchUserInfo } from '../utils/api';
import Navbar from '../components/Navbar';

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(getUserProfile());

  useEffect(() => {
    fetchUserInfo()
      .then((info) => {
        if (info.code === 200) {
          localStorage.setItem('user_profile', JSON.stringify(info));
          setUser(info);
        }
      })
      .catch(() => {});
  }, []);

  if (!user) {
    navigate('/login');
    return null;
  }

  const fullName = user.fullname || user.name || user.username || '—';
  const phone = user.phone || '—';
  const roleLabel = user.roleName || (user.role === 2 ? 'Administrator' : 'User');
  const statusLabel = user.statusText || (user.status === 0 ? 'Inactive' : 'Active');

  return (
    <div className="page-shell">
      <Navbar />
      <div className="container" style={{ maxWidth: 720 }}>
        <div className="card" style={{ padding: '2.5rem' }}>
          <span className="page-eyebrow">Account</span>
          <h1 className="heading-serif page-header" style={{ marginBottom: '2rem' }}>Profile</h1>

          <div className="profile-row">
            <span className="profile-label">Full name</span>
            <span>{fullName}</span>
          </div>
          <div className="profile-row">
            <span className="profile-label">Email</span>
            <span>{user.email || '—'}</span>
          </div>
          <div className="profile-row">
            <span className="profile-label">Phone</span>
            <span>{phone}</span>
          </div>
          <div className="profile-row">
            <span className="profile-label">Role</span>
            <span>{roleLabel}</span>
          </div>
          <div className="profile-row" style={{ borderBottom: 'none' }}>
            <span className="profile-label">Status</span>
            <span>{statusLabel}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
