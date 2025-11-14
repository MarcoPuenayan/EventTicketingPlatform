# 🧪 Manual Testing Guide for Event Ticketing API

## Prerequisites Checklist

Before running the API, ensure you have:

- ✅ **Node.js 20+** installed (`node --version`)
- ✅ **npm 10+** installed (`npm --version`)
- ✅ **SQL Server 2019+** running (Express, Developer, or Standard)
- ✅ **Database** created (default: `EventPlanning`)

---

## Quick Start (Automated)

### Option 1: Using PowerShell Script (Recommended)
```powershell
cd c:\Respaldo\Evaluacion_Sr\ticket\EventTicketingPlatform\event-ticketing-api
.\test-migration.ps1
```

### Option 2: Using Batch Script
```cmd
cd c:\Respaldo\Evaluacion_Sr\ticket\EventTicketingPlatform\event-ticketing-api
test-migration.bat
```

---

## Manual Step-by-Step Testing

If you prefer to run each step manually:

### Step 1: Create Environment File
```powershell
# Navigate to project directory
cd c:\Respaldo\Evaluacion_Sr\ticket\EventTicketingPlatform\event-ticketing-api

# Copy .env.example to .env
Copy-Item .env.example .env
```

**Edit `.env` file with your SQL Server credentials:**
```env
DB_HOST=localhost
DB_PORT=1433
DB_USERNAME=sa
DB_PASSWORD=YourPassword
DB_DATABASE=EventPlanning
```

### Step 2: Verify Node.js Installation
```powershell
node --version  # Should show v20.x.x or higher
npm --version   # Should show v10.x.x or higher
```

### Step 3: Install Dependencies
```powershell
npm install
```
This will install all required packages (~200MB, takes 2-5 minutes).

### Step 4: Create Database (if not exists)
```sql
-- Run in SQL Server Management Studio or sqlcmd
CREATE DATABASE EventPlanning;
GO
```

Or using sqlcmd:
```powershell
sqlcmd -S localhost -U sa -P "YourPassword" -Q "CREATE DATABASE EventPlanning"
```

### Step 5: Run Database Migrations
```powershell
npm run migration:run
```

Expected output:
```
query: SELECT * FROM "INFORMATION_SCHEMA"."TABLES"
query: CREATE TABLE "user" (...)
query: CREATE TABLE "event" (...)
...
Migration InitialCreate1699000000000 has been executed successfully.
```

### Step 6: Build the Application
```powershell
npm run build
```

Expected output:
```
Successfully compiled: 150 files with swc (1.2s)
```

### Step 7: Start the Application
```powershell
npm run start:dev
```

Expected output:
```
[Nest] 12345  - 11/14/2025, 10:30:00 AM     LOG [NestFactory] Starting Nest application...
[Nest] 12345  - 11/14/2025, 10:30:01 AM     LOG [InstanceLoader] AppModule dependencies initialized
[Nest] 12345  - 11/14/2025, 10:30:01 AM     LOG [InstanceLoader] TypeOrmModule dependencies initialized
[Nest] 12345  - 11/14/2025, 10:30:02 AM     LOG [RoutesResolver] AuthController {/auth}:
[Nest] 12345  - 11/14/2025, 10:30:02 AM     LOG [RouterExplorer] Mapped {/auth/register, POST} route
[Nest] 12345  - 11/14/2025, 10:30:02 AM     LOG [RouterExplorer] Mapped {/auth/login, POST} route
...
[Nest] 12345  - 11/14/2025, 10:30:03 AM     LOG [NestApplication] Nest application successfully started
[Nest] 12345  - 11/14/2025, 10:30:03 AM     LOG Application is running on: http://localhost:3001
```

---

## Verification Tests

### 1. Health Check
Open browser or use curl:
```powershell
# PowerShell
Invoke-RestMethod http://localhost:3001/health

# Expected response
@{
    status = "ok"
    timestamp = "2025-11-14T10:30:00.000Z"
}
```

### 2. Swagger UI
Open in browser:
```
http://localhost:3001/api
```

You should see the complete API documentation with all endpoints.

### 3. Test User Registration
```powershell
# PowerShell
$body = @{
    email = "test@example.com"
    password = "Test123!"
    firstName = "Test"
    lastName = "User"
    role = "Customer"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3001/auth/register" -Method POST -Body $body -ContentType "application/json"
```

Expected response:
```json
{
  "id": 1,
  "email": "test@example.com",
  "firstName": "Test",
  "lastName": "User",
  "role": "Customer",
  "createdAt": "2025-11-14T10:30:00.000Z"
}
```

