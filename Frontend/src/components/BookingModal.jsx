import { useState } from 'react';

const today = () => new Date().toISOString().split('T')[0];

const BookingModal = ({ resource, onClose, onConfirm }) => {
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [fromTime, setFromTime] = useState('');
  const [toTime, setToTime] = useState('');
  const [purpose, setPurpose] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!fromDate || !toDate || !fromTime || !toTime || !purpose) {
      alert('Please fill in from/to dates, from/to times, and purpose.');
      return;
    }
    const start = new Date(`${fromDate}T${fromTime}`);
    const end = new Date(`${toDate}T${toTime}`);
    if (end <= start) {
      alert('"To" date/time must be after "From" date/time.');
      return;
    }
    onConfirm({
      resourceId: resource.id,
      fromDate,
      toDate,
      fromTime,
      toTime,
      purpose,
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}
        style={{ borderRadius: '24px', padding: '2rem', maxWidth: '520px' }}>
        <h2 className="heading-serif" style={{ fontSize: '1.75rem', marginBottom: '1.5rem' }}>
          Book <span className="text-accent">{resource.name}</span>
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="booking-range-row">
            <div className="form-group">
              <label className="form-label">From date</label>
              <input type="date" className="form-input" value={fromDate} required
                min={today()} onChange={(e) => setFromDate(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">To date</label>
              <input type="date" className="form-input" value={toDate} required
                min={fromDate || today()} onChange={(e) => setToDate(e.target.value)} />
            </div>
          </div>
          <div className="booking-range-row">
            <div className="form-group">
              <label className="form-label">From time</label>
              <input type="time" className="form-input" value={fromTime} required
                onChange={(e) => setFromTime(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">To time</label>
              <input type="time" className="form-input" value={toTime} required
                onChange={(e) => setToTime(e.target.value)} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Purpose</label>
            <textarea className="form-input" value={purpose} required
              placeholder="Meeting, lab session, workshop…" onChange={(e) => setPurpose(e.target.value)} />
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" className="btn-outline" style={{ flex: 1 }} onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" style={{ flex: 1 }}>Confirm</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookingModal;
