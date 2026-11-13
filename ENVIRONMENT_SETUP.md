# SMARTWAY Environment Setup Guide

## Prerequisites
- Node.js >= 18.x (v24.x tested & supported)
- npm >= 9.x
- PostgreSQL database (Local instance or Cloud provider like Neon, Supabase, AWS RDS)
- Optional: Redis for caching and background queues

---

## 1. Directory Structure

```
smartway/
├── backend/               # Modular Express.js & TypeScript API Server
│   ├── src/
│   │   ├── config/        # Environment and global configuration
│   │   ├── middleware/    # Auth, validation, error handler, rate limiter
│   │   ├── modules/       # Domain modules (auth, pyq, notes, etc.)
│   │   ├── routes/        # Main route aggregator
│   │   ├── utils/         # Helpers and response standardizers
│   │   └── server.ts      # Server bootstrap
│   ├── prisma/            # Prisma schema, migrations, and seed script
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
├── frontend/              # Next.js 14+ (App Router, Tailwind, TypeScript)
│   ├── src/
│   │   ├── app/           # App router pages (Public, Dashboard, Admin)
│   │   ├── components/    # Reusable UI tokens, cards, modals, navigation
│   │   ├── lib/           # API client, auth context, utilities
│   │   └── types/         # TypeScript interfaces
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.ts
│   └── .env.example
├── package.json           # Root workspace orchestrator
└── README.md
```

---

## 2. Environment Variables

### Backend (`backend/.env`)
```ini
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000

# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/smartway?schema=public"

# JWT Authentication
JWT_SECRET=super-secret-jwt-key-change-in-production-min32chars
JWT_EXPIRES_IN=7d

# Storage (AWS S3)
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=ap-south-1
AWS_S3_BUCKET_NAME=smartway-edtech-assets

# Cloudflare Stream (Videos)
CLOUDFLARE_ACCOUNT_ID=your-cloudflare-account-id
CLOUDFLARE_STREAM_API_TOKEN=your-stream-token
```

### Frontend (`frontend/.env.local`)
```ini
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
NEXT_PUBLIC_APP_NAME="Smartway"
NEXT_PUBLIC_APP_DESCRIPTION="Premium NEET & JEE Learning Platform"
```

---

## 3. Quick Start

1. **Install dependencies:**
   ```bash
   npm run install:all
   ```

2. **Setup Database:**
   ```bash
   cd backend
   npx prisma generate
   npx prisma db push # or npx prisma migrate dev
   npx prisma db seed
   ```

3. **Start Development Servers:**
   ```bash
   # From root directory:
   npm run dev
   ```
   - Frontend runs on: `http://localhost:3000`
   - Backend API runs on: `http://localhost:5000`

