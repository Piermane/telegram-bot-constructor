#!/bin/bash

# TelegramBot Constructor - Development Environment Stop Script

set -e

echo "🛑 Stopping TelegramBot Constructor DEV Environment"
echo "=================================================="

# Stop all services
echo "🔧 Stopping all services..."
docker-compose down

echo ""
echo "📊 Removing containers..."
docker-compose rm -f

echo ""
echo "🧹 Cleaning up unused images (optional)..."
read -p "Do you want to remove unused Docker images? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    docker image prune -f
    echo "✅ Unused images removed"
fi

echo ""
echo "💾 Database and volume cleanup..."
read -p "Do you want to remove all data (database, logs, etc.)? This will DELETE ALL DATA! (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🗑️ Removing volumes and data..."
    docker-compose down -v
    docker volume prune -f
    
    # Remove log files
    rm -rf backend/logs/*
    rm -rf bot-runtime/logs/*
    
    echo "⚠️ All data has been removed!"
else
    echo "💾 Data preserved"
fi

echo ""
echo "✅ TelegramBot Constructor DEV environment stopped"
echo ""
echo "🚀 To start again, run: ./start.sh"
