import { Loader2, RefreshCw, AlertCircle, Search } from 'lucide-react';
import ExternalResourceCard from './ExternalResourceCard';

/**
 * @param {ReturnType<import('../hooks/useGithubResources').useGithubResources>} grid
 * @param {{ onBook?: (resource: import('../types/externalResource').ExternalResource) => void }} props
 */
const GithubResourcesGrid = ({ grid, onBook }) => {
  const {
    loading, error, load, search, setSearch, typeFilter, setTypeFilter,
    availableOnly, setAvailableOnly, types, filtered, page, setPage,
    pageItems, totalPages, resources,
  } = grid;

  if (loading) {
    return (
      <div className="ext-resources-state">
        <Loader2 className="ext-resources-state__icon spin" size={40} />
        <p>Loading resources…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="ext-resources-state ext-resources-state--error">
        <AlertCircle size={40} />
        <p>{error}</p>
        <button type="button" className="btn-primary" onClick={load}>Retry</button>
      </div>
    );
  }

  return (
    <div className="ext-resources">
      <div className="ext-resources-toolbar">
        <div className="ext-resources-search">
          <Search size={18} className="ext-resources-search__icon" />
          <input type="search" className="form-input" placeholder="Search name, type, location…"
            value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select className="form-input ext-resources-select" value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}>
          <option value="">All types</option>
          {types.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <label className="ext-resources-check">
          <input type="checkbox" checked={availableOnly} onChange={(e) => setAvailableOnly(e.target.checked)} />
          Available only
        </label>
        <button type="button" className="btn-outline" onClick={load}><RefreshCw size={16} /></button>
      </div>

      <p className="ext-resources-count">
        Showing {pageItems.length} of {filtered.length}
        {filtered.length !== resources.length && ` (${resources.length} total)`}
      </p>

      {filtered.length === 0 ? (
        <div className="empty-state"><p>No matches. Clear filters to see all.</p></div>
      ) : (
        <div className="ext-resources-grid ext-resources-grid--large">
          {pageItems.map((r) => <ExternalResourceCard key={r.id} resource={r} onBook={onBook} />)}
        </div>
      )}

      {totalPages > 1 && (
        <div className="ext-resources-pagination">
          <button type="button" className="btn-outline" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</button>
          <span>Page {page} of {totalPages}</span>
          <button type="button" className="btn-outline" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Next</button>
        </div>
      )}
    </div>
  );
};

export default GithubResourcesGrid;
