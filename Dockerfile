# Dockerfile for Railway deployment
# This builds backend service only
FROM node:18-alpine

# Install Python for bot generation
RUN apk add --no-cache python3 py3-pip
RUN pip3 install --break-system-packages python-telegram-bot==20.7

WORKDIR /app

# Build frontend first
COPY frontend/package*.json ./frontend/
RUN cd frontend && npm ci

# Force rebuild with timestamp (invalidates Docker cache)
ARG FRONTEND_BUILD_DATE=2025-10-02
ENV FRONTEND_BUILD_DATE=${FRONTEND_BUILD_DATE}

COPY frontend/ ./frontend/
RUN cd frontend && npm run build

# Copy backend
COPY backend/package*.json ./
RUN npm ci --only=production

COPY backend/src ./src

# Serve frontend build from backend
RUN mkdir -p public && cp -r frontend/build/* public/ 2>/dev/null || true
RUN mkdir -p logs deployed_bots

# Create user
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001
RUN chown -R nodejs:nodejs /app
USER nodejs

EXPOSE 5555

CMD ["npm", "start"]
