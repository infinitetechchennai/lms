# SMARTWAY Production Deployment Guide

## 1. Architecture Overview
Smartway is designed for cloud-native deployment with decoupled client and server tiers:
- **Frontend**: Next.js deployed on Vercel or AWS CloudFront + S3 / ECS.
- **Backend**: Express/Node.js API containerized with Docker, deployed on AWS ECS / Render / Railway.
- **Database**: Managed PostgreSQL (AWS RDS / Neon / Supabase).
- **Asset Storage**: AWS S3 with signed URLs for confidential notes, Cloudflare Stream for short video reels.

---

## 2. Docker Configuration

### Backend Dockerfile (`backend/Dockerfile`)
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json tsconfig.json ./
COPY prisma ./prisma/
RUN npm ci
RUN npx prisma generate
COPY src ./src
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --only=production
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
EXPOSE 5000
CMD ["node", "dist/server.js"]
```

### Frontend Dockerfile (`frontend/Dockerfile`)
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
EXPOSE 3000
ENV PORT=3000
CMD ["node", "server.js"]
```

---

## 3. GitHub Actions CI/CD Pipeline
`.github/workflows/deploy.yml` automates:
1. Automated linting and type-checking on pull requests.
2. Unit and integration tests.
3. Building Docker images and deploying to staging/production clusters upon merging to `main`.

