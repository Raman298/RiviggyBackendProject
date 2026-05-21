#!/bin/bash
# PostgreSQL Setup Script for Riviggy Dineout Feature
# Run this script to set up PostgreSQL for the table booking feature

echo "🍽️  Riviggy Dineout - PostgreSQL Setup"
echo "========================================"
echo ""

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL is not installed!"
    echo "Please install PostgreSQL first:"
    echo "  Windows: https://www.postgresql.org/download/windows/"
    echo "  macOS: brew install postgresql"
    echo "  Linux: sudo apt-get install postgresql"
    exit 1
fi

echo "✅ PostgreSQL found!"
psql --version
echo ""

# Get user input
read -p "Enter PostgreSQL password (or press Enter for default): " db_password
db_password=${db_password:-"password"}

read -p "Enter database name (or press Enter for 'riviggy_dineout'): " db_name
db_name=${db_name:-"riviggy_dineout"}

read -p "Enter database user (or press Enter for 'riviggy_user'): " db_user
db_user=${db_user:-"riviggy_user"}

echo ""
echo "Creating database and user..."
echo ""

# Create database and user
psql -U postgres <<EOF
CREATE DATABASE $db_name;
CREATE USER $db_user WITH PASSWORD '$db_password';
ALTER ROLE $db_user SET client_encoding TO 'utf8';
ALTER ROLE $db_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE $db_user SET default_transaction_deferrable TO on;
ALTER ROLE $db_user SET default_transaction_read_only TO off;
GRANT ALL PRIVILEGES ON DATABASE $db_name TO $db_user;
\c $db_name
GRANT ALL PRIVILEGES ON SCHEMA public TO $db_user;
EOF

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Database setup completed successfully!"
    echo ""
    echo "📝 Update your .env file with:"
    echo "DB_HOST=localhost"
    echo "DB_PORT=5432"
    echo "DB_NAME=$db_name"
    echo "DB_USER=$db_user"
    echo "DB_PASSWORD=$db_password"
    echo ""
    echo "Then run: npm run dev"
else
    echo ""
    echo "❌ Error setting up database!"
    echo "Make sure you're running this as admin/superuser."
fi
