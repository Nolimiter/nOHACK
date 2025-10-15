# Updating Frontend Environment Variables in Vercel

This guide explains how to update the frontend's environment variables to connect to the deployed backend.

## Prerequisites

1. A deployed backend on Railway (or another platform)
2. Access to your Vercel project

## Step 1: Get Your Backend URL

After deploying your backend, you'll have a URL like:
`https://your-project-name-production.up.railway.app`

## Step 2: Access Vercel Dashboard

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Find your `nohack` project
3. Click on the project to access its settings

## Step 3: Add Environment Variables

1. Navigate to "Settings" → "Environment Variables"
2. Add the following variable:

| Key | Value |
|-----|-------|
| `NEXT_PUBLIC_API_URL` | `https://your-railway-app-url.up.railway.app/api` |

Replace `https://your-railway-app-url.up.railway.app/api` with your actual backend URL, making sure to include `/api` at the end as the frontend service expects this path.

**Important Notes:**
- The variable must be prefixed with `NEXT_PUBLIC_` to be available on the client-side
- Include `/api` at the end of your backend URL (e.g., if your backend URL is `https://example.up.railway.app`, set the variable to `https://example.up.railway.app/api`)
- Don't forget the `https://` protocol

## Step 4: Redeploy the Frontend

After setting the environment variables:

1. Go to the "Deployments" tab
2. Click on the latest deployment
3. Click "Redeploy" to rebuild the project with the new environment variables

## Step 5: Verify the Connection

1. Once redeployed, visit your frontend site
2. Check the browser console for API connection errors
3. Try logging in/registering to ensure authentication works

## Common Environment Variables for Frontend

| Variable | Purpose | Example |
|----------|---------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API base URL | `https://your-backend-url/api` |
| `NEXT_PUBLIC_WEBSOCKET_URL` | WebSocket connection URL (if needed) | `wss://your-backend-url` |

## Troubleshooting

### If you still see connection errors:

1. **Verify the URL**: Make sure the backend URL is accessible by visiting `https://your-backend-url/health`
2. **Check CORS**: Ensure the backend's `FRONTEND_URL` environment variable matches your frontend URL
3. **Console Errors**: Check the browser console for specific error messages
4. **Network Tab**: Check the Network tab in browser dev tools to see the API calls

### Testing the API

You can test the API endpoints manually:
- Health check: `GET https://your-backend-url/health`
- Register: `POST https://your-backend-url/api/auth/register`
- Login: `POST https://your-backend-url/api/auth/login`

## Security Best Practices

- Never commit API URLs directly in the code
- Use environment variables for all service endpoints
- Regularly review and rotate secrets if necessary
- Ensure HTTPS is used for all API connections in production

## Additional Configuration

If your application requires additional environment variables, you can add them in the same section:

- `NEXT_PUBLIC_SITE_URL` - The frontend URL for redirects
- `NEXT_PUBLIC_BACKEND_WEBSOCKET_URL` - WebSocket connection URL (if applicable)

## Verification Checklist

- [ ] Environment variable `NEXT_PUBLIC_API_URL` is set correctly
- [ ] Backend health endpoint is accessible
- [ ] CORS settings allow requests from frontend URL
- [ ] Frontend has been redeployed after environment variable changes
- [ ] Authentication flows (login/register) work correctly
- [ ] API calls no longer show 404 or connection errors