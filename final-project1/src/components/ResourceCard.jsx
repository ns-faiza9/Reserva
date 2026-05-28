const ResourceCard = ({ resource, onBook }) => {
    return (
        <div className="card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ position: 'relative', overflow: 'hidden' }}>
                <img
                    src={resource.image}
                    alt={resource.name}
                    style={{
                        width: '100%',
                        height: '200px', /* Reduced from 260px to satisfy "minimize size" */
                        objectFit: 'cover',
                        transition: 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)'
                    }}
                    onMouseEnter={(e) => e.target.style.transform = 'scale(1.1)'}
                    onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                />
                <div style={{
                    position: 'absolute',
                    top: '1rem',
                    right: '1rem',
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(4px)',
                    padding: '0.4rem 0.8rem',
                    borderRadius: '6px',
                    boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    zIndex: 1
                }}>
                    <span style={{ fontSize: '0.55rem', textTransform: 'uppercase', opacity: 0.6, fontWeight: 700 }}>Rate</span>
                    <span className="price-tag" style={{ fontSize: '1.2rem' }}>₹{resource.pricePerHour}<small style={{ fontSize: '0.65rem' }}>/hr</small></span>
                </div>
            </div>

            <div style={{ padding: '2rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.8rem' }}>
                    <h3 className="heading-serif" style={{ fontSize: '1.4rem', color: 'var(--primary-color)', fontWeight: 700 }}>{resource.name}</h3>
                    <span style={{
                        fontSize: '0.6rem',
                        padding: '0.35rem 0.75rem',
                        borderRadius: '100px',
                        background: resource.available ? '#f0f9f1' : '#fff1f1',
                        color: resource.available ? '#15803d' : '#b91c1c',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                        border: '1px solid currentColor'
                    }}>
                        {resource.available ? 'Ready' : 'Occupied'}
                    </span>
                </div>

                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.2rem', flex: 1, lineHeight: '1.5' }}>
                    {resource.description}
                </p>

                <div style={{ marginBottom: '1.2rem', padding: '0.8rem', background: '#f9f6f3', borderRadius: '8px', border: '1px solid #eeebe7' }}>
                    <p style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.5, marginBottom: '0.1rem', fontWeight: 700 }}>Registry Address</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--primary-color)', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{resource.address}</p>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '1.2rem' }}>
                    <div style={{ fontSize: '0.75rem' }}>
                        <p style={{ fontWeight: 700, color: 'var(--accent-color)', textTransform: 'uppercase', fontSize: '0.65rem', letterSpacing: '1px' }}>{resource.location}</p>
                        <p style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Cap: {resource.capacity} Ops</p>
                    </div>
                    <button
                        onClick={() => onBook(resource)}
                        disabled={!resource.available}
                        className="btn-hero"
                        style={{
                            background: resource.available ? 'var(--primary-color)' : '#e0dbd5',
                            color: 'white',
                            padding: '0.6rem 1.2rem',
                            borderRadius: '6px',
                            border: 'none',
                            cursor: resource.available ? 'pointer' : 'not-allowed',
                            fontFamily: 'inherit',
                            fontWeight: 700,
                            fontSize: '0.8rem',
                            textTransform: 'uppercase',
                            letterSpacing: '1px'
                        }}
                    >
                        {resource.available ? 'Book' : 'Booked'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ResourceCard;
