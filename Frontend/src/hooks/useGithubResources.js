import { useCallback, useEffect, useMemo, useState } from 'react';
import { fetchGithubResources } from '../api/githubResources';
import { semanticSearch } from '../utils/api';

const PAGE_SIZE = 24;

export function useGithubResources() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [availableOnly, setAvailableOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [semanticResults, setSemanticResults] = useState(null);

  const load = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    queueMicrotask(() => load());
  }, [load]);

  useEffect(() => {
    const q = search.trim();
    if (!q) {
      queueMicrotask(() => setSemanticResults(null));
      return undefined;
    }

    const timeout = setTimeout(async () => {
      try {
        const results = await semanticSearch(q, undefined, availableOnly);
        setSemanticResults(Array.isArray(results) ? results : null);
      } catch {
        setSemanticResults(null);
      }
    }, 250);

    return () => clearTimeout(timeout);
  }, [search, availableOnly]);

  const types = useMemo(
    () => [...new Set(resources.map((r) => r.type))].sort(),
    [resources]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const source = semanticResults || resources;
    return source.filter((r) => {
      if (availableOnly && !r.available) return false;
      if (typeFilter && r.type !== typeFilter) return false;
      if (semanticResults) return true;
      if (!q) return true;
      return (
        r.name.toLowerCase().includes(q) ||
        r.type.toLowerCase().includes(q) ||
        r.location.toLowerCase().includes(q)
      );
    });
  }, [resources, semanticResults, search, typeFilter, availableOnly]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const setTypeFilterAndReset = useCallback((type) => {
    setTypeFilter(type);
    setPage(1);
  }, []);

  useEffect(() => {
    queueMicrotask(() => setPage(1));
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
