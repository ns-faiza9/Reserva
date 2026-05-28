import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';

const About = () => (
  <div className="page-shell" style={{ paddingBottom: '4rem' }}>
    <Navbar />

    <section className="hero container">
      <div
        className="hero-card"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,0,0,0.45), rgba(0,0,0,0.45)), url('https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1600')",
          minHeight: '400px',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
        }}
      >
        <div className="hero-content">
          <p style={{ textTransform: 'uppercase', letterSpacing: '5px', fontSize: '0.85rem', marginBottom: '1rem', fontWeight: 600 }}>
            Our story
          </p>
          <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)' }}>
            Space booking, <span className="heading-serif">reimagined</span>
          </h1>
          <p style={{ maxWidth: '640px', margin: '1rem auto 0', fontSize: '1.1rem', opacity: 0.9 }}>
            Reserva was created for organizations that outgrew spreadsheets and phone tags —
            one place to discover venues, check availability, and confirm reservations with confidence.
          </p>
        </div>
      </div>
    </section>

    <section className="section container">
      <div className="project-features__grid" style={{ marginBottom: '3rem' }}>
        <div className="card">
          <h3 className="heading-serif" style={{ fontSize: '1.35rem', marginBottom: '0.75rem' }}>Discover</h3>
          <p style={{ color: 'var(--text-muted)', lineHeight: 1.7 }}>
            Browse our catalog of partner companies and explore thousands of rooms, suites, and halls with photos, pricing, and capacity at a glance.
          </p>
        </div>
        <div className="card" style={{ background: 'var(--primary-color)', color: 'white' }}>
          <h3 className="heading-serif" style={{ fontSize: '1.35rem', marginBottom: '0.75rem' }}>Reserve</h3>
          <p style={{ opacity: 0.85, lineHeight: 1.7 }}>
            Choose your dates and times, add a purpose for your visit, and receive instant confirmation — with smart checks that prevent overlapping bookings.
          </p>
        </div>
        <div className="card">
          <h3 className="heading-serif" style={{ fontSize: '1.35rem', marginBottom: '0.75rem' }}>Manage</h3>
          <p style={{ color: 'var(--text-muted)', lineHeight: 1.7 }}>
            Review upcoming visits in list or calendar view, update plans when things change, and keep your team aligned on who has which space and when.
          </p>
        </div>
      </div>

      <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 3rem' }}>
        <h2 className="heading-serif" style={{ fontSize: '2.25rem', marginBottom: '1.25rem' }}>
          Start in <span className="text-accent">minutes</span>
        </h2>
        <p style={{ color: 'var(--text-muted)', lineHeight: 1.8, marginBottom: '1.5rem' }}>
          Create a free account, search for the space you need, and book your first slot today.
          Organization admins can also curate internal resources for their teams.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', marginTop: '2rem' }}>
          <Link to="/resources" className="btn-primary" style={{ textDecoration: 'none' }}>Explore spaces</Link>
          <Link to="/catalog" className="btn-outline" style={{ textDecoration: 'none' }}>View partners</Link>
        </div>
      </div>
    </section>
  </div>
);

export default About;
