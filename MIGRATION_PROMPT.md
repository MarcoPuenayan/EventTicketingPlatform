# 🚀 Prompt Profesional para Migración: EventTicketing.API (.NET → Node.js)

## 📋 Contexto del Proyecto

Soy el líder técnico de un proyecto de plataforma de venta de tickets para eventos. Actualmente tenemos un backend en **ASP.NET Core 9.0 con C#** y un frontend en **Next.js 14 con TypeScript**. Necesito migrar completamente el backend a **Node.js con NestJS y TypeScript** para unificar nuestro stack tecnológico.

---

## 🎯 Objetivo de la Migración

Convertir una API REST completa de ASP.NET Core a Node.js/NestJS manteniendo:
- ✅ **100% de funcionalidad** actual
- ✅ **Misma estructura de base de datos** (SQL Server)
- ✅ **Compatibilidad con el frontend** existente
- ✅ **Seguridad y rendimiento** equivalente o superior
- ✅ **Código limpio** siguiendo mejores prácticas

---

## 🏗️ Arquitectura Actual (.NET)

### **Stack Tecnológico**
```yaml
Framework: ASP.NET Core 9.0
Lenguaje: C#
Base de Datos: SQL Server
ORM: Entity Framework Core 9.0.5
Autenticación: JWT Bearer Tokens
Documentación: Swagger/OpenAPI
Patrón: Arquitectura en Capas (Controllers → Services → Data)
```

### **Componentes del Sistema**

#### **Controladores (9)**
1. `AuthController` - Registro y login de usuarios
2. `EventsController` - Gestión de eventos y banners
3. `TicketsController` - Compra y gestión de tickets
4. `UserController` - Perfil y preferencias de usuario
5. `VenuesController` - Gestión de venues/locaciones
6. `OrdersController` - Órdenes y transacciones
7. `PromoCodesController` - Códigos promocionales
8. `AnalyticsController` - Estadísticas y reportes
9. `CategoriesController` - Categorías de eventos

#### **Servicios de Negocio (9)**
1. `AuthService` - Autenticación, JWT, hash de passwords (SHA256)
2. `EventService` - CRUD eventos, filtros, búsqueda
3. `TicketService` - Generación de tickets con QR codes
4. `UserService` - Gestión de usuarios y perfiles
5. `PromoCodeService` - Validación y aplicación de descuentos
6. `AnalyticsService` - Métricas y reportes
7. `QrCodeService` - Generación de códigos QR (QRCoder)
8. `LocalImageStorageService` - Almacenamiento local de imágenes
9. `IImageStorageService` - Interface para storage

#### **Entidades de Dominio (14)**
```
User, UserProfile, UserRole, UserPreferences, UserNotification, 
UserFavoriteEvent, Event, EventCategory, EventReview, 
Ticket, TicketType, Order, PromoCode, Venue
```

#### **DTOs (6 archivos)**
- `AuthDTOs.cs` - LoginDto, RegisterDto, AuthResponseDto
- `EventDTOs.cs` - CreateEventDto, UpdateEventDto, EventResponseDto
- `TicketDTOs.cs` - PurchaseTicketDto, TicketResponseDto
- `UserProfileDTOs.cs` - UpdateProfileDto, UserPreferencesDto
- `PromoCodeDTOs.cs` - CreatePromoCodeDto, ValidatePromoCodeDto
- `AnalyticsDtos.cs` - EventAnalyticsDto, SalesReportDto

### **Dependencias Clave .NET**
```xml
<PackageReference Include="Microsoft.EntityFrameworkCore.SqlServer" Version="9.0.5" />
<PackageReference Include="Microsoft.AspNetCore.Authentication.JwtBearer" Version="9.0.5" />
<PackageReference Include="System.IdentityModel.Tokens.Jwt" Version="8.11.0" />
<PackageReference Include="QRCoder" Version="1.6.0" />
<PackageReference Include="iText7" Version="9.2.0" />
<PackageReference Include="Swashbuckle.AspNetCore" Version="8.1.2" />
```

