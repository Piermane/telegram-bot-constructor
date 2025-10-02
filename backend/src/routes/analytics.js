const express = require('express');
const router = express.Router();
const db = require('../utils/database');
const path = require('path');
const fs = require('fs').promises;
const sqlite3 = require('sqlite3').verbose();
const { authenticate } = require('../middleware/auth');

/**
 * Получение аналитики для конкретного бота
 * GET /api/analytics/:botId
 * Требует аутентификации + ownership!
 */
router.get('/:botId', authenticate, async (req, res) => {
  try {
    const { botId } = req.params;
    const userId = req.userId;
    const dbId = parseInt(botId.replace('bot_', ''));
    
    // Проверяем что бот существует + ownership
    const botRecord = await db.query('SELECT * FROM bots WHERE id = $1 AND user_id = $2', [dbId, userId]);
    if (botRecord.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Бот не найден или у вас нет прав доступа'
      });
    }
    
    const botData = botRecord.rows[0];
    
    // Путь к базе данных бота (SQLite)
    const botDir = path.join(__dirname, '../../deployed_bots', botId);
    const dbPath = path.join(botDir, 'bot_database.db');
    
    // Проверяем существование БД
    try {
      await fs.access(dbPath);
    } catch (error) {
      // БД еще не создана (бот не запускался)
      return res.json({
        success: true,
        data: {
          botInfo: {
            id: botId,
            name: botData.name,
            username: botData.telegram_username,
            status: botData.status,
            created_at: botData.created_at
          },
          users: [],
          analytics_events: [],
          webapp_data: [],
          stats: {
            total_users: 0,
            active_today: 0,
            active_week: 0,
            total_messages: 0,
            messages_today: 0
          }
        }
      });
    }
    
    // Подключаемся к SQLite базе бота
    const botDb = new sqlite3.Database(dbPath);
    
    // Функция для промисификации запросов SQLite
    const queryAsync = (sql, params = []) => {
      return new Promise((resolve, reject) => {
        botDb.all(sql, params, (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        });
      });
    };
    
    // Получаем данные из разных таблиц
    const users = await queryAsync('SELECT * FROM users ORDER BY created_at DESC LIMIT 100');
    
    let analyticsEvents = [];
    try {
      analyticsEvents = await queryAsync('SELECT * FROM analytics_events ORDER BY created_at DESC LIMIT 1000');
    } catch (e) {
      // Таблица может не существовать если аналитика отключена
    }
    
    let webappData = [];
    try {
      webappData = await queryAsync('SELECT * FROM webapp_data ORDER BY created_at DESC LIMIT 1000');
    } catch (e) {
      // Таблица может не существовать если WebApp не использовался
    }
    
    // Вычисляем статистику
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const activeToday = users.filter(u => {
      if (!u.last_active) return false;
      const lastActive = new Date(u.last_active);
      return lastActive >= todayStart;
    }).length;
    
    const activeWeek = users.filter(u => {
      if (!u.last_active) return false;
      const lastActive = new Date(u.last_active);
      return lastActive >= weekStart;
    }).length;
    
    const messagesToday = analyticsEvents.filter(e => {
      if (!e.created_at) return false;
      const created = new Date(e.created_at);
      return created >= todayStart;
    }).length;
    
    // Закрываем соединение с БД
    botDb.close();
    
    res.json({
      success: true,
      data: {
        botInfo: {
          id: botId,
          name: botData.name,
          username: botData.telegram_username,
          status: botData.status,
          created_at: botData.created_at,
          config: botData.config
        },
        users: users.map(u => ({
          id: u.id,
          first_name: u.first_name,
          username: u.username,
          created_at: u.created_at,
          last_active: u.last_active
        })),
        analytics_events: analyticsEvents.map(e => ({
          id: e.id,
          event_type: e.event_type,
          user_id: e.user_id,
          scene_id: e.scene_id,
          data: e.data,
          created_at: e.created_at
        })),
        webapp_data: webappData.map(d => ({
          id: d.id,
          user_id: d.user_id,
          action: d.action,
          data: d.data,
          created_at: d.created_at
        })),
        stats: {
          total_users: users.length,
          active_today: activeToday,
          active_week: activeWeek,
          total_messages: analyticsEvents.length,
          messages_today: messagesToday
        }
      }
    });
    
  } catch (error) {
    console.error('Ошибка получения аналитики:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка получения аналитики',
      error: error.message
    });
  }
});

/**
 * Экспорт данных в CSV
 * GET /api/analytics/:botId/export/:type
 * type: users | analytics | webapp | all
 * Требует аутентификации + ownership!
 */
router.get('/:botId/export/:type', authenticate, async (req, res) => {
  try {
    const { botId, type } = req.params;
    const userId = req.userId;
    const dbId = parseInt(botId.replace('bot_', ''));
    
    const botRecord = await db.query('SELECT * FROM bots WHERE id = $1 AND user_id = $2', [dbId, userId]);
    if (botRecord.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Бот не найден или у вас нет прав доступа'
      });
    }
    
    const botDir = path.join(__dirname, '../../deployed_bots', botId);
    const dbPath = path.join(botDir, 'bot_database.db');
    
    const botDb = new sqlite3.Database(dbPath);
    
    const queryAsync = (sql, params = []) => {
      return new Promise((resolve, reject) => {
        botDb.all(sql, params, (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        });
      });
    };
    
    let csvContent = '';
    let filename = '';
    
    if (type === 'users' || type === 'all') {
      const users = await queryAsync('SELECT * FROM users');
      csvContent += 'ID,First Name,Username,Created At,Last Active\n';
      users.forEach(u => {
        csvContent += `${u.id},"${u.first_name || ''}","${u.username || ''}","${u.created_at || ''}","${u.last_active || ''}"\n`;
      });
      filename = `users_${Date.now()}.csv`;
    }
    
    if (type === 'analytics' || type === 'all') {
      try {
        const events = await queryAsync('SELECT * FROM analytics_events');
        if (type === 'all') csvContent += '\n';
        csvContent += 'ID,Event Type,User ID,Scene ID,Data,Created At\n';
        events.forEach(e => {
          csvContent += `${e.id},"${e.event_type}",${e.user_id},"${e.scene_id || ''}","${e.data || ''}","${e.created_at || ''}"\n`;
        });
        if (type !== 'all') filename = `analytics_${Date.now()}.csv`;
      } catch (e) {}
    }
    
    if (type === 'webapp' || type === 'all') {
      try {
        const webapp = await queryAsync('SELECT * FROM webapp_data');
        if (type === 'all') csvContent += '\n';
        csvContent += 'ID,User ID,Action,Data,Created At\n';
        webapp.forEach(d => {
          csvContent += `${d.id},${d.user_id},"${d.action}","${d.data || ''}","${d.created_at || ''}"\n`;
        });
        if (type !== 'all') filename = `webapp_${Date.now()}.csv`;
      } catch (e) {}
    }
    
    if (type === 'all') {
      filename = `all_data_${Date.now()}.csv`;
    }
    
    botDb.close();
    
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send('\uFEFF' + csvContent); // BOM для правильной кодировки в Excel
    
  } catch (error) {
    console.error('Ошибка экспорта:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка экспорта данных',
      error: error.message
    });
  }
});

module.exports = router;
