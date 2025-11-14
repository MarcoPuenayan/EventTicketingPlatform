# Event Ticketing Platform - Backend API

🎫 Modern event ticketing platform built with NestJS, TypeScript, and SQL Server.

[![Node.js](https://img.shields.io/badge/Node.js-20+-green.svg)](https://nodejs.org/)
[![NestJS](https://img.shields.io/badge/NestJS-10+-red.svg)](https://nestjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5+-blue.svg)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 📋 Table of Contents

- [Features](#features)
- [Technology Stack](#technology-stack)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Testing](#testing)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

---

## ✨ Features

### Core Functionality
- 🔐 **JWT Authentication** - Secure user registration and login
- 🎪 **Event Management** - Create, publish, and manage events
- 🎟️ **Ticket Sales** - Purchase tickets with QR codes
- 💰 **Promo Codes** - Percentage and fixed amount discounts
- 📊 **Analytics Dashboard** - Revenue, capacity, and demographics insights
- 🏢 **Multi-tenancy** - Support for multiple event organizers
- 📱 **QR Code Generation** - Automated ticket validation

### Business Rules
- **Service Fee**: 5% of subtotal
- **Tax Rate**: 8% applied after discounts
- **Promo Code Validation**: Date range, usage limits, minimum purchase
- **Event Publishing**: Requires at least one ticket type
- **Role-Based Access**: Customer, Organizer, Admin roles

---

## 🛠️ Technology Stack

### Core Technologies
- **Runtime**: Node.js 20+
- **Framework**: NestJS 10.3+
- **Language**: TypeScript 5.3+ (strict mode)
- **Database**: SQL Server 2019+ with TypeORM 0.3.19
- **Authentication**: JWT with Passport
- **Validation**: class-validator & class-transformer

### Additional Libraries
- **QR Codes**: qrcode 1.5+
- **PDF Generation**: pdfkit 0.14+
- **Security**: helmet, bcrypt
- **Documentation**: Swagger/OpenAPI 3.0
- **Testing**: Jest 29+ (>70% coverage)

---

## 🚀 Quick Start

### Prerequisites
- Node.js 20.0.0 or higher
- npm 10.0.0 or higher
- SQL Server 2019 or higher (Express/Developer/Standard)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/MarcoPuenayan/EventTicketingPlatform.git
cd EventTicketingPlatform/event-ticketing-api
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment**
```bash
# Copy environment template
cp .env.example .env

# Edit .env with your configuration
nano .env
```

Required environment variables:
```env
NODE_ENV=development
PORT=3000
DB_HOST=localhost
DB_PORT=1433
DB_USERNAME=sa
DB_PASSWORD=YourPassword123!
DB_DATABASE=EventTicketing
JWT_SECRET=your-secret-key
```


4. **Setup database**
```bash
# Create database
sqlcmd -S localhost -U sa -Q "CREATE DATABASE EventTicketing"

# Run migrations
npm run migration:run
```

5. **Start development server**
```bash
npm run start:dev
```

6. **Access the application**
- API: http://localhost:3000
- Swagger UI: http://localhost:3000/api
- Health Check: http://localhost:3000/health

---

## 📁 Project Structure

```
event-ticketing-api/
├── src/
│   ├── auth/              # Authentication module
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── jwt.strategy.ts
│   │   └── local.strategy.ts
│   ├── users/             # User management
│   ├── events/            # Event CRUD operations
│   ├── tickets/           # Ticket purchase & validation
│   ├── promo-codes/       # Promo code management
│   ├── analytics/         # Analytics & reporting
│   ├── categories/        # Event categories
│   ├── venues/            # Venue management
│   ├── orders/            # Order management
│   ├── entities/          # TypeORM entities
│   ├── database/          # Database configuration
│   ├── migrations/        # Database migrations
│   └── main.ts            # Application entry point
├── test/                  # E2E tests
├── docs/                  # Additional documentation
├── Dockerfile             # Docker configuration
├── docker-compose.yml     # Docker Compose setup
├── ecosystem.config.js    # PM2 configuration
└── package.json           # Dependencies
```

---

## 📚 API Documentation

### Authentication Endpoints
```http
POST   /auth/register      # Register new user
POST   /auth/login         # User login
GET    /auth/profile       # Get user profile
```

### Event Endpoints
```http
GET    /events                    # List all events
GET    /events/:id                # Get event details
POST   /events                    # Create event (Organizer)
PATCH  /events/:id                # Update event (Owner)
DELETE /events/:id                # Delete event (Owner)
POST   /events/:id/publish        # Publish event (Owner)
POST   /events/:id/ticket-types   # Add ticket type (Owner)
```

### Ticket Endpoints
```http
POST   /tickets/calculate-summary      # Calculate order
POST   /tickets/purchase                # Purchase tickets
GET    /tickets/my-tickets              # Get user tickets
GET    /tickets/validate/:ticketNumber # Validate ticket
POST   /tickets/check-in/:ticketNumber # Check in ticket (Organizer)
```

### Analytics Endpoints
```http
GET    /analytics/revenue              # Revenue by event
GET    /analytics/capacity/:eventId    # Capacity utilization
GET    /analytics/demographics/:eventId # Age demographics
GET    /analytics/check-ins/:eventId   # Check-in patterns
GET    /analytics/low-attendance       # Low attendance events
GET    /analytics/top-selling          # Top selling events
```

**Full API Documentation**: See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

**Postman Collection**: Import [postman-collection.json](./postman-collection.json)

---

## 🧪 Testing

### Run Tests
```bash
# Unit tests
npm test

# Unit tests with coverage
npm run test:cov

# E2E tests
npm run test:e2e

# Watch mode
npm run test:watch
```

### Test Coverage
- **Target**: >70% coverage for all metrics
- **Unit Tests**: 68 test cases across 5 modules
- **E2E Tests**: 3 comprehensive user flows
- **Coverage Report**: Generated in `coverage/` directory

**Testing Documentation**: See [TESTING_SUMMARY.md](./TESTING_SUMMARY.md)

---

## 🚢 Deployment

### Docker Deployment
```bash
# Build and run with Docker Compose
docker-compose up -d

# View logs
docker-compose logs -f api

# Stop services
docker-compose down
```

### Traditional Server Deployment
```bash
# Build application
npm run build

# Start with PM2
pm2 start ecosystem.config.js --env production

# Monitor
pm2 monit
```

### Cloud Platforms
- **Azure**: App Service with Azure SQL Database
- **AWS**: EC2 + RDS SQL Server
- **Google Cloud**: Cloud Run with Cloud SQL

**Full Deployment Guide**: See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)

---

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| NODE_ENV | Environment mode | development |
| PORT | Server port | 3000 |
| DB_HOST | Database host | localhost |
| DB_PORT | Database port | 1433 |
| DB_USERNAME | Database user | sa |
| DB_PASSWORD | Database password | - |
| DB_DATABASE | Database name | EventTicketing |
| JWT_SECRET | JWT signing secret | - |
| JWT_EXPIRATION | Token expiration | 24h |

### Security Configuration
- **Password Hashing**: bcrypt with 10 rounds
- **JWT Algorithm**: HS256
- **CORS**: Configurable allowed origins
- **Helmet**: Security headers enabled
- **Rate Limiting**: Recommended for production

---

## 📊 Business Logic

### Fee Calculation
```javascript
subtotal = ticketPrice * quantity
discount = calculateDiscount(promoCode, subtotal)
serviceFee = (subtotal - discount) * 0.05
taxAmount = (subtotal - discount + serviceFee) * 0.08
totalAmount = subtotal - discount + serviceFee + taxAmount
```

### Promo Code Types
- **Percentage**: X% off (with optional max cap)
- **Fixed Amount**: $X off (cannot exceed order total)
- **Scopes**: All events, specific event, specific category

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript strict mode
- Write unit tests for all business logic
- Maintain >70% code coverage
- Use conventional commits
- Update documentation

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👥 Authors

- **Marco Puenayan** - *Initial work & Migration* - [GitHub](https://github.com/MarcoPuenayan)

---

## 🙏 Acknowledgments

- Original ASP.NET Core implementation team
- NestJS community and documentation
- TypeORM contributors
- All open-source libraries used in this project

---

## 📞 Support

- **Documentation**: [API Docs](./API_DOCUMENTATION.md)
- **Issues**: [GitHub Issues](https://github.com/MarcoPuenayan/EventTicketingPlatform/issues)

---

## 🗺️ Roadmap

### Version 1.1 (Planned)
- [ ] Real-time notifications (WebSocket)
- [ ] Email notifications (SendGrid)
- [ ] PDF ticket generation
- [ ] Refund processing
- [ ] Advanced analytics dashboards

### Version 1.2 (Planned)
- [ ] Multi-language support (i18n)
- [ ] Payment gateway integration (Stripe)
- [ ] Social media sharing
- [ ] Event recommendations
- [ ] Mobile app API enhancements

---

## 🔒 Security

### Implemented Measures
- ✅ JWT token authentication
- ✅ Password hashing (bcrypt)
- ✅ SQL injection prevention (TypeORM)
- ✅ XSS protection (Helmet)
- ✅ CORS configuration
- ✅ Input validation (class-validator)
- ✅ Rate limiting (recommended)

### Security Best Practices
- Rotate JWT secrets regularly
- Use HTTPS in production
- Implement rate limiting
- Enable audit logging
- Regular security updates

---

## 📖 Additional Documentation

- [API Documentation](./API_DOCUMENTATION.md) - Complete API reference
- [Deployment Guide](./DEPLOYMENT_GUIDE.md) - Production deployment
- [Testing Summary](./TESTING_SUMMARY.md) - Test coverage and strategy
- [Migration Summary](./MIGRATION_COMPLETE.md) - ASP.NET Core to NestJS migration details

---

## 📊 Database Entities

This project includes 14 TypeORM entities:

1. **User** - User accounts and authentication
2. **UserProfile** - Extended user information
3. **UserRole** - User roles (Customer, Organizer, Admin)
4. **UserPreferences** - User preferences and theme settings
5. **Event** - Event information and management
6. **EventCategory** - Event categorization
7. **Ticket** - Individual ticket records
8. **TicketType** - Ticket type configurations
9. **Order** - Purchase orders
10. **PromoCode** - Promotional codes and discounts
11. **Venue** - Event venue information
12. **EventReview** - Event reviews and ratings
13. **UserFavoriteEvent** - User favorite events
14. **UserNotification** - User notifications

---

## 🔑 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run start` | Start the application |
| `npm run start:dev` | Start in development (watch mode) |
| `npm run start:prod` | Start in production mode |
| `npm run build` | Build the project |
| `npm run lint` | Run ESLint |
| `npm run format` | Format code with Prettier |
| `npm run test` | Run unit tests |
| `npm run test:cov` | Run tests with coverage |
| `npm run test:e2e` | Run E2E tests |
| `npm run migration:generate` | Generate migration |
| `npm run migration:run` | Run migrations |
| `npm run migration:revert` | Revert last migration |

---

**Version**: 1.0.0  
**Last Updated**: November 2025  
**Build Status**: ✅ Passing  
**Coverage**: >70%  
**Migration**: ASP.NET Core 9.0 → NestJS 10+

