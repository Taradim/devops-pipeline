#!/bin/bash

# Production startup script for Acquisition App
# This script starts the application in production mode with a classic database

echo "🚀 Starting Acquisition App in Production Mode"
echo "================================================"

# Check if .env.production exists
if [ ! -f .env.production ]; then
    echo "❌ Error: .env.production file not found!"
    echo "   Please copy .env.production from the template and update with your database credentials."
    exit 1
fi

# Check if Docker is running
if ! docker info >/dev/null 2>&1; then
    echo "❌ Error: Docker is not running!"
    echo "   Please start Docker Desktop and try again."
    exit 1
fi

echo "📦 Building and starting production containers..."
echo "   - Application will run in production mode"
echo "   - Using classic database connection from DATABASE_URL"
echo ""

# Start containers in detached mode first
echo "🚀 Starting Docker containers..."
docker compose -f docker-compose.prod.yml up --build -d

# Wait for the app container to be ready
echo "⏳ Waiting for application to be ready..."
timeout=60
counter=0
while ! docker compose -f docker-compose.prod.yml exec -T app node -e "console.log('ready')" >/dev/null 2>&1; do
    if [ $counter -ge $timeout ]; then
        echo "❌ Error: Application container did not become ready within $timeout seconds"
        docker compose -f docker-compose.prod.yml logs app
        exit 1
    fi
    echo "   Waiting for application... ($counter/$timeout)"
    sleep 2
    counter=$((counter + 2))
done
echo "✅ Application container is ready!"

# Run migrations with Drizzle from inside the app container
echo "📜 Applying latest schema with Drizzle..."
if docker compose -f docker-compose.prod.yml exec app npm run db:migrate; then
    echo "✅ Migrations applied successfully!"
else
    echo "⚠️  Warning: Migrations may have failed. Check the logs above."
    echo "   This might be normal if the database is not yet accessible or migrations were already applied."
fi

# Show success message and connection info
echo ""
echo "🎉 Production environment started!"
echo "   Application: http://localhost:3000"
echo "   Health check: http://localhost:3000/health"
echo ""

# Show logs and follow them
echo "📋 Following container logs (Ctrl+C to stop and cleanup)..."
echo ""
trap 'echo ""; echo "🛑 Stopping production environment..."; docker compose -f docker-compose.prod.yml down; echo "✅ Production environment stopped!"' INT TERM
docker compose -f docker-compose.prod.yml logs -f

