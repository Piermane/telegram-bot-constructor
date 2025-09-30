FROM node:18-alpine

# Install Python3 and pip
RUN apk add --no-cache python3 py3-pip

# Set working directory
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY src/ ./src/

# Create directories
RUN mkdir -p logs deployed_bots

# Install Python telegram bot library globally (force system packages)
RUN pip3 install --break-system-packages python-telegram-bot==20.7

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Change ownership of the app directory
RUN chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 5555

# Health check disabled for now
# HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
#   CMD wget --no-verbose --tries=1 --spider http://localhost:5000/health || exit 1

# Start the application
CMD ["npm", "start"]