### **Configuración JWT Actual**
```json
{
  "Jwt": {
    "Key": "YourSuperSecretKeyThatIsAtLeast32CharactersLongForSecurity123456789",
    "Issuer": "EventTicketingAPI",
    "Audience": "EventTicketingApp",
    "ExpiryMinutes": 60
  }
}
```

### **Conexión Base de Datos**
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost,1433;Database=EventPlanning;User Id=sa;Password=P@ssw0rd123!;TrustServerCertificate=True;Encrypt=False;"
  }
}
```

### **Características Importantes**
- ✅ Autenticación JWT con refresh tokens
- ✅ Generación de PDFs para tickets (iText7)
- ✅ Generación de códigos QR únicos por ticket
- ✅ Sistema de roles (User, Organizer, Admin)
- ✅ Upload de imágenes (banners de eventos)
- ✅ Sistema de favoritos y notificaciones
- ✅ Códigos promocionales con validaciones complejas
- ✅ Analytics con métricas de eventos y ventas
- ✅ Validación exhaustiva con Data Annotations
- ✅ CORS configurado para React frontend (localhost:3000)
- ✅ 6 migraciones de base de datos implementadas

---

## 🎯 Stack Objetivo (Node.js)

### **Tecnologías Requeridas**
```yaml
Framework: NestJS 10+
Lenguaje: TypeScript 5+
Base de Datos: SQL Server (mantener actual)
ORM: TypeORM o Prisma
Autenticación: Passport.js + JWT + bcrypt
Validación: class-validator + class-transformer
Documentación: @nestjs/swagger
Testing: Jest
```

### **Mapeo de Dependencias**

| Funcionalidad | .NET Package | Node.js Package |
|---------------|--------------|-----------------|
| **ORM** | Entity Framework Core | TypeORM / Prisma |
| **SQL Server** | Microsoft.EntityFrameworkCore.SqlServer | mssql + typeorm-mssql |
| **JWT** | Microsoft.AspNetCore.Authentication.JwtBearer | @nestjs/jwt + passport-jwt |
| **Hash Password** | System.Security.Cryptography (SHA256) | bcrypt |
| **QR Codes** | QRCoder | qrcode |
| **PDF** | iText7 | pdfkit / @napi-rs/canvas |
| **Swagger** | Swashbuckle.AspNetCore | @nestjs/swagger |
| **Validación** | Data Annotations | class-validator |
| **Mapeo** | AutoMapper | @automapper/classes |
| **File Upload** | IFormFile | @nestjs/platform-express (multer) |

---

## 📝 Instrucciones de Migración

### **Fase 1: Configuración del Proyecto**

**Tarea:** Inicializa un proyecto NestJS profesional con la siguiente estructura:

```
event-ticketing-api/
├── src/
│   ├── modules/
│   │   ├── auth/
│   │   ├── events/
│   │   ├── tickets/
│   │   ├── users/
│   │   ├── venues/
│   │   ├── orders/
│   │   ├── promo-codes/
│   │   ├── analytics/
│   │   └── categories/
│   ├── common/
│   │   ├── decorators/
│   │   ├── filters/
│   │   ├── guards/
│   │   ├── interceptors/
│   │   └── pipes/
│   ├── config/
│   ├── database/
│   │   ├── entities/
│   │   └── migrations/
│   └── main.ts
├── test/
├── .env.development
├── .env.production
├── package.json
├── tsconfig.json
├── nest-cli.json
└── README.md
```

**Configuración requerida:**
1. TypeScript con modo `strict: true`
2. ESLint + Prettier configurados
3. Variables de entorno con validación
4. TypeORM configurado para SQL Server
5. Swagger en ruta `/api/docs`
6. CORS habilitado para `http://localhost:3000`
7. Global pipes para validación
8. Global filters para manejo de errores
9. Logger personalizado

