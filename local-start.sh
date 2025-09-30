#!/bin/bash

# TelegramBot Constructor - Development Environment Startup Script

set -e

echo "🤖 TelegramBot Constructor - DEV Environment"
echo "=============================================="

# Check if Docker is running
if ! docker info >/dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Check if Docker Compose is available
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install it and try again."
    exit 1
fi

echo "✅ Docker is running"

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p database/data
mkdir -p database/init
mkdir -p backend/logs
mkdir -p bot-runtime/logs

# Check if .env files exist, create defaults if not
if [ ! -f backend/.env ]; then
    echo "📝 Creating backend .env file..."
    cat > backend/.env << EOF
NODE_ENV=development
DATABASE_URL=postgresql://postgres:postgres123@postgres:5432/telegram_bot_constructor
REDIS_URL=redis://redis:6379
JWT_SECRET=dev-jwt-secret-key-change-in-production
PORT=5555
CORS_ORIGIN=http://localhost:3000
EOF
fi

if [ ! -f frontend/.env ]; then
    echo "📝 Creating frontend .env file..."
    cat > frontend/.env << EOF
REACT_APP_API_URL=http://localhost:5555
REACT_APP_WS_URL=ws://localhost:5555
PORT=3000
EOF
fi

# Stop any running containers
echo "🛑 Stopping existing containers..."
docker-compose down --remove-orphans

# Pull latest images
echo "📥 Pulling latest images..."
docker-compose pull

# Build and start services
echo "🔨 Building and starting services..."
docker-compose up --build -d

# Wait for services to be healthy
echo "⏳ Waiting for services to start..."

# Wait for PostgreSQL
echo "📊 Waiting for PostgreSQL..."
timeout 60s bash -c 'until docker-compose exec -T postgres pg_isready -U postgres; do sleep 2; done'

# Wait for Redis
echo "🗄️ Waiting for Redis..."
timeout 30s bash -c 'until docker-compose exec -T redis redis-cli ping; do sleep 1; done'

# Wait for Backend
echo "🔧 Waiting for Backend API..."
timeout 60s bash -c 'until curl -f http://localhost:5555/health >/dev/null 2>&1; do sleep 2; done'

# Wait for Frontend
echo "🎨 Waiting for Frontend..."
timeout 60s bash -c 'until curl -f http://localhost:3000 >/dev/null 2>&1; do sleep 2; done'

echo ""
echo "🎉 All services are running!"
echo ""
echo "📱 Access your services:"
echo "   Frontend (Bot Builder):  http://localhost:3000"
echo "   Backend API:             http://localhost:5555"
echo "   pgAdmin (Database):      http://localhost:8080"
echo "   API Documentation:       http://localhost:5555/docs"
echo ""
echo "🔐 pgAdmin credentials:"
echo "   Email:    admin@tbc.dev"
echo "   Password: admin123"
echo ""
echo "💾 Database connection:"
echo "   Host:     localhost"
echo "   Port:     5432"
echo "   Database: telegram_bot_constructor"
echo "   Username: postgres"
echo "   Password: postgres123"
echo ""
echo "📊 Service Status:"
docker-compose ps

echo ""
echo "🚀 Your TelegramBot Constructor DEV environment is ready!"
echo "📖 Open http://localhost:3000 to start building bots"
echo ""
echo "🔧 Useful commands:"
echo "   ./stop.sh              - Stop all services"
echo "   ./logs.sh              - View logs"
echo "   docker-compose ps      - Check service status"
echo "   docker-compose logs -f - Follow all logs"
echo ""
