#!/bin/bash

# Setup test database for Validuct

echo "Setting up test database..."

# Create test database (assuming PostgreSQL is running)
psql -U postgres -c "DROP DATABASE IF EXISTS validuct_test;" 2>/dev/null || true
psql -U postgres -c "CREATE DATABASE validuct_test;"

echo "Test database created successfully!"

# Run migrations
echo "Running Prisma migrations..."
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/validuct_test" npx prisma migrate deploy

echo "Test database setup complete!"