**Dependencias principales a instalar:**
```json
{
  "dependencies": {
    "@nestjs/common": "^10.0.0",
    "@nestjs/core": "^10.0.0",
    "@nestjs/platform-express": "^10.0.0",
    "@nestjs/typeorm": "^10.0.0",
    "@nestjs/jwt": "^10.0.0",
    "@nestjs/passport": "^10.0.0",
    "@nestjs/config": "^3.0.0",
    "@nestjs/swagger": "^7.0.0",
    "typeorm": "^0.3.17",
    "mssql": "^10.0.0",
    "passport": "^0.7.0",
    "passport-jwt": "^4.0.1",
    "bcrypt": "^5.1.1",
    "class-validator": "^0.14.0",
    "class-transformer": "^0.5.1",
    "qrcode": "^1.5.3",
    "pdfkit": "^0.14.0"
  }
}
```

---

### **Fase 2: Migración de Entidades**

**Tarea:** Convierte las 14 entidades de C# a TypeORM entities en TypeScript.

**Ejemplo de migración - User.cs → user.entity.ts:**

**C# Original:**
```csharp
public class User
{
    [Key]
    public int UserId { get; set; }
    
    [Required]
    [EmailAddress]
    public string Email { get; set; }
    
    [Required]
    public string PasswordHash { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public bool IsActive { get; set; } = true;
    
    // Navigation Properties
    public ICollection<Event> OrganizedEvents { get; set; }
    public ICollection<Ticket> Tickets { get; set; }
}

public enum UserStatus
{
    Active,
    Inactive,
    Suspended
}
```

**TypeScript Esperado:**
```typescript
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { Event } from '../events/event.entity';
import { Ticket } from '../tickets/ticket.entity';

export enum UserStatus {
  Active = 'Active',
  Inactive = 'Inactive',
  Suspended = 'Suspended'
}

@Entity('Users')
export class User {
  @PrimaryGeneratedColumn()
  userId: number;

  @Column({ unique: true })
  email: string;

  @Column()
  passwordHash: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'varchar', default: UserStatus.Active })
  status: UserStatus;

  @CreateDateColumn()
  createdAt: Date;

  // Relations
  @OneToMany(() => Event, event => event.organizer)
  organizedEvents: Event[];

  @OneToMany(() => Ticket, ticket => ticket.user)
  tickets: Ticket[];
}
```

**Entidades a migrar:**
1. ✅ User → user.entity.ts
2. ✅ UserProfile → user-profile.entity.ts
3. ✅ UserRole → user-role.entity.ts
4. ✅ UserPreferences → user-preferences.entity.ts
5. ✅ Event → event.entity.ts
6. ✅ EventCategory → event-category.entity.ts
7. ✅ Ticket → ticket.entity.ts
8. ✅ TicketType → ticket-type.entity.ts
9. ✅ Order → order.entity.ts
10. ✅ PromoCode → promo-code.entity.ts
11. ✅ Venue → venue.entity.ts
12. ✅ EventReview → event-review.entity.ts
13. ✅ UserFavoriteEvent → user-favorite-event.entity.ts
14. ✅ UserNotification → user-notification.entity.ts

**Requisitos:**
- Usar decoradores de TypeORM correctamente
- Mantener todos los enums como string enums
- Preservar relaciones (OneToMany, ManyToOne, ManyToMany)
- Incluir índices donde sea necesario
- Agregar validaciones con class-validator

---

### **Fase 3: Migración de DTOs**

**Tarea:** Convierte todos los DTOs de C# a TypeScript con validaciones.

**Ejemplo - LoginDto:**

**C# Original:**
```csharp
public class LoginDto
{
    [Required]
    [EmailAddress]
    public string Email { get; set; }

    [Required]
    [MinLength(6)]
    public string Password { get; set; }
}
```

**TypeScript Esperado:**
```typescript
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'Password123!' })
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}
```

**DTOs a migrar con sus validaciones:**

1. **AuthDTOs:**
   - LoginDto (email, password)
   - RegisterDto (email, password, firstName, lastName, phoneNumber)
   - AuthResponseDto (token, refreshToken, user)

2. **EventDTOs:**
   - CreateEventDto (todos los campos del evento)
   - UpdateEventDto (campos opcionales)
   - EventResponseDto (evento + relations)

3. **TicketDTOs:**
   - PurchaseTicketDto (eventId, ticketTypeId, quantity, promoCode)
   - TicketResponseDto (ticket + QR code + PDF URL)

4. **UserProfileDTOs:**
   - UpdateProfileDto
   - UserPreferencesDto

