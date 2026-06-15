import { NavLink, useNavigate } from 'react-router-dom';
import { User, LogOut } from 'lucide-react';
import { isAuthenticated, isAdmin, logout } from '../utils/auth';

import toast from 'react-hot-toast';

const logoUrl = `${import.meta.env.BASE_URL}reserva-logo.png`;

const linkStyle = ({ isActive }) => ({
  color: isActive ? 'var(--primary-color)' : '#666',
  fontWeight: isActive ? 800 : 500,
  textDecoration: 'none',
  fontSize: '0.9rem',
});

const Navbar = () => {
  const navigate = useNavigate();
  const loggedIn = isAuthenticated();

  return (
    <nav className="capsule-navbar">
      <div className="logo brand-logo-link" onClick={() => navigate('/')} role="button" tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && navigate('/')}>
        <span className="brand-logo-wrap">
          <img src={logoUrl} alt="" className="brand-logo" />
        </span>
        <span className="brand-name">Reserva</span>
      </div>

      <div className="nav-links">
        <NavLink to="/catalog" className="nav-link" style={linkStyle}>Catalog</NavLink>
        <NavLink to="/resources" className="nav-link" style={linkStyle}>Explore</NavLink>
        <NavLink to="/bookings" className="nav-link" style={linkStyle}>Bookings</NavLink>
        {loggedIn && isAdmin() && <NavLink to="/admin" className="nav-link" style={linkStyle}>Admin</NavLink>}
        <NavLink to="/about" className="nav-link" style={linkStyle}>About</NavLink>
        <NavLink to="/contact-us" className="nav-link" style={linkStyle}>Contact</NavLink>
      </div>

      <div className="nav-actions">
        {loggedIn ? (
          <>
            <NavLink to="/profile" style={linkStyle} title="Profile">
              <div className="nav-avatar"><User size={18} /></div>
            </NavLink>
            <button
              type="button"
              className="btn-nav-logout"
              onClick={async () => {
                await logout();
                toast.success('Logged out successfully');
                navigate('/');
              }}
            >
              <LogOut size={16} /> Log Out
            </button>
          </>
        ) : (
          <>
            <div className="nav-avatar" onClick={() => navigate('/login')} style={{cursor: 'pointer'}} title="Login"><User size={18} /></div>
            <button type="button" className="btn-nav-login" onClick={() => navigate('/login')}>Log In</button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
