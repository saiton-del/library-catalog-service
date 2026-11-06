import { useState } from 'react';
import { ArrowLeft, BookOpen, UserRoundPlus } from 'lucide-react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function RegisterPage() {
  const { register, login, user, checkingAuth } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

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
      await register({ username: username.trim(), email: email.trim(), password });
      await login(email.trim(), password);
      navigate(location.state?.from?.pathname || '/booking', { replace: true });
    } catch (requestError) {
      setError(requestError.message || 'We could not create your account. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="auth-page">
      <Link to="/" className="back-link"><ArrowLeft size={16} /> Back to the collection</Link>
      <section className="auth-card">
        <div className="auth-mark"><BookOpen size={22} /></div>
        <div className="eyebrow">JOIN THE LIBRARY</div>
        <h1>Your next chapter.</h1>
        <p className="auth-lede">Create a reader account to keep your place and plan a visit.</p>
        <form className="auth-form" onSubmit={submit}>
          <label className="form-field"><span>Name</span><input type="text" name="username" value={username} onChange={(event) => setUsername(event.target.value)} autoComplete="username" minLength={3} maxLength={40} required /></label>
          <label className="form-field"><span>Email address</span><input type="email" name="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required /></label>
          <label className="form-field"><span>Password</span><input type="password" name="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="new-password" minLength={8} required /><small>Use at least 8 characters.</small></label>
          {error && <p className="form-feedback form-feedback--error" role="alert">{error}</p>}
          <button className="button button--dark auth-submit" type="submit" disabled={submitting}><UserRoundPlus size={16} /> {submitting ? 'Creating account…' : 'Create account'}</button>
        </form>
        <p className="auth-switch">Already have an account? <Link to="/login" state={location.state}>Sign in</Link></p>
      </section>
    </main>
  );
}
