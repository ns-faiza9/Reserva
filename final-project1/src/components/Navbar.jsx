import { NavLink, useNavigate } from 'react-router-dom';
import { User, LogOut } from 'lucide-react';

const Navbar = () => {
    const navigate = useNavigate();
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';

    const handleLogout = () => {
        localStorage.removeItem('isAuthenticated');
        navigate('/login', { state: { fromLogout: true } });
    };

    return (
        <nav className="capsule-navbar">
            <div
                className="logo"
                onClick={() => navigate('/')}
                style={{
                    cursor: 'pointer',
                    fontSize: '1.8rem',
                    fontWeight: 900,
                    color: 'var(--primary-color)',
                    letterSpacing: '-2px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                }}
            >
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--accent-color)' }}></div>
                Reserva
            </div>

            <div className="nav-links" style={{ display: 'flex', gap: '3rem' }}>
                <NavLink to="/resources" className="nav-link" style={({ isActive }) => ({
                    color: isActive ? 'var(--primary-color)' : '#666',
                    fontWeight: isActive ? 800 : 500,
                    textDecoration: 'none',
                    fontSize: '0.95rem'
                })}>Explore</NavLink>

                <NavLink to="/bookings" className="nav-link" style={({ isActive }) => ({
                    color: isActive ? 'var(--primary-color)' : '#666',
                    fontWeight: isActive ? 800 : 500,
                    textDecoration: 'none',
                    fontSize: '0.95rem'
                })}>Bookings</NavLink>

                <NavLink to="/about" className="nav-link" style={({ isActive }) => ({
                    color: isActive ? 'var(--primary-color)' : '#666',
                    fontWeight: isActive ? 800 : 500,
                    textDecoration: 'none',
                    fontSize: '0.95rem'
                })}>Story</NavLink>

                <NavLink to="/contact-us" className="nav-link" style={({ isActive }) => ({
                    color: isActive ? 'var(--primary-color)' : '#666',
                    fontWeight: isActive ? 800 : 500,
                    textDecoration: 'none',
                    fontSize: '0.95rem'
                })}>Contact</NavLink>
            </div>

            <div className="nav-actions" style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                {isAuthenticated ? (
                    <>
                        <NavLink to="/profile" style={({ isActive }) => ({
                            color: isActive ? 'var(--accent-color)' : 'var(--primary-color)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            textDecoration: 'none',
                            fontWeight: 700,
                            fontSize: '0.9rem'
                        })}>
                            <div style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '50%',
                                background: 'white',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 5px 15px rgba(0,0,0,0.05)',
                                border: '1px solid rgba(0,0,0,0.05)'
                            }}>
                                <User size={20} />
                            </div>
                        </NavLink>
                        <button
                            onClick={handleLogout}
                            style={{
                                background: '#111',
                                color: 'white',
                                borderRadius: '100px',
                                padding: '0.7rem 1.8rem',
                                border: 'none',
                                fontSize: '0.85rem',
                                fontWeight: 800,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                transition: 'all 0.3s ease'
                            }}
                            onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
                            onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                        >
                            <LogOut size={16} />
                            Log Out
                        </button>
                    </>
                ) : (
                    <button
                        onClick={() => navigate('/login')}
                        style={{
                            background: 'var(--primary-color)',
                            color: 'white',
                            borderRadius: '100px',
                            padding: '0.8rem 2.2rem',
                            border: 'none',
                            fontSize: '0.9rem',
                            fontWeight: 800,
                            cursor: 'pointer',
                            boxShadow: '0 10px 20px rgba(0,0,0,0.1)'
                        }}
                    >
                        Log In
                    </button>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
