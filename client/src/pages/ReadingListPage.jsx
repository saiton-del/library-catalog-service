import { BookHeart, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import BookCard from '../components/BookCard.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { fetchJson } from '../lib/api.js';
import { useReadingList } from '../hooks/useReadingList.js';

function BorrowRequestAction({ book, signedIn }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const requestBook = async () => {
    setLoading(true);
    setMessage('');
    setError('');
    try {
      const request = await fetchJson('/api/borrow-requests', {
        method: 'POST',
        body: { bookId: book._id },
      });
      setMessage(`Request sent · due ${new Date(request.dueAt).toLocaleDateString()}`);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="borrow-action">
      {signedIn ? (
        <button className="button button--dark" type="button" onClick={requestBook} disabled={loading}>{loading ? 'Sending…' : 'Request this book'}</button>
      ) : (
        <Link className="button button--dark" to="/login">Sign in to borrow</Link>
      )}
      {message && <span className="borrow-action__success" role="status">{message}</span>}
      {error && <span className="borrow-action__error" role="alert">{error}</span>}
    </div>
  );
}

export default function ReadingListPage() {
  const { readingList, clearList } = useReadingList();
  const { user } = useAuth();
  return (
    <main className="reading-list-page">
      <div className="eyebrow section-eyebrow">YOUR PERSONAL STACK</div>
      <div className="reading-list-heading">
        <div><h1>For another day.</h1><p>All the stories you’ve saved for later.</p></div>
        {readingList.length > 0 && <button className="clear-list-button" type="button" onClick={clearList}><Trash2 size={15} /> Clear list</button>}
      </div>
      {readingList.length ? (
        <>
          <div className="results-line"><span>{readingList.length} {readingList.length === 1 ? 'book' : 'books'} saved</span></div>
          <div className="book-grid">{readingList.map((book) => <div className="reading-list-item" key={book._id}><BookCard book={book} /><BorrowRequestAction book={book} signedIn={Boolean(user)} /></div>)}</div>
        </>
      ) : (
        <div className="state-panel state-panel--empty">
          <div className="state-icon"><BookHeart size={24} /></div>
          <h2>Your reading list is still a blank page.</h2>
          <p>Save a book from the catalog and it’ll be waiting here next time.</p>
          <Link className="button button--dark" to="/">Explore the collection</Link>
        </div>
      )}
    </main>
  );
}
