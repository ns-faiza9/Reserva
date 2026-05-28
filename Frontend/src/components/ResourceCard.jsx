const TYPE_IMAGES = {
  Room: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1000',
  Lab: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=1000',
  Equipment: 'https://images.unsplash.com/photo-1554469384-e58fac16e23a?auto=format&fit=crop&q=80&w=1000',
};

const ResourceCard = ({ resource, onBook }) => {
  const image = TYPE_IMAGES[resource.type] || TYPE_IMAGES.Room;
  const features = [];
  if (resource.hasProjector) features.push('Projector');
  if (resource.hasGpu) features.push('GPU');

  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <div style={{ position: 'relative', overflow: 'hidden' }}>
        <img
          src={image}
          alt={resource.name}
          style={{ width: '100%', height: '200px', objectFit: 'cover' }}
        />
        <div style={{
          position: 'absolute', top: '1rem', right: '1rem',
          background: 'rgba(255,255,255,0.95)', padding: '0.4rem 0.8rem',
          borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700,
        }}>
          {resource.type}
        </div>
        {resource.relevanceScore != null && (
          <div style={{
            position: 'absolute', top: '1rem', left: '1rem',
            background: 'var(--accent-color)', color: 'white',
            padding: '0.3rem 0.6rem', borderRadius: '6px', fontSize: '0.65rem', fontWeight: 700,
          }}>
            Match {(resource.relevanceScore * 100).toFixed(0)}%
          </div>
        )}
      </div>

      <div style={{ padding: '2rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.8rem' }}>
          <h3 className="heading-serif" style={{ fontSize: '1.4rem', fontWeight: 700 }}>{resource.name}</h3>
          <span style={{
            fontSize: '0.6rem', padding: '0.35rem 0.75rem', borderRadius: '100px',
            background: resource.available ? '#f0f9f1' : '#fff1f1',
            color: resource.available ? '#15803d' : '#b91c1c',
            fontWeight: 700, textTransform: 'uppercase',
          }}>
            {resource.available ? 'Available' : 'Fully Booked'}
          </span>
        </div>

        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1rem', flex: 1 }}>
          {resource.description || 'Shared campus resource.'}
        </p>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
          {features.map((f) => (
            <span key={f} style={{
              fontSize: '0.65rem', padding: '0.25rem 0.6rem',
              background: '#f9f6f3', borderRadius: '100px', fontWeight: 600,
            }}>{f}</span>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '1.2rem' }}>
          <div style={{ fontSize: '0.75rem' }}>
            <p style={{ fontWeight: 700, color: 'var(--accent-color)' }}>{resource.location}</p>
            <p style={{ color: 'var(--text-muted)' }}>Capacity: {resource.capacity}</p>
          </div>
          <button
            type="button"
            onClick={() => onBook(resource)}
            disabled={!resource.available}
            className="btn-primary"
            style={{
              opacity: resource.available ? 1 : 0.5,
              cursor: resource.available ? 'pointer' : 'not-allowed',
              padding: '0.55rem 1rem',
              fontSize: '0.85rem',
            }}
          >
            Book
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResourceCard;
