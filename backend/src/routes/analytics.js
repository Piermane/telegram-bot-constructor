const express = require('express');
const { authenticate, checkBotOwnership } = require('../middleware/auth');
const { AppError } = require('../middleware/errorHandler');
const db = require('../utils/database');
const logger = require('../utils/logger');

const router = express.Router();

// Get bot analytics
router.get('/bots/:id', authenticate, checkBotOwnership, async (req, res, next) => {
  try {
    const botId = req.params.id;
    const { 
      startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), 
      endDate = new Date().toISOString() 
    } = req.query;

    const analytics = await db.getBotAnalytics(botId, startDate, endDate);

    // Group analytics by date and event type
    const analyticsData = analytics.reduce((acc, row) => {
      const date = row.date.toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = {};
      }
      acc[date][row.event_type] = parseInt(row.count);
      return acc;
    }, {});

    res.json({
      status: 'success',
      data: {
        analytics: analyticsData,
        dateRange: {
          start: startDate,
          end: endDate,
        },
      },
    });
  } catch (error) {
    logger.error('Get bot analytics error:', error);
    next(new AppError('Failed to get bot analytics', 500));
  }
});

// Get bot statistics
router.get('/bots/:id/stats', authenticate, checkBotOwnership, async (req, res, next) => {
  try {
    const botId = req.params.id;

    const stats = await db.getBotStats(botId);

    res.json({
      status: 'success',
      data: {
        stats: {
          totalUsers: parseInt(stats.total_users) || 0,
          totalMessages: parseInt(stats.total_messages) || 0,
          activeSessions: parseInt(stats.active_sessions) || 0,
          messagesToday: parseInt(stats.messages_today) || 0,
        },
      },
    });
  } catch (error) {
    logger.error('Get bot stats error:', error);
    next(new AppError('Failed to get bot statistics', 500));
  }
});

module.exports = router;
