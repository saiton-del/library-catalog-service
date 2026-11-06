import { ArrowUpRight, BookOpen, Heart, LogOut } from 'lucide-react';
import { Link, Route, Routes, useNavigate } from 'react-router-dom';
import BookDetailPage from './pages/BookDetailPage.jsx';
import CatalogPage from './pages/CatalogPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import ReadingListPage from './pages/ReadingListPage.jsx';
import BookingPage from './pages/BookingPage.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import { useAuth } from './context/AuthContext.jsx';
import { useReadingList } from './hooks/useReadingList.js';

function SiteHeader() {
  const { user, logout } = useAuth();
  const { readingList } = useReadingList();
  const navigate = useNavigate();

  const signOut = async () => {
    try {
      await logout();
    } catch {
      // Local auth state is cleared even when the network is unavailable.
    } finally {
      navigate('/');
    }
  };

  return (
    <header className="site-header">
      <Link to="/" className="brand" aria-label="Stacks home">
        <span className="brand-mark"><BookOpen size={19} strokeWidth={1.8} /></span>
        <span>stacks<span className="brand-period">.</span></span>
      </Link>
      <nav className="header-nav" aria-label="Main navigation">
        <Link to="/" className="header-nav__link">The collection</Link>
        <Link to="/reading-list" className="header-nav__link reading-list-nav">Reading list <span>{readingList.length}</span></Link>
        {user ? (
          <div className="account-nav"><Link to="/booking" className="header-nav__link">Book a space</Link><button type="button" className="header-nav__link sign-out-button" onClick={signOut}><LogOut size={14} /> Sign out</button></div>
        ) : (
          <Link to="/login" className="header-nav__link sign-in-link">Sign in</Link>
        )}
        <a className="header-note" href="mailto:library@example.com">A good place to get lost <ArrowUpRight size={14} /></a>
      </nav>
    </header>
  );
}

function SiteFooter() {
  return (
    <footer className="site-footer">
      <Link to="/" className="footer-brand">stacks<span>.</span></Link>
      <p>For the love of a well-turned page.</p>
      <span className="footer-made">Made with <Heart size={13} fill="currentColor" /> & a little quiet</span>
    </footer>
  );
}

export default function App() {
  return (
    <div className="app-shell">
      <a className="skip-link" href="#catalog">Skip to catalog</a>
      <SiteHeader />
      <Routes>
        <Route path="/" element={<CatalogPage />} />
        <Route path="/books/:id" element={<BookDetailPage />} />
        <Route path="/reading-list" element={<ReadingListPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/booking" element={<ProtectedRoute><BookingPage /></ProtectedRoute>} />
        <Route path="*" element={<CatalogPage />} />
      </Routes>
      <SiteFooter />
    </div>
  );
}
