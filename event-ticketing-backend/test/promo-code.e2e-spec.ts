import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';

describe('Promo Code Flow E2E Tests', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let authToken: string;
  let organizerToken: string;
  let userId: number;
  let organizerId: number;
  let eventId: number;
  let ticketTypeId: number;
  let promoCodeId: number;

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
        email: `promo-customer-${Date.now()}@example.com`,
        password: 'Test123456!',
        firstName: 'Promo',
        lastName: 'Customer',
        phoneNumber: '1234567890',
      });

    authToken = customerResponse.body.access_token;
    userId = customerResponse.body.user.userId;

    // Create an organizer user
    const organizerResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: `promo-organizer-${Date.now()}@example.com`,
        password: 'Test123456!',
        firstName: 'Promo',
        lastName: 'Organizer',
        phoneNumber: '9876543210',
      });

    organizerToken = organizerResponse.body.access_token;
    organizerId = organizerResponse.body.user.userId;

    // Setup event and ticket type
    const categoryResponse = await request(app.getHttpServer())
      .post('/categories')
      .set('Authorization', `Bearer ${organizerToken}`)
      .send({
        name: 'Promo Music',
        description: 'Music events for promo test',
      });

    const venueResponse = await request(app.getHttpServer())
      .post('/venues')
      .set('Authorization', `Bearer ${organizerToken}`)
      .send({
        name: 'Promo Arena',
        address: '456 Promo Street',
        city: 'Promo City',
        state: 'PS',
        country: 'PromoLand',
        capacity: 300,
      });

    const eventResponse = await request(app.getHttpServer())
      .post('/events')
      .set('Authorization', `Bearer ${organizerToken}`)
      .send({
        title: 'Promo Concert',
        description: 'Concert with promo codes',
        startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString(),
        categoryId: categoryResponse.body.categoryId,
        venueId: venueResponse.body.venueId,
      });

    eventId = eventResponse.body.eventId;

    const ticketTypeResponse = await request(app.getHttpServer())
      .post(`/events/${eventId}/ticket-types`)
      .set('Authorization', `Bearer ${organizerToken}`)
      .send({
        name: 'VIP',
        price: 100.0,
        capacity: 50,
        salesStartDate: new Date().toISOString(),
        salesEndDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(),
      });

    ticketTypeId = ticketTypeResponse.body.ticketTypeId;

    await request(app.getHttpServer())
      .post(`/events/${eventId}/publish`)
      .set('Authorization', `Bearer ${organizerToken}`);
  });

  afterAll(async () => {
    await dataSource.destroy();
    await app.close();
  });

  describe('Promo Code Creation and Usage', () => {
    it('should create a percentage promo code', async () => {
      const response = await request(app.getHttpServer())
        .post('/promo-codes')
        .set('Authorization', `Bearer ${organizerToken}`)
        .send({
          code: 'SUMMER20',
          discountType: 'Percentage',
          discountValue: 20,
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          maxUses: 100,
          minPurchaseAmount: 50,
          maxDiscountAmount: 50,
          scope: 'All',
        })
        .expect(201);

      promoCodeId = response.body.promoCodeId;
      expect(response.body.code).toBe('SUMMER20');
      expect(response.body.discountType).toBe('Percentage');
      expect(response.body.discountValue).toBe(20);
      expect(response.body.isActive).toBe(true);
    });

    it('should validate promo code successfully', async () => {
      const response = await request(app.getHttpServer())
        .post('/promo-codes/validate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          code: 'SUMMER20',
          eventId,
          orderAmount: 100,
        })
        .expect(200);

      expect(response.body.isValid).toBe(true);
      expect(response.body.discountAmount).toBe(20); // 20% of 100
    });

    it('should calculate order summary with promo code', async () => {
      const response = await request(app.getHttpServer())
        .post('/tickets/calculate-summary')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          ticketTypeId,
          quantity: 2,
          promoCode: 'SUMMER20',
        })
        .expect(200);

      expect(response.body).toHaveProperty('subtotal');
      expect(response.body).toHaveProperty('discount');
      expect(response.body).toHaveProperty('serviceFee');
      expect(response.body).toHaveProperty('taxAmount');
      expect(response.body).toHaveProperty('totalAmount');
      expect(response.body.subtotal).toBe(200); // 2 * $100
      expect(response.body.discount).toBe(40); // 20% of 200
    });

    it('should purchase tickets with promo code discount', async () => {
      const response = await request(app.getHttpServer())
        .post('/tickets/purchase')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          ticketTypeId,
          quantity: 2,
          promoCode: 'SUMMER20',
        })
        .expect(201);

      expect(response.body.order).toHaveProperty('promoCodeId');
      expect(response.body.order.promoCodeId).toBe(promoCodeId);
      expect(response.body.order).toHaveProperty('discountAmount');
      expect(response.body.order.discountAmount).toBe(40);
    });

    it('should not allow using same promo code twice by same user', async () => {
      const response = await request(app.getHttpServer())
        .post('/tickets/purchase')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          ticketTypeId,
          quantity: 1,
          promoCode: 'SUMMER20',
        })
        .expect(400);

      expect(response.body.message).toContain('already used');
    });
  });

  describe('Event-Specific Promo Code', () => {
    let eventSpecificPromoCode: string;

    it('should create event-specific promo code', async () => {
      eventSpecificPromoCode = `EVENT${eventId}PROMO`;

      const response = await request(app.getHttpServer())
        .post('/promo-codes')
        .set('Authorization', `Bearer ${organizerToken}`)
        .send({
          code: eventSpecificPromoCode,
          discountType: 'FixedAmount',
          discountValue: 25,
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          maxUses: 50,
          minPurchaseAmount: 0,
          scope: 'Event',
          eventId,
        })
        .expect(201);

      expect(response.body.scope).toBe('Event');
      expect(response.body.eventId).toBe(eventId);
    });

    it('should validate event-specific promo for correct event', async () => {
      const response = await request(app.getHttpServer())
        .post('/promo-codes/validate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          code: eventSpecificPromoCode,
          eventId,
          orderAmount: 100,
        })
        .expect(200);

      expect(response.body.isValid).toBe(true);
      expect(response.body.discountAmount).toBe(25);
    });
  });

  describe('Promo Code Validation Errors', () => {
    it('should fail with invalid promo code', async () => {
      await request(app.getHttpServer())
        .post('/promo-codes/validate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          code: 'INVALID123',
          eventId,
          orderAmount: 100,
        })
        .expect(404);
    });

    it('should fail if order amount below minimum', async () => {
      await request(app.getHttpServer())
        .post('/promo-codes/validate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          code: 'SUMMER20',
          eventId,
          orderAmount: 30, // Below minPurchaseAmount of 50
        })
        .expect(400);
    });
  });

  describe('Promo Code Analytics', () => {
    it('should get promo code analytics', async () => {
      const response = await request(app.getHttpServer())
        .get(`/promo-codes/${promoCodeId}/analytics`)
        .set('Authorization', `Bearer ${organizerToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('promoCode');
      expect(response.body).toHaveProperty('totalUsages');
      expect(response.body).toHaveProperty('totalDiscountGiven');
      expect(response.body).toHaveProperty('averageDiscountPerUse');
      expect(response.body).toHaveProperty('usageRate');
      expect(response.body.totalUsages).toBeGreaterThan(0);
    });
  });

  describe('Deactivate Promo Code', () => {
    it('should deactivate promo code', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/promo-codes/${promoCodeId}/deactivate`)
        .set('Authorization', `Bearer ${organizerToken}`)
        .expect(200);

      expect(response.body.isActive).toBe(false);
    });

    it('should fail to validate deactivated promo code', async () => {
      await request(app.getHttpServer())
        .post('/promo-codes/validate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          code: 'SUMMER20',
          eventId,
          orderAmount: 100,
        })
        .expect(400);
    });
  });
});
