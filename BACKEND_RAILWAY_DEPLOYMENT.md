# Deploying nOHACK Backend to Railway

This guide will walk you through deploying the nOHACK backend to Railway.

## Prerequisites

1. **Railway Account**: Sign up at [Railway](https://railway.app)
2. **Railway CLI**: Install the Railway CLI
   ```bash
   npm install -g @railway/cli
   ```
3. **GitHub Account**: Your nOHACK repository should be on GitHub

## Step 1: Deploy to Railway

### Option A: Using the Railway Dashboard (Recommended)

1. Go to [Railway Dashboard](https://railway.app/dashboard)
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose the `Nolimiter/nOHACK` repository
5. Select the `main` branch

### Option B: Using the Railway CLI

1. Login to Railway:
   ```bash
   railway login
   ```

2. Create a new project:
   ```bash
   railway init
   ```

3. Link to your repository:
   ```bash
   railway link
   # Select your project if prompted
   ```

4. Set the working directory to the backend:
   ```bash
   railway up -d backend
   ```

## Step 2: Configure Environment Variables

After creating the project, you need to add the required environment variables:

1. Click on your project in the Railway dashboard
2. Go to the "Variables" tab
3. Add the following environment variables:

```
DATABASE_URL=postgresql://username:password@host:port/dbname
REDIS_URL=redis://host:port
JWT_SECRET=your-super-secret-jwt-key-here-make-sure-its-at-least-32-characters-long
BCRYPT_ROUNDS=12
FRONTEND_URL=https://your-frontend-url.vercel.app
NODE_ENV=production
```

### For DATABASE_URL:
1. In your Railway project, click "New" → "Database"
2. Choose "PostgreSQL" 
3. The DATABASE_URL will be automatically populated

### For REDIS_URL:
1. In your Railway project, click "New" → "Database" 
2. Choose "Redis"
3. The REDIS_URL will be automatically populated

### For JWT_SECRET:
Generate a secure secret with at least 32 characters:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### For FRONTEND_URL:
Replace with your actual frontend deployment URL (e.g., `https://nohack.vercel.app`)

## Step 3: Configure Deployment Settings

1. Go to the "Settings" tab in your Railway project
2. Under "Build & Deploy", ensure:
   - Build Command: `cd backend && npm install && npm run build`
   - Start Command: `cd backend && npm start`
   - Working Directory: `backend` (or leave empty if using subdirectory approach)

## Step 4: Run Database Migrations

Before starting the application, you need to run database migrations:

1. Go to the "Deployments" tab
2. Click "New Deployment"
3. Or use the Railway CLI to run migrations:

```bash
railway run -- npx prisma migrate deploy --schema=backend/prisma/schema.prisma
```

If the above doesn't work, you can also run:
```bash
cd backend
npx prisma migrate dev --name init
```

## Step 5: Deploy the Service

1. Go to the "Deployments" tab
2. Click "New Deployment" or wait for automatic deployment
3. Monitor the logs to ensure the service starts successfully

## Step 6: Get the Backend URL

Once deployed successfully:
1. Go to the "Settings" tab
2. Note the "Railway URL" (it will look like `https://your-project-name-production.up.railway.app`)
3. This is the URL you'll use for the frontend configuration

## Step 7: Update Frontend Environment Variables in Vercel

Now that your backend is deployed, update the frontend:

1. Go to your Vercel dashboard
2. Go to your frontend project (nohack)
3. Go to Settings → Environment Variables
4. Add/update the variable:
   ```
   NEXT_PUBLIC_API_URL=https://your-railway-app-url.up.railway.app/api
   ```
   (replace with your actual Railway URL, add `/api` at the end)

## Troubleshooting

### Common Issues:

1. **Database Connection Issues**: Make sure the DATABASE_URL is properly set
2. **Redis Connection Issues**: Verify the REDIS_URL is correct
3. **Migration Issues**: Ensure migrations have run successfully
4. **Port Issues**: The app will use Railway's PORT environment variable automatically

### Environment Variables Check:
Run this command to check if environment variables are set:
```bash
railway run -- env
```

### Checking Logs:
```bash
railway logs
```

## Verification

Once deployed:
1. Visit `https://your-railway-app-url.up.railway.app/health` - should return a health check
2. Check the logs for successful startup
3. Test authentication endpoints if needed

## Additional Considerations

- **Scaling**: For production, consider scaling your database and adding more resources
- **Monitoring**: Set up proper error tracking and monitoring
- **Security**: Regularly update dependencies and rotate secrets
- **Backups**: Configure automated backups for your PostgreSQL database

## Environment Variables Summary

Required environment variables:
- `DATABASE_URL` (from Railway PostgreSQL addon)
- `REDIS_URL` (from Railway Redis addon)
- `JWT_SECRET` (min 32 chars, generated securely)
- `BCRYPT_ROUNDS` (recommended: 12)
- `FRONTEND_URL` (your Vercel frontend URL)
- `NODE_ENV` (set to "production")
- `PORT` (set by Railway, but app defaults to 4000)