import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import BookingModal from '../components/BookingModal';
import Navbar from '../components/Navbar';
import GithubResourcesGrid from '../components/GithubResourcesGrid';
import { useGithubResources } from '../hooks/useGithubResources';
import { useBookResource } from '../hooks/useBookResource';
import '../styles/external-resources.css';

const Resources = () => {
  const location = useLocation();
  const github = useGithubResources();

  useEffect(() => {
    const type = location.state?.typeFilter;
    if (type) github.setTypeFilterAndReset(type);
  }, [location.state?.typeFilter]);
  const {
    selectedResource,
    setSelectedResource,
    handleBookExternal,
    handleConfirmBooking,
    resolving,
  } = useBookResource();

  return (
    <div className="page-shell">
      <Navbar />
      <div className="container">
        <header className="page-header">
          <span className="page-eyebrow">Find your space</span>
          <h1 className="heading-serif">Explore <span className="text-accent">Resources</span></h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            {github.resources.length > 0
              ? `${github.resources.length.toLocaleString()} spaces — select any to book`
              : 'Loading resource catalog…'}
          </p>
        </header>

        {resolving && (
          <p className="alert-banner info" style={{ marginBottom: '1rem' }}>Preparing booking…</p>
        )}

        <GithubResourcesGrid grid={github} onBook={handleBookExternal} />
      </div>

      {selectedResource && (
        <BookingModal
          resource={selectedResource}
          onClose={() => setSelectedResource(null)}
          onConfirm={handleConfirmBooking}
        />
      )}
    </div>
  );
};

export default Resources;
