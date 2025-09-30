const redis = require('redis');
const logger = require('./logger');

// Redis configuration
const redisConfig = {
  url: process.env.REDIS_URL || 'redis://localhost:6379',
  socket: {
    reconnectStrategy: (retries) => Math.min(retries * 50, 500),
  },
};

// Create Redis client
const client = redis.createClient(redisConfig);

// Handle Redis events
client.on('error', (err) => {
  logger.error('Redis Client Error:', err);
});

client.on('connect', () => {
  logger.info('Redis client connected');
});

client.on('ready', () => {
  logger.info('Redis client ready');
});

client.on('end', () => {
  logger.info('Redis client disconnected');
});

// Connect to Redis
client.connect().catch((err) => {
  logger.error('Failed to connect to Redis:', err);
});

// Redis utility functions
const redisUtils = {
  client,

  // Test Redis connection
  async testConnection() {
    try {
      const result = await client.ping();
      logger.info('Redis connection successful:', result);
      return true;
    } catch (error) {
      logger.error('Redis connection failed:', error);
      throw error;
    }
  },

  // Set key with optional expiration
  async set(key, value, expireSeconds = null) {
    try {
      const stringValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
      if (expireSeconds) {
        await client.setEx(key, expireSeconds, stringValue);
      } else {
        await client.set(key, stringValue);
      }
      return true;
    } catch (error) {
      logger.error('Redis SET error:', error);
      throw error;
    }
  },

  // Get key value
  async get(key) {
    try {
      const value = await client.get(key);
      if (!value) return null;
      
      // Try to parse as JSON, fallback to string
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    } catch (error) {
      logger.error('Redis GET error:', error);
      throw error;
    }
  },

  // Delete key
  async del(key) {
    try {
      const result = await client.del(key);
      return result;
    } catch (error) {
      logger.error('Redis DEL error:', error);
      throw error;
    }
  },

  // Check if key exists
  async exists(key) {
    try {
      const result = await client.exists(key);
      return Boolean(result);
    } catch (error) {
      logger.error('Redis EXISTS error:', error);
      throw error;
    }
  },

  // Set expiration for key
  async expire(key, seconds) {
    try {
      const result = await client.expire(key, seconds);
      return Boolean(result);
    } catch (error) {
      logger.error('Redis EXPIRE error:', error);
      throw error;
    }
  },

  // Get time to live for key
  async ttl(key) {
    try {
      const result = await client.ttl(key);
      return result;
    } catch (error) {
      logger.error('Redis TTL error:', error);
      throw error;
    }
  },

  // Increment counter
  async incr(key) {
    try {
      const result = await client.incr(key);
      return result;
    } catch (error) {
      logger.error('Redis INCR error:', error);
      throw error;
    }
  },

  // Hash operations
  async hSet(key, field, value) {
    try {
      const stringValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
      const result = await client.hSet(key, field, stringValue);
      return result;
    } catch (error) {
      logger.error('Redis HSET error:', error);
      throw error;
    }
  },

  async hGet(key, field) {
    try {
      const value = await client.hGet(key, field);
      if (!value) return null;
      
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    } catch (error) {
      logger.error('Redis HGET error:', error);
      throw error;
    }
  },

  async hGetAll(key) {
    try {
      const result = await client.hGetAll(key);
      const parsed = {};
      
      Object.keys(result).forEach((field) => {
        try {
          parsed[field] = JSON.parse(result[field]);
        } catch {
          parsed[field] = result[field];
        }
      });
      
      return parsed;
    } catch (error) {
      logger.error('Redis HGETALL error:', error);
      throw error;
    }
  },

  async hDel(key, field) {
    try {
      const result = await client.hDel(key, field);
      return result;
    } catch (error) {
      logger.error('Redis HDEL error:', error);
      throw error;
    }
  },

  // List operations
  async lPush(key, value) {
    try {
      const stringValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
      const result = await client.lPush(key, stringValue);
      return result;
    } catch (error) {
      logger.error('Redis LPUSH error:', error);
      throw error;
    }
  },

  async lRange(key, start, stop) {
    try {
      const result = await client.lRange(key, start, stop);
      return result.map((item) => {
        try {
          return JSON.parse(item);
        } catch {
          return item;
        }
      });
    } catch (error) {
      logger.error('Redis LRANGE error:', error);
      throw error;
    }
  },

  // Session management helpers
  async setSession(sessionId, sessionData, expireSeconds = 3600) {
    const key = `session:${sessionId}`;
    return this.set(key, sessionData, expireSeconds);
  },

  async getSession(sessionId) {
    const key = `session:${sessionId}`;
    return this.get(key);
  },

  async deleteSession(sessionId) {
    const key = `session:${sessionId}`;
    return this.del(key);
  },

  // Rate limiting helpers
  async checkRateLimit(identifier, limit, windowSeconds) {
    const key = `rate_limit:${identifier}`;
    const current = await this.incr(key);
    
    if (current === 1) {
      await this.expire(key, windowSeconds);
    }
    
    return {
      current,
      limit,
      remaining: Math.max(0, limit - current),
      exceeded: current > limit,
    };
  },

  // Cache helpers
  async setCache(key, data, expireSeconds = 300) {
    const cacheKey = `cache:${key}`;
    return this.set(cacheKey, data, expireSeconds);
  },

  async getCache(key) {
    const cacheKey = `cache:${key}`;
    return this.get(cacheKey);
  },

  async deleteCache(key) {
    const cacheKey = `cache:${key}`;
    return this.del(cacheKey);
  },

  // Bot state management
  async setBotState(botId, userId, state) {
    const key = `bot_state:${botId}:${userId}`;
    return this.set(key, state, 3600); // 1 hour expiration
  },

  async getBotState(botId, userId) {
    const key = `bot_state:${botId}:${userId}`;
    return this.get(key);
  },

  async deleteBotState(botId, userId) {
    const key = `bot_state:${botId}:${userId}`;
    return this.del(key);
  },
};

module.exports = redisUtils;
