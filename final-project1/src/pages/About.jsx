import Navbar from '../components/Navbar';

const About = () => {
    return (
        <div style={{ paddingTop: '80px', background: 'var(--bg-color)', minHeight: '100vh', paddingBottom: '6rem' }}>
            <Navbar />

            {/* Hero Branding */}
            <section className="hero container">
                <div className="hero-card" style={{
                    backgroundImage: "linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url('https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&q=80&w=1600')",
                    minHeight: '450px',
                    justifyContent: 'center',
                    alignItems: 'center',
                    textAlign: 'center'
                }}>
                    <div className="hero-content">
                        <p style={{ textTransform: 'uppercase', letterSpacing: '5px', fontSize: '0.9rem', marginBottom: '1.5rem', fontWeight: 600 }}>Decades of Stability</p>
                        <h1 style={{ fontSize: '4.5rem' }}>Our <span className="heading-serif">Historical</span> Path</h1>
                        <p style={{ maxWidth: '700px', margin: '0 auto', fontSize: '1.2rem', opacity: 0.9 }}>Architecting the world's most reliable resource allocation infrastructure since initialization.</p>
                    </div>
                </div>
            </section>

            {/* Journey Grid */}
            <section className="section container">
                <div className="info-grid" style={{ marginBottom: '10rem' }}>
                    <div className="stat-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <span className="heading-serif" style={{ fontSize: '4rem', color: 'var(--accent-color)' }}>2010</span>
                        <h3 style={{ fontSize: '1.5rem', margin: '1rem 0' }}>The Initialization</h3>
                        <p style={{ color: 'rgba(0,0,0,0.6)', lineHeight: 1.8 }}>Reserva was born in a small research lab in Zurich, designed to manage high-precision computational units.</p>
                    </div>
                    <div className="info-content" style={{ padding: 0, overflow: 'hidden', height: '400px' }}>
                        <img src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=1200" alt="Building" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                </div>

                <div className="info-grid" style={{ gridTemplateColumns: '1fr 350px', marginBottom: '10rem' }}>
                    <div className="info-content" style={{ padding: 0, overflow: 'hidden', height: '400px' }}>
                        <img src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1200" alt="Legacy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div className="stat-card" style={{ background: '#2c2c2c', color: 'white', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <span className="heading-serif" style={{ fontSize: '4rem', color: 'var(--accent-color)' }}>2018</span>
                        <h3 style={{ fontSize: '1.5rem', margin: '1rem 0' }}>Global Expansion</h3>
                        <p style={{ color: 'rgba(255,255,255,0.6)', lineHeight: 1.8 }}>Transitioned to a global grid network, connecting 50+ sectors across 12 countries with real-time sync.</p>
                    </div>
                </div>

                <div style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto' }}>
                    <h2 style={{ fontSize: '3rem', marginBottom: '2rem' }}>Merging <span className="heading-serif">Art</span> & Science</h2>
                    <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)', lineHeight: 1.8 }}>
                        Our journey is a testament to the belief that operational tools should be as elegant as the work they facilitate. We continue to refine our resolution engine to provide the most seamless resource management experience on the planet.
                    </p>
                    <img
                        src="https://images.unsplash.com/photo-1542744094-24638eff58bb?auto=format&fit=crop&q=80&w=1200"
                        alt="Signature"
                        style={{ width: '100%', borderRadius: '40px', marginTop: '4rem', boxShadow: '0 30px 60px rgba(0,0,0,0.1)' }}
                    />
                </div>
            </section>
        </div>
    );
};

export default About;
