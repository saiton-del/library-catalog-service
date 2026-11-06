import { CalendarDays, Sparkles } from 'lucide-react';
import BookingForm from '../components/BookingForm.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function BookingPage() {
  const { user } = useAuth();
  return (
    <main className="booking-page">
      <section className="booking-intro">
        <div className="hero-kicker"><span className="kicker-dot" /> A little space to settle in</div>
        <h1>Make room for<br /><em>a good story.</em></h1>
        <p>Choose your favorite corner of the library and set aside a little time for yourself.</p>
        <div className="booking-welcome"><Sparkles size={16} /> Welcome, {user?.username || 'reader'}</div>
      </section>
      <section className="booking-card">
        <div className="booking-card-heading">
          <span className="booking-card-icon"><CalendarDays size={18} /></span>
          <div><div className="eyebrow">YOUR VISIT</div><h2>Plan a library moment</h2></div>
        </div>
        <BookingForm />
      </section>
    </main>
  );
}
