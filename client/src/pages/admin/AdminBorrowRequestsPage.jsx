import { useCallback, useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { fetchJson } from '../../lib/api.js';
import AdminNavigation from '../../components/AdminNavigation.jsx';

const statuses = ['pending', 'approved', 'late', 'returned'];
const formatDate = (value) => value ? new Date(value).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : '—';

export default function AdminBorrowRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState('');
  const [reloadId, setReloadId] = useState(0);

  const loadRequests = useCallback(async (signal) => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchJson('/api/borrow-requests', signal);
      setRequests(Array.isArray(data) ? data : []);
    } catch (requestError) {
      if (requestError.name !== 'AbortError') setError(requestError.message);
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    loadRequests(controller.signal);
    return () => controller.abort();
  }, [loadRequests, reloadId]);

  const updateStatus = async (request, status) => {
    if (status === request.status) return;
    setUpdatingId(request._id);
    setError('');
    try {
      const updated = await fetchJson(`/api/borrow-requests/${request._id}`, { method: 'PATCH', body: { status } });
      setRequests((current) => current.map((item) => item._id === updated._id ? updated : item));
    } catch (requestError) {
      setError(requestError.message);
      setReloadId((current) => current + 1);
    } finally {
      setUpdatingId('');
    }
  };

  return (
    <main className="admin-page">
      <div className="admin-title-row"><div><div className="eyebrow section-eyebrow">LIBRARIAN DESK</div><h1>Borrow requests.</h1><p>Review loans, follow their status, and settle returned books.</p></div><button className="admin-refresh" type="button" onClick={() => setReloadId((current) => current + 1)} aria-label="Refresh borrow requests"><RefreshCw size={16} /></button></div>
      <AdminNavigation />
      {error && <div className="admin-alert admin-alert--error" role="alert">{error}</div>}
      <section className="admin-table-section">
        <div className="admin-table-heading"><div><div className="eyebrow">LOAN ACTIVITY</div><h2>All requests <span>{requests.length}</span></h2></div></div>
        {loading ? <div className="state-panel" role="status" aria-busy="true">Loading borrow requests…</div> : error && !requests.length ? null : requests.length === 0 ? <div className="state-panel state-panel--empty"><h3>No borrow requests yet.</h3><p>Patron requests will appear here when they borrow a book from their reading list.</p></div> : (
          <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Book</th><th>Patron</th><th>Requested</th><th>Due</th><th>Returned</th><th>Status</th><th>Fine</th></tr></thead><tbody>{requests.map((request) => <tr key={request._id}><td><strong>{request.book?.title || 'Book removed'}</strong><small>{request.book?.author || ''}</small></td><td>{request.user?.username || request.user?.email || '—'}</td><td>{formatDate(request.requestedAt)}</td><td>{formatDate(request.dueAt)}</td><td>{formatDate(request.returnedAt)}</td><td><select className={`status-select status-select--${request.status}`} aria-label={`Set status for ${request.book?.title || 'borrow request'}`} value={request.status} disabled={updatingId === request._id || request.status === 'returned'} onChange={(event) => updateStatus(request, event.target.value)}>{statuses.map((status) => <option key={status} value={status}>{status}</option>)}</select></td><td><strong className={request.fine > 0 ? 'fine-amount' : ''}>${Number(request.fine || 0).toFixed(2)}</strong></td></tr>)}</tbody></table></div>
        )}
      </section>
    </main>
  );
}
