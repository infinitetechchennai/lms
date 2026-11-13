import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from './config/index.js';
import { apiLimiter } from './middleware/rateLimiter.js';
import { errorHandler } from './middleware/error.js';
import apiRoutes from './routes/index.js';
import { prisma } from './db.js';

export const app = express();

// Security and utility middleware
app.use(helmet());
app.use(
  cors({
    origin: [config.clientUrl, 'http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

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

