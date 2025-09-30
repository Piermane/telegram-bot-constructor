const logger = require('../utils/logger');

// Custom error class
class AppError extends Error {
  constructor(message, statusCode = 500, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.status = statusCode >= 400 && statusCode < 500 ? 'fail' : 'error';

    Error.captureStackTrace(this, this.constructor);
  }
}

// Error handler middleware
const errorHandler = (error, req, res, next) => {
  let err = { ...error };
  err.message = error.message;

  // Log error
  logger.error('Error Handler:', {
    error: err.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
  });

  // Mongoose bad ObjectId
  if (error.name === 'CastError') {
    const message = 'Resource not found';
    err = new AppError(message, 404);
  }

  // Mongoose duplicate key
  if (error.code === 11000) {
    const value = error.errmsg.match(/(["'])(\\?.)*?\1/)[0];
    const message = `Duplicate field value: ${value}. Please use another value!`;
    err = new AppError(message, 400);
  }

  // Mongoose validation error
  if (error.name === 'ValidationError') {
    const errors = Object.values(error.errors).map(val => val.message);
    const message = `Invalid input data. ${errors.join('. ')}`;
    err = new AppError(message, 400);
  }

  // JWT errors
  if (error.name === 'JsonWebTokenError') {
    const message = 'Invalid token. Please log in again!';
    err = new AppError(message, 401);
  }

  if (error.name === 'TokenExpiredError') {
    const message = 'Your token has expired! Please log in again.';
    err = new AppError(message, 401);
  }

  // PostgreSQL errors
  if (error.code === '23505') {
    const message = 'Duplicate data. Resource already exists.';
    err = new AppError(message, 409);
  }

  if (error.code === '23503') {
    const message = 'Referenced resource does not exist.';
    err = new AppError(message, 400);
  }

  if (error.code === '23502') {
    const message = 'Required field is missing.';
    err = new AppError(message, 400);
  }

  // Redis connection errors
  if (error.code === 'ECONNREFUSED' && error.port === 6379) {
    const message = 'Cache service temporarily unavailable';
    err = new AppError(message, 503);
  }

  // Default error response
  const statusCode = err.statusCode || 500;
  const status = err.status || 'error';

  // Send error response
  res.status(statusCode).json({
    status,
    error: {
      message: err.message || 'Something went wrong!',
      ...(process.env.NODE_ENV === 'development' && {
        stack: error.stack,
        details: error,
      }),
    },
    timestamp: new Date().toISOString(),
    path: req.url,
    method: req.method,
  });
};

module.exports = errorHandler;
module.exports.AppError = AppError;
