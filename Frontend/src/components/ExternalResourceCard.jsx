const optimizeImageUrl = (url) => {
  if (typeof url === 'string' && url.includes('unsplash.com')) {
    const baseUrl = url.split('?')[0];
    return `${baseUrl}?auto=format&fit=crop&w=400&q=60`;
  }
  return url;
};

/**
 * @param {{
 *   resource: import('../types/externalResource').ExternalResource,
 *   onBook?: (resource: import('../types/externalResource').ExternalResource) => void,
 * }} props
 */
const ExternalResourceCard = ({ resource, onBook }) => (
  <article className="ext-resource-card">
    <div className="ext-resource-card__image-wrap">
      <img
        src={optimizeImageUrl(resource.image)}
        alt={resource.name}
        className="ext-resource-card__image"
        loading="lazy"
        onError={(e) => {
          if (!e.currentTarget.dataset.failed) {
            e.currentTarget.dataset.failed = 'true';
            e.currentTarget.src =
              'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=60&w=400';
          }
        }}
      />
      <span className={`ext-resource-card__badge ${resource.available ? 'is-available' : 'is-unavailable'}`}>
        {resource.available ? 'Available' : 'Unavailable'}
      </span>
    </div>
    <div className="ext-resource-card__body">
      <span className="ext-resource-card__type">{resource?.type}</span>
      <h3 className="ext-resource-card__title heading-serif">{resource?.name}</h3>
      <p className="ext-resource-card__location">{resource?.location}</p>
      <div className="ext-resource-card__footer">
        <div className="ext-resource-card__meta">
          <span>₹{resource?.price_per_hour?.toLocaleString() || 0}/hr</span>
          <span>Cap. {resource?.capacity || 0}</span>
        </div>
        {onBook && (
          <button
            type="button"
            className="btn-primary ext-resource-card__book"
            onClick={() => onBook(resource)}
          >
            Book
          </button>
        )}
      </div>
    </div>
  </article>
);

export default ExternalResourceCard;
