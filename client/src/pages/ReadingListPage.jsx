import { BookHeart, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import BookCard from '../components/BookCard.jsx';
import { useReadingList } from '../hooks/useReadingList.js';

export default function ReadingListPage() {
  const { readingList, clearList } = useReadingList();
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
          <div className="book-grid">{readingList.map((book) => <BookCard key={book._id} book={book} />)}</div>
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
