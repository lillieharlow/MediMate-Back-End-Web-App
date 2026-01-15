/**
 * Booking Routes Tests
 *
 * Tests CRUD operations for bookings:
 * - List all bookings (staff only)
 * - A patient can get their own bookings
 * - A doctor can't get a list of bookings that are not theirs (403)
 * - A doctor can get one of their bookings
 * - A patient can create a booking
 * - A patient can update their booking
 * - A doctor can update the doctor notes of a booking
 * - A patient can delete their booking
 *
 * Uses Supertest to test routes without starting the actual server.
 */

const request = require('supertest');
const app = require('../src/index');

const {
  createStaffUserAndToken,
  createDoctorUserAndToken,
  createPatientUserAndToken,
  getFutureDate,
} = require('./testUtils');

describe('Booking Routes: /api/v1/bookings', () => {
  let staffToken;
  let patientToken;
  let patientUserId;
  let doctorToken1;
  let doctorUserId2;
  let doctorToken2;

  beforeEach(async () => {
    const staff = await createStaffUserAndToken(app);
    staffToken = staff.token;

    const patient = await createPatientUserAndToken(app);
    patientToken = patient.token;
    patientUserId = patient.userId;

    const doctor1 = await createDoctorUserAndToken(app);
    doctorToken1 = doctor1.token;

    const doctor2 = await createDoctorUserAndToken(app);
    doctorUserId2 = doctor2.userId;
    doctorToken2 = doctor2.token;
  });

  test('GET / - staff should be able to list all bookings', async () => {
    const res = await request(app)
      .get('/api/v1/bookings/')
      .set('Authorization', `Bearer ${staffToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  test('GET /patients/:userId - a patient user should be able to list their own bookings', async () => {
    const res = await request(app)
      .get(`/api/v1/bookings/patients/${patientUserId}`)
      .set('Authorization', `Bearer ${patientToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  test('GET /doctors/:userId - doctor1 should not be able to list doctor2 bookings (403)', async () => {
    const futureDate = getFutureDate();
    await request(app)
      .post('/api/v1/bookings/')
      .set('Authorization', `Bearer ${patientToken}`)
      .send({
        patientId: patientUserId,
        doctorId: doctorUserId2,
        bookingStatus: 'pending',
        datetimeStart: futureDate,
        bookingDuration: 30,
        patientNotes: 'Test booking',
      });

    const res = await request(app)
      .get(`/api/v1/bookings/doctors/${doctorUserId2}`)
      .set('Authorization', `Bearer ${doctorToken1}`);

    expect(res.status).toBe(403);
  });

  test('GET /:bookingId - doctor2 should be able to get their own booking', async () => {
    const futureDate = getFutureDate();
    const bookingRes = await request(app)
      .post('/api/v1/bookings')
      .set('Authorization', `Bearer ${patientToken}`)
      .send({
        patientId: patientUserId,
        doctorId: doctorUserId2,
        bookingStatus: 'pending',
        datetimeStart: futureDate,
        bookingDuration: 30,
        patientNotes: 'Test booking',
      });

    const bookingId = bookingRes.body.data._id;

    const res = await request(app)
      .get(`/api/v1/bookings/${bookingId}`)
      .set('Authorization', `Bearer ${doctorToken2}`);

    expect(res.status).toBe(200);
    expect(res.body.data._id).toBe(bookingId);
    expect(res.body.data.doctorId).toBe(doctorUserId2);
  });
});