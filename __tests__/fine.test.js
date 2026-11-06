const { calculateFine } = require('../utils/fine');

describe('server fine calculation', () => {
  const dueAt = new Date('2026-01-15T12:00:00.000Z');

  test('charges $0.50 for a return exactly 48 hours after the due time', () => {
    const returnedAt = new Date(dueAt.getTime() + 48 * 60 * 60 * 1000);
    expect(calculateFine(dueAt, returnedAt)).toBe(0.5);
  });

  test('does not charge for a return at or before the due time', () => {
    expect(calculateFine(dueAt, dueAt)).toBe(0);
    expect(calculateFine(dueAt, new Date(dueAt.getTime() - 60_000))).toBe(0);
  });
});
