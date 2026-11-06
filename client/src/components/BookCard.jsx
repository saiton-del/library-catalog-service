import { ArrowUpRight, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';

export default function BookCard({ book }) {
  const [coverFailed, setCoverFailed] = useState(false);
  const genreName = typeof book.genre === 'object' ? book.genre?.name : '';

  return (
    <article className="book-card">
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
        <div className="book-card__meta">
          <span className="eyebrow">{genreName || 'From the collection'}</span>
          <h2>{book.title}</h2>
          <p>{book.author}</p>
        </div>
      </Link>
    </article>
  );
}
