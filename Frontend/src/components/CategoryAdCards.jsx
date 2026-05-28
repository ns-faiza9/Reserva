import { AD_CATEGORIES, countByType } from '../constants/adCategories';

/**
 * @param {{
 *   resources: import('../types/externalResource').ExternalResource[],
 *   activeType: string,
 *   onSelectType: (type: string) => void,
 * }} props
 */
const CategoryAdCards = ({ resources, activeType, onSelectType }) => (
  <section className="category-ads">
    <div className="category-ads__header">
      <span className="page-eyebrow">Featured spaces</span>
      <h2 className="heading-serif category-ads__title">Browse by category</h2>
    </div>
    <div className="category-ads__grid">
      {AD_CATEGORIES.map((cat) => {
        const count = countByType(resources, cat.type);
        const isActive = activeType === cat.type;
        return (
          <button
            key={cat.type}
            type="button"
            className={`category-ad-card ${isActive ? 'is-active' : ''}`}
            style={{ '--ad-accent': cat.accent }}
            onClick={() => onSelectType(isActive ? '' : cat.type)}
          >
            <span className="category-ad-card__count">{count}</span>
            <span className="category-ad-card__label">{cat.type}</span>
            <span className="category-ad-card__tagline">{cat.tagline}</span>
            <span className="category-ad-card__cta">{isActive ? 'Showing all' : 'Explore →'}</span>
          </button>
        );
      })}
    </div>
  </section>
);

export default CategoryAdCards;
