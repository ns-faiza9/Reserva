import { useNavigate } from 'react-router-dom';
import { useGithubResources } from '../hooks/useGithubResources';
import { AD_CATEGORIES, countByType } from '../constants/adCategories';

/** Featured companies by category — shown on Catalog only */
const CompanyCatalogGrid = () => {
  const navigate = useNavigate();
  const { resources, loading } = useGithubResources();

  return (
    <section className="company-catalog">
      <header className="company-catalog__header">
        <span className="page-eyebrow">Featured categories</span>
        <h2 className="heading-serif company-catalog__title">
          Categories in our <span className="text-accent">catalog</span>
        </h2>
        <p className="company-catalog__sub">
          {loading
            ? 'Loading…'
            : `${resources.length.toLocaleString()} spaces · tap a category to explore it`}
        </p>
      </header>
      <div className="company-catalog__flex">
        {AD_CATEGORIES.map((cat) => {
          const count = loading ? '—' : countByType(resources, cat.type);
          return (
            <button
              key={cat.type}
              type="button"
              className="company-catalog__card"
              style={{ '--cat-accent': cat.accent }}
              onClick={() => navigate('/resources', { state: { typeFilter: cat.type } })}
            >
              <span className="company-catalog__count">{count}</span>
              <span className="company-catalog__type">{cat.type}</span>
              <span className="company-catalog__tagline">{cat.tagline}</span>
              <span className="company-catalog__cta">View spaces →</span>
            </button>
          );
        })}
      </div>
    </section>
  );
};

export default CompanyCatalogGrid;
