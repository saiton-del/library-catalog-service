import { useCallback, useEffect, useState } from 'react';
import { BookPlus, Pencil, RefreshCw, Trash2, X } from 'lucide-react';
import { fetchJson } from '../../lib/api.js';
import AdminNavigation from '../../components/AdminNavigation.jsx';

const blankBook = {
  title: '', author: '', isbn: '', description: '', coverImage: '',
  totalCopies: 1, availableCopies: 1, genre: '',
};

export default function AdminBooksPage() {
  const [books, setBooks] = useState([]);
  const [genres, setGenres] = useState([]);
  const [form, setForm] = useState(blankBook);
  const [editingId, setEditingId] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [reloadId, setReloadId] = useState(0);

  const loadData = useCallback(async (signal) => {
    setLoading(true);
    setError('');
    try {
      const [bookResult, genreResult] = await Promise.all([
        fetchJson('/books?page=1&limit=100', signal),
        fetchJson('/genres', signal),
      ]);
      setBooks(Array.isArray(bookResult.data) ? bookResult.data : []);
      setGenres(Array.isArray(genreResult) ? genreResult : []);
    } catch (requestError) {
      if (requestError.name !== 'AbortError') setError(requestError.message);
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    loadData(controller.signal);
    return () => controller.abort();
  }, [loadData, reloadId]);

  const resetForm = () => {
    setForm({ ...blankBook, genre: genres[0]?._id || '' });
    setEditingId('');
    setNotice('');
  };

  const beginEdit = (book) => {
    setEditingId(book._id);
    setForm({
      title: book.title || '',
      author: book.author || '',
      isbn: book.isbn || '',
      description: book.description || '',
      coverImage: book.coverImage || '',
      totalCopies: book.totalCopies,
      availableCopies: book.availableCopies,
      genre: typeof book.genre === 'object' ? book.genre?._id : book.genre,
    });
    setNotice('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const saveBook = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setNotice('');
    const payload = { ...form, totalCopies: Number(form.totalCopies), availableCopies: Number(form.availableCopies) };
    try {
      await fetchJson(editingId ? `/books/${editingId}` : '/books', {
        method: editingId ? 'PUT' : 'POST',
        body: payload,
      });
      setNotice(editingId ? 'Book updated.' : 'Book added to the catalog.');
      setForm({ ...blankBook, genre: genres[0]?._id || '' });
      setEditingId('');
      setReloadId((current) => current + 1);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  };

  const deleteBook = async (book) => {
    if (!window.confirm(`Delete “${book.title}” from the catalog?`)) return;
    setError('');
    setNotice('');
    try {
      await fetchJson(`/books/${book._id}`, { method: 'DELETE' });
      setNotice(`“${book.title}” was deleted.`);
      setBooks((current) => current.filter((item) => item._id !== book._id));
      if (editingId === book._id) resetForm();
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  return (
    <main className="admin-page">
      <div className="admin-title-row"><div><div className="eyebrow section-eyebrow">LIBRARIAN DESK</div><h1>Manage the catalog.</h1><p>Add new titles, keep details current, and tend the shelves.</p></div><button className="admin-refresh" type="button" onClick={() => setReloadId((current) => current + 1)} aria-label="Refresh books"><RefreshCw size={16} /></button></div>
      <AdminNavigation />
      {error && <div className="admin-alert admin-alert--error" role="alert">{error}</div>}
      {notice && <div className="admin-alert admin-alert--success" role="status">{notice}</div>}

      <section className="admin-form-card">
        <div className="admin-card-heading"><span className="booking-card-icon"><BookPlus size={18} /></span><div><div className="eyebrow">{editingId ? 'UPDATE TITLE' : 'NEW TITLE'}</div><h2>{editingId ? 'Edit a book' : 'Add to the collection'}</h2></div>{editingId && <button className="icon-button admin-cancel" type="button" onClick={resetForm} aria-label="Cancel editing"><X size={16} /></button>}</div>
        <form className="admin-book-form" onSubmit={saveBook}>
          <label className="form-field"><span>Title</span><input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} required /></label>
          <label className="form-field"><span>Author</span><input value={form.author} onChange={(event) => setForm({ ...form, author: event.target.value })} required /></label>
          <label className="form-field"><span>ISBN</span><input value={form.isbn} onChange={(event) => setForm({ ...form, isbn: event.target.value })} required /></label>
          <label className="form-field"><span>Genre</span><select value={form.genre} onChange={(event) => setForm({ ...form, genre: event.target.value })} required><option value="" disabled>Select genre</option>{genres.map((genre) => <option key={genre._id} value={genre._id}>{genre.name}</option>)}</select></label>
          <label className="form-field admin-book-form__wide"><span>Cover image URL</span><input type="url" value={form.coverImage} onChange={(event) => setForm({ ...form, coverImage: event.target.value })} required /></label>
          <label className="form-field admin-book-form__wide"><span>Description</span><textarea rows="3" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} required /></label>
          <label className="form-field"><span>Total copies</span><input type="number" min="0" step="1" value={form.totalCopies} onChange={(event) => setForm({ ...form, totalCopies: event.target.value })} required /></label>
          <label className="form-field"><span>Available copies</span><input type="number" min="0" step="1" value={form.availableCopies} onChange={(event) => setForm({ ...form, availableCopies: event.target.value })} required /></label>
          <button className="button button--dark admin-book-form__wide" type="submit" disabled={saving || !genres.length}>{saving ? 'Saving…' : editingId ? 'Save changes' : 'Add book'}</button>
        </form>
      </section>

      <section className="admin-table-section">
        <div className="admin-table-heading"><div><div className="eyebrow">CATALOG RECORDS</div><h2>All books <span>{books.length}</span></h2></div></div>
        {loading ? <div className="state-panel" role="status" aria-busy="true">Loading catalog records…</div> : error && !books.length ? null : books.length === 0 ? <div className="state-panel state-panel--empty"><h3>No books in the catalog yet.</h3><p>Add a title using the form above.</p></div> : (
          <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Title</th><th>Author</th><th>Genre</th><th>Copies</th><th>Actions</th></tr></thead><tbody>{books.map((book) => <tr key={book._id}><td><strong>{book.title}</strong><small>{book.isbn}</small></td><td>{book.author}</td><td>{typeof book.genre === 'object' ? book.genre?.name : '—'}</td><td>{book.availableCopies} / {book.totalCopies}</td><td><div className="table-actions"><button className="icon-button" type="button" onClick={() => beginEdit(book)} aria-label={`Edit ${book.title}`}><Pencil size={15} /></button><button className="icon-button table-delete" type="button" onClick={() => deleteBook(book)} aria-label={`Delete ${book.title}`}><Trash2 size={15} /></button></div></td></tr>)}</tbody></table></div>
        )}
      </section>
    </main>
  );
}
