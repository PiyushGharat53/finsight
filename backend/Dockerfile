# Stage 1: Build environment
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# Stage 2: Production environment
FROM node:20-alpine
WORKDIR /app

# Copy built artifacts and node_modules from the builder stage
COPY --from=builder /app ./

# Best Practice: Run as a secure, non-root user
USER node

EXPOSE 5000

# Best Practice: Use CMD to execute node directly instead of npm start
CMD ["node", "server.js"]