# Event Ticketing Platform - API Documentation

## 📚 Table of Contents
1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Authentication](#authentication)
4. [API Endpoints](#api-endpoints)
5. [Data Models](#data-models)
6. [Error Handling](#error-handling)
7. [Rate Limiting](#rate-limiting)
8. [Examples](#examples)

---

## 🎯 Overview

Event Ticketing Platform RESTful API built with NestJS, TypeScript, and TypeORM.

### Technology Stack
- **Runtime**: Node.js 20+
- **Framework**: NestJS 10+
- **Language**: TypeScript 5+ (strict mode)
- **Database**: SQL Server with TypeORM 0.3.17
- **Authentication**: JWT with Passport
- **Documentation**: Swagger/OpenAPI 3.0
- **Testing**: Jest with >70% coverage

### Base URL
```
Development: http://localhost:3000
Production: https://api.eventtickets.com
```

### Swagger UI
```
http://localhost:3000/api
```

---

## 🏗️ Architecture

### Layered Architecture
```
Controllers (HTTP Layer)
    ↓
Services (Business Logic)
    ↓
Repositories (Data Access)
    ↓
Database (SQL Server)
```

### Module Structure
```
src/
├── auth/           # Authentication & Authorization
├── users/          # User Management
├── events/         # Event CRUD Operations
├── tickets/        # Ticket Purchase & Validation
├── promo-codes/    # Promo Code Management
├── analytics/      # Analytics & Reporting
├── categories/     # Event Categories
├── venues/         # Venue Management
└── orders/         # Order Management
```

---

## 🔐 Authentication

### JWT Token Authentication

All protected endpoints require a Bearer token in the Authorization header.

#### Register New User
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe",
  "phoneNumber": "1234567890",
  "dateOfBirth": "1990-01-15"
}

Response 201:
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "userId": 1,
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "Customer"
  }
}
```

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!"
}

Response 200:
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { ... }
}
```

#### Get Profile
```http
GET /auth/profile
Authorization: Bearer {token}

Response 200:
{
  "userId": 1,
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "role": "Customer",
  "preferences": { ... }
}
```

### Token Details
- **Algorithm**: HS256
- **Expiration**: 24 hours
- **Payload**: userId (sub), email, role

---

## 📡 API Endpoints

### Authentication Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /auth/register | No | Register new user |
| POST | /auth/login | No | User login |
| GET | /auth/profile | Yes | Get current user profile |

### Event Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /events | No | List all published events |
| GET | /events/:id | No | Get event details |
| POST | /events | Yes (Organizer) | Create new event |
| PATCH | /events/:id | Yes (Owner) | Update event |
| DELETE | /events/:id | Yes (Owner) | Delete event |
| POST | /events/:id/publish | Yes (Owner) | Publish event |
| POST | /events/:id/unpublish | Yes (Owner) | Unpublish event |
| POST | /events/:id/ticket-types | Yes (Owner) | Add ticket type |
| GET | /events/search | No | Search events |

### Ticket Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /tickets/calculate-summary | Yes | Calculate order summary |
| POST | /tickets/purchase | Yes | Purchase tickets |
| GET | /tickets/my-tickets | Yes | Get user's tickets |
| GET | /tickets/validate/:ticketNumber | Yes | Validate ticket |
| POST | /tickets/check-in/:ticketNumber | Yes (Organizer) | Check in ticket |

### Promo Code Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /promo-codes | Yes (Organizer) | Create promo code |
| GET | /promo-codes | Yes (Organizer) | List promo codes |
| POST | /promo-codes/validate | Yes | Validate promo code |
| PATCH | /promo-codes/:id/deactivate | Yes (Owner) | Deactivate promo |
| GET | /promo-codes/:id/analytics | Yes (Owner) | Get promo analytics |

### Analytics Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /analytics/revenue | Yes (Organizer) | Revenue analytics |
| GET | /analytics/capacity/:eventId | Yes (Organizer) | Capacity analytics |
| GET | /analytics/demographics/:eventId | Yes (Organizer) | Demographics data |
| GET | /analytics/check-ins/:eventId | Yes (Organizer) | Check-in analytics |
| GET | /analytics/low-attendance | Yes (Organizer) | Low attendance events |
| GET | /analytics/top-selling | Yes (Organizer) | Top selling events |
| GET | /analytics/sales-over-time/:eventId | Yes (Organizer) | Sales timeline |

### User Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /users/preferences | Yes | Get user preferences |
| PUT | /users/preferences | Yes | Update preferences |
| GET | /users/orders | Yes | Get user orders |

### Category Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /categories | No | List all categories |
| POST | /categories | Yes (Admin) | Create category |

### Venue Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /venues | No | List all venues |
| POST | /venues | Yes (Organizer) | Create venue |

---

## 📊 Data Models

### User
```typescript
{
  userId: number;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  dateOfBirth?: Date;
  role: 'Customer' | 'Organizer' | 'Admin';
  isActive: boolean;
  createdAt: Date;
}
```

### Event
```typescript
{
  eventId: number;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  status: 'Draft' | 'Published' | 'Cancelled' | 'Completed';
  imageUrl?: string;
  organizerId: number;
  categoryId: number;
  venueId: number;
  ticketTypes: TicketType[];
  createdAt: Date;
  updatedAt: Date;
}
```

### TicketType
```typescript
{
  ticketTypeId: number;
  eventId: number;
  name: string;
  description?: string;
  price: number;
  capacity: number;
  quantitySold: number;
  maxPerOrder: number;
  salesStartDate: Date;
  salesEndDate: Date;
}
```

### Order
```typescript
{
  orderId: number;
  userId: number;
  eventId: number;
  orderDate: Date;
  totalAmount: number;
  status: 'Pending' | 'Completed' | 'Cancelled' | 'Refunded';
  promoCodeId?: number;
  discountAmount: number;
  serviceFee: number;
  taxAmount: number;
  tickets: Ticket[];
}
```

### Ticket
```typescript
{
  ticketId: number;
  ticketNumber: string;
  ticketTypeId: number;
  orderId: number;
  userId: number;
  eventId: number;
  price: number;
  status: 'Valid' | 'Used' | 'Cancelled' | 'Refunded';
  qrCodeData: string;
  purchaseDate: Date;
  checkedInAt?: Date;
}
```

### PromoCode
```typescript
{
  promoCodeId: number;
  code: string;
  discountType: 'Percentage' | 'FixedAmount';
  discountValue: number;
  startDate: Date;
  endDate: Date;
  maxUses: number;
  usedCount: number;
  minPurchaseAmount: number;
  maxDiscountAmount?: number;
  isActive: boolean;
  scope: 'All' | 'Event' | 'Category';
  eventId?: number;
}
```

---

## ❌ Error Handling

### HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | OK - Request succeeded |
| 201 | Created - Resource created |
| 400 | Bad Request - Validation error |
| 401 | Unauthorized - Invalid/missing token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource not found |
| 409 | Conflict - Duplicate resource |
| 500 | Internal Server Error |

### Error Response Format
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "must be an email"
    }
  ]
}
```

### Common Error Messages

**Authentication Errors**:
- `Invalid credentials` (401)
- `Token expired` (401)
- `Unauthorized access` (403)

**Validation Errors**:
- `Email already exists` (409)
- `Invalid date range` (400)
- `Quantity exceeds maximum` (400)

**Business Logic Errors**:
- `Event not published` (400)
- `Insufficient tickets available` (400)
- `Promo code expired` (400)
- `Ticket already checked in` (400)

---

## 🚦 Rate Limiting

Currently not implemented. Recommended for production:
- **General endpoints**: 100 requests/minute per IP
- **Auth endpoints**: 10 requests/minute per IP
- **Purchase endpoints**: 20 requests/minute per user

---

## 📝 Examples

### Example 1: Complete Ticket Purchase Flow

```javascript
// 1. Register/Login
const authResponse = await fetch('http://localhost:3000/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'customer@example.com',
    password: 'SecurePass123!'
  })
});
const { access_token } = await authResponse.json();