### 4. Test User Login
```powershell
$loginBody = @{
    email = "test@example.com"
    password = "Test123!"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:3001/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
$token = $response.access_token
Write-Host "Token: $token"
```

Expected response:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "test@example.com",
    "firstName": "Test",
    "lastName": "User",
    "role": "Customer"
  }
}
```

### 5. Test Protected Endpoint
```powershell
$headers = @{
    Authorization = "Bearer $token"
}

Invoke-RestMethod -Uri "http://localhost:3001/auth/profile" -Method GET -Headers $headers
```

Expected response:
```json
{
  "id": 1,
  "email": "test@example.com",
  "firstName": "Test",
  "lastName": "User",
  "role": "Customer"
}
```

---

## Testing All Features

### Using Postman Collection
1. Open Postman
2. Import `postman-collection.json`
3. Set environment variable: `base_url = http://localhost:3001`
4. Run the collection folders in order:
   - Authentication
   - Events
   - Tickets
   - Promo Codes
   - Analytics

---

## Common Issues and Solutions

### Issue 1: Port 3001 Already in Use
```
Error: listen EADDRINUSE: address already in use :::3001
```

**Solution:**
```powershell
# Find process using port 3001
Get-NetTCPConnection -LocalPort 3001 | Select-Object OwningProcess
Stop-Process -Id <ProcessId>

# Or change port in .env
PORT=3002
```

### Issue 2: Cannot Connect to SQL Server
```
Error: Failed to connect to SQL Server
```

**Solutions:**
1. Verify SQL Server is running:
   ```powershell
   Get-Service MSSQLSERVER
   ```

2. Check TCP/IP is enabled in SQL Server Configuration Manager

3. Verify credentials in `.env` file

4. Test connection:
   ```powershell
   sqlcmd -S localhost -U sa -P "YourPassword"
   ```

### Issue 3: Migration Failed
```
Error: Cannot find module 'typeorm'
```

**Solution:**
```powershell
# Reinstall dependencies
Remove-Item node_modules -Recurse -Force
npm install
```

### Issue 4: TypeScript Build Errors
```
Error: Cannot find name 'Request'
```

**Solution:**
```powershell
# Clean and rebuild
Remove-Item dist -Recurse -Force
npm run build
```

### Issue 5: Database Already Exists Error
```
Error: Database 'EventPlanning' already exists
```

**Solution:**
```powershell
# Either use existing database or drop and recreate
sqlcmd -S localhost -U sa -P "YourPassword" -Q "DROP DATABASE EventPlanning; CREATE DATABASE EventPlanning"

# Then run migrations again
npm run migration:run
```

---

## Performance Testing

### Load Test with Apache Bench (if installed)
```powershell
# Test health endpoint
ab -n 1000 -c 10 http://localhost:3001/health

# Expected results:
# Requests per second: > 500 [#/sec]
# Time per request: < 20ms (mean)
```

### Memory Usage
```powershell
# Check Node.js process memory
Get-Process -Name node | Select-Object WorkingSet

# Expected: ~150-200MB for dev mode
```

---

## Running Tests

### Unit Tests
```powershell
npm test
```

Expected: 68 tests passing

### E2E Tests
```powershell
npm run test:e2e
```

Expected: 3 test suites passing

### Coverage Report
```powershell
npm run test:cov
```

Expected: >70% coverage for all metrics

---

## Stopping the Application

Press `Ctrl + C` in the terminal where the app is running.

---

## Next Steps After Successful Test

1. ✅ **API is working** - Proceed to frontend integration
2. ✅ **Import Postman collection** - Test all endpoints
3. ✅ **Review Swagger docs** - Understand API structure
4. ✅ **Run full test suite** - Verify all features
5. ✅ **Deploy to staging** - Follow DEPLOYMENT_GUIDE.md

---

## Success Criteria

The migration is successful if:

✅ Application starts without errors  
✅ Health check returns 200 OK  
✅ Swagger UI loads at /api  
✅ User registration works  
✅ User login returns JWT token  
✅ Protected endpoints require authentication  
✅ Database has all 14 tables created  
✅ All 68 unit tests pass  
✅ All 3 E2E test suites pass

---

## Support

If you encounter issues not covered here:

1. Check `DEPLOYMENT_GUIDE.md` for detailed troubleshooting
2. Review `API_DOCUMENTATION.md` for endpoint details
3. Check application logs in console output
4. Verify all prerequisites are met

---

**Last Updated**: November 14, 2025  
**Version**: 1.0.0  
**Status**: Ready for Testing
