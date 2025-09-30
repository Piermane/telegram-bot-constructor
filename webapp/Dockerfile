FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Expose HTTPS port
EXPOSE 8443

# Start the server
CMD ["npm", "start"]
