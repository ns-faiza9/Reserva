import { useNavigate } from 'react-router-dom';
import { getUserProfile } from '../utils/auth';
import Navbar from '../components/Navbar';
import { ChevronRight, Camera } from 'lucide-react';

const Profile = () => {
    const navigate = useNavigate();
    const user = getUserProfile();

    if (!user) {
        navigate('/login');
        return null;
    }

    const ProfileItem = ({ label, value }) => (
        <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '1.5rem 0',
            borderBottom: '1px solid rgba(0,0,0,0.05)',
            cursor: 'pointer'
        }}>
            <span style={{ color: '#777', fontSize: '1rem', fontWeight: 500 }}>{label}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <span style={{ color: 'var(--primary-color)', fontWeight: 600, fontSize: '1rem' }}>{value}</span>
                <ChevronRight size={18} color="#bbb" />
            </div>
        </div>
    );

    return (
        <div style={{
            background: 'linear-gradient(135deg, #e5dcd3 0%, #b1a699 100%)',
            minHeight: '100vh',
            paddingTop: '60px',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Organic Decorative Leaves */}
            <img
                src="https://images.unsplash.com/photo-1510133760529-2cd18f60875b?auto=format&fit=crop&q=80&w=800"
                alt="decoration"
                className="organic-leaf leaf-tr"
                style={{ mixBlendMode: 'multiply' }}
            />
            <img
                src="https://images.unsplash.com/photo-1525498122383-3f61b912b051?auto=format&fit=crop&q=80&w=800"
                alt="decoration"
                className="organic-leaf leaf-bl"
                style={{ mixBlendMode: 'multiply' }}
            />

            <Navbar />

            <div className="container" style={{
                maxWidth: '1000px',
                padding: '6rem 2rem',
                position: 'relative',
                zIndex: 10
            }}>
                <div style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '50px',
                    padding: '5rem',
                    boxShadow: '0 50px 100px rgba(0,0,0,0.1)'
                }}>
                    <h1 className="heading-serif" style={{ fontSize: '3.5rem', marginBottom: '3rem', fontWeight: 800, color: 'var(--primary-color)' }}>Account Settings</h1>

                    <section style={{ marginBottom: '5rem' }}>
                        <h2 style={{ fontSize: '2rem', marginBottom: '2.5rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <span style={{ width: '8px', height: '30px', background: 'var(--accent-color)', borderRadius: '4px' }}></span>
                            Basic info
                        </h2>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '4rem', padding: '2.5rem 0', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                            <span style={{ color: '#777', fontSize: '1rem', width: '200px', fontWeight: 500 }}>Profile Picture</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '2.5rem' }}>
                                <div style={{
                                    width: '120px',
                                    height: '120px',
                                    borderRadius: '50%',
                                    backgroundColor: '#fff',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    border: '4px solid #fff',
                                    boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                                    position: 'relative',
                                    backgroundImage: `url('https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}')`,
                                    backgroundSize: 'cover'
                                }}>
                                    <div style={{
                                        position: 'absolute',
                                        bottom: '5px',
                                        right: '5px',
                                        background: 'var(--accent-color)',
                                        padding: '8px',
                                        borderRadius: '50%',
                                        boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
                                        color: 'white'
                                    }}>
                                        <Camera size={16} />
                                    </div>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <button style={{ background: 'var(--primary-color)', color: 'white', border: 'none', padding: '0.8rem 1.5rem', borderRadius: '10px', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem' }}>Upload New</button>
                                    <button style={{ background: 'transparent', color: '#ff4d4f', border: 'none', fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem' }}>Remove Image</button>
                                </div>
                            </div>
                        </div>

                        <ProfileItem label="Full Name" value={user.name} />
                        <ProfileItem label="Date of Birth" value={user.dob} />
                        <ProfileItem label="Gender Preference" value={user.gender} />
                        <ProfileItem label="Email ID" value={user.email} />
                    </section>

                    <section>
                        <h2 style={{ fontSize: '2rem', marginBottom: '2.5rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <span style={{ width: '8px', height: '30px', background: 'var(--primary-color)', borderRadius: '4px' }}></span>
                            Account Identity
                        </h2>
                        <ProfileItem label="Username Handle" value={user.username} />
                        <ProfileItem label="Security Password" value="••••••••" />
                    </section>

                    <div style={{
                        marginTop: '6rem',
                        padding: '2.5rem',
                        background: 'linear-gradient(90deg, #fff5f7 0%, #fff 100%)',
                        borderRadius: '30px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '25px',
                        border: '1px solid #fee2e2'
                    }}>
                        <div style={{ background: '#ff4d4f', width: '50px', height: '50px', borderRadius: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', boxShadow: '0 10px 20px rgba(255,77,79,0.2)' }}>
                            <Camera size={24} />
                        </div>
                        <div>
                            <p style={{ color: 'var(--primary-color)', fontWeight: 800, fontSize: '1.2rem', marginBottom: '4px' }}>Setup Guide</p>
                            <p style={{ color: '#ff4d4f', fontWeight: 600, fontSize: '0.9rem' }}>Complete your profile to unlock elite allocations.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
