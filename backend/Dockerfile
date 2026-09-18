# Stage 1: Build & Install Dependencies
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package manifests first to leverage Docker layer caching
COPY package*.json ./

# Install clean production dependencies
RUN npm ci

# Copy full application source code
COPY . .

# Stage 2: Production Execution Environment
FROM node:18-alpine

WORKDIR /app

# Copy built code from builder stage
COPY --from=builder /app ./

# Expose backend service port
EXPOSE 5000

# Security practice: Run container as non-root user
USER node

# Launch the Express server
CMD ["node", "server.js"]