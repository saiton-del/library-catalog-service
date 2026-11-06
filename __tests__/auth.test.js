const request = require('supertest');
const app = require('../app');
const { requireRole } = require('../middleware/auth');

describe('authentication and role protection', () => {
  test('rejects anonymous access to librarian booking records with 401', async () => {
    const response = await request(app).get('/api/bookings');

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ error: 'Authentication required.' });
  });

  test('rejects anonymous borrow-request submission with 401', async () => {
    const response = await request(app)
      .post('/api/borrow-requests')
      .send({ bookId: '507f1f77bcf86cd799439011' });

    expect(response.status).toBe(401);
    expect(response.body.error).toMatch(/Authentication required/);
  });

  test('rejects a patron from a librarian-only action with 403', () => {
    const req = { user: { role: 'patron' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();

    requireRole('librarian')(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ error: 'Forbidden: insufficient role.' });
    expect(next).not.toHaveBeenCalled();
  });
});
