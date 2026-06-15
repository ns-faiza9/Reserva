import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { signup } from '../utils/auth';

const Signup = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        dob: '',
        gender: '',
        email: '',
        username: '',
        role: 'USER',
        password: '',
        confirmPassword: ''
    });

    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.password.length < 8) {
            toast.error("Password must be at least 8 characters long");
            return;
        }
        if (formData.password !== formData.confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }
        setLoading(true);
        try {
            await signup(formData);
            toast.success("Account created successfully. Please login.");
            navigate('/login');
        } catch (err) {
            toast.error(err.message || 'Signup failed');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div className="auth-page">
            <div className="card auth-card" style={{ maxWidth: 560 }}>
                <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                    <div className="logo" style={{ marginBottom: '1.5rem', display: 'block' }}>Reserva</div>
                    <h2 className="heading-serif" style={{ fontSize: '2.2rem' }}>Construct <span className="text-accent">Identity</span></h2>
                    <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>Start your operational journey with us.</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Full Name</label>
                        <input name="name" type="text" className="form-input" placeholder="Wade Armstrong" onChange={handleChange} required />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        <div className="form-group">
                            <label className="form-label">Date of Birth</label>
                            <input name="dob" type="date" className="form-input" onChange={handleChange} required />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Gender</label>
                            <select name="gender" className="form-input" onChange={handleChange} required>
                                <option value="">Select</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Email ID</label>
                        <input name="email" type="email" className="form-input" placeholder="wade@email.com" onChange={handleChange} required />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Username</label>
                        <input name="username" type="text" className="form-input" placeholder="wade08" onChange={handleChange} required />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Account Role</label>
                        <select name="role" className="form-input" value={formData.role} onChange={handleChange} required>
                            <option value="USER">User</option>
                            <option value="ADMIN">Admin</option>
                        </select>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        <div className="form-group">
                            <label className="form-label">Password</label>
                            <input name="password" type="password" className="form-input" placeholder="••••••••" onChange={handleChange} required />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Confirm Password</label>
                            <input name="confirmPassword" type="password" className="form-input" placeholder="••••••••" onChange={handleChange} required />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="btn-hero"
                        disabled={loading}
                        style={{ width: '100%', background: 'var(--primary-color)', color: 'white', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', marginTop: '1rem', borderRadius: '12px', opacity: loading ? 0.7 : 1, padding: '1rem', fontWeight: 700 }}
                    >
                        {loading ? 'Establishing Identity...' : 'Establish Identity'}
                    </button>
                </form>

                <div style={{ textAlign: 'center', marginTop: '2.5rem', fontSize: '0.9rem' }}>
                    <p style={{ color: 'var(--text-muted)' }}>
                        Already registered? <Link to="/login" style={{ color: 'var(--accent-color)', fontWeight: 600, textDecoration: 'none' }}>Log in</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Signup;
