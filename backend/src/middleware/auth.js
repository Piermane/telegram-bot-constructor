const jwt = require('jsonwebtoken');
const db = require('../utils/database');
const { AppError } = require('./errorHandler');
const logger = require('../utils/logger');

// JWT secret
const JWT_SECRET = process.env.JWT_SECRET || 'dev-jwt-secret-key';

// Generate JWT token
const generateToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

// Verify JWT token
const verifyToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};

// Authentication middleware
const authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(new AppError('Access token is required', 401));
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return next(new AppError('Token has expired. Please log in again.', 401));
      }
      if (error.name === 'JsonWebTokenError') {
        return next(new AppError('Invalid token. Please log in again.', 401));
      }
      throw error;
    }

    // Get user from database
    const user = await db.getUserById(decoded.userId);
    
    if (!user) {
      return next(new AppError('User not found. Please log in again.', 401));
    }

    // Add user to request object
    req.user = user;
    req.userId = user.id;
    
    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    next(new AppError('Authentication failed', 401));
  }
};

// Optional authentication middleware (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(); // Continue without authentication
    }

    const token = authHeader.substring(7);
    
    try {
      const decoded = verifyToken(token);
      const user = await db.getUserById(decoded.userId);
      
      if (user) {
        req.user = user;
        req.userId = user.id;
      }
    } catch (error) {
      // Ignore authentication errors in optional auth
      logger.debug('Optional auth failed:', error.message);
    }
    
    next();
  } catch (error) {
    logger.error('Optional authentication error:', error);
    next(); // Continue even if there's an error
  }
};

// Role-based authorization middleware
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Access denied. Authentication required.', 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(new AppError('Access denied. Insufficient permissions.', 403));
    }

    next();
  };
};

// Subscription plan authorization middleware
const requireSubscription = (...plans) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Access denied. Authentication required.', 401));
    }

    if (!plans.includes(req.user.subscription_plan)) {
      return next(new AppError('Access denied. Subscription upgrade required.', 403));
    }

    next();
  };
};

// Rate limiting by user
const rateLimitByUser = (maxRequests = 100, windowMinutes = 15) => {
  const redis = require('../utils/redis');
  
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return next(); // Skip rate limiting for unauthenticated requests
      }

      const key = `rate_limit:user:${req.user.id}`;
      const windowSeconds = windowMinutes * 60;
      
      const rateLimit = await redis.checkRateLimit(key, maxRequests, windowSeconds);
      
      // Add rate limit headers
      res.set({
        'X-RateLimit-Limit': maxRequests,
        'X-RateLimit-Remaining': rateLimit.remaining,
        'X-RateLimit-Reset': new Date(Date.now() + windowSeconds * 1000).toISOString(),
      });

      if (rateLimit.exceeded) {
        return next(new AppError('Rate limit exceeded. Please try again later.', 429));
      }

      next();
    } catch (error) {
      logger.error('Rate limiting error:', error);
      next(); // Continue if rate limiting fails
    }
  };
};

// Check bot ownership middleware
const checkBotOwnership = async (req, res, next) => {
  try {
    const botId = req.params.id || req.params.botId;
    const userId = req.userId;

    if (!botId) {
      return next(new AppError('Bot ID is required', 400));
    }

    const bot = await db.getBotById(botId, userId);
    
    if (!bot) {
      return next(new AppError('Bot not found or access denied', 404));
    }

    req.bot = bot;
    next();
  } catch (error) {
    logger.error('Bot ownership check error:', error);
    next(new AppError('Failed to verify bot ownership', 500));
  }
};

// Validate request body middleware
const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errors = error.details.map(detail => detail.message);
      return next(new AppError(`Validation error: ${errors.join(', ')}`, 400));
    }

    req.body = value;
    next();
  };
};

module.exports = {
  generateToken,
  verifyToken,
  authenticate,
  optionalAuth,
  authorize,
  requireSubscription,
  rateLimitByUser,
  checkBotOwnership,
  validateRequest,
};
