import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { login } from '../utils/auth';

const Login = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const fromLogout = location.state?.fromLogout;

    const handleLogin = (e) => {
        e.preventDefault();
        const user = login(email, password);
        if (user) {
            navigate('/resources');
        } else {
            alert("Invalid Email ID or Password. Please ensure your details match your registration.");
        }
    };

    return (
        <div className="auth-container" style={{
            background: 'var(--bg-color)',
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem'
        }}>
            <motion.div
                className="card animate-pop-up"
                style={{
                    maxWidth: '480px',
                    width: '100%',
                    padding: '4rem',
                    borderRadius: '40px',
                    boxShadow: '0 40px 100px rgba(0,0,0,0.1)',
                    backgroundColor: 'white',
                    textAlign: 'center'
                }}
            >
                <AnimatePresence>
                    {fromLogout && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            style={{
                                backgroundColor: '#fdf2f2',
                                border: '1px solid #fee2e2',
                                padding: '1rem',
                                borderRadius: '12px',
                                marginBottom: '2rem',
                                color: '#991b1b',
                                fontSize: '0.85rem',
                                fontWeight: 600
                            }}
                        >
                            Logged Out Successfully. Please log in again to access the grid.
                        </motion.div>
                    )}
                    {location.state?.fromAction === 'booking' && !fromLogout && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            style={{
                                backgroundColor: '#fdf7ef',
                                border: '1px solid #fae8d0',
                                padding: '1rem',
                                borderRadius: '12px',
                                marginBottom: '2rem',
                                color: '#a07a4a',
                                fontSize: '0.85rem',
                                fontWeight: 600
                            }}
                        >
                            Authentication Required. Please log in to secure your resource allocation.
                        </motion.div>
                    )}
                </AnimatePresence>

                <div style={{ marginBottom: '3rem' }}>
                    <div className="logo" style={{ marginBottom: '1rem', fontSize: '2.5rem' }}>Reserva</div>
                    <h2 className="heading-serif" style={{ fontSize: '2.2rem', marginBottom: '0.5rem' }}>Identity <span className="text-accent">Verification</span></h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Enter credentials to access your secure terminal.</p>
                </div>

                <form onSubmit={handleLogin}>
                    <div className="form-group" style={{ textAlign: 'left', marginBottom: '1.5rem' }}>
                        <label className="form-label" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Email ID</label>
                        <input
                            type="email"
                            className="form-input"
                            placeholder="operator@reserva.sys"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            style={{ width: '100%', borderRadius: '12px', padding: '1rem' }}
                        />
                    </div>

                    <div className="form-group" style={{ textAlign: 'left', marginBottom: '2rem' }}>
                        <label className="form-label" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Password</label>
                        <input
                            type="password"
                            className="form-input"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            style={{ width: '100%', borderRadius: '12px', padding: '1rem' }}
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn-hero"
                        style={{
                            width: '100%',
                            background: 'var(--primary-color)',
                            color: 'white',
                            border: 'none',
                            padding: '1.2rem',
                            borderRadius: '12px',
                            fontWeight: 700,
                            fontSize: '1rem'
                        }}
                    >
                        Log In
                    </button>
                </form>

                <div style={{ textAlign: 'center', marginTop: '2.5rem', fontSize: '0.9rem' }}>
                    <p style={{ color: 'var(--text-muted)' }}>
                        New operative? <a href="/signup" style={{ color: 'var(--accent-color)', fontWeight: 700, textDecoration: 'none' }}>Establish ID</a>
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
