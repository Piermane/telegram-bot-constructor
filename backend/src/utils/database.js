const { Pool } = require('pg');
const bcryptjs = require('bcryptjs');
const logger = require('./logger');

// Database configuration
const dbConfig = {
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20, // maximum number of clients in the pool
  idleTimeoutMillis: 30000, // how long a client is allowed to remain idle
  connectionTimeoutMillis: 2000, // how long to try connecting before timing out
};

// Create connection pool
const pool = new Pool(dbConfig);

// Handle pool errors
pool.on('error', (err) => {
  logger.error('Unexpected error on idle client', err);
});

// Database utility functions
const db = {
  pool,

  // Test database connection and initialize tables
  async testConnection() {
    try {
      const client = await pool.connect();
      const result = await client.query('SELECT NOW()');
      client.release();
      logger.info('Database connection successful:', result.rows[0]);
      
      // Initialize database tables
      await this.initializeTables();
      
      return true;
    } catch (error) {
      logger.error('Database connection failed:', error);
      throw error;
    }
  },

  // Initialize database tables
  async initializeTables() {
    try {
      // Create users table
      await this.query(`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          email VARCHAR(255) UNIQUE NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          first_name VARCHAR(100),
          last_name VARCHAR(100),
          role VARCHAR(50) DEFAULT 'user',
          subscription_plan VARCHAR(50) DEFAULT 'free',
          is_active BOOLEAN DEFAULT true,
          last_login TIMESTAMP,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Create bots table
      await this.query(`
        CREATE TABLE IF NOT EXISTS bots (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          name VARCHAR(255) NOT NULL,
          token VARCHAR(255) NOT NULL,
          description TEXT,
          config JSONB,
          telegram_username VARCHAR(255),
          status VARCHAR(50) DEFAULT 'stopped',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      // Add telegram_username column if it doesn't exist
      try {
        await this.query('ALTER TABLE bots ADD COLUMN IF NOT EXISTS telegram_username VARCHAR(255)');
        logger.info('✅ Migration: telegram_username column added');
      } catch (error) {
        logger.debug('Migration note:', error.message);
      }

      // Add missing columns to existing tables (migrations)
      try {
        await this.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login TIMESTAMP');
        logger.info('✅ Migration: last_login column added');
      } catch (error) {
        // Column might already exist
        logger.debug('Migration note:', error.message);
      }

      // Migration: Add started_at to bots table
      try {
        await this.query('ALTER TABLE bots ADD COLUMN IF NOT EXISTS started_at TIMESTAMP');
        logger.info('✅ Migration: started_at column added to bots');
      } catch (error) {
        // Column might already exist
        logger.debug('Migration note:', error.message);
      }

      // Create super admin if not exists
      const adminExists = await this.query('SELECT id FROM users WHERE email = $1', ['admin@botconstructor.local']);
      if (adminExists.rows.length === 0) {
        const hashedPassword = await bcryptjs.hash('SuperAdmin2025!', 10);
        
        await this.query(`
          INSERT INTO users (email, password_hash, first_name, last_name, role)
          VALUES ($1, $2, $3, $4, $5)
        `, ['admin@botconstructor.local', hashedPassword, 'Super', 'Admin', 'admin']);
        
        logger.info('✅ Super Admin created successfully');
      }

      logger.info('✅ Database tables initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize database tables:', error);
      throw error;
    }
  },

  // Execute query with error handling
  async query(text, params = []) {
    const start = Date.now();
    try {
      const result = await pool.query(text, params);
      const duration = Date.now() - start;
      logger.debug('Executed query', { text, duration, rows: result.rowCount });
      return result;
    } catch (error) {
      logger.error('Database query error', { text, params, error: error.message });
      throw error;
    }
  },

  // Transaction wrapper
  async transaction(callback) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error('Transaction error:', error);
      throw error;
    } finally {
      client.release();
    }
  },

  // Get user by ID
  async getUserById(id) {
    const result = await this.query(
      'SELECT id, email, first_name, last_name, role, subscription_plan, created_at FROM users WHERE id = $1',
      [id]
    );
    return result.rows[0];
  },

  // Get user by email
  async getUserByEmail(email) {
    const result = await this.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    return result.rows[0];
  },

  // Create new user
  async createUser(userData) {
    const { email, passwordHash, firstName, lastName } = userData;
    const result = await this.query(
      `INSERT INTO users (email, password_hash, first_name, last_name) 
       VALUES ($1, $2, $3, $4) 
       RETURNING id, email, first_name, last_name, role, subscription_plan, created_at`,
      [email, passwordHash, firstName, lastName]
    );
    return result.rows[0];
  },

  // Get bots by user ID
  async getBotsByUserId(userId, limit = 50, offset = 0) {
    const result = await this.query(
      `SELECT id, name, description, status, telegram_username, 
              total_users, total_messages, created_at, updated_at, deployed_at
       FROM bots 
       WHERE user_id = $1 
       ORDER BY created_at DESC 
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );
    return result.rows;
  },

  // Get bot by ID and user ID
  async getBotById(botId, userId) {
    const result = await this.query(
      'SELECT * FROM bots WHERE id = $1 AND user_id = $2',
      [botId, userId]
    );
    return result.rows[0];
  },

  // Create new bot
  async createBot(botData) {
    const { userId, name, description, flowConfig } = botData;
    const result = await this.query(
      `INSERT INTO bots (user_id, name, description, flow_config) 
       VALUES ($1, $2, $3, $4) 
       RETURNING *`,
      [userId, name, description, JSON.stringify(flowConfig)]
    );
    return result.rows[0];
  },

  // Update bot
  async updateBot(botId, userId, updates) {
    const fields = [];
    const values = [];
    let paramIndex = 1;

    Object.keys(updates).forEach((key) => {
      if (key === 'flowConfig') {
        fields.push(`flow_config = $${paramIndex}`);
        values.push(JSON.stringify(updates[key]));
      } else if (key === 'settings') {
        fields.push(`settings = $${paramIndex}`);
        values.push(JSON.stringify(updates[key]));
      } else {
        fields.push(`${key} = $${paramIndex}`);
        values.push(updates[key]);
      }
      paramIndex++;
    });

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    values.push(botId, userId);
    const result = await this.query(
      `UPDATE bots SET ${fields.join(', ')}, updated_at = NOW() 
       WHERE id = $${paramIndex} AND user_id = $${paramIndex + 1} 
       RETURNING *`,
      values
    );
    return result.rows[0];
  },

  // Delete bot
  async deleteBot(botId, userId) {
    const result = await this.query(
      'DELETE FROM bots WHERE id = $1 AND user_id = $2 RETURNING *',
      [botId, userId]
    );
    return result.rows[0];
  },

  // Get bot templates
  async getTemplates(category = null, featured = null, limit = 20, offset = 0) {
    let query = 'SELECT * FROM bot_templates WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    if (category) {
      query += ` AND category = $${paramIndex}`;
      params.push(category);
      paramIndex++;
    }

    if (featured !== null) {
      query += ` AND is_featured = $${paramIndex}`;
      params.push(featured);
      paramIndex++;
    }

    query += ' ORDER BY is_featured DESC, usage_count DESC, created_at DESC';
    query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const result = await this.query(query, params);
    return result.rows;
  },

  // Get template by ID
  async getTemplateById(templateId) {
    const result = await this.query(
      'SELECT * FROM bot_templates WHERE id = $1',
      [templateId]
    );
    return result.rows[0];
  },

  // Increment template usage
  async incrementTemplateUsage(templateId) {
    await this.query(
      'UPDATE bot_templates SET usage_count = usage_count + 1 WHERE id = $1',
      [templateId]
    );
  },

  // Create bot session
  async createOrUpdateBotSession(sessionData) {
    const { botId, telegramUserId, telegramUsername, telegramFirstName, telegramLastName, currentState, variables } = sessionData;
    const result = await this.query(
      `INSERT INTO bot_sessions (bot_id, telegram_user_id, telegram_username, telegram_first_name, telegram_last_name, current_state, variables)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (bot_id, telegram_user_id) 
       DO UPDATE SET 
         telegram_username = EXCLUDED.telegram_username,
         telegram_first_name = EXCLUDED.telegram_first_name,
         telegram_last_name = EXCLUDED.telegram_last_name,
         current_state = EXCLUDED.current_state,
         variables = EXCLUDED.variables,
         last_interaction = NOW()
       RETURNING *`,
      [botId, telegramUserId, telegramUsername, telegramFirstName, telegramLastName, currentState, JSON.stringify(variables)]
    );
    return result.rows[0];
  },

  // Get bot session
  async getBotSession(botId, telegramUserId) {
    const result = await this.query(
      'SELECT * FROM bot_sessions WHERE bot_id = $1 AND telegram_user_id = $2',
      [botId, telegramUserId]
    );
    return result.rows[0];
  },

  // Log analytics event
  async logAnalyticsEvent(eventData) {
    const { botId, sessionId, telegramUserId, eventType, eventData: data, nodeId, flowStep } = eventData;
    const result = await this.query(
      `INSERT INTO analytics_events (bot_id, session_id, telegram_user_id, event_type, event_data, node_id, flow_step)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [botId, sessionId, telegramUserId, eventType, JSON.stringify(data), nodeId, flowStep]
    );
    return result.rows[0];
  },

  // Get bot analytics
  async getBotAnalytics(botId, startDate, endDate) {
    const result = await this.query(
      `SELECT 
         event_type,
         COUNT(*) as count,
         DATE_TRUNC('day', created_at) as date
       FROM analytics_events 
       WHERE bot_id = $1 
         AND created_at >= $2 
         AND created_at <= $3
       GROUP BY event_type, DATE_TRUNC('day', created_at)
       ORDER BY date`,
      [botId, startDate, endDate]
    );
    return result.rows;
  },

  // Get bot statistics
  async getBotStats(botId) {
    const result = await this.query(
      'SELECT * FROM get_bot_stats($1)',
      [botId]
    );
    return result.rows[0];
  },
};

module.exports = db;
