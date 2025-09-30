const express = require('express');
const Joi = require('joi');
const { authenticate, checkBotOwnership, validateRequest } = require('../middleware/auth');
const { AppError } = require('../middleware/errorHandler');
const db = require('../utils/database');
const logger = require('../utils/logger');

const router = express.Router();

// Validation schemas
const createBotSchema = Joi.object({
  name: Joi.string().min(1).max(255).required(),
  description: Joi.string().max(1000).allow(''),
  flowConfig: Joi.object().default({ nodes: [], edges: [] }),
});

const updateBotSchema = Joi.object({
  name: Joi.string().min(1).max(255),
  description: Joi.string().max(1000).allow(''),
  flowConfig: Joi.object(),
  telegramToken: Joi.string().allow(''),
  settings: Joi.object(),
});

// Get all bots for authenticated user
router.get('/', authenticate, async (req, res, next) => {
  try {
    const userId = req.userId;
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);
    const offset = (page - 1) * limit;

    const bots = await db.getBotsByUserId(userId, limit, offset);

    // Get total count for pagination
    const countResult = await db.query(
      'SELECT COUNT(*) FROM bots WHERE user_id = $1',
      [userId]
    );
    const totalBots = parseInt(countResult.rows[0].count);

    res.json({
      status: 'success',
      data: {
        bots: bots.map(bot => ({
          id: bot.id,
          name: bot.name,
          description: bot.description,
          status: bot.status,
          telegramUsername: bot.telegram_username,
          totalUsers: bot.total_users,
          totalMessages: bot.total_messages,
          createdAt: bot.created_at,
          updatedAt: bot.updated_at,
          deployedAt: bot.deployed_at,
        })),
        pagination: {
          page,
          limit,
          total: totalBots,
          pages: Math.ceil(totalBots / limit),
        },
      },
    });
  } catch (error) {
    logger.error('Get bots error:', error);
    next(new AppError('Failed to get bots', 500));
  }
});

// Create new bot
router.post('/', authenticate, validateRequest(createBotSchema), async (req, res, next) => {
  try {
    const userId = req.userId;
    const { name, description, flowConfig } = req.body;

    // Check subscription limits (simplified for dev)
    const userBots = await db.getBotsByUserId(userId, 100, 0);
    if (userBots.length >= 10) { // Limit for development
      return next(new AppError('Bot limit reached. Please upgrade your subscription.', 403));
    }

    const bot = await db.createBot({
      userId,
      name,
      description,
      flowConfig,
    });

    logger.info('Bot created:', { botId: bot.id, userId, name });

    res.status(201).json({
      status: 'success',
      message: 'Bot created successfully',
      data: {
        bot: {
          id: bot.id,
          name: bot.name,
          description: bot.description,
          status: bot.status,
          flowConfig: bot.flow_config,
          settings: bot.settings,
          createdAt: bot.created_at,
        },
      },
    });
  } catch (error) {
    logger.error('Create bot error:', error);
    next(new AppError('Failed to create bot', 500));
  }
});

// Get specific bot
router.get('/:id', authenticate, checkBotOwnership, async (req, res, next) => {
  try {
    const bot = req.bot;

    res.json({
      status: 'success',
      data: {
        bot: {
          id: bot.id,
          name: bot.name,
          description: bot.description,
          status: bot.status,
          telegramToken: bot.telegram_token,
          telegramUsername: bot.telegram_username,
          flowConfig: bot.flow_config,
          settings: bot.settings,
          totalUsers: bot.total_users,
          totalMessages: bot.total_messages,
          createdAt: bot.created_at,
          updatedAt: bot.updated_at,
          deployedAt: bot.deployed_at,
        },
      },
    });
  } catch (error) {
    logger.error('Get bot error:', error);
    next(new AppError('Failed to get bot', 500));
  }
});

// Update bot
router.put('/:id', authenticate, checkBotOwnership, validateRequest(updateBotSchema), async (req, res, next) => {
  try {
    const botId = req.params.id;
    const userId = req.userId;
    const updates = req.body;

    const updatedBot = await db.updateBot(botId, userId, updates);

    if (!updatedBot) {
      return next(new AppError('Bot not found', 404));
    }

    logger.info('Bot updated:', { botId, userId, updates: Object.keys(updates) });

    res.json({
      status: 'success',
      message: 'Bot updated successfully',
      data: {
        bot: {
          id: updatedBot.id,
          name: updatedBot.name,
          description: updatedBot.description,
          status: updatedBot.status,
          telegramToken: updatedBot.telegram_token,
          telegramUsername: updatedBot.telegram_username,
          flowConfig: updatedBot.flow_config,
          settings: updatedBot.settings,
          updatedAt: updatedBot.updated_at,
        },
      },
    });
  } catch (error) {
    logger.error('Update bot error:', error);
    next(new AppError('Failed to update bot', 500));
  }
});

// Delete bot
router.delete('/:id', authenticate, checkBotOwnership, async (req, res, next) => {
  try {
    const botId = req.params.id;
    const userId = req.userId;

    const deletedBot = await db.deleteBot(botId, userId);

    if (!deletedBot) {
      return next(new AppError('Bot not found', 404));
    }

    logger.info('Bot deleted:', { botId, userId });

    res.json({
      status: 'success',
      message: 'Bot deleted successfully',
    });
  } catch (error) {
    logger.error('Delete bot error:', error);
    next(new AppError('Failed to delete bot', 500));
  }
});

