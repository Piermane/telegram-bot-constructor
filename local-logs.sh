#!/bin/bash

# TelegramBot Constructor - Logs Viewer Script

echo "📋 TelegramBot Constructor - Logs Viewer"
echo "======================================="

# Function to show service logs
show_logs() {
    local service=$1
    echo "📊 Logs for $service:"
    echo "-------------------"
    docker-compose logs --tail=50 $service
    echo ""
}

# Check if specific service is requested
if [ "$1" != "" ]; then
    case $1 in
        "frontend"|"f")
            show_logs "frontend"
            ;;
        "backend"|"b")
            show_logs "backend"
            ;;
        "postgres"|"db")
            show_logs "postgres"
            ;;
        "redis"|"r")
            show_logs "redis"
            ;;
        "bot-runtime"|"bot"|"runtime")
            show_logs "bot-runtime"
            ;;
        "pgadmin"|"admin")
            show_logs "pgadmin"
            ;;
        "all"|"a")
            echo "📊 All services logs:"
            docker-compose logs --tail=30
            ;;
        "follow"|"tail"|"live")
            echo "📊 Following all logs (Ctrl+C to stop):"
            docker-compose logs -f
            ;;
        *)
            echo "❌ Unknown service: $1"
            echo ""
            echo "Available services:"
            echo "  frontend, f       - Frontend React app"
            echo "  backend, b        - Backend API server"
            echo "  postgres, db      - PostgreSQL database"
            echo "  redis, r          - Redis cache"
            echo "  bot-runtime, bot  - Bot runtime service"
            echo "  pgadmin, admin    - pgAdmin interface"
            echo "  all, a            - All services"
            echo "  follow, tail      - Follow all logs live"
            exit 1
            ;;
    esac
else
    # Interactive menu
    echo "Select service to view logs:"
    echo "1) Frontend (React)"
    echo "2) Backend (API)"
    echo "3) PostgreSQL"
    echo "4) Redis"
    echo "5) Bot Runtime"
    echo "6) pgAdmin"
    echo "7) All services"
    echo "8) Follow all logs (live)"
    echo "9) Service status"
    echo ""
    read -p "Enter choice (1-9): " choice

    case $choice in
        1)
            show_logs "frontend"
            ;;
        2)
            show_logs "backend"
            ;;
        3)
            show_logs "postgres"
            ;;
        4)
            show_logs "redis"
            ;;
        5)
            show_logs "bot-runtime"
            ;;
        6)
            show_logs "pgadmin"
            ;;
        7)
            echo "📊 All services logs:"
            docker-compose logs --tail=30
            ;;
        8)
            echo "📊 Following all logs (Ctrl+C to stop):"
            docker-compose logs -f
            ;;
        9)
            echo "📊 Service Status:"
            docker-compose ps
            echo ""
            echo "🔍 Container Details:"
            docker-compose top
            ;;
        *)
            echo "❌ Invalid choice"
            ;;
    esac
fi

echo ""
echo "💡 Tip: Use './logs.sh follow' to see live logs"
echo "💡 Tip: Use './logs.sh backend' to see specific service logs"
