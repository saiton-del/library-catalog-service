import { useState } from 'react';
import { ArrowLeft, BookOpen, LockKeyhole } from 'lucide-react';
import { Link, Navigate, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function LoginPage() {
  const { login, user, checkingAuth } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const successMessage = searchParams.get('registered') === '1' ? 'Your account is ready. Sign in to continue.' : '';

  if (user) {
    return <Navigate to={location.state?.from?.pathname || '/booking'} replace />;
  }

  if (checkingAuth) {
    return <main className="detail-state"><div className="state-panel" role="status">Checking your library pass…</div></main>;
  }

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(email.trim(), password);
      navigate(location.state?.from?.pathname || '/booking', { replace: true });
    } catch (requestError) {
      setError(requestError.message || 'We could not sign you in. Check your details and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="auth-page">
      <Link to="/" className="back-link"><ArrowLeft size={16} /> Back to the collection</Link>
      <section className="auth-card">
        <div className="auth-mark"><BookOpen size={22} /></div>
        <div className="eyebrow">WELCOME BACK</div>
        <h1>Come on in.</h1>
        <p className="auth-lede">Sign in to your library and settle back into your story.</p>
        {successMessage && <p className="form-feedback form-feedback--success" role="status">{successMessage}</p>}
        <form className="auth-form" onSubmit={submit}>
          <label className="form-field"><span>Email address</span><input type="email" name="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required /></label>
          <label className="form-field"><span>Password</span><input type="password" name="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" required /></label>
          {error && <p className="form-feedback form-feedback--error" role="alert">{error}</p>}
          <button className="button button--dark auth-submit" type="submit" disabled={submitting}><LockKeyhole size={15} /> {submitting ? 'Signing in…' : 'Sign in'}</button>
        </form>
        <p className="auth-switch">New to Stacks? <Link to="/register" state={location.state}>Create an account</Link></p>
      </section>
    </main>
  );
}
