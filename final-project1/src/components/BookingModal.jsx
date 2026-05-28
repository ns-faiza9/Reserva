import { useState } from 'react';

const BookingModal = ({ resource, onClose, onConfirm }) => {
    const [date, setDate] = useState('');
    const [purpose, setPurpose] = useState('');
    const [capacity, setCapacity] = useState(resource.capacity);
    const [hours, setHours] = useState(1);
    const [paymentId, setPaymentId] = useState('');
    const [step, setStep] = useState(1); // 1: Details, 2: Payment

    const totalPrice = resource.pricePerHour * hours;

    const handleNext = () => {
        if (!date || !purpose) {
            alert('Please fill in required fields.');
            return;
        }
        setStep(2);
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content" style={{ borderRadius: '40px', padding: '4rem', maxWidth: '600px', background: 'white' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
                    <h2 className="heading-serif" style={{ fontSize: '2.5rem' }}>
                        {step === 1 ? 'Booking' : 'Payment'} <span className="text-accent">Protocol</span>
                    </h2>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: step === 1 ? 'var(--accent-color)' : '#e5dcd3' }}></div>
                        <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: step === 2 ? 'var(--accent-color)' : '#e5dcd3' }}></div>
                    </div>
                </div>

                {step === 1 ? (
                    <div>
                        <div className="form-group" style={{ marginBottom: '2rem' }}>
                            <label className="form-label" style={{ textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '2px', opacity: 0.6 }}>Resource Node</label>
                            <p className="heading-serif" style={{ fontSize: '1.4rem' }}>{resource.name}</p>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Booking Date</label>
                            <input
                                type="date"
                                className="form-input"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                style={{ borderRadius: '12px' }}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Purpose of Booking</label>
                            <textarea
                                className="form-input"
                                placeholder="State what you want to book for..."
                                value={purpose}
                                onChange={(e) => setPurpose(e.target.value)}
                                style={{ borderRadius: '12px', height: '100px', resize: 'none' }}
                            />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                            <div className="form-group">
                                <label className="form-label">People Capacity</label>
                                <input
                                    type="number"
                                    className="form-input"
                                    max={resource.capacity}
                                    min="1"
                                    value={capacity}
                                    onChange={(e) => setCapacity(e.target.value)}
                                    style={{ borderRadius: '12px' }}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">How many hours?</label>
                                <input
                                    type="number"
                                    className="form-input"
                                    min="1"
                                    max="24"
                                    value={hours}
                                    onChange={(e) => setHours(e.target.value)}
                                    style={{ borderRadius: '12px' }}
                                />
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '1.5rem', marginTop: '2rem' }}>
                            <button onClick={onClose} className="btn-hero" style={{ flex: 1, background: 'transparent', border: '1px solid var(--border-color)' }}>Discard</button>
                            <button onClick={handleNext} className="btn-hero" style={{ flex: 1, background: 'var(--primary-color)', color: 'white' }}>Continue to Payment</button>
                        </div>
                    </div>
                ) : (
                    <div>
                        <div className="payment-summary" style={{ borderRadius: '20px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', borderBottom: '1px solid #e5dcd3', paddingBottom: '1.5rem' }}>
                                <span style={{ color: 'var(--text-muted)' }}>Price per hour</span>
                                <span style={{ fontWeight: 600 }}>₹{resource.pricePerHour} / hr</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', borderBottom: '1px solid #e5dcd3', paddingBottom: '1.5rem' }}>
                                <span style={{ color: 'var(--text-muted)' }}>Duration</span>
                                <span style={{ fontWeight: 600 }}>{hours} Hour(s)</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0' }}>
                                <span className="heading-serif" style={{ fontSize: '1.2rem' }}>Total Amount</span>
                                <span className="price-tag" style={{ fontSize: '1.8rem' }}>₹{totalPrice}</span>
                            </div>
                        </div>

                        <div style={{ marginTop: '2.5rem' }}>
                            <label className="form-label">Enter Payment ID / Account ID</label>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="E.g. ACC-4242-8899"
                                value={paymentId}
                                onChange={(e) => setPaymentId(e.target.value)}
                                style={{ borderRadius: '12px' }}
                                required
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '1.5rem', marginTop: '3rem' }}>
                            <button onClick={() => setStep(1)} className="btn-hero" style={{ flex: 1, background: 'transparent', border: '1px solid var(--border-color)' }}>Back</button>
                            <button
                                onClick={() => {
                                    if (!paymentId) { alert("Please enter payment ID"); return; }
                                    onConfirm({
                                        resourceId: resource.id,
                                        resourceName: resource.name,
                                        date,
                                        purpose,
                                        capacity,
                                        hours,
                                        totalPrice,
                                        paymentId
                                    });
                                }}
                                className="btn-hero"
                                style={{ flex: 1, background: 'var(--accent-color)', color: 'white' }}
                            >
                                Pay & Confirm
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BookingModal;