5. **PromoCodeDTOs:**
   - CreatePromoCodeDto
   - ValidatePromoCodeDto

6. **AnalyticsDtos:**
   - EventAnalyticsDto
   - SalesReportDto

**Requisitos:**
- Todos los DTOs deben tener decoradores de class-validator
- Incluir documentación Swagger con @ApiProperty
- Usar @ApiPropertyOptional para campos opcionales
- Agregar ejemplos en la documentación

---

### **Fase 4: Migración del Módulo de Autenticación**

**Tarea:** Implementa el módulo de autenticación completo con JWT.

**Componentes a crear:**

#### **1. auth.service.ts**

Migra el `AuthService.cs` con las siguientes funcionalidades:

```typescript
@Injectable()
export class AuthService {
  async register(registerDto: RegisterDto): Promise<AuthResponseDto>;
  async login(loginDto: LoginDto): Promise<AuthResponseDto>;
  async validateUser(email: string, password: string): Promise<User>;
  async generateTokens(user: User): Promise<{ accessToken: string; refreshToken: string }>;
  private hashPassword(password: string): Promise<string>;
  private comparePasswords(plainPassword: string, hashedPassword: string): Promise<boolean>;
}
```

**Requisitos críticos:**
- ✅ Usar **bcrypt** para hash (NO SHA256 como .NET)
- ✅ JWT con misma configuración (Issuer, Audience, Key)
- ✅ Tokens con expiración de 60 minutos
- ✅ Manejo de errores con UnauthorizedException
- ✅ Validación de email duplicado antes de registro

#### **2. auth.controller.ts**

```typescript
@Controller('api/auth')
@ApiTags('Authentication')
export class AuthController {
  @Post('register')
  async register(@Body() registerDto: RegisterDto): Promise<AuthResponseDto>;
  
  @Post('login')
  async login(@Body() loginDto: LoginDto): Promise<AuthResponseDto>;
  
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@CurrentUser() user: User): Promise<UserResponseDto>;
}
```

#### **3. Guards y Strategies**

```typescript
// jwt.strategy.ts
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: any) {
    return { userId: payload.sub, email: payload.email };
  }
}

// jwt-auth.guard.ts
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
```

#### **4. Decorador @CurrentUser()**

```typescript
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
```

---

### **Fase 5: Migración de Módulo de Eventos**

**Tarea:** Migra EventsController y EventService completamente.

#### **Funcionalidades clave:**

1. **CRUD de Eventos**
   - GET /api/events - Lista todos los eventos
   - GET /api/events/:id - Obtiene un evento
   - POST /api/events - Crea evento (requiere autenticación)
   - PUT /api/events/:id - Actualiza evento
   - DELETE /api/events/:id - Elimina evento

2. **Filtros y Búsqueda**
   - Filtro por categoría
   - Filtro por fecha
   - Búsqueda por título
   - Filtro por venue
   - Ordenamiento (fecha, precio, popularidad)

3. **Upload de Banner**
   ```typescript
   @Post(':id/upload-banner')
   @UseInterceptors(FileInterceptor('file'))
   async uploadBanner(
     @Param('id') id: number,
     @UploadedFile() file: Express.Multer.File,
     @CurrentUser() user: User
   ): Promise<{ imageUrl: string }>;
   ```

4. **Sistema de Favoritos**
   - POST /api/events/:id/favorite
   - DELETE /api/events/:id/favorite

**Validaciones importantes:**
- Solo el organizador puede editar/eliminar su evento
- Validar fechas (StartDateTime < EndDateTime)
- Validar MaxAttendees > 0
- Validar BasePrice >= 0
- Imágenes: max 5MB, formatos JPEG/PNG/WebP

---

### **Fase 6: Migración de Módulo de Tickets**

**Tarea:** Implementa la compra de tickets con generación de QR y PDF.

#### **Funcionalidades:**

1. **Compra de Tickets**
```typescript
@Post('purchase')
@UseGuards(JwtAuthGuard)
async purchaseTicket(
  @Body() purchaseDto: PurchaseTicketDto,
  @CurrentUser() user: User
): Promise<TicketResponseDto>;
```

