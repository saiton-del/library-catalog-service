import { useCallback, useEffect, useState } from 'react';
import { fetchJson } from '../lib/api.js';

const initialState = {
  books: [],
  total: 0,
  page: 1,
  limit: 12,
  totalPages: 0,
  loading: true,
  error: '',
};

export function useBooks({ genre = '', search = '', page = 1, limit = 12 } = {}) {
  const [state, setState] = useState(initialState);
  const [reloadId, setReloadId] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (genre) params.set('genre', genre);
    if (search) params.set('search', search);

    setState((current) => ({ ...current, loading: true, error: '' }));
    fetchJson(`/books?${params.toString()}`, controller.signal)
      .then((result) => {
        setState({
          books: Array.isArray(result.data) ? result.data : [],
          total: Number(result.total) || 0,
          page: Number(result.page) || page,
          limit: Number(result.limit) || limit,
          totalPages: Number(result.totalPages) || 0,
          loading: false,
          error: '',
        });
      })
      .catch((error) => {
        if (error.name === 'AbortError') return;
        setState({ ...initialState, loading: false, error: error.message });
      });

    return () => controller.abort();
  }, [genre, search, page, limit, reloadId]);

  const retry = useCallback(() => setReloadId((current) => current + 1), []);
  return { ...state, retry };
}
