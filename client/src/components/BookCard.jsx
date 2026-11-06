import { ArrowUpRight, BookmarkCheck, BookmarkPlus, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useReadingList } from '../hooks/useReadingList.js';

export default function BookCard({ book }) {
  const [coverFailed, setCoverFailed] = useState(false);
  const { readingList, addBook, removeBook } = useReadingList();
  const isSaved = readingList.some((item) => item._id === book._id);
  const genreName = typeof book.genre === 'object' ? book.genre?.name : '';

  return (
    <article className="book-card">
      <div className="book-card__cover-wrap">
        <Link className="book-card__link" to={`/books/${book._id}`} aria-label={`View ${book.title} by ${book.author}`}>
          <div className="book-card__cover">
            {book.coverImage && !coverFailed ? (
              <img src={book.coverImage} alt={`Cover of ${book.title}`} loading="lazy" onError={() => setCoverFailed(true)} />
            ) : (
              <div className="cover-placeholder" aria-label="Cover image unavailable">
                <BookOpen size={34} strokeWidth={1.4} />
                <span>{book.title}</span>
              </div>
            )}
            <span className="book-card__open"><ArrowUpRight size={18} /></span>
          </div>
        </Link>
        <button
          className={`save-book-button ${isSaved ? 'is-saved' : ''}`}
          type="button"
          aria-label={isSaved ? `Remove ${book.title} from reading list` : `Add ${book.title} to reading list`}
          aria-pressed={isSaved}
          onClick={() => (isSaved ? removeBook(book._id) : addBook(book))}
        >
          {isSaved ? <BookmarkCheck size={17} /> : <BookmarkPlus size={17} />}
        </button>
      </div>
      <Link className="book-card__text-link" to={`/books/${book._id}`}>
        <div className="book-card__meta">
          <span className="eyebrow">{genreName || 'From the collection'}</span>
          <h2>{book.title}</h2>
          <p>{book.author}</p>
        </div>
      </Link>
    </article>
  );
}
