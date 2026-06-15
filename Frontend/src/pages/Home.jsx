import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ProjectFeatureCards from '../components/ProjectFeatureCards';
import { isAuthenticated } from '../utils/auth';

const Home = () => {
  const navigate = useNavigate();
  const loggedIn = isAuthenticated();

  return (
    <div className="home-viewport">
      <Navbar />
      <div className="main-frame">
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
                Reserva simplifies how teams find, compare, and book workspaces — from executive
                boardrooms to conference halls, with real-time availability you can trust.
              </p>
              <button
                type="button"
                onClick={() => {
                  if (loggedIn) navigate('/resources');
                  else navigate('/login', { state: { fromAction: 'booking' } });
                }}
                className="btn-trigger-action"
              >
                {loggedIn ? 'Begin Bookings' : 'Log In'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container home-sections">
        <ProjectFeatureCards />

        <section className="project-stats-block">
          <div className="project-stats-block__card project-stats-block__card--stats">
            <p className="page-eyebrow" style={{ marginBottom: '1rem' }}>Our network</p>
            <div className="project-stats-row">
              <div>
                <h3 className="heading-serif">1000+</h3>
                <p>Bookable spaces</p>
              </div>
              <div>
                <h3 className="heading-serif">9</h3>
                <p>Partner companies</p>
              </div>
              <div>
                <h3 className="heading-serif">24/7</h3>
                <p>Online booking</p>
              </div>
            </div>
          </div>
          <div className="project-stats-block__card project-stats-block__card--about">
            <h2 className="heading-serif" style={{ fontSize: '2rem', marginBottom: '1rem' }}>
              Built for <span className="text-accent">availability</span>
            </h2>
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '1.25rem' }}>
              Whether you need a quiet focus room or a hall for hundreds, Reserva keeps schedules
              clear, conflicts out of the way, and your team focused on the work that matters.
            </p>
            <button type="button" className="btn-primary" onClick={() => navigate('/about')}>
              Our story
            </button>
          </div>
        </section>
      </div>

      <footer className="container" style={{ padding: '4rem 0', opacity: 0.4, textAlign: 'center', borderTop: '1px solid var(--border-color)' }}>
        <p>&copy; 2026 Reserva. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Home;
