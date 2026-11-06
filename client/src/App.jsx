import { ArrowUpRight, BookOpen, Heart } from 'lucide-react';
import { Link, Route, Routes } from 'react-router-dom';
import BookDetailPage from './pages/BookDetailPage.jsx';
import CatalogPage from './pages/CatalogPage.jsx';

function SiteHeader() {
  return (
    <header className="site-header">
      <Link to="/" className="brand" aria-label="Stacks home">
        <span className="brand-mark"><BookOpen size={19} strokeWidth={1.8} /></span>
        <span>stacks<span className="brand-period">.</span></span>
      </Link>
      <nav className="header-nav" aria-label="Main navigation">
        <Link to="/" className="header-nav__link">The collection</Link>
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
        <Route path="*" element={<CatalogPage />} />
      </Routes>
      <SiteFooter />
    </div>
  );
}
