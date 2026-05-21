@echo off
REM PostgreSQL Setup Script for Riviggy Dineout Feature (Windows)
REM Run this script to set up PostgreSQL for the table booking feature

echo.
echo 🍽️  Riviggy Dineout - PostgreSQL Setup (Windows)
echo ================================================
echo.

REM Check if PostgreSQL is installed
psql --version >nul 2>&1
if errorlevel 1 (
    echo ❌ PostgreSQL is not installed!
    echo.
    echo Please install PostgreSQL from:
    echo https://www.postgresql.org/download/windows/
    echo.
    pause
    exit /b 1
)

echo ✅ PostgreSQL found!
psql --version
echo.

REM Get user input
set /p db_password="Enter PostgreSQL password (or press Enter for 'password'): "
if "%db_password%"=="" set db_password=password

set /p db_name="Enter database name (or press Enter for 'riviggy_dineout'): "
if "%db_name%"=="" set db_name=riviggy_dineout

set /p db_user="Enter database user (or press Enter for 'riviggy_user'): "
if "%db_user%"=="" set db_user=riviggy_user

echo.
echo Creating database and user...
echo.

REM Create database and user
psql -U postgres -c "CREATE DATABASE %db_name%;"
psql -U postgres -c "CREATE USER %db_user% WITH PASSWORD '%db_password%';"
psql -U postgres -c "ALTER ROLE %db_user% SET client_encoding TO 'utf8';"
psql -U postgres -c "ALTER ROLE %db_user% SET default_transaction_isolation TO 'read committed';"
psql -U postgres -c "ALTER ROLE %db_user% SET default_transaction_deferrable TO on;"
psql -U postgres -c "ALTER ROLE %db_user% SET default_transaction_read_only TO off;"
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE %db_name% TO %db_user%;"
psql -U postgres -d %db_name% -c "GRANT ALL PRIVILEGES ON SCHEMA public TO %db_user%;"

if errorlevel 0 (
    echo.
    echo ✅ Database setup completed successfully!
    echo.
    echo 📝 Update your .env file with:
    echo DB_HOST=localhost
    echo DB_PORT=5432
    echo DB_NAME=%db_name%
    echo DB_USER=%db_user%
    echo DB_PASSWORD=%db_password%
    echo.
    echo Then run: npm run dev
) else (
    echo.
    echo ❌ Error setting up database!
    echo Make sure you're running this as administrator.
)

pause