**Lógica de negocio:**
- ✅ Validar disponibilidad de tickets
- ✅ Aplicar código promocional si existe
- ✅ Calcular precio final
- ✅ Generar QR code único
- ✅ Generar PDF del ticket
- ✅ Enviar email con ticket (opcional)
- ✅ Actualizar inventario

2. **Generación de QR Code**
```typescript
@Injectable()
export class QrCodeService {
  async generateQrCode(ticketId: number, userId: number): Promise<string> {
    // Usar librería 'qrcode'
    // Formato: TICKET-{ticketId}-{userId}-{timestamp}
    // Retornar base64 o URL
  }
}
```

3. **Generación de PDF**
```typescript
@Injectable()
export class PdfService {
  async generateTicketPdf(ticket: Ticket): Promise<Buffer> {
    // Usar pdfkit
    // Incluir: QR code, detalles del evento, términos
  }
}
```

4. **Validación de Tickets**
```typescript
@Get('validate/:qrCode')
async validateTicket(@Param('qrCode') qrCode: string): Promise<{
  valid: boolean;
  ticket?: Ticket;
  message: string;
}>;
```

---

### **Fase 7: Migración de Módulo de Códigos Promocionales**

**Tarea:** Implementa sistema completo de promo codes.

#### **Tipos de Descuento (Enum):**
```typescript
export enum DiscountType {
  Percentage = 'Percentage',
  FixedAmount = 'FixedAmount'
}
```

#### **Validaciones:**
```typescript
@Injectable()
export class PromoCodeService {
  async validatePromoCode(
    code: string, 
    eventId: number, 
    userId: number
  ): Promise<PromoCodeValidationResult> {
    // ✅ Verificar que existe
    // ✅ Verificar que está activo
    // ✅ Verificar fecha de validez
    // ✅ Verificar límite de usos
    // ✅ Verificar si aplica al evento
    // ✅ Verificar si el usuario ya lo usó
  }

  async applyPromoCode(
    code: string,
    originalPrice: number
  ): Promise<{ discountedPrice: number; discount: number }>;
}
```

---

### **Fase 8: Migración de Módulo de Analytics**

**Tarea:** Implementa servicio de analytics con reportes.

#### **Métricas requeridas:**

```typescript
@Injectable()
export class AnalyticsService {
  // Estadísticas de evento
  async getEventAnalytics(eventId: number): Promise<EventAnalyticsDto> {
    // - Total tickets vendidos
    // - Revenue total
    // - Tickets por tipo
    // - Uso de promo codes
    // - Rating promedio
    // - Evolución de ventas por día
  }

  // Reporte de ventas
  async getSalesReport(
    startDate: Date,
    endDate: Date
  ): Promise<SalesReportDto> {
    // - Ventas por día
    // - Top eventos
    // - Revenue por categoría
  }

  // Dashboard del organizador
  async getOrganizerDashboard(
    userId: number
  ): Promise<OrganizerDashboardDto> {
    // - Eventos activos
    // - Próximos eventos
    // - Ventas totales
    // - Tickets vendidos
  }
}
```

---

### **Fase 9: Testing**

**Tarea:** Crea tests unitarios y e2e para módulos críticos.

#### **Tests Unitarios (Jest):**

```typescript
describe('AuthService', () => {
  it('should register a new user successfully', async () => {
    // Test registro
  });

  it('should throw error when email already exists', async () => {
    // Test email duplicado
  });

  it('should login with valid credentials', async () => {
    // Test login exitoso
  });

  it('should throw error with invalid credentials', async () => {
    // Test login fallido
  });
});
```

**Módulos a testear:**
- ✅ AuthService (registro, login, JWT)
- ✅ EventService (CRUD, filtros)
- ✅ TicketService (compra, validación)
- ✅ PromoCodeService (validación, aplicación)
- ✅ QrCodeService (generación)

#### **Tests E2E:**
```typescript
describe('Events (e2e)', () => {
  it('/api/events (GET)', () => {
    return request(app.getHttpServer())
      .get('/api/events')
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body)).toBe(true);
      });
  });

  it('/api/events (POST) - unauthorized', () => {
    return request(app.getHttpServer())
      .post('/api/events')
      .send(createEventDto)
      .expect(401);
  });
});
```

