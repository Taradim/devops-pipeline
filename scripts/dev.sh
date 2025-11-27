#!/bin/bash

# Development startup script for Acquisition App with Neon Local
# This script starts the application in development mode with Neon Local

echo "🚀 Starting Acquisition App in Development Mode"
echo "================================================"

# Check if .env.development exists
if [ ! -f .env.development ]; then
    echo "❌ Error: .env.development file not found!"
    echo "   Please copy .env.development from the template and update with your Neon credentials."
    exit 1
fi

# Check if Docker is running
if ! docker info >/dev/null 2>&1; then
    echo "❌ Error: Docker is not running!"
    echo "   Please start Docker Desktop and try again."
    exit 1
fi

# Create .neon_local directory if it doesn't exist
mkdir -p .neon_local

# Add .neon_local to .gitignore if not already present
if ! grep -q ".neon_local/" .gitignore 2>/dev/null; then
    echo ".neon_local/" >> .gitignore
    echo "✅ Added .neon_local/ to .gitignore"
fi

echo "📦 Building and starting development containers..."
echo "   - Neon Local proxy will create an ephemeral database branch"
echo "   - Application will run with hot reload enabled"
echo ""

# Start containers in detached mode first
echo "🚀 Starting Docker containers..."
docker compose -f docker-compose.dev.yml up --build -d

# Wait for Neon Local to be ready
echo "⏳ Waiting for Neon Local database to be ready..."
timeout=60
counter=0
while ! docker compose -f docker-compose.dev.yml exec -T neon-local pg_isready -U neon -d neondb >/dev/null 2>&1; do
    if [ $counter -ge $timeout ]; then
        echo "❌ Error: Database did not become ready within $timeout seconds"
        docker compose -f docker-compose.dev.yml logs neon-local
        exit 1
    fi
    echo "   Waiting for database... ($counter/$timeout)"
    sleep 2
    counter=$((counter + 2))
done
echo "✅ Database is ready!"

# Run migrations with Drizzle from inside the app container
echo "📜 Applying latest schema with Drizzle..."
docker compose -f docker-compose.dev.yml exec app npm run db:migrate

# Show success message and connection info
echo ""
echo "🎉 Development environment started!"
echo "   Application: http://localhost:3000"
echo "   Health check: http://localhost:3000/health"
echo "   Database: postgres://neon:npg@localhost:5432/neondb"
echo ""

# Show logs and follow them
echo "📋 Following container logs (Ctrl+C to stop and cleanup)..."
echo ""
trap 'echo ""; echo "🛑 Stopping development environment..."; docker compose -f docker-compose.dev.yml down; echo "✅ Development environment stopped!"' INT TERM
docker compose -f docker-compose.dev.yml logs -f