import Navbar from '../components/Navbar';
import CompanyCatalogGrid from '../components/CompanyCatalogGrid';

const Catalog = () => (
  <div className="page-shell">
    <Navbar />
    <div className="container">
      <header className="page-header">
        <span className="page-eyebrow">Partners</span>
        <h1 className="heading-serif">
          Resource <span className="text-accent">Catalog</span>
        </h1>
        <p style={{ color: 'var(--text-muted)', maxWidth: 560, marginTop: '0.5rem' }}>
          Featured companies by category — tap a card to explore and book on Explore.
        </p>
      </header>
      <CompanyCatalogGrid />
    </div>
  </div>
);

export default Catalog;