---

### **Fase 10: Documentación y Deploy**

#### **1. Swagger Documentation**
```typescript
// main.ts
const config = new DocumentBuilder()
  .setTitle('Event Ticketing API')
  .setDescription('Complete API for event ticketing platform')
  .setVersion('1.0')
  .addBearerAuth()
  .addTag('Authentication')
  .addTag('Events')
  .addTag('Tickets')
  .addTag('Promo Codes')
  .addTag('Analytics')
  .build();

const document = SwaggerModule.createDocument(app, config);
SwaggerModule.setup('api/docs', app, document);
```

#### **2. README.md**
Debe incluir:
- Descripción del proyecto
- Prerequisitos
- Instalación
- Variables de entorno
- Scripts disponibles
- Endpoints principales
- Ejemplos de uso
- Arquitectura
- Estructura de carpetas

#### **3. Dockerfile**
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3001
CMD ["node", "dist/main"]
```

#### **4. docker-compose.yml**
```yaml
version: '3.8'
services:
  api:
    build: .
    ports:
      - "3001:3001"
    environment:
      - DATABASE_HOST=sqlserver
      - JWT_SECRET=${JWT_SECRET}
    depends_on:
      - sqlserver
  
  sqlserver:
    image: mcr.microsoft.com/mssql/server:2022-latest
    environment:
      - SA_PASSWORD=P@ssw0rd123!
      - ACCEPT_EULA=Y
    ports:
      - "1433:1433"
```

---

## 🎨 Estándares de Código

### **Naming Conventions**
- **Archivos**: kebab-case (`user.service.ts`, `auth.controller.ts`)
- **Clases**: PascalCase (`UserService`, `AuthController`)
- **Interfaces**: PascalCase con prefijo I (`IUserService`)
- **Variables/funciones**: camelCase (`getUserById`, `isActive`)
- **Constantes**: UPPER_SNAKE_CASE (`MAX_FILE_SIZE`)
- **Enums**: PascalCase con valores string (`UserStatus.Active`)

### **Estructura de Módulos**
Cada módulo debe tener:
```
module-name/
├── module-name.module.ts
├── module-name.controller.ts
├── module-name.service.ts
├── entities/
│   └── module-name.entity.ts
├── dto/
│   ├── create-module-name.dto.ts
│   └── update-module-name.dto.ts
└── module-name.service.spec.ts
```

### **Error Handling**
```typescript
// Usar excepciones HTTP de NestJS
throw new BadRequestException('Invalid input');
throw new UnauthorizedException('Invalid credentials');
throw new NotFoundException('Event not found');
throw new ForbiddenException('Access denied');
throw new ConflictException('Email already exists');
```

### **Response Format**
```typescript
// Success Response
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}

