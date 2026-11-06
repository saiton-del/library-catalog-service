import { Search, X } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function SearchBar({ value, onSearch }) {
  const [draft, setDraft] = useState(value);

  useEffect(() => setDraft(value), [value]);

  useEffect(() => {
    const timer = window.setTimeout(() => onSearch(draft.trim()), 400);
    return () => window.clearTimeout(timer);
  }, [draft, onSearch]);

  return (
    <label className="search-box">
      <Search size={19} aria-hidden="true" />
      <span className="sr-only">Search books by title or author</span>
      <input
        type="search"
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        placeholder="Search a title or author..."
        autoComplete="off"
      />
      {draft && (
        <button className="search-box__clear" type="button" aria-label="Clear search" onClick={() => setDraft('')}>
          <X size={17} />
        </button>
      )}
    </label>
  );
}
