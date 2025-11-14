@echo off
echo ========================================
echo Event Ticketing API - Migration Test
echo ========================================
echo.

cd /d "%~dp0"

REM Step 1: Check if .env exists
echo [1/6] Checking environment configuration...
if not exist .env (
    echo Creating .env file from .env.example...
    copy .env.example .env
    echo Please edit .env file with your database credentials!
    echo.
    pause
)

REM Step 2: Check Node.js
echo [2/6] Checking Node.js installation...
node --version
if errorlevel 1 (
    echo ERROR: Node.js is not installed!
    echo Please install Node.js 20+ from https://nodejs.org
    pause
    exit /b 1
)
echo.

REM Step 3: Install dependencies
echo [3/6] Installing dependencies...
if not exist node_modules (
    echo Installing npm packages...
    call npm install
    if errorlevel 1 (
        echo ERROR: Failed to install dependencies!
        pause
        exit /b 1
    )
) else (
    echo Dependencies already installed.
)
echo.

REM Step 4: Check SQL Server
echo [4/6] Checking SQL Server connection...
echo Please ensure SQL Server is running and accessible at localhost:1433
echo Default credentials: sa / P@ssw0rd123!
echo.
pause

REM Step 5: Run migrations
echo [5/6] Running database migrations...
call npm run migration:run
if errorlevel 1 (
    echo WARNING: Migrations failed! Check database connection.
    echo You can continue but the API may not work properly.
    echo.
    pause
)
echo.

REM Step 6: Start the application
echo [6/6] Starting the application...
echo.
echo ========================================
echo The API will start on http://localhost:3001
echo Swagger documentation: http://localhost:3001/api
echo Press Ctrl+C to stop the server
echo ========================================
echo.

call npm run start:dev

pause
