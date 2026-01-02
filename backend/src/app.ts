import express, { Application } from 'express';
import cors from 'cors';
import { config } from './config/env.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import { generalLimiter } from './middleware/rateLimiter.js';
import { isRedisConnected } from './config/redis.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import ideaRoutes from './routes/ideaRoutes.js';
import voteRoutes from './routes/voteRoutes.js';
import commentRoutes from './routes/commentRoutes.js';

const app: Application = express();

// Middleware
// For development: allow all origins. For production: specify allowed origins
const corsOptions = {
  origin: config.CORS_ORIGIN === '*' ? true : config.CORS_ORIGIN,
  credentials: true,
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Global rate limiter for GET requests
app.use(generalLimiter);

// Health check route
app.get('/health', (_req, res) => {
  const redisStatus = isRedisConnected();
  res.status(redisStatus ? 200 : 503).json({
    success: redisStatus,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    services: {
      redis: redisStatus ? 'connected' : 'disconnected',
    },
  });
});

// API routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/ideas', ideaRoutes);
app.use('/api/v1', voteRoutes);
app.use('/api/v1', commentRoutes);

// Error handlers
app.use(notFound);
app.use(errorHandler);

export default app;
