# nOHACK Project Context

## Project Overview

nOHACK is a multiplayer web-based game simulator in the style of a hacker simulator. It features a Multi-Page Application (MPA) architecture where each function has its own page for better SEO and performance. Players take on the role of hackers conducting cyber attacks, defending their systems, developing infrastructure, and competing for dominance in cyberspace.

The project is structured as a full-stack application with:
- **Frontend**: Next.js (Pages Router), React, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express.js, TypeScript, Socket.io
- **Databases**: PostgreSQL, Redis
- **ORM**: Prisma
- **Authentication**: JWT, Passport.js
- **Containerization**: Docker, Docker Compose
- **Web Server**: Nginx

## Project Structure

The application follows a monorepo structure with the following key directories:

```
nOHACK/
├── frontend/                    # Next.js frontend
│   ├── public/
│   ├── src/
│   │   ├── pages/              # Pages (MPA routing)
│   │   ├── components/         # Components
│   │   ├── hooks/              # Custom hooks
│   │   ├── stores/             # Zustand stores
│   │   ├── services/           # API services
│   │   ├── utils/              # Utilities
│   │   └── types/              # TypeScript types
│   ├── package.json
│   └── next.config.js
├── backend/                    # Node.js backend
│   ├── src/
│   │   ├── server.ts           # Entry point
│   │   ├── config/             # Configurations
│   │   ├── controllers/        # Route controllers
│   │   ├── routes/             # Express routes
│   │   ├── services/           # Business logic
│   │   ├── socket/             # WebSocket handlers
│   │   ├── middleware/         # Express middleware
│   │   ├── validators/         # Validators (Zod)
│   │   ├── models/             # Models (if needed)
│   │   ├── jobs/               # Background jobs (Bull)
│   │   ├── cron/               # Task scheduling
│   │   ├── utils/              # Utilities
│   │   └── types/              # TypeScript types
│   ├── prisma/
│   ├── tests/
│   ├── package.json
│   └── tsconfig.json
├── shared/                     # Shared code
├── docker/                     # Docker configurations
├── nginx/                      # Nginx configuration
├── scripts/                    # Utility scripts
├── docs/                       # Documentation
├── .github/
├── docker-compose.yml
├── README.md
└── package.json
```

## Building and Running

### Local Development

1. Clone the repository:
```bash
git clone <repository-url>
cd nOHACK
```

2. Install dependencies:
```bash
npm install
cd frontend && npm install
cd ../backend && npm install
```

3. Create .env files based on .env.example

4. Run databases (if not using Docker):
```bash
# Start PostgreSQL and Redis
```

5. Run database migrations:
```bash
cd backend
npx prisma migrate dev
```

6. Start the application:
```bash
npm run dev
```

### Production Deployment

The project supports multiple deployment methods:

1. **Docker Compose Deployment**:
```bash
docker-compose -f docker-compose.prod.yml up -d
```

2. **Railway Deployment**: The project includes a `railway.toml` file configured to build and deploy only the backend service with the following settings:
   - Builder: NIXPACKS
   - Build command: `cd backend && npm install && npx prisma generate && npm run build`
   - Start command: `cd backend && npm start`
   - Node.js version: 18.20.8

## Development Conventions

- **TypeScript**: Type safety is enforced throughout the codebase
- **Prisma ORM**: Database schema is managed via Prisma
- **Socket.io**: Real-time features are implemented using WebSockets
- **JWT Authentication**: Session management uses JWT tokens
- **Zod Validation**: Request validation is performed using Zod
- **Environment Validation**: All required environment variables are validated at startup

### Key Scripts

- `npm run dev`: Starts both frontend and backend in development mode
- `npm run build`: Builds both frontend and backend
- `npm run start`: Starts the backend server only
- `npm run test`: Runs backend tests
- `npm run lint`: Runs linting on both frontend and backend
- `npm run prisma:generate`: Generates Prisma client
- `npm run prisma:migrate`: Runs Prisma database migrations

## Key Features

- **Hacking System**: Multiple attack types (DDoS, SQL injection, ransomware, zero days)
- **Defense System**: Firewall management, IDS/IPS, incident response system
- **Economic System**: Marketplace, currencies (BTC, REP, DMT), auction system
- **Progress System**: Skill tree, technology tree, achievements
- **Multiplayer Interaction**: Guilds, PvP, bounty system, tournaments
- **Social Features**: Chat, friends, messaging system
- **Real-time**: Interactive features via WebSocket

## Architecture Notes

1. **Backend Architecture**: Express.js server with TypeScript, proper error handling middleware, authentication middleware, and WebSocket integration.

2. **Database Schema**: Prisma schema includes models for Users, Guilds, GuildWars, Skills, Items, Inventory, Operations, Attacks, Defense systems, Missions, Achievements, Friendships, Messages, and more.

3. **Environment Configuration**: The app validates essential environment variables including DATABASE_URL, REDIS_URL, JWT_SECRET, and BCRYPT_ROUNDS.

4. **Containerization**: Complete Docker Compose setup includes PostgreSQL, Redis, Backend API, Frontend, and Nginx reverse proxy.

## Deployment Notes

- The backend requires environment variables: DATABASE_URL, REDIS_URL, JWT_SECRET, BCRYPT_ROUNDS, FRONTEND_URL
- For Railway deployment, only the backend service is configured to build, as the frontend build was failing due to Next.js not being found
- The Railway configuration specifically runs `npx prisma generate` as part of the build process to ensure Prisma client is generated

## Backend Fixes and Improvements

Recent updates have resolved TypeScript compilation errors in the backend by:

- **Added GuildMember Model**: Created a new GuildMember model in Prisma schema to properly handle relationships between Users and Guilds, including proper relation naming and bidirectional references.
- **Fixed Guild Relations**: Updated all guild-related methods in `guild.service.ts` to use the new `guildMembers` relation instead of the old `members` relation.
- **Added Missing Functions**: Added `calculateMarketPrice` function to `src/utils/gameLogic.ts` that was referenced but missing.
- **Fixed Prisma Schema Issues**: Fixed relation naming conflicts in the GuildWar model and ensured proper bidirectional relations.
- **Improved Error Handling**: Enhanced error handling in `hacking.service.ts` with proper null checks and error type checking.
- **Updated Socket Handlers**: Fixed missing imports and variable references in `market.handler.ts`.
- **Return Type Corrections**: Updated return types in `social.service.ts` to match actual returned data structures.

These changes ensure the backend compiles successfully to the `dist` directory and can be deployed without TypeScript errors.