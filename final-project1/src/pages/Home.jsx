import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';

const Home = () => {
    const navigate = useNavigate();
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';

    return (
        <div className="home-viewport">
            <div className="main-frame">
                <Navbar />

                {/* Hero Visual Layer */}
                <div className="hero-visual-layer">
                    <div className="hero-info-grid">
                        <div className="headline-box animate-pop-up">
                            <h1 className="hero-title-main">
                                Bringing <span className="heading-serif">Simplicity</span><br />
                                To Modern Space.
                            </h1>
                        </div>

                        <div className="hero-side-block animate-pop-up" style={{ animationDelay: '0.2s' }}>
                            <p className="hero-subtitle-text">
                                Reserva simplifies the complex process of managing high-end workspace availability for industrial and creative hubs.
                            </p>
                            <button
                                onClick={() => {
                                    if (isAuthenticated) {
                                        navigate('/resources');
                                    } else {
                                        navigate('/login', { state: { fromAction: 'booking' } });
                                    }
                                }}
                                className="btn-trigger-action"
                            >
                                Begin Bookings
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Intro Sections */}
            <section id="why" className="section container animate-pop-up">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem', marginTop: '4rem' }}>
                    <div className="card" style={{ textAlign: 'center' }}>
                        <h3 className="heading-serif" style={{ fontSize: '1.8rem', marginBottom: '1rem' }}>Architectural Clarity</h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>A visual interface designed for high-performance spatial awareness.</p>
                    </div>
                    <div className="card" style={{ textAlign: 'center', background: 'var(--primary-color)', color: 'white' }}>
                        <h3 className="heading-serif" style={{ fontSize: '1.8rem', marginBottom: '1rem' }}>Fluid Execution</h3>
                        <p style={{ opacity: 0.7, fontSize: '0.9rem' }}>Zero-friction scheduling with integrated asynchronous state management.</p>
                    </div>
                    <div className="card" style={{ textAlign: 'center' }}>
                        <h3 className="heading-serif" style={{ fontSize: '1.8rem', marginBottom: '1rem' }}>Global Registry</h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Comprehensive database of over 20+ world-class conference halls.</p>
                    </div>
                </div>
            </section>

            <section id="about" className="section container">
                <div className="info-grid">
                    <div className="stat-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <p style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '2px', opacity: 0.6 }}>Our Network</p>
                        <div className="stat-row">
                            <div className="stat-item">
                                <h3 style={{ fontSize: '3rem' }}>20+</h3>
                                <p>Premium halls</p>
                            </div>
                            <div className="stat-item">
                                <h3 style={{ fontSize: '3rem' }}>50+</h3>
                                <p>Global sectors</p>
                            </div>
                        </div>
                    </div>

                    <div className="info-content" style={{ backgroundColor: 'white' }}>
                        <div className="info-text-wrapper">
                            <h2 style={{ marginBottom: '1.5rem', fontSize: '2.5rem' }}>Our <span className="heading-serif">Vision</span></h2>
                            <p style={{ color: 'var(--text-muted)', marginBottom: '1.2rem', fontSize: '0.95rem' }}>
                                We believe that physical infrastructure should be as agile as the software that powers it. Reserva is built on the pillars of stability and aesthetic brilliance.
                            </p>
                            <img
                                src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=800"
                                alt="Skyscraper"
                                style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '20px', marginTop: '1.5rem' }}
                            />
                        </div>
                    </div>
                </div>
            </section>

            <footer className="container" style={{ padding: '4rem 0', opacity: 0.4, textAlign: 'center', borderTop: '1px solid var(--border-color)' }}>
                <p>&copy; 2026 RESERVA GRID OPERATIONS. INSPIRED BY EXCELLENCE.</p>
            </footer>
        </div>
    );
};

export default Home;
