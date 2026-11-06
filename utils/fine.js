const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

function calculateFine(dueAt, returnedAt, ratePerDay = 0.25) {
  const due = new Date(dueAt).getTime();
  const returned = new Date(returnedAt).getTime();
  if (!Number.isFinite(due) || !Number.isFinite(returned)) {
    throw new TypeError('dueAt and returnedAt must be valid dates.');
  }
  if (!Number.isFinite(ratePerDay) || ratePerDay < 0) {
    throw new TypeError('ratePerDay must be a non-negative number.');
  }

  const lateDays = Math.max(0, Math.ceil((returned - due) / MILLISECONDS_PER_DAY));
  return Math.round(lateDays * ratePerDay * 100) / 100;
}

module.exports = { calculateFine };
