import { useCallback } from 'react';
import { ArrowDown, ArrowLeft, ArrowRight, BookOpen, Sparkles } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import BookCard from '../components/BookCard.jsx';
import GenreFilter from '../components/GenreFilter.jsx';
import SearchBar from '../components/SearchBar.jsx';
import { useBooks } from '../hooks/useBooks.js';

const PAGE_SIZE = 12;

function LoadingGrid() {
  return (
    <div className="book-grid" aria-label="Loading books" aria-busy="true">
      {Array.from({ length: 8 }, (_, index) => (
        <div className="book-skeleton" key={index}>
          <div className="skeleton-cover" />
          <div className="skeleton-line skeleton-line--short" />
          <div className="skeleton-line" />
          <div className="skeleton-line skeleton-line--small" />
        </div>
      ))}
    </div>
  );
}

export default function CatalogPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const genre = searchParams.get('genre') || '';
  const search = searchParams.get('search') || '';
  const page = Math.max(1, Number.parseInt(searchParams.get('page') || '1', 10) || 1);
  const { books, total, totalPages, loading, error, retry } = useBooks({ genre, search, page, limit: PAGE_SIZE });

  const updateSearch = useCallback((value) => {
    setSearchParams((current) => {
      const next = new URLSearchParams(current);
      if (value) next.set('search', value);
      else next.delete('search');
      next.delete('page');
      return next;
    }, { replace: true });
  }, [setSearchParams]);

  const updateGenre = useCallback((value) => {
    setSearchParams((current) => {
      const next = new URLSearchParams(current);
      if (value) next.set('genre', value);
      else next.delete('genre');
      next.delete('page');
      return next;
    }, { replace: true });
  }, [setSearchParams]);

  const updatePage = (nextPage) => {
    setSearchParams((current) => {
      const next = new URLSearchParams(current);
      if (nextPage > 1) next.set('page', String(nextPage));
      else next.delete('page');
      return next;
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearFilters = () => setSearchParams({}, { replace: true });

  return (
    <main>
      <section className="hero-shell">
        <div className="hero-copy">
          <div className="hero-kicker"><span className="kicker-dot" /> A little room for big stories</div>
          <h1>Find your next<br /><em>favorite chapter.</em></h1>
          <p>Thoughtful reads, curious minds, and a whole shelf of somewhere else.</p>
          <a className="hero-link" href="#catalog">Explore the collection <ArrowDown size={16} /></a>
        </div>
        <div className="hero-art" aria-hidden="true">
          <div className="art-sun" />
          <div className="art-label">THE<br />READING<br />HOUR <span>EST. 2024</span></div>
          <div className="art-book art-book--one" />
          <div className="art-book art-book--two" />
          <div className="art-book art-book--three" />
          <div className="art-sparkle"><Sparkles size={22} /></div>
        </div>
        <div className="hero-note"><span>01</span> Curated for slow afternoons</div>
      </section>

      <section className="catalog-section" id="catalog">
        <div className="section-heading">
          <div>
            <div className="eyebrow section-eyebrow">THE LIBRARY</div>
            <h2>Stories worth staying in for.</h2>
          </div>
          <p className="section-aside">Take a look around.<br />Your next read is in here somewhere.</p>
        </div>

        <div className="catalog-toolbar">
          <SearchBar value={search} onSearch={updateSearch} />
          <GenreFilter value={genre} onChange={updateGenre} />
        </div>

        <div className="results-line" aria-live="polite">
          <span>{loading ? 'Finding your next read…' : `${total} ${total === 1 ? 'book' : 'books'} in the collection`}</span>
          {(search || genre) && !loading && <span className="results-filtered">Filtered collection</span>}
        </div>

        {loading ? (
          <LoadingGrid />
        ) : error ? (
          <div className="state-panel state-panel--error" role="alert">
            <div className="state-icon">!</div>
            <h3>The shelves are taking a moment.</h3>
            <p>{error}</p>
            <button type="button" className="button button--dark" onClick={retry}>Try again</button>
          </div>
        ) : books.length === 0 ? (
          <div className="state-panel state-panel--empty">
            <div className="state-icon"><BookOpen size={24} /></div>
            <h3>No stories found this time.</h3>
            <p>Try a different title, author, or genre and we’ll look again.</p>
            {(search || genre) && <button type="button" className="text-button" onClick={clearFilters}>Clear filters</button>}
          </div>
        ) : (
          <>
            <div className="book-grid">
              {books.map((book) => <BookCard key={book._id} book={book} />)}
            </div>
            {totalPages > 1 && (
              <nav className="pagination" aria-label="Catalog pages">
                <button className="page-button" type="button" onClick={() => updatePage(page - 1)} disabled={page <= 1}>
                  <ArrowLeft size={16} /> <span>Previous</span>
                </button>
                <span className="page-count">Page <strong>{page}</strong> of {totalPages}</span>
                <button className="page-button" type="button" onClick={() => updatePage(page + 1)} disabled={page >= totalPages}>
                  <span>Next</span> <ArrowRight size={16} />
                </button>
              </nav>
            )}
          </>
        )}
      </section>
    </main>
  );
}
