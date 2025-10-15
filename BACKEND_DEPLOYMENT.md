# Backend Deployment Guide

This guide explains how to deploy the nOHACK backend to various platforms.

## Deployment Platforms

### 1. Railway (Recommended)

Railway is an excellent platform for deploying Node.js APIs with integrated PostgreSQL and Redis.

1. Sign up at [Railway](https://railway.app)
2. Create a new project and connect to your GitHub repository
3. Set the deployment type to "Deploy from GitHub"
4. Select the `nOHACK` repository
5. For the root directory, specify `backend`
6. Add the following environment variables in the "Variables" section:
   ```
   DATABASE_URL=postgresql://username:password@host:port/dbname
   REDIS_URL=redis://host:port
   JWT_SECRET=your-super-secret-jwt-key-here-make-sure-its-at-least-32-characters-long
   BCRYPT_ROUNDS=12
   FRONTEND_URL=https://your-frontend-url.vercel.app
   PORT=8080
   ```
7. In the "Settings" → "Environment" section, ensure the build command is:
   - Build Command: `npm run build`
   - Start Command: `npm start`
8. Create PostgreSQL and Redis services using Railway's add-ons
9. Deploy the service

### 2. Render

Render is another great option for deploying Node.js APIs.

1. Sign up at [Render](https://render.com)
2. Create a new "Web Service"
3. Connect to your GitHub repository
4. Choose the `nOHACK` repository
5. For the root directory, specify `backend`
6. Environment:
   - Environment: Node
   - Region: Choose your preferred region
7. Plan: Free or Paid (for static IP)
8. Add environment variables:
   ```
   DATABASE_URL
   REDIS_URL
   JWT_SECRET
   BCRYPT_ROUNDS
   FRONTEND_URL
   NODE_ENV=production
   ```
9. Build command: `npm run build`
10. Start command: `npm start`
11. Health check path: `/health`

### 3. Heroku (Legacy but still functional)

1. Sign up at [Heroku](https://heroku.com)
2. Install Heroku CLI
3. Create a new app:
   ```bash
   heroku create your-app-name
   ```
4. Set environment variables:
   ```bash
   heroku config:set DATABASE_URL=your_db_url
   heroku config:set REDIS_URL=your_redis_url
   heroku config:set JWT_SECRET=your_secret
   heroku config:set BCRYPT_ROUNDS=12
   heroku config:set FRONTEND_URL=your_frontend_url
   ```
5. Deploy:
   ```bash
   git push heroku main
   ```

## Deployment Configuration Notes

### Prisma Setup
When deploying to production, you'll need to ensure Prisma migrations run properly:

1. Add this to your deployment scripts if needed:
   ```bash
   npx prisma migrate deploy
   npx prisma generate
   ```

2. Your production database URL should be set as an environment variable on your deployment platform.

### Database Migrations
Before deploying to production, ensure all your database migrations are complete:

```bash
cd backend
npx prisma migrate dev  # For development
npx prisma migrate deploy  # For production
```

### Redis Setup
Ensure your Redis instance is properly configured with:
- Appropriate memory limits
- Persistence settings
- Security settings (password protection if required)

## Environment Variables Required

All deployments require these environment variables:

- `DATABASE_URL`: PostgreSQL connection string
- `REDIS_URL`: Redis connection string
- `JWT_SECRET`: Secret for JWT token signing (min 32 chars)
- `BCRYPT_ROUNDS`: Number of bcrypt rounds for password hashing (typically 12)
- `FRONTEND_URL`: URL of your frontend application for CORS
- `NODE_ENV`: Set to "production" for production deployments
- `PORT`: Port number (platforms typically set this automatically)

## Health Checks

The backend includes a health check endpoint at:
- `GET /health`

Response example:
```json
{
  "status": "OK",
  "timestamp": "2023-10-15T10:30:00.000Z"
}
```

## Build Process

The backend follows this build process:

1. Install dependencies: `npm install`
2. Generate Prisma client: `npx prisma generate`
3. Compile TypeScript: `npm run build` (compiles to `dist` folder)
4. Start server: `npm start` (runs `node dist/server.js`)

## Running Migrations in Production

For production deployments, you might want to run migrations as a separate step:

```bash
# Run this in your deployment pipeline before starting the app
npx prisma migrate deploy
npx prisma generate
```

## Monitoring and Logging

The backend uses console logging for basic monitoring. For production deployments, consider:

1. Setting up log aggregation
2. Implementing structured logging
3. Adding application monitoring (New Relic, Datadog, etc.)
4. Setting up error tracking (Sentry, etc.)

## Scaling Considerations

Since this is a multiplayer game backend:

1. Ensure your database has appropriate scaling
2. Redis should be properly sized for session storage and caching
3. Consider horizontal scaling for web socket connections
4. Implement proper load balancing if needed