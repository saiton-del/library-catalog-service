import { useCallback, useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { fetchJson } from '../../lib/api.js';
import AdminNavigation from '../../components/AdminNavigation.jsx';

const formatDate = (value) => value ? new Date(value).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' }) : '—';

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadId, setReloadId] = useState(0);

  const loadBookings = useCallback(async (signal) => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchJson('/api/bookings', signal);
      setBookings(Array.isArray(data) ? data : []);
    } catch (requestError) {
      if (requestError.name !== 'AbortError') setError(requestError.message);
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    loadBookings(controller.signal);
    return () => controller.abort();
  }, [loadBookings, reloadId]);

  return (
    <main className="admin-page">
      <div className="admin-title-row"><div><div className="eyebrow section-eyebrow">LIBRARIAN DESK</div><h1>Space bookings.</h1><p>See what’s happening across the library spaces.</p></div><button className="admin-refresh" type="button" onClick={() => setReloadId((current) => current + 1)} aria-label="Refresh bookings"><RefreshCw size={16} /></button></div>
      <AdminNavigation />
      {error && <div className="admin-alert admin-alert--error" role="alert">{error}</div>}
      <section className="admin-table-section">
        <div className="admin-table-heading"><div><div className="eyebrow">UPCOMING & RECENT VISITS</div><h2>All bookings <span>{bookings.length}</span></h2></div></div>
        {loading ? <div className="state-panel" role="status" aria-busy="true">Loading space bookings…</div> : error && !bookings.length ? null : bookings.length === 0 ? <div className="state-panel state-panel--empty"><h3>No space bookings yet.</h3><p>Patron bookings will appear here after a space is reserved.</p></div> : (
          <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Space</th><th>Date</th><th>Time</th><th>Patron</th><th>Booked on</th></tr></thead><tbody>{bookings.map((booking) => <tr key={booking._id}><td><strong>{booking.space}</strong></td><td>{formatDate(booking.date)}</td><td>{booking.startTime}–{booking.endTime}</td><td>{booking.user?.username || booking.user?.email || '—'}</td><td>{formatDate(booking.createdAt)}</td></tr>)}</tbody></table></div>
        )}
      </section>
    </main>
  );
}
