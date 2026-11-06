jest.mock('../middleware/auth', () => ({
  requireAuth: (req, res, next) => {
    req.user = { _id: '507f1f77bcf86cd799439011', role: 'patron' };
    next();
  },
  requireRole: () => (req, res, next) => next(),
}));

jest.mock('../models/Booking', () => ({
  findOne: jest.fn(),
  create: jest.fn(),
}));

const request = require('supertest');
const app = require('../app');
const Booking = require('../models/Booking');

describe('booking overlap protection', () => {
  beforeEach(() => jest.clearAllMocks());

  test('returns 409 when requested time partially overlaps an existing booking', async () => {
    Booking.findOne.mockImplementation(async (filter) => {
      expect(filter.space).toBe('The Reading Room');
      expect(filter.date.toISOString()).toBe('2026-12-10T00:00:00.000Z');
      expect(filter.startTime).toEqual({ $lt: '11:30' });
      expect(filter.endTime).toEqual({ $gt: '11:00' });
      return { _id: 'existing-booking', startTime: '10:00', endTime: '11:15' };
    });

    const response = await request(app)
      .post('/api/bookings')
      .send({
        space: 'The Reading Room',
        date: '2026-12-10',
        startTime: '11:00',
        endTime: '11:30',
      });

    expect(response.status).toBe(409);
    expect(response.body.error).toMatch(/already booked/);
    expect(response.body.conflictId).toBe('existing-booking');
    expect(Booking.create).not.toHaveBeenCalled();
  });
});
