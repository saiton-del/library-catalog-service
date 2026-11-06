import { useState } from 'react';
import { CalendarDays, Check, Clock3, MapPin } from 'lucide-react';
import { fetchJson } from '../lib/api.js';

const spaces = ['The Reading Room', 'Quiet Study Nook', 'Community Table', 'Garden Terrace'];

export default function BookingForm() {
  const [form, setForm] = useState({ space: '', date: '', startTime: '', endTime: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const today = new Date().toISOString().slice(0, 10);

  const update = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
    setMessage('');
    setError('');
  };

  const submit = async (event) => {
    event.preventDefault();
    if (form.endTime <= form.startTime) {
      setError('Choose an end time later than your start time.');
      setMessage('');
      return;
    }
    setError('');
    setMessage('');
    setSaving(true);
    try {
      await fetchJson('/api/bookings', { method: 'POST', body: form });
      setMessage(`${form.space} is booked for ${form.date}, ${form.startTime}–${form.endTime}.`);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
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
      <button className="button button--dark booking-submit" type="submit" disabled={saving}>{saving ? 'Checking availability…' : 'Reserve this space'}</button>
      <p className="booking-note">Availability is checked by the library server before a booking is saved.</p>
    </form>
  );
}
