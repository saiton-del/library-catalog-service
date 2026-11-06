import { useState } from 'react';
import { CalendarDays, Check, Clock3, MapPin } from 'lucide-react';

const spaces = ['The Reading Room', 'Quiet Study Nook', 'Community Table', 'Garden Terrace'];

export default function BookingForm() {
  const [form, setForm] = useState({ space: '', date: '', startTime: '', endTime: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const today = new Date().toISOString().slice(0, 10);

  const update = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
    setMessage('');
    setError('');
  };

  const submit = (event) => {
    event.preventDefault();
    if (form.endTime <= form.startTime) {
      setError('Choose an end time later than your start time.');
      setMessage('');
      return;
    }
    setError('');
    setMessage(`${form.space} is on your plan for ${form.date}, ${form.startTime}–${form.endTime}. This draft is saved in this form only; booking requests will be enabled soon.`);
  };

  return (
    <form className="booking-form" onSubmit={submit}>
      <label className="form-field">
        <span><MapPin size={15} /> Space</span>
        <select name="space" value={form.space} onChange={update} required>
          <option value="" disabled>Choose a place</option>
          {spaces.map((space) => <option key={space} value={space}>{space}</option>)}
        </select>
      </label>
      <label className="form-field">
        <span><CalendarDays size={15} /> Date</span>
        <input type="date" name="date" value={form.date} min={today} onChange={update} required />
      </label>
      <div className="form-time-row">
        <label className="form-field">
          <span><Clock3 size={15} /> Start time</span>
          <input type="time" name="startTime" value={form.startTime} onChange={update} required />
        </label>
        <label className="form-field">
          <span><Clock3 size={15} /> End time</span>
          <input type="time" name="endTime" value={form.endTime} onChange={update} required />
        </label>
      </div>
      {error && <p className="form-feedback form-feedback--error" role="alert">{error}</p>}
      {message && <p className="form-feedback form-feedback--success" role="status"><Check size={16} /> {message}</p>}
      <button className="button button--dark booking-submit" type="submit">Save booking draft</button>
      <p className="booking-note">This is a local preview only. Booking requests are coming soon.</p>
    </form>
  );
}