// Error Response
{
  "success": false,
  "statusCode": 400,
  "message": "Error message",
  "error": "Bad Request"
}
```

---

## ✅ Checklist de Migración

### **Configuración Inicial**
- [ ] Proyecto NestJS inicializado
- [ ] TypeORM configurado con SQL Server
- [ ] Variables de entorno configuradas
- [ ] Swagger funcionando en /api/docs
- [ ] CORS habilitado
- [ ] Logger configurado

### **Entidades y Base de Datos**
- [ ] 14 entidades migradas a TypeORM
- [ ] Relaciones correctamente definidas
- [ ] Migraciones creadas
- [ ] Seed data implementado

### **DTOs y Validaciones**
- [ ] Todos los DTOs migrados
- [ ] Validaciones con class-validator
- [ ] Documentación Swagger en DTOs

### **Módulos Core**
- [ ] Auth module (registro, login, JWT)
- [ ] Events module (CRUD completo)
- [ ] Tickets module (compra, QR, PDF)
- [ ] Users module (perfil, preferencias)
- [ ] Venues module
- [ ] Orders module
- [ ] Promo codes module
- [ ] Analytics module
- [ ] Categories module

### **Funcionalidades Avanzadas**
- [ ] Generación de QR codes
- [ ] Generación de PDFs
- [ ] Upload de imágenes
- [ ] Sistema de favoritos
- [ ] Notificaciones
- [ ] Sistema de reviews

### **Seguridad**
- [ ] JWT authentication funcionando
- [ ] Guards implementados
- [ ] Bcrypt para passwords
- [ ] Validación de inputs
- [ ] Rate limiting
- [ ] Helmet configurado

### **Testing**
- [ ] Tests unitarios (>70% coverage)
- [ ] Tests e2e para endpoints críticos
- [ ] Tests de integración

### **Documentación**
- [ ] README completo
- [ ] Swagger documentation
- [ ] Postman collection
- [ ] Arquitectura documentada

### **Deploy**
- [ ] Dockerfile creado
- [ ] docker-compose funcionando
- [ ] Variables de entorno de producción
- [ ] Scripts de deploy

---

## 🚨 Puntos Críticos de Atención

### **1. Cambio de Hash de Passwords**
⚠️ **IMPORTANTE:** .NET usa SHA256, Node.js debe usar bcrypt.

**Estrategia de migración:**
- Opción A: Forzar reset de passwords
- Opción B: Implementar hash híbrido (detectar SHA256 y rehash en bcrypt)

### **2. Manejo de Fechas**
- .NET: `DateTime.UtcNow`
- Node.js: `new Date()` o `dayjs`
- SQL Server: Configurar TypeORM con timezone UTC

### **3. Generación de PDFs**
- iText7 es más robusto que pdfkit
- Alternativa: Usar Puppeteer para PDFs complejos
- Implementar caching de PDFs

### **4. Performance**
- .NET generalmente más rápido
- Implementar caching con Redis
- Usar indexación en base de datos
- Implementar pagination en listas

### **5. Migraciones de Base de Datos**
- NO modificar la base de datos existente
- TypeORM debe generar migraciones compatibles
- Testear con datos reales antes de producción

---

## 📊 Criterios de Éxito

La migración será exitosa cuando:

1. ✅ **100% de endpoints funcionando** igual que .NET
2. ✅ **Frontend funcionando sin cambios** (mismos endpoints)
3. ✅ **Tests passing** (>70% coverage)
4. ✅ **Performance similar** o mejor que .NET
5. ✅ **Swagger documentation** completa
6. ✅ **Zero data loss** en migración de BD
7. ✅ **Logs y monitoring** implementados
8. ✅ **Docker containerizado** y funcionando

---

## 🎯 Prompt de Ejecución

**Ahora, como experto en NestJS y TypeScript, necesito que:**

1. **Comiences con Fase 1**: Genera la estructura completa del proyecto con todos los archivos de configuración necesarios (package.json, tsconfig.json, nest-cli.json, .env.example, etc.)

2. **Continúa con Fase 2**: Migra las 14 entidades a TypeORM con todas sus relaciones y validaciones

3. **Avanza fase por fase**: Implementa cada módulo completamente antes de pasar al siguiente

4. **Mantén consistencia**: Sigue exactamente los estándares de código definidos

5. **Documenta todo**: Cada clase, método y endpoint debe tener comentarios claros

6. **Testea progresivamente**: Crea tests unitarios después de cada módulo

¿Estás listo para comenzar con la Fase 1? Por favor confirma y procede con la generación de la estructura inicial del proyecto.

---

## 📚 Referencias Útiles

- **NestJS Docs**: https://docs.nestjs.com
- **TypeORM Docs**: https://typeorm.io
- **Passport JWT**: https://www.passportjs.org/packages/passport-jwt/
- **Class Validator**: https://github.com/typestack/class-validator
- **QRCode**: https://www.npmjs.com/package/qrcode
- **PDFKit**: https://pdfkit.org

---

**Versión del Prompt:** 1.0  
**Fecha:** Noviembre 13, 2025  
**Autor:** Marco Puenayan  
**Proyecto:** EventTicketing Platform Migration

---

*Este prompt está diseñado para ser utilizado con Claude, ChatGPT-4, o cualquier LLM avanzado con capacidad de generación de código. La migración estimada es de 6-8 semanas con un desarrollador full-time.*
