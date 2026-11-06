import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function ProtectedRoute({ children, requireRole }) {
  const { user, checkingAuth } = useAuth();
  const location = useLocation();

  if (checkingAuth) {
    return <main className="detail-state"><div className="state-panel" role="status" aria-live="polite"><div className="state-icon">…</div><h1>Checking your library pass</h1><p>One moment while we confirm your sign-in.</p></div></main>;
  }

  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
  if (requireRole && user.role !== requireRole) {
    return <main className="detail-state"><div className="state-panel state-panel--error" role="alert"><div className="state-icon">!</div><h1>Librarian access only.</h1><p>Your account does not have permission to view this page.</p><Link className="button button--dark" to="/">Back to the catalog</Link></div></main>;
  }
  return children;
}
