const express = require('express');
const bcrypt = require('bcryptjs');
const Joi = require('joi');
const { generateToken, authenticate, validateRequest } = require('../middleware/auth');
const { AppError } = require('../middleware/errorHandler');
const db = require('../utils/database');
const logger = require('../utils/logger');

const router = express.Router();

// Validation schemas
const registerSchema = Joi.object({
  email: Joi.string().email({ tlds: { allow: false } }).required(),
  password: Joi.string().min(6).required(),
  firstName: Joi.string().min(1).max(50).required(),
  lastName: Joi.string().min(1).max(50).required(),
});

const loginSchema = Joi.object({
  email: Joi.string().email({ tlds: { allow: false } }).required(),
  password: Joi.string().required(),
});

// Register new user
router.post('/register', validateRequest(registerSchema), async (req, res, next) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    // Check if user already exists
    const existingUser = await db.getUserByEmail(email);
    if (existingUser) {
      return next(new AppError('User with this email already exists', 409));
    }

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = await db.createUser({
      email,
      passwordHash,
      firstName,
      lastName,
    });

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    logger.info('User registered successfully:', { userId: user.id, email: user.email });

    res.status(201).json({
      status: 'success',
      message: 'User registered successfully',
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          role: user.role,
          subscriptionPlan: user.subscription_plan,
          createdAt: user.created_at,
        },
        token,
      },
    });
  } catch (error) {
    logger.error('Registration error:', error);
    next(new AppError('Registration failed', 500));
  }
});

// User login
router.post('/login', validateRequest(loginSchema), async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Get user by email
    const user = await db.getUserByEmail(email);
    if (!user) {
      return next(new AppError('Invalid email or password', 401));
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return next(new AppError('Invalid email or password', 401));
    }

    // Update last login
    await db.query(
      'UPDATE users SET last_login = NOW() WHERE id = $1',
      [user.id]
    );

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    logger.info('User logged in successfully:', { userId: user.id, email: user.email });

    res.json({
      status: 'success',
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          role: user.role,
          subscriptionPlan: user.subscription_plan,
          lastLogin: new Date().toISOString(),
        },
        token,
      },
    });
  } catch (error) {
    logger.error('Login error:', error);
    next(new AppError('Login failed', 500));
  }
});

// Get current user info
router.get('/me', authenticate, async (req, res, next) => {
  try {
    const user = req.user;

    res.json({
      status: 'success',
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          role: user.role,
          subscriptionPlan: user.subscription_plan,
          emailVerified: user.email_verified,
          createdAt: user.created_at,
        },
      },
    });
  } catch (error) {
    logger.error('Get user info error:', error);
    next(new AppError('Failed to get user information', 500));
  }
});

// Update user profile
router.put('/profile', authenticate, async (req, res, next) => {
  try {
    const userId = req.userId;
    const allowedFields = ['firstName', 'lastName'];
    const updates = {};

    // Filter allowed fields
    Object.keys(req.body).forEach((key) => {
      if (allowedFields.includes(key)) {
        updates[key === 'firstName' ? 'first_name' : 'last_name'] = req.body[key];
      }
    });

    if (Object.keys(updates).length === 0) {
      return next(new AppError('No valid fields to update', 400));
    }

    // Update user
    const fields = Object.keys(updates).map((key, index) => `${key} = $${index + 1}`);
    const values = Object.values(updates);
    values.push(userId);

    const result = await db.query(
      `UPDATE users SET ${fields.join(', ')}, updated_at = NOW() 
       WHERE id = $${values.length} 
       RETURNING id, email, first_name, last_name, role, subscription_plan, updated_at`,
      values
    );

    const updatedUser = result.rows[0];

    logger.info('User profile updated:', { userId, updates });

    res.json({
      status: 'success',
      message: 'Profile updated successfully',
      data: {
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          firstName: updatedUser.first_name,
          lastName: updatedUser.last_name,
          role: updatedUser.role,
          subscriptionPlan: updatedUser.subscription_plan,
          updatedAt: updatedUser.updated_at,
        },
      },
    });
  } catch (error) {
    logger.error('Profile update error:', error);
    next(new AppError('Failed to update profile', 500));
  }
});

// Change password
router.put('/password', authenticate, async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return next(new AppError('Current password and new password are required', 400));
    }

    if (newPassword.length < 6) {
      return next(new AppError('New password must be at least 6 characters long', 400));
    }

    // Get current user with password
    const user = await db.getUserByEmail(req.user.email);
    
    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isCurrentPasswordValid) {
      return next(new AppError('Current password is incorrect', 400));
    }

    // Hash new password
    const saltRounds = 12;
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    await db.query(
      'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2',
      [newPasswordHash, req.userId]
    );

    logger.info('User password changed:', { userId: req.userId });

    res.json({
      status: 'success',
      message: 'Password changed successfully',
    });
  } catch (error) {
    logger.error('Password change error:', error);
    next(new AppError('Failed to change password', 500));
  }
});

// Logout (client-side token invalidation)
router.post('/logout', authenticate, (req, res) => {
  // In a real application, you might want to blacklist the token
  // For now, we just return success and let the client remove the token
  logger.info('User logged out:', { userId: req.userId });
  
  res.json({
    status: 'success',
    message: 'Logged out successfully',
  });
});

// Get user statistics
router.get('/stats', authenticate, async (req, res, next) => {
  try {
    const userId = req.userId;

    const stats = await db.query(`
      SELECT 
        COUNT(b.id) as total_bots,
        COUNT(CASE WHEN b.status = 'active' THEN 1 END) as active_bots,
        COUNT(CASE WHEN b.status = 'draft' THEN 1 END) as draft_bots,
        COALESCE(SUM(b.total_users), 0) as total_bot_users,
        COALESCE(SUM(b.total_messages), 0) as total_messages,
        COUNT(CASE WHEN b.created_at >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as bots_created_last_month
      FROM bots b 
      WHERE b.user_id = $1
    `, [userId]);

    res.json({
      status: 'success',
      data: {
        stats: stats.rows[0],
      },
    });
  } catch (error) {
    logger.error('User stats error:', error);
    next(new AppError('Failed to get user statistics', 500));
  }
});

module.exports = router;
