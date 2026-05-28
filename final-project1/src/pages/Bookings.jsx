import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = momentLocalizer(moment);

const Bookings = () => {
    const [bookings, setBookings] = useState([]);
    const [view, setView] = useState('list'); // 'list' or 'calendar'

    useEffect(() => {
        const stored = JSON.parse(localStorage.getItem('user_bookings') || '[]');
        setBookings(stored);
    }, []);

    const removeBooking = (id) => {
        if (window.confirm('Are you sure you want to revoke this operational clearance?')) {
            const updated = bookings.filter(b => b.id !== id);
            setBookings(updated);
            localStorage.setItem('user_bookings', JSON.stringify(updated));
        }
    };

    // Transform bookings for calendar
    const events = bookings.map(b => {
        const startDate = new Date(b.date);
        const endDate = new Date(startDate);
        endDate.setHours(startDate.getHours() + parseInt(b.hours));

        return {
            id: b.id,
            title: `${b.resourceName}: ${b.purpose}`,
            start: startDate,
            end: endDate,
            allDay: false,
            resource: b
        };
    });

    return (
        <div style={{ paddingTop: '80px', minHeight: '100vh', paddingBottom: '5rem' }}>
            <Navbar />

            <section className="section container">
                <div className="section-header" style={{ textAlign: 'center', marginBottom: '4rem' }}>
                    <p style={{ color: 'var(--accent-color)', textTransform: 'uppercase', letterSpacing: '4px', fontSize: '0.8rem', fontWeight: 700, marginBottom: '1rem' }}>Global Timeline</p>
                    <h2 style={{ fontSize: '3.5rem' }}>Operational <span className="heading-serif">Schedule</span></h2>

                    <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '2.5rem' }}>
                        <button
                            onClick={() => setView('list')}
                            className="btn-hero"
                            style={{
                                padding: '0.6rem 2rem',
                                background: view === 'list' ? 'var(--primary-color)' : 'transparent',
                                color: view === 'list' ? 'white' : 'var(--text-main)',
                                border: '1px solid var(--primary-color)'
                            }}
                        >
                            Log View
                        </button>
                        <button
                            onClick={() => setView('calendar')}
                            className="btn-hero"
                            style={{
                                padding: '0.6rem 2rem',
                                background: view === 'calendar' ? 'var(--primary-color)' : 'transparent',
                                color: view === 'calendar' ? 'white' : 'var(--text-main)',
                                border: '1px solid var(--primary-color)'
                            }}
                        >
                            Calendar View
                        </button>
                    </div>
                </div>

                {view === 'calendar' ? (
                    <div className="calendar-container animate-fade">
                        <Calendar
                            localizer={localizer}
                            events={events}
                            startAccessor="start"
                            endAccessor="end"
                            style={{ height: 600 }}
                            onSelectEvent={(event) => alert(`${event.resource.resourceName}\n\nObjective: ${event.resource.purpose}\n operatives: ${event.resource.capacity}\nDuration: ${event.resource.hours}h`)}
                        />
                        <div style={{ marginTop: '2rem', padding: '1.5rem', background: '#fcfaf7', borderRadius: '12px', border: '1px solid #f3efea' }}>
                            <p style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--accent-color)', fontWeight: 600 }}>
                                <span style={{ width: '10px', height: '10px', background: 'var(--accent-color)', borderRadius: '50%' }}></span>
                                Remainder: Ensure all operative credentials are valid before node access.
                            </p>
                        </div>
                    </div>
                ) : (
                    <div style={{ maxWidth: '900px', margin: '0 auto' }} className="animate-fade">
                        {bookings.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '100px 0', background: 'white', borderRadius: '40px', border: '1px solid var(--border-color)' }}>
                                <p className="heading-serif" style={{ fontSize: '1.5rem', opacity: 0.3 }}>No Active Allocations Found</p>
                                <button onClick={() => window.location.href = '/resources'} className="btn-contact" style={{ marginTop: '2rem', display: 'inline-block' }}>Explore Resources</button>
                            </div>
                        ) : (
                            <div style={{ display: 'grid', gap: '2rem' }}>
                                {bookings.map(b => (
                                    <div key={b.id} className="card" style={{ padding: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '0.5rem' }}>
                                                <h3 className="heading-serif" style={{ fontSize: '1.8rem' }}>{b.resourceName}</h3>
                                                <span style={{ fontSize: '0.7rem', padding: '0.3rem 0.8rem', background: '#f8f5f1', borderRadius: '100px', fontWeight: 600 }}>Active Clearance</span>
                                            </div>
                                            <p style={{ color: 'var(--text-main)', fontWeight: 500, marginBottom: '0.5rem' }}>{b.purpose}</p>
                                            <div style={{ display: 'flex', gap: '2rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                                <span>Date: <strong>{b.date}</strong></span>
                                                <span>Duration: <strong>{b.hours}h</strong></span>
                                                <span>Operatives: <strong>{b.capacity}</strong></span>
                                                <span>Total: <strong style={{ color: 'var(--accent-color)' }}>₹{b.totalPrice}</strong></span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => removeBooking(b.id)}
                                            style={{
                                                padding: '0.8rem 1.5rem',
                                                background: '#fef2f2',
                                                color: '#991b1b',
                                                borderRadius: '8px',
                                                border: '1px solid #fee2e2',
                                                cursor: 'pointer',
                                                fontWeight: 700,
                                                fontSize: '0.8rem',
                                                textTransform: 'uppercase',
                                                letterSpacing: '1px'
                                            }}
                                        >
                                            Cancel Booking
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </section>
        </div>
    );
};

export default Bookings;