// Deploy bot (simplified for dev)
router.post('/:id/deploy', authenticate, checkBotOwnership, async (req, res, next) => {
  try {
    const bot = req.bot;
    
    if (!bot.telegram_token) {
      return next(new AppError('Telegram token is required for deployment', 400));
    }

    // Validate flow configuration
    if (!bot.flow_config.nodes || bot.flow_config.nodes.length === 0) {
      return next(new AppError('Bot flow configuration is empty', 400));
    }

    // Update bot status to deploying
    await db.updateBot(bot.id, req.userId, { 
      status: 'deploying' 
    });

    // Simulate deployment process (in real implementation, this would deploy to bot runtime)
    setTimeout(async () => {
      try {
        await db.updateBot(bot.id, req.userId, { 
          status: 'active',
          deployedAt: new Date()
        });
        logger.info('Bot deployed successfully:', { botId: bot.id });
      } catch (error) {
        logger.error('Bot deployment failed:', error);
        await db.updateBot(bot.id, req.userId, { status: 'error' });
      }
    }, 2000);

    res.json({
      status: 'success',
      message: 'Bot deployment started',
      data: {
        bot: {
          id: bot.id,
          status: 'deploying',
        },
      },
    });
  } catch (error) {
    logger.error('Deploy bot error:', error);
    next(new AppError('Failed to deploy bot', 500));
  }
});

// Stop bot
router.post('/:id/stop', authenticate, checkBotOwnership, async (req, res, next) => {
  try {
    const botId = req.params.id;
    const userId = req.userId;

    const updatedBot = await db.updateBot(botId, userId, { 
      status: 'inactive' 
    });

    logger.info('Bot stopped:', { botId, userId });

    res.json({
      status: 'success',
      message: 'Bot stopped successfully',
      data: {
        bot: {
          id: updatedBot.id,
          status: updatedBot.status,
        },
      },
    });
  } catch (error) {
    logger.error('Stop bot error:', error);
    next(new AppError('Failed to stop bot', 500));
  }
});

// Test bot message (simulate conversation)
router.post('/:id/test', authenticate, checkBotOwnership, async (req, res, next) => {
  try {
    const bot = req.bot;
    const { message, sessionId = 'test_session' } = req.body;

    if (!message) {
      return next(new AppError('Message is required for testing', 400));
    }

    // Simulate bot response based on flow configuration
    const response = await simulateBotResponse(bot, message, sessionId);

    res.json({
      status: 'success',
      data: {
        response,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    logger.error('Test bot error:', error);
    next(new AppError('Failed to test bot', 500));
  }
});

// Duplicate bot
router.post('/:id/duplicate', authenticate, checkBotOwnership, async (req, res, next) => {
  try {
    const originalBot = req.bot;
    const userId = req.userId;

    const duplicateBot = await db.createBot({
      userId,
      name: `${originalBot.name} (Copy)`,
      description: originalBot.description,
      flowConfig: originalBot.flow_config,
    });

    logger.info('Bot duplicated:', { originalBotId: originalBot.id, duplicateBotId: duplicateBot.id, userId });

    res.status(201).json({
      status: 'success',
      message: 'Bot duplicated successfully',
      data: {
        bot: {
          id: duplicateBot.id,
          name: duplicateBot.name,
          description: duplicateBot.description,
          status: duplicateBot.status,
          flowConfig: duplicateBot.flow_config,
          createdAt: duplicateBot.created_at,
        },
      },
    });
  } catch (error) {
    logger.error('Duplicate bot error:', error);
    next(new AppError('Failed to duplicate bot', 500));
  }
});

// Simple bot response simulator for testing
async function simulateBotResponse(bot, message, sessionId) {
  const flowConfig = bot.flow_config;
  
  // Find start node
  const startNode = flowConfig.nodes.find(node => node.type === 'start');
  if (!startNode) {
    return {
      type: 'error',
      message: 'Bot configuration error: No start node found',
    };
  }

  // Find connected message node
  const startEdge = flowConfig.edges.find(edge => edge.source === startNode.id);
  if (!startEdge) {
    return {
      type: 'message',
      message: 'Hello! This is a test response.',
    };
  }

  const nextNode = flowConfig.nodes.find(node => node.id === startEdge.target);
  if (!nextNode) {
    return {
      type: 'message',
      message: 'Hello! This is a test response.',
    };
  }

  // Handle different node types
  switch (nextNode.type) {
    case 'message':
      return {
        type: 'message',
        message: nextNode.data?.message || 'Hello!',
        parseMode: nextNode.data?.parseMode,
      };
    
    case 'keyboard':
      return {
        type: 'keyboard',
        message: 'Please choose an option:',
        buttons: nextNode.data?.buttons || [
          [{ text: 'Option 1', action: 'option1' }],
          [{ text: 'Option 2', action: 'option2' }],
        ],
      };
    
    default:
      return {
        type: 'message',
        message: 'Hello! This is a test response.',
      };
  }
}

module.exports = router;
