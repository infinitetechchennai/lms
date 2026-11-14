import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import fs from 'fs';
import { config } from './config/index.js';
import { apiLimiter } from './middleware/rateLimiter.js';
import { errorHandler } from './middleware/error.js';
import apiRoutes from './routes/index.js';
import { prisma } from './db.js';

export const app = express();

// Ensure local uploads directory exists
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Security and utility middleware (configured to allow media streaming & PDF viewing)
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: false,
  })
);
app.use(
  cors({
    origin: [config.clientUrl, 'http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve uploaded assets (PDF books, videos, thumbnails) statically
app.use('/uploads', express.static(uploadsDir));

if (config.nodeEnv !== 'test') {
  app.use(morgan('dev'));
}

// Apply general API rate limiting
app.use('/api', apiLimiter);

// Mount API routes
app.get('/api/v1', (req, res) => {
  res.json({
    success: true,
    message: 'Smartway API v1 is active and running',
    version: '1.0.0',
  });
});
app.use('/api/v1', apiRoutes);

// Fallback 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Cannot ${req.method} ${req.originalUrl} - Route not found`,
  });
});

// Centralized error handling
app.use(errorHandler);

// Bootstrap server when run directly
if (process.env.NODE_ENV !== 'test') {
  const server = app.listen(config.port, () => {
    console.log(`===============================================`);
    console.log(` Smartway Backend API running on port ${config.port}`);
    console.log(` Environment: ${config.nodeEnv}`);
    console.log(` Base API: http://localhost:${config.port}/api/v1`);
    console.log(`===============================================`);
  });

  // Graceful shutdown
  const shutdown = async () => {
    console.log('\nReceived shutdown signal. Closing HTTP server & database connections...');
    server.close(async () => {
      await prisma.$disconnect();
      console.log('HTTP server and Prisma disconnected cleanly.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

