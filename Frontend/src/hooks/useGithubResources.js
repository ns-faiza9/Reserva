import { useEffect, useMemo, useState } from 'react';
import { fetchGithubResources } from '../api/githubResources';

const PAGE_SIZE = 24;

export function useGithubResources() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [availableOnly, setAvailableOnly] = useState(false);
  const [page, setPage] = useState(1);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      setResources(await fetchGithubResources());
      setPage(1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load resources');
      setResources([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const types = useMemo(
    () => [...new Set(resources.map((r) => r.type))].sort(),
    [resources]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return resources.filter((r) => {
      if (availableOnly && !r.available) return false;
      if (typeFilter && r.type !== typeFilter) return false;
      if (!q) return true;
      return (
        r.name.toLowerCase().includes(q) ||
        r.type.toLowerCase().includes(q) ||
        r.location.toLowerCase().includes(q)
      );
    });
  }, [resources, search, typeFilter, availableOnly]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const setTypeFilterAndReset = (type) => {
    setTypeFilter(type);
    setPage(1);
  };

  useEffect(() => {
    setPage(1);
  }, [search, typeFilter, availableOnly]);

  return {
    resources,
    loading,
    error,
    load,
    search,
    setSearch,
    typeFilter,
    setTypeFilter,
    setTypeFilterAndReset,
    availableOnly,
    setAvailableOnly,
    types,
    filtered,
    page,
    setPage,
    pageItems,
    totalPages,
    pageSize: PAGE_SIZE,
  };
}
