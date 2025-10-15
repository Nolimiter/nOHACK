# Use the official Node.js runtime as the base image
FROM node:18-alpine AS base

# Set the working directory in the container
WORKDIR /app

# Copy root package files
COPY package*.json ./

# Install root dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Install frontend dependencies specifically
WORKDIR /app/frontend
RUN npm install

# Go back to root and build the frontend
WORKDIR /app
RUN npm run build:frontend

# Go to backend and build it
WORKDIR /app/backend
RUN npm install
RUN npm run build

# Production stage
FROM node:18-alpine AS production

# Set the working directory in the container
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies for root
RUN npm install --only=production

# Create directories
RUN mkdir -p frontend dist backend

# Copy frontend built files
COPY --from=base /app/frontend/package*.json ./frontend/
COPY --from=base /app/frontend/node_modules ./frontend/node_modules
COPY --from=base /app/frontend/.next ./frontend/.next
COPY --from=base /app/frontend/public ./frontend/public
COPY --from=base /app/frontend/out ./frontend/out

# Copy backend built files
COPY --from=base /app/backend/dist ./backend/dist
COPY --from=base /app/backend/package*.json ./backend/
COPY --from=base /app/backend/node_modules ./backend/node_modules
COPY --from=base /app/backend/prisma ./backend/prisma

# Create a non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Change ownership of the app directory to the non-root user
RUN chown -R nextjs:nodejs /app

# Switch to the non-root user
USER nextjs

# Expose the ports the apps run on
EXPOSE 3000 4000

# Run the application
CMD ["npm", "start"]