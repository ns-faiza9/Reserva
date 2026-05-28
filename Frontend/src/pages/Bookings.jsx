import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { fetchBookings, cancelBooking } from '../utils/api';
import { formatTime } from '../utils/format';

const localizer = momentLocalizer(moment);

const Bookings = () => {
  const [bookings, setBookings] = useState([]);
  const [view, setView] = useState('list');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    setError('');
    fetchBookings()
      .then(setBookings)
      .catch(() => {
        setError('Could not load bookings. Ensure you are logged in and the backend is running.');
        setBookings([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const removeBooking = async (id) => {
    if (!window.confirm('Cancel this booking?')) return;
    try {
      await cancelBooking(id);
      load();
    } catch (err) {
      alert(err.response?.data?.message || 'Could not cancel.');
    }
  };

  const active = bookings.filter((b) => b.status !== 'CANCELLED');

  const events = active.map((b) => {
    const startDate = b.fromDate || b.bookingDate;
    const endDate = b.toDate || b.bookingDate;
    const start = moment(`${startDate}T${formatTime(b.fromTime ?? b.startTime)}`);
    const end = moment(`${endDate}T${formatTime(b.toTime ?? b.endTime)}`);
    return {
      id: b.id,
      title: b.resourceName,
      start: start.toDate(),
      end: end.toDate(),
      resource: b,
    };
  });

  return (
    <div className="page-shell">
      <Navbar />
      <div className="container">
        <header className="page-header" style={{ textAlign: 'center' }}>
          <span className="page-eyebrow">Your schedule</span>
          <h1 className="heading-serif">My <span className="text-accent">Bookings</span></h1>
          <div className="toolbar-row" style={{ justifyContent: 'center' }}>
            <button type="button" className={view === 'list' ? 'btn-primary' : 'btn-outline'} onClick={() => setView('list')}>List</button>
            <button type="button" className={view === 'calendar' ? 'btn-primary' : 'btn-outline'} onClick={() => setView('calendar')}>Calendar</button>
          </div>
        </header>

        {error && <div className="alert-banner error">{error}</div>}

        {loading ? (
          <p style={{ textAlign: 'center' }}>Loading…</p>
        ) : view === 'calendar' ? (
          <div className="calendar-container">
            <Calendar localizer={localizer} events={events} startAccessor="start" endAccessor="end" style={{ height: 560 }} />
          </div>
        ) : active.length === 0 ? (
          <div className="empty-state">
            <p className="heading-serif">No bookings yet</p>
            <Link to="/resources" className="btn-primary" style={{ display: 'inline-block', textDecoration: 'none' }}>Browse resources</Link>
          </div>
        ) : (
          <div style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gap: '1.25rem' }}>
            {active.map((b) => (
              <div key={b.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                <div>
                  <h3 className="heading-serif" style={{ fontSize: '1.25rem' }}>{b.resourceName}</h3>
                  <p style={{ color: 'var(--text-muted)', marginTop: '0.35rem' }}>{b.purpose || '—'}</p>
                  <p style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>
                    {(b.fromDate || b.bookingDate)} → {(b.toDate || b.bookingDate)}
                    {' · '}{formatTime(b.fromTime ?? b.startTime)}–{formatTime(b.toTime ?? b.endTime)}
                    {' · '}{b.resourceLocation}
                  </p>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#15803d' }}>{b.status}</span>
                </div>
                <button type="button" className="btn-outline" style={{ color: '#991b1b', borderColor: '#fecaca' }}
                  onClick={() => removeBooking(b.id)}>Cancel</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Bookings;
