import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';

describe('Ticket Purchase Flow E2E Tests', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let authToken: string;
  let organizerToken: string;
  let userId: number;
  let organizerId: number;
  let eventId: number;
  let ticketTypeId: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    dataSource = moduleFixture.get<DataSource>(DataSource);

    // Create a customer user
    const customerResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: `customer-${Date.now()}@example.com`,
        password: 'Test123456!',
        firstName: 'Customer',
        lastName: 'User',
        phoneNumber: '1234567890',
      });

    authToken = customerResponse.body.access_token;
    userId = customerResponse.body.user.userId;

    // Create an organizer user
    const organizerResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: `organizer-${Date.now()}@example.com`,
        password: 'Test123456!',
        firstName: 'Organizer',
        lastName: 'User',
        phoneNumber: '9876543210',
      });

    organizerToken = organizerResponse.body.access_token;
    organizerId = organizerResponse.body.user.userId;
  });

  afterAll(async () => {
    await dataSource.destroy();
    await app.close();
  });

  describe('Complete Purchase Flow', () => {
    it('should create, publish event, and purchase tickets successfully', async () => {
      // Step 1: Create a category
      const categoryResponse = await request(app.getHttpServer())
        .post('/categories')
        .set('Authorization', `Bearer ${organizerToken}`)
        .send({
          name: 'Music',
          description: 'Music events',
        })
        .expect(201);

      const categoryId = categoryResponse.body.categoryId;

      // Step 2: Create a venue
      const venueResponse = await request(app.getHttpServer())
        .post('/venues')
        .set('Authorization', `Bearer ${organizerToken}`)
        .send({
          name: 'Test Arena',
          address: '123 Test Street',
          city: 'Test City',
          state: 'TS',
          country: 'TestLand',
          capacity: 500,
        })
        .expect(201);

      const venueId = venueResponse.body.venueId;

      // Step 3: Create an event
      const eventResponse = await request(app.getHttpServer())
        .post('/events')
        .set('Authorization', `Bearer ${organizerToken}`)
        .send({
          title: 'Amazing Concert',
          description: 'A fantastic music event',
          startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
          endDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString(), // 8 days from now
          categoryId,
          venueId,
        })
        .expect(201);

      eventId = eventResponse.body.eventId;
      expect(eventResponse.body.status).toBe('Draft');

      // Step 4: Add ticket types to the event
      const ticketTypeResponse = await request(app.getHttpServer())
        .post(`/events/${eventId}/ticket-types`)
        .set('Authorization', `Bearer ${organizerToken}`)
        .send({
          name: 'General Admission',
          price: 50.0,
          capacity: 100,
          salesStartDate: new Date().toISOString(),
          salesEndDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(),
        })
        .expect(201);

      ticketTypeId = ticketTypeResponse.body.ticketTypeId;

      // Step 5: Publish the event
      const publishResponse = await request(app.getHttpServer())
        .post(`/events/${eventId}/publish`)
        .set('Authorization', `Bearer ${organizerToken}`)
        .expect(200);

      expect(publishResponse.body.status).toBe('Published');

      // Step 6: Customer views the event
      const eventDetailsResponse = await request(app.getHttpServer())
        .get(`/events/${eventId}`)
        .expect(200);

      expect(eventDetailsResponse.body.eventId).toBe(eventId);
      expect(eventDetailsResponse.body.status).toBe('Published');
      expect(eventDetailsResponse.body.ticketTypes).toHaveLength(1);

      // Step 7: Calculate order summary
      const summaryResponse = await request(app.getHttpServer())
        .post('/tickets/calculate-summary')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          ticketTypeId,
          quantity: 2,
        })
        .expect(200);

      expect(summaryResponse.body).toHaveProperty('subtotal');
      expect(summaryResponse.body).toHaveProperty('serviceFee');
      expect(summaryResponse.body).toHaveProperty('taxAmount');
      expect(summaryResponse.body).toHaveProperty('totalAmount');
      expect(summaryResponse.body.subtotal).toBe(100); // 2 tickets * $50

      // Step 8: Purchase tickets
      const purchaseResponse = await request(app.getHttpServer())
        .post('/tickets/purchase')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          ticketTypeId,
          quantity: 2,
        })
        .expect(201);

      expect(purchaseResponse.body).toHaveProperty('order');
      expect(purchaseResponse.body).toHaveProperty('tickets');
      expect(purchaseResponse.body.order.userId).toBe(userId);
      expect(purchaseResponse.body.tickets).toHaveLength(2);
      expect(purchaseResponse.body.tickets[0]).toHaveProperty('ticketNumber');
      expect(purchaseResponse.body.tickets[0]).toHaveProperty('qrCodeData');

      // Step 9: Verify user can see their tickets
      const userTicketsResponse = await request(app.getHttpServer())
        .get('/tickets/my-tickets')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(userTicketsResponse.body).toHaveLength(2);
      expect(userTicketsResponse.body[0].event.title).toBe('Amazing Concert');
    });
  });

  describe('Ticket Validation Flow', () => {
    let ticketNumber: string;

    beforeAll(async () => {
      // Purchase a ticket for validation tests
      const purchaseResponse = await request(app.getHttpServer())
        .post('/tickets/purchase')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          ticketTypeId,
          quantity: 1,
        });

      ticketNumber = purchaseResponse.body.tickets[0].ticketNumber;
    });

    it('should validate ticket successfully', async () => {
      const response = await request(app.getHttpServer())
        .get(`/tickets/validate/${ticketNumber}`)
        .set('Authorization', `Bearer ${organizerToken}`)
        .expect(200);

      expect(response.body.isValid).toBe(true);
      expect(response.body.status).toBe('Valid');
    });

    it('should check in ticket successfully', async () => {
      const response = await request(app.getHttpServer())
        .post(`/tickets/check-in/${ticketNumber}`)
        .set('Authorization', `Bearer ${organizerToken}`)
        .expect(200);

      expect(response.body.status).toBe('Used');
      expect(response.body).toHaveProperty('checkedInAt');
    });

    it('should not allow checking in same ticket twice', async () => {
      await request(app.getHttpServer())
        .post(`/tickets/check-in/${ticketNumber}`)
        .set('Authorization', `Bearer ${organizerToken}`)
        .expect(400);
    });
  });

  describe('Purchase with Insufficient Capacity', () => {
    it('should fail when trying to purchase more tickets than available', async () => {
      const response = await request(app.getHttpServer())
        .post('/tickets/purchase')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          ticketTypeId,
          quantity: 1000, // More than capacity
        })
        .expect(400);

      expect(response.body.message).toContain('insufficient');
    });
  });
});
