# Event Ticketing API - Migration Verification Script
# PowerShell version

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Event Ticketing API - Migration Test" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Set-Location $PSScriptRoot

# Step 1: Check if .env exists
Write-Host "[1/6] Checking environment configuration..." -ForegroundColor Yellow
if (-not (Test-Path .env)) {
    Write-Host "Creating .env file from .env.example..." -ForegroundColor Yellow
    Copy-Item .env.example .env
    Write-Host "✓ .env file created!" -ForegroundColor Green
    Write-Host "⚠ Please edit .env file with your database credentials!" -ForegroundColor Red
    Write-Host ""
    pause
} else {
    Write-Host "✓ .env file exists" -ForegroundColor Green
}
Write-Host ""

# Step 2: Check Node.js
Write-Host "[2/6] Checking Node.js installation..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✓ Node.js version: $nodeVersion" -ForegroundColor Green
    
    $npmVersion = npm --version
    Write-Host "✓ npm version: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ ERROR: Node.js is not installed!" -ForegroundColor Red
    Write-Host "Please install Node.js 20+ from https://nodejs.org" -ForegroundColor Red
    pause
    exit 1
}
Write-Host ""

# Step 3: Install dependencies
Write-Host "[3/6] Installing dependencies..." -ForegroundColor Yellow
if (-not (Test-Path node_modules)) {
    Write-Host "Installing npm packages (this may take a few minutes)..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "✗ ERROR: Failed to install dependencies!" -ForegroundColor Red
        pause
        exit 1
    }
    Write-Host "✓ Dependencies installed successfully!" -ForegroundColor Green
} else {
    Write-Host "✓ Dependencies already installed" -ForegroundColor Green
}
Write-Host ""

# Step 4: Build the application
Write-Host "[4/6] Building the application..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ ERROR: Build failed!" -ForegroundColor Red
    Write-Host "Please check for TypeScript errors in the code." -ForegroundColor Red
    pause
    exit 1
}
Write-Host "✓ Application built successfully!" -ForegroundColor Green
Write-Host ""

# Step 5: Check SQL Server
Write-Host "[5/6] Checking SQL Server connection..." -ForegroundColor Yellow
Write-Host "Please ensure SQL Server is running and accessible" -ForegroundColor Cyan
Write-Host "Connection details from .env:" -ForegroundColor Cyan
Write-Host "  - Host: localhost:1433" -ForegroundColor White
Write-Host "  - Database: EventPlanning" -ForegroundColor White
Write-Host "  - User: sa" -ForegroundColor White
Write-Host ""
Write-Host "Press any key to continue with database migrations..." -ForegroundColor Yellow
pause
Write-Host ""

# Step 6: Run migrations
Write-Host "[6/6] Running database migrations..." -ForegroundColor Yellow
npm run migration:run
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠ WARNING: Migrations failed!" -ForegroundColor Red
    Write-Host "Common issues:" -ForegroundColor Yellow
    Write-Host "  1. SQL Server is not running" -ForegroundColor White
    Write-Host "  2. Database 'EventPlanning' doesn't exist" -ForegroundColor White
    Write-Host "  3. Incorrect credentials in .env file" -ForegroundColor White
    Write-Host "  4. SQL Server not accepting TCP/IP connections on port 1433" -ForegroundColor White
    Write-Host ""
    Write-Host "You can continue but the API may not work properly." -ForegroundColor Yellow
    Write-Host ""
    pause
} else {
    Write-Host "✓ Migrations completed successfully!" -ForegroundColor Green
}
Write-Host ""

# Step 7: Start the application
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Starting the application..." -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "API URL: http://localhost:3001" -ForegroundColor Green
Write-Host "Swagger UI: http://localhost:3001/api" -ForegroundColor Green
Write-Host "Health Check: http://localhost:3001/health" -ForegroundColor Green
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

npm run start:dev
