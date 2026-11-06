import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function ProtectedRoute({ children }) {
  const { user, checkingAuth } = useAuth();
  const location = useLocation();

  if (checkingAuth) {
    return <main className="detail-state"><div className="state-panel" role="status" aria-live="polite"><div className="state-icon">…</div><h1>Checking your library pass</h1><p>One moment while we confirm your sign-in.</p></div></main>;
  }

  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
  return children;
}
