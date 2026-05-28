import Navbar from '../components/Navbar';
import { Mail, Phone, MapPin, Globe, Instagram, Twitter, Linkedin, ArrowRight } from 'lucide-react';

const Contact = () => {
    return (
        <div className="page-shell" style={{ paddingBottom: '4rem' }}>
            <Navbar />

            <section className="container">
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '6rem', alignItems: 'start' }}>

                    {/* Left: Contact Form */}
                    <div className="animate-pop-up">
                        <span style={{ textTransform: 'uppercase', letterSpacing: '8px', fontSize: '0.9rem', fontWeight: 800, color: 'var(--accent-color)', display: 'block', marginBottom: '2rem' }}>Get in Touch</span>
                        <h1 className="heading-serif" style={{ fontSize: '4.5rem', fontWeight: 700, lineHeight: 1, marginBottom: '4rem' }}>Let's plan your <br /><span className="text-accent">next booking</span></h1>

                        <form style={{ display: 'grid', gap: '2.5rem' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                                <div className="form-group">
                                    <label className="form-label" style={{ opacity: 0.5 }}>Your Name</label>
                                    <input type="text" className="form-input" placeholder="Wade Armstrong" style={{ background: 'transparent', borderBottom: '2px solid var(--border-color)', borderRadius: 0, padding: '1rem 0' }} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label" style={{ opacity: 0.5 }}>Your Email ID</label>
                                    <input type="email" className="form-input" placeholder="wade@reserva.in" style={{ background: 'transparent', borderBottom: '2px solid var(--border-color)', borderRadius: 0, padding: '1rem 0' }} />
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label" style={{ opacity: 0.5 }}>What do you need?</label>
                                <textarea className="form-input" placeholder="Tell us about your space requirements..." style={{ background: 'transparent', borderBottom: '2px solid var(--border-color)', borderRadius: 0, padding: '1rem 0', height: '120px', resize: 'none' }}></textarea>
                            </div>

                            <button className="btn-hero" style={{ background: 'var(--primary-color)', color: 'white', width: 'fit-content', padding: '1.2rem 4rem', display: 'flex', alignItems: 'center', gap: '15px' }}>
                                Send Message <ArrowRight size={20} />
                            </button>
                        </form>
                    </div>

                    {/* Right: Contact Details */}
                    <div className="animate-pop-up" style={{ animationDelay: '0.3s' }}>
                        <div className="card" style={{ padding: '4rem', background: 'white', borderRadius: '40px' }}>
                            <h3 className="heading-serif" style={{ fontSize: '2rem', marginBottom: '3rem' }}>Operational <span className="text-accent">HQ</span></h3>

                            <div style={{ display: 'grid', gap: '2.5rem' }}>
                                <div style={{ display: 'flex', gap: '20px' }}>
                                    <div style={{ color: 'var(--accent-color)' }}><MapPin size={24} /></div>
                                    <div>
                                        <p style={{ fontWeight: 700, marginBottom: '5px' }}>Visit Us</p>
                                        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.6 }}>
                                            4th Floor, Capital Plaza,<br />
                                            Ring Road, Near NTR Stadium,<br />
                                            Guntur, Andhra Pradesh 522006
                                        </p>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '20px' }}>
                                    <div style={{ color: 'var(--accent-color)' }}><Phone size={24} /></div>
                                    <div>
                                        <p style={{ fontWeight: 700, marginBottom: '5px' }}>Call Us</p>
                                        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>+91 91234 56789</p>
                                        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>+91 8645 224444</p>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '20px' }}>
                                    <div style={{ color: 'var(--accent-color)' }}><Mail size={24} /></div>
                                    <div>
                                        <p style={{ fontWeight: 700, marginBottom: '5px' }}>Email Us</p>
                                        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>operations@reserva.in</p>
                                        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>support@reserva.in</p>
                                    </div>
                                </div>
                            </div>

                            <div style={{ marginTop: '4rem', paddingTop: '3rem', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '20px' }}>
                                <div style={{ cursor: 'pointer', opacity: 0.6 }}><Instagram size={24} /></div>
                                <div style={{ cursor: 'pointer', opacity: 0.6 }}><Twitter size={24} /></div>
                                <div style={{ cursor: 'pointer', opacity: 0.6 }}><Linkedin size={24} /></div>
                                <div style={{ cursor: 'pointer', opacity: 0.6 }}><Globe size={24} /></div>
                            </div>
                        </div>
                    </div>

                </div>
            </section>
        </div>
    );
};

export default Contact;