// 2. Get Event Details
const eventResponse = await fetch('http://localhost:3000/events/1');
const event = await eventResponse.json();

// 3. Calculate Order Summary
const summaryResponse = await fetch('http://localhost:3000/tickets/calculate-summary', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${access_token}`
  },
  body: JSON.stringify({
    ticketTypeId: 1,
    quantity: 2,
    promoCode: 'SUMMER20' // Optional
  })
});
const summary = await summaryResponse.json();
// { subtotal: 100, discount: 20, serviceFee: 4, taxAmount: 6.72, totalAmount: 90.72 }

// 4. Purchase Tickets
const purchaseResponse = await fetch('http://localhost:3000/tickets/purchase', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${access_token}`
  },
  body: JSON.stringify({
    ticketTypeId: 1,
    quantity: 2,
    promoCode: 'SUMMER20'
  })
});
const purchase = await purchaseResponse.json();
// { order: {...}, tickets: [{ticketNumber: 'TKT-001', qrCodeData: '...'}] }
```

### Example 2: Create Event and Publish

```javascript
// 1. Login as Organizer
const authResponse = await fetch('http://localhost:3000/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'organizer@example.com',
    password: 'OrganizerPass123!'
  })
});
const { access_token } = await authResponse.json();

// 2. Create Event
const eventResponse = await fetch('http://localhost:3000/events', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${access_token}`
  },
  body: JSON.stringify({
    title: 'Summer Music Festival',
    description: 'Amazing outdoor concert',
    startDate: '2024-07-15T18:00:00Z',
    endDate: '2024-07-15T23:00:00Z',
    categoryId: 1,
    venueId: 1
  })
});
const event = await eventResponse.json();

// 3. Add Ticket Types
const ticketTypeResponse = await fetch(`http://localhost:3000/events/${event.eventId}/ticket-types`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${access_token}`
  },
  body: JSON.stringify({
    name: 'General Admission',
    price: 50,
    capacity: 500,
    maxPerOrder: 10,
    salesStartDate: '2024-06-01T00:00:00Z',
    salesEndDate: '2024-07-14T23:59:59Z'
  })
});

