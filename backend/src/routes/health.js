const express = require('express');
const db = require('../utils/database');
const redis = require('../utils/redis');
const logger = require('../utils/logger');

const router = express.Router();

// Basic health check
router.get('/', async (req, res) => {
  try {
    const healthCheck = {
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      message: 'TelegramBot Constructor API is running',
      version: '1.0.0',
    };

    res.status(200).json(healthCheck);
  } catch (error) {
    logger.error('Health check error:', error);
    res.status(503).json({
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      message: 'Service unavailable',
    });
  }
});

// Detailed readiness check
router.get('/ready', async (req, res) => {
  const checks = {
    database: false,
    redis: false,
    overall: false,
  };

  let httpStatus = 200;

  try {
    // Check database connection
    try {
      await db.testConnection();
      checks.database = true;
    } catch (error) {
      logger.error('Database health check failed:', error);
      checks.database = false;
      httpStatus = 503;
    }

    // Check Redis connection
    try {
      await redis.testConnection();
      checks.redis = true;
    } catch (error) {
      logger.error('Redis health check failed:', error);
      checks.redis = false;
      httpStatus = 503;
    }

    // Overall status
    checks.overall = checks.database && checks.redis;

    const response = {
      status: checks.overall ? 'READY' : 'NOT_READY',
      timestamp: new Date().toISOString(),
      checks,
      details: {
        database: checks.database ? 'Connected' : 'Connection failed',
        redis: checks.redis ? 'Connected' : 'Connection failed',
      },
    };

    res.status(httpStatus).json(response);
  } catch (error) {
    logger.error('Readiness check error:', error);
    res.status(503).json({
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      message: 'Readiness check failed',
      error: error.message,
    });
  }
});

// Liveness check (for Kubernetes)
router.get('/live', (req, res) => {
  res.status(200).json({
    status: 'ALIVE',
    timestamp: new Date().toISOString(),
    pid: process.pid,
    memory: process.memoryUsage(),
    uptime: process.uptime(),
  });
});

// Metrics endpoint (for monitoring)
router.get('/metrics', async (req, res) => {
  try {
    const metrics = {
      timestamp: new Date().toISOString(),
      system: {
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        cpu: process.cpuUsage(),
        pid: process.pid,
        platform: process.platform,
        nodeVersion: process.version,
      },
      database: {
        connected: false,
        poolSize: db.pool ? db.pool.totalCount : 0,
        idleConnections: db.pool ? db.pool.idleCount : 0,
        waitingClients: db.pool ? db.pool.waitingCount : 0,
      },
      redis: {
        connected: false,
      },
    };

    // Test database connection
    try {
      await db.testConnection();
      metrics.database.connected = true;
    } catch (error) {
      metrics.database.connected = false;
    }

    // Test Redis connection
    try {
      await redis.testConnection();
      metrics.redis.connected = true;
    } catch (error) {
      metrics.redis.connected = false;
    }

    res.status(200).json(metrics);
  } catch (error) {
    logger.error('Metrics error:', error);
    res.status(500).json({
      error: 'Failed to collect metrics',
      timestamp: new Date().toISOString(),
    });
  }
});

// Service info endpoint
router.get('/info', (req, res) => {
  res.json({
    name: 'TelegramBot Constructor API',
    version: '1.0.0',
    description: 'Backend API for creating and managing Telegram bots',
    environment: process.env.NODE_ENV || 'development',
    features: [
      'Bot creation and management',
      'Visual flow builder',
      'Template system',
      'Analytics and monitoring',
      'User authentication',
      'Real-time bot testing',
    ],
    endpoints: {
      health: '/health',
      readiness: '/health/ready',
      liveness: '/health/live',
      metrics: '/health/metrics',
      docs: '/docs',
    },
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
