# nOHACK Backend

The backend server for nOHACK - a multiplayer cybersecurity simulation game.

## Features

- **User Authentication**: JWT-based authentication system
- **WebSocket Integration**: Real-time game events and chat
- **Database Management**: PostgreSQL with Prisma ORM
- **Redis Integration**: Caching and session management
- **Rate Limiting**: Protection against abuse
- **Security**: Helmet, CORS, and other security measures

## Tech Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL (with Prisma ORM)
- **Cache**: Redis
- **WebSocket**: Socket.io
- **Authentication**: Passport.js with JWT
- **Validation**: Zod
- **Queue Processing**: Bull (Redis-based)

## Environment Variables

Create a `.env` file based on `.env.example`:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/nohack_db"

# Redis
REDIS_URL="redis://localhost:6379"

# JWT
JWT_SECRET="your-super-secret-jwt-key-here-make-sure-its-at-least-32-characters-long"

# Bcrypt
BCRYPT_ROUNDS=12

# Frontend URL (for CORS)
FRONTEND_URL="http://localhost:3000"

# Port
PORT=4000
```

## Getting Started

### Prerequisites

- Node.js (>= 18.0.0)
- PostgreSQL
- Redis

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd nohack-backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables (see above)

4. Run database migrations:
   ```bash
   npx prisma migrate dev
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

### Production Build

1. Build the project:
   ```bash
   npm run build
   ```

2. Start the production server:
   ```bash
   npm start
   ```

## Available Scripts

- `npm run dev` - Start development server with auto-reload
- `npm run build` - Compile TypeScript to JavaScript
- `npm start` - Start production server
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:migrate` - Run Prisma migrations
- `npm test` - Run unit tests
- `npm test:watch` - Run tests in watch mode

## API Endpoints

- `GET /health` - Health check endpoint
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/test-auth` - Test authentication middleware

## Deployment

### Vercel (Note: This is for frontend deployment typically)

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Link your project:
   ```bash
   vercel
   ```

### Alternative Deployment Options
For backend deployments, consider:
- Railway
- Render
- Heroku
- DigitalOcean App Platform
- AWS/Azure/GCP

## Project Structure

```
src/
├── config/          # Configuration files
├── controllers/     # Route controllers
├── middleware/      # Express middleware
├── routes/          # API route definitions
├── services/        # Business logic
├── socket/          # WebSocket handlers
├── utils/           # Utility functions
├── validators/      # Input validation
└── server.ts        # Entry point
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Commit your changes (`git commit -m 'Add some amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a pull request

## License

MIT License - see the [LICENSE](../LICENSE) file for details.