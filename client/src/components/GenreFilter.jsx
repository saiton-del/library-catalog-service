import { useEffect, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { fetchJson } from '../lib/api.js';

export default function GenreFilter({ value, onChange }) {
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    fetchJson('/genres', controller.signal)
      .then((data) => {
        setGenres(Array.isArray(data) ? data : []);
        setError('');
      })
      .catch((requestError) => {
        if (requestError.name !== 'AbortError') setError(requestError.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, []);

  return (
    <label className="filter-select">
      <span className="sr-only">Filter by genre</span>
      <select value={value} onChange={(event) => onChange(event.target.value)} disabled={loading || Boolean(error)}>
        <option value="">
          {loading ? 'Loading genres…' : error ? 'Genres unavailable' : genres.length ? 'All genres' : 'No genres available'}
        </option>
        {genres.map((genre) => <option key={genre._id} value={genre._id}>{genre.name}</option>)}
      </select>
      <ChevronDown size={16} aria-hidden="true" />
      {error && <span className="filter-select__error" role="status">{error}</span>}
    </label>
  );
}
