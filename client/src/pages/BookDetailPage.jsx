import { useEffect, useState } from 'react';
import { ArrowLeft, BookOpen, Check, Copy, Library, Share2 } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { fetchJson } from '../lib/api.js';

export default function BookDetailPage() {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [coverFailed, setCoverFailed] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError('');
    setBook(null);
    fetchJson(`/books/${encodeURIComponent(id)}`, controller.signal)
      .then(setBook)
      .catch((requestError) => {
        if (requestError.name !== 'AbortError') setError(requestError.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [id]);

  const copyIsbn = async () => {
    try {
      await navigator.clipboard.writeText(book.isbn);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  if (loading) {
    return <main className="detail-state"><div className="detail-skeleton" aria-label="Loading book details" aria-busy="true"><div /><span /><span /></div></main>;
  }

  if (error || !book) {
    return (
      <main className="detail-state">
        <div className="state-panel state-panel--error" role="alert">
          <div className="state-icon">!</div>
          <h1>We couldn’t find that story.</h1>
          <p>{error || 'This book may have moved off the shelf.'}</p>
          <Link className="button button--dark" to="/"><ArrowLeft size={16} /> Back to the library</Link>
        </div>
      </main>
    );
  }

  const genreName = typeof book.genre === 'object' ? book.genre?.name : 'From the collection';

  return (
    <main className="detail-page">
      <Link to="/" className="back-link"><ArrowLeft size={16} /> Back to the collection</Link>
      <div className="detail-layout">
        <div className="detail-cover-wrap">
          <div className="detail-cover">
            {book.coverImage && !coverFailed ? (
              <img src={book.coverImage} alt={`Cover of ${book.title}`} onError={() => setCoverFailed(true)} />
            ) : (
              <div className="cover-placeholder cover-placeholder--large"><BookOpen size={54} strokeWidth={1.3} /><span>{book.title}</span></div>
            )}
          </div>
          <div className="cover-caption"><span>FROM THE STACKS</span><span>NO. {String(book._id || '').slice(-5).toUpperCase()}</span></div>
        </div>

        <article className="detail-copy">
          <div className="eyebrow detail-genre"><span /> {genreName}</div>
          <h1>{book.title}</h1>
          <p className="detail-author">by <strong>{book.author}</strong></p>
          <div className="detail-rule" />
          <p className="detail-description">{book.description || 'A good book needs no introduction. Find a comfortable chair and turn the first page.'}</p>

          <div className="availability-card">
            <div className="availability-icon"><Library size={19} /></div>
            <div><span className="eyebrow">ON THE SHELF</span><p><strong>{book.availableCopies}</strong> of {book.totalCopies} copies available</p></div>
            <span className={`availability-dot ${book.availableCopies > 0 ? 'is-available' : ''}`} />
          </div>

          <div className="isbn-row">
            <div><span className="eyebrow">ISBN</span><p>{book.isbn}</p></div>
            <button type="button" className="icon-button" onClick={copyIsbn} aria-label="Copy ISBN" title="Copy ISBN">
              {copied ? <Check size={17} /> : <Copy size={17} />}
            </button>
          </div>

          <button type="button" className="button button--terracotta detail-share" onClick={() => navigator.share?.({ title: book.title, url: window.location.href })}>
            <Share2 size={16} /> Share this story
          </button>
          <p className="detail-footnote">A little adventure is always close to home.</p>
        </article>
      </div>
    </main>
  );
}