// 4. Publish Event
const publishResponse = await fetch(`http://localhost:3000/events/${event.eventId}/publish`, {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${access_token}` }
});
```

### Example 3: Validate and Check In Ticket

```javascript
// 1. Validate Ticket
const validateResponse = await fetch('http://localhost:3000/tickets/validate/TKT-12345', {
  headers: { 'Authorization': `Bearer ${organizer_token}` }
});
const validation = await validateResponse.json();
// { isValid: true, status: 'Valid', ticket: {...} }

// 2. Check In Ticket
const checkInResponse = await fetch('http://localhost:3000/tickets/check-in/TKT-12345', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${organizer_token}` }
});
const checkedInTicket = await checkInResponse.json();
// { ticketId: 1, status: 'Used', checkedInAt: '2024-07-15T18:30:00Z' }
```

### Example 4: Get Analytics

```javascript
// Revenue Analytics
const revenueResponse = await fetch('http://localhost:3000/analytics/revenue', {
  headers: { 'Authorization': `Bearer ${organizer_token}` }
});
const revenue = await revenueResponse.json();
// [{ eventId: 1, eventTitle: '...', totalRevenue: 5000, ticketsSold: 100 }]

// Capacity Analytics
const capacityResponse = await fetch('http://localhost:3000/analytics/capacity/1', {
  headers: { 'Authorization': `Bearer ${organizer_token}` }
});
const capacity = await capacityResponse.json();
// { totalCapacity: 500, ticketsSold: 350, availableTickets: 150, utilizationPercentage: 70 }
```

---

## 🔧 Business Rules

### Service Fees & Taxes
- **Service Fee**: 5% of subtotal
- **Tax Rate**: 8% of (subtotal - discount + serviceFee)
- **Calculation**: `totalAmount = subtotal - discount + serviceFee + taxAmount`

### Promo Code Rules
- One promo code per user per code
- Must meet minimum purchase amount
- Cannot exceed max discount cap (if set)
- Must be within valid date range
- Event-specific codes only valid for specified event

### Ticket Purchase Rules
- Event must be Published
- Sales must be within ticket type's sales period
- Quantity cannot exceed `maxPerOrder`
- Sufficient capacity must be available

### Event Publishing Rules
- Event must have at least one ticket type
- Start date must be in the future
- End date must be after start date
- Only organizer (owner) can publish

---

## 📱 WebSocket Events (Future)

Not currently implemented. Planned for real-time updates:
- `ticket.purchased` - New ticket sale
- `event.published` - Event published
- `capacity.warning` - Low capacity alert

---

## 🔗 Additional Resources

- **Swagger UI**: http://localhost:3000/api
- **Postman Collection**: See `postman-collection.json`
- **GitHub Repository**: https://github.com/MarcoPuenayan/EventTicketingPlatform
- **Support**: support@eventtickets.com

---

**Last Updated**: November 14, 2025
**API Version**: 1.0.0
