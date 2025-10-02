const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');
const { spawn, exec } = require('child_process');
const https = require('https');
const { generateAdvancedPythonBot } = require('../utils/advanced-bot-generator');
const { generateWebAppHTML } = require('../utils/webapp-generator');
const db = require('../utils/database');
const { authenticate } = require('../middleware/auth');

// Хранилище запущенных процессов ботов (только для runtime, данные в БД)
const runningBots = new Map();

/**
 * Восстановление всех запущенных ботов при старте сервера
 * Регенерирует файлы из БД если они были удалены при редеплое
 */
async function restoreRunningBots() {
  try {
    console.log('🔄 Восстанавливаем запущенные боты из базы данных...');
    
    // Получаем всех ботов со статусом 'running'
    const result = await db.query(
      "SELECT id, name, token, config, telegram_username FROM bots WHERE status = 'running'"
    );
    
    let restored = 0;
    
    for (const botRecord of result.rows) {
      const botId = `bot_${botRecord.id}`;
      const botDir = path.join(__dirname, '../../deployed_bots', botId);
      const botFilePath = path.join(botDir, 'bot.py');
      
      // Проверяем, существует ли файл бота
      let needsRegeneration = false;
      try {
        await fs.access(botFilePath);
      } catch {
        needsRegeneration = true;
      }
      
      // Если файлов нет - регенерируем из config в БД
      if (needsRegeneration) {
        console.log(`🔧 Регенерируем файлы для бота ${botRecord.name}...`);
        
        try {
          // Создаём директорию
          await fs.mkdir(botDir, { recursive: true });
          
          // Регенерируем bot.py из config
          const botSettings = botRecord.config;
          const botInfo = {
            username: botRecord.telegram_username || botRecord.name,
            first_name: botRecord.name
          };
          
          const botCode = generateAdvancedPythonBot(botSettings, botInfo, botId);
          await fs.writeFile(botFilePath, botCode, 'utf-8');
          
          // Регенерируем requirements.txt
          const requirements = `python-telegram-bot==20.7
qrcode==7.4.2
pillow==10.1.0`;
          await fs.writeFile(path.join(botDir, 'requirements.txt'), requirements, 'utf-8');
          
          // Регенерируем WebApp
          await generateWebAppHTML(botSettings, botId);
          
          // Устанавливаем зависимости
          console.log(`📦 Устанавливаем зависимости для ${botRecord.name}...`);
          await new Promise((resolve, reject) => {
            exec(`cd ${botDir} && pip3 install -r requirements.txt`, (error) => {
              if (error) {
                console.error(`⚠️ Ошибка установки зависимостей: ${error.message}`);
                // Продолжаем даже если не удалось установить (могут быть уже установлены глобально)
              }
              resolve();
            });
          });
          
          console.log(`✅ Файлы регенерированы для ${botRecord.name}`);
        } catch (error) {
          console.error(`❌ Ошибка регенерации файлов для ${botRecord.name}:`, error);
          await db.query('UPDATE bots SET status = $1 WHERE id = $2', ['stopped', botRecord.id]);
          continue;
        }
      }
      
      // Запускаем бота
      console.log(`🤖 Запускаем бота: ${botRecord.name}`);
      const botProcess = spawn('/usr/bin/python3', ['bot.py'], {
        cwd: botDir,
        detached: true,
        stdio: ['ignore', 'pipe', 'pipe'],
        env: { ...process.env, BOT_TOKEN: botRecord.token }
      });
      
      botProcess.stdout.on('data', (data) => {
        console.log(`[${botRecord.name}] ${data.toString()}`);
      });
      
      botProcess.stderr.on('data', (data) => {
        console.error(`[${botRecord.name}] ERROR: ${data.toString()}`);
      });
      
      botProcess.on('exit', async (code) => {
        console.log(`[${botRecord.name}] Процесс завершен с кодом ${code}`);
        runningBots.delete(botId);
        // Обновляем статус в БД
        await db.query('UPDATE bots SET status = $1 WHERE id = $2', ['stopped', botRecord.id]);
      });
      
      runningBots.set(botId, {
        process: botProcess,
        dbId: botRecord.id,
        dir: botDir,
        name: botRecord.name,
        token: botRecord.token,
        settings: botRecord.config,
        pid: botProcess.pid
      });
      
      botProcess.unref();
      
      console.log(`✅ Бот ${botRecord.name} восстановлен! PID: ${botProcess.pid}`);
      restored++;
    }
    
    console.log(`✅ Восстановлено ботов: ${restored} из ${result.rows.length}`);
  } catch (error) {
    console.error('❌ Ошибка восстановления ботов:', error);
  }
}

// Восстанавливаем боты при загрузке модуля
setTimeout(() => restoreRunningBots(), 2000);

/**
 * Проверка валидности токена бота через Telegram API
 */
async function validateBotToken(token) {
  return new Promise((resolve) => {
    const url = `https://api.telegram.org/bot${token}/getMe`;
    
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          if (result.ok && result.result) {
            resolve({
              valid: true,
              botInfo: result.result
            });
          } else {
            resolve({ valid: false, error: result.description || 'Неверный токен' });
          }
        } catch (error) {
          resolve({ valid: false, error: 'Ошибка проверки токена' });
        }
      });
    }).on('error', () => {
      resolve({ valid: false, error: 'Ошибка соединения с Telegram' });
    });
  });
}

/**
 * Создание и развертывание бота с сохранением в БД
 * Требует аутентификации - каждый пользователь создает свои боты!
 */
router.post('/create', authenticate, async (req, res) => {
  try {
    const { botSettings } = req.body;

    if (!botSettings || !botSettings.name || !botSettings.token) {
      return res.status(400).json({ 
        success: false, 
        message: 'Название бота и токен обязательны' 
      });
    }

    console.log('🚀 Создаем бота:', botSettings.name);

    // 1. ПРОВЕРЯЕМ ТОКЕН через Telegram API
    const tokenValidation = await validateBotToken(botSettings.token);
    if (!tokenValidation.valid) {
      return res.status(400).json({
        success: false,
        message: `❌ Неверный токен: ${tokenValidation.error}`
      });
    }

    const botInfo = tokenValidation.botInfo;
    console.log('✅ Токен валиден! Бот:', botInfo.username);

    // 2. СОХРАНЯЕМ в базу данных (привязываем к текущему пользователю!)
    const userId = req.userId || 1; // Временный fallback для совместимости
    const dbResult = await db.query(
      `INSERT INTO bots (user_id, name, token, description, config, status, telegram_username)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id`,
      [userId, botSettings.name, botSettings.token, botSettings.description || '', JSON.stringify(botSettings), 'running', botInfo.username]
    );
    
    const dbId = dbResult.rows[0].id;
    const botId = `bot_${dbId}`;

    // 3. СОЗДАЕМ ДИРЕКТОРИЮ для бота
    const botDir = path.join(__dirname, '../../deployed_bots', botId);
    await fs.mkdir(botDir, { recursive: true });

    // 4. ГЕНЕРИРУЕМ Python код бота
    const pythonCode = generateAdvancedPythonBot(botSettings, botInfo, botId);
    await fs.writeFile(path.join(botDir, 'bot.py'), pythonCode);

    // 5. СОЗДАЕМ requirements.txt
    // 5. Создаем requirements.txt с необходимыми библиотеками
    const requirements = [
      'python-telegram-bot==20.7',
      'qrcode==7.4.2',  // Для генерации QR кодов
      'pillow==10.1.0'  // Для работы с изображениями (требуется для qrcode)
    ];
    await fs.writeFile(path.join(botDir, 'requirements.txt'), requirements.join('\n'));

    // 6. ГЕНЕРИРУЕМ WebApp для бота (если включен WebApp функционал)
    if (botSettings.features && botSettings.features.webApp) {
      const webAppDir = path.join(botDir, 'webapp');
      await fs.mkdir(webAppDir, { recursive: true });
      
      const webAppHTML = generateWebAppHTML(botSettings, botId);
      await fs.writeFile(path.join(webAppDir, 'index.html'), webAppHTML);
      
      console.log('📱 WebApp создан для бота');
    }

    // 7. СОХРАНЯЕМ настройки в JSON для восстановления
    await fs.writeFile(
      path.join(botDir, 'settings.json'),
      JSON.stringify(botSettings, null, 2)
    );

    // 7. ЗАПУСКАЕМ бота как отдельный процесс
    console.log('🤖 Запускаем бота...');
    const botProcess = spawn('/usr/bin/python3', ['bot.py'], {
      cwd: botDir,
      detached: true,
      stdio: ['ignore', 'pipe', 'pipe']
    });

    // Логируем вывод бота
    botProcess.stdout.on('data', (data) => {
      console.log(`[${botInfo.username}] ${data.toString()}`);
    });

    botProcess.stderr.on('data', (data) => {
      console.error(`[${botInfo.username}] ERROR: ${data.toString()}`);
    });
    
    botProcess.on('exit', async (code) => {
      console.log(`[${botInfo.username}] Процесс завершен с кодом ${code}`);
      runningBots.delete(botId);
      // Обновляем статус в БД
      await db.query('UPDATE bots SET status = $1 WHERE id = $2', ['stopped', dbId]);
    });

    // Сохраняем информацию о запущенном боте
    runningBots.set(botId, {
      process: botProcess,
      dbId: dbId,
      dir: botDir,
      name: botSettings.name,
      username: botInfo.username,
      token: botSettings.token,
      settings: botSettings,
      startedAt: new Date(),
      pid: botProcess.pid
    });

    botProcess.unref();

    console.log(`✅ Бот ${botInfo.username} запущен! PID: ${botProcess.pid}`);

    // 8. ВОЗВРАЩАЕМ результат
    res.status(201).json({
      success: true,
      message: 'Бот успешно создан и запущен!',
      bot: {
        id: botId,
        dbId: dbId,
        name: botSettings.name,
        username: botInfo.username,
        status: 'running',
        url: `https://t.me/${botInfo.username}`,
        deployedAt: new Date().toISOString(),
        scenes: botSettings.scenes?.length || 0,
        features: Object.values(botSettings.features || {}).filter(Boolean).length,
        pid: botProcess.pid,
        directory: botDir
      }
    });

  } catch (error) {
    console.error('❌ Ошибка при создании бота:', error);
    res.status(500).json({
      success: false,
      message: `Ошибка создания бота: ${error.message}`
    });
  }
});

/**
 * Список всех ботов из БД (только свои!)
 * Требует аутентификации
 */
router.get('/list', authenticate, async (req, res) => {
  try {
    // Получаем ТОЛЬКО боты текущего пользователя!
    const userId = req.userId || 1; // Временный fallback
    const result = await db.query(
      'SELECT id, name, telegram_username, description, status, config, created_at, started_at FROM bots WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    
    const botsList = result.rows.map(bot => {
      const botId = `bot_${bot.id}`;
      const runningInfo = runningBots.get(botId);
      
      return {
        id: botId,
        dbId: bot.id,
        name: bot.name,
        username: bot.telegram_username,
        description: bot.description,
        status: bot.status,
        url: `https://t.me/${bot.telegram_username}`,
        createdAt: bot.created_at,
        startedAt: bot.started_at || bot.created_at, // Время запуска или создания
        pid: runningInfo?.pid,
        scenes: bot.config?.scenes?.length || 0,
        settings: bot.config // Настройки для редактирования
      };
    });

    res.json({
      success: true,
      bots: botsList,
      total: botsList.length
    });
  } catch (error) {
    console.error('Ошибка получения списка ботов:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка получения списка ботов'
    });
  }
});

/**
 * Получение настроек конкретного бота
 * Требует аутентификации + ownership!
 */
router.get('/:botId/settings', authenticate, async (req, res) => {
  try {
    const { botId } = req.params;
    const userId = req.userId;
    const dbId = parseInt(botId.replace('bot_', ''));
    
    // Проверяем ownership через БД
    const botRecord = await db.query('SELECT * FROM bots WHERE id = $1 AND user_id = $2', [dbId, userId]);
    if (botRecord.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Бот не найден или у вас нет прав доступа'
      });
    }

    const botInfo = runningBots.get(botId);
    const settings = botInfo ? botInfo.settings : botRecord.rows[0].config;

    res.json({
      success: true,
      settings: settings
    });
  } catch (error) {
    console.error('Ошибка получения настроек бота:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка получения настроек бота'
    });
  }
});

/**
 * Обновление бота с сохранением в БД (Hot Reload)
 * Требует аутентификации + проверка ownership!
 */
router.put('/:botId/update', authenticate, async (req, res) => {
  try {
    const { botId } = req.params;
    const { botSettings } = req.body;
    const userId = req.userId;
    
    // Извлекаем DB ID из botId
    const dbId = parseInt(botId.replace('bot_', ''));
    
    // Проверяем существование в БД + ownership (только СВОЙ бот!)
    const botRecord = await db.query('SELECT * FROM bots WHERE id = $1 AND user_id = $2', [dbId, userId]);
    if (botRecord.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Бот не найден или у вас нет прав доступа'
      });
    }
    
    const botData = botRecord.rows[0];
    const botInfo = runningBots.get(botId) || {
      dir: path.join(__dirname, '../../deployed_bots', botId),
      username: botData.telegram_username,
      token: botData.config?.token || botSettings.token
    };

    console.log('🔄 Обновляем бота:', botData.telegram_username || botId);

    // Валидация токена (если изменился)
    if (botSettings.token !== botInfo.token) {
      const tokenValidation = await validateBotToken(botSettings.token);
      if (!tokenValidation.valid) {
        return res.status(400).json({
          success: false,
          message: `❌ Неверный токен: ${tokenValidation.error}`
        });
      }
    }

    // Обновляем запись в БД
    await db.query(
      'UPDATE bots SET name = $1, description = $2, config = $3, token = $4, updated_at = NOW() WHERE id = $5',
      [botSettings.name, botSettings.description || '', JSON.stringify(botSettings), botSettings.token, dbId]
    );

    // Генерируем новый код бота
    const botInfoForGeneration = {
      username: botInfo.username,
      ...botInfo
    };
    const newPythonCode = generateAdvancedPythonBot(botSettings, botInfoForGeneration, botId);

    // Сохраняем новый код и настройки
    await fs.writeFile(path.join(botInfo.dir, 'bot.py'), newPythonCode);
    await fs.writeFile(
      path.join(botInfo.dir, 'settings.json'),
      JSON.stringify(botSettings, null, 2)
    );
    
    // Регенерируем WebApp (если включен)
    if (botSettings.features?.webApp) {
      console.log('📱 Обновляем WebApp...');
      await generateWebAppHTML(botSettings, botId);
    }

    // Останавливаем старый процесс (если работает)
    if (botInfo.process && botInfo.process.pid) {
      try {
        console.log(`⏹️ Останавливаем старый процесс (PID: ${botInfo.process.pid})...`);
        process.kill(botInfo.process.pid, 'SIGTERM');
        
        // КРИТИЧНО: Ждем 2 секунды чтобы процесс корректно завершился
        // Это предотвращает конфликт getUpdates
        await new Promise(resolve => setTimeout(resolve, 2000));
        console.log('✅ Старый процесс остановлен');
      } catch (e) {
        console.log('⚠️ Процесс уже остановлен или недоступен');
      }
    }
    
    // Удаляем из памяти старую версию
    runningBots.delete(botId);
    
    console.log('🚀 Запускаем обновленного бота...');

    // Запускаем новый процесс
    const newBotProcess = spawn('/usr/bin/python3', ['bot.py'], {
      cwd: botInfo.dir,
      detached: true,
      stdio: ['ignore', 'pipe', 'pipe']
    });

    // Логируем вывод нового бота
    newBotProcess.stdout.on('data', (data) => {
      console.log(`[${botInfo.username}] ${data.toString()}`);
    });

    newBotProcess.stderr.on('data', (data) => {
      console.error(`[${botInfo.username}] ERROR: ${data.toString()}`);
    });
    
    newBotProcess.on('exit', async (code) => {
      console.log(`[${botInfo.username}] Процесс завершен с кодом ${code}`);
      runningBots.delete(botId);
      await db.query('UPDATE bots SET status = $1 WHERE id = $2', ['stopped', dbId]);
    });

    newBotProcess.unref();

    // Обновляем информацию о боте в памяти
    runningBots.set(botId, {
      ...botInfo,
      process: newBotProcess,
      settings: botSettings,
      token: botSettings.token,
      pid: newBotProcess.pid,
      updatedAt: new Date()
    });
    
    // Обновляем статус в БД на 'running'
    await db.query('UPDATE bots SET status = $1, started_at = NOW() WHERE id = $2', ['running', dbId]);

    console.log(`✅ Бот ${botInfo.username} обновлен! Новый PID: ${newBotProcess.pid}`);

    res.json({
      success: true,
      message: 'Бот успешно обновлен!',
      bot: {
        id: botId,
        name: botSettings.name,
        username: botInfo.username,
        status: 'running',
        pid: newBotProcess.pid,
        updatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Ошибка обновления бота:', error);
    res.status(500).json({
      success: false,
      message: `Ошибка обновления бота: ${error.message}`
    });
  }
});

/**
 * Остановка бота (обновление статуса в БД)
 * Требует аутентификации + ownership!
 */
router.delete('/stop/:botId', authenticate, async (req, res) => {
  try {
    const { botId } = req.params;
    const userId = req.userId;
    const dbId = parseInt(botId.replace('bot_', ''));
    
    // Проверяем существование в БД + ownership
    const botRecord = await db.query('SELECT * FROM bots WHERE id = $1 AND user_id = $2', [dbId, userId]);
    if (botRecord.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Бот не найден или у вас нет прав доступа'
      });
    }
    
    const botInfo = runningBots.get(botId);
    const botData = botRecord.rows[0];

    console.log(`🛑 Останавливаем бота: ${botData.telegram_username || botData.name || botId}`);

    // Останавливаем процесс если он запущен
    if (botInfo && botInfo.process) {
      try {
        process.kill(botInfo.process.pid, 'SIGTERM');
        console.log(`✅ Процесс бота остановлен (PID: ${botInfo.process.pid})`);
      } catch (e) {
        console.log('⚠️ Процесс уже остановлен или недоступен');
      }
    } else {
      console.log('ℹ️ Процесс не был запущен');
    }

    // Обновляем статус в БД (НЕ удаляем запись!)
    await db.query('UPDATE bots SET status = $1 WHERE id = $2', ['stopped', dbId]);

    // Удаляем из списка запущенных процессов
    runningBots.delete(botId);

    // НЕ удаляем файлы бота - они нужны для повторного запуска

    res.json({
      success: true,
      message: `Бот ${botData.telegram_username || botData.name || botId} успешно остановлен`
    });

  } catch (error) {
    console.error('Ошибка остановки бота:', error);
    res.status(500).json({
      success: false,
      message: `Ошибка остановки бота: ${error.message}`
    });
  }
});

/**
 * Удаление бота (полное удаление из БД и файловой системы)
 * Требует аутентификации + ownership!
 */
router.delete('/delete/:botId', authenticate, async (req, res) => {
  try {
    const { botId } = req.params;
    const userId = req.userId;
    const dbId = parseInt(botId.replace('bot_', ''));
    
    // Проверяем существование в БД + ownership
    const botRecord = await db.query('SELECT * FROM bots WHERE id = $1 AND user_id = $2', [dbId, userId]);
    if (botRecord.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Бот не найден или у вас нет прав доступа'
      });
    }

    const botData = botRecord.rows[0];
    console.log(`🗑️ Удаляем бота: ${botData.telegram_username || botData.name || botId}`);
    
    const botInfo = runningBots.get(botId);

    // Останавливаем процесс если запущен
    if (botInfo && botInfo.process) {
      try {
        process.kill(botInfo.process.pid, 'SIGTERM');
        console.log('✅ Процесс остановлен перед удалением');
      } catch (e) {
        console.log('⚠️ Процесс уже остановлен');
      }
      runningBots.delete(botId);
    }

    // Удаляем из БД
    await db.query('DELETE FROM bots WHERE id = $1', [dbId]);

    // Удаляем файлы бота
    const botDir = path.join(__dirname, '../../deployed_bots', botId);
    try {
      await fs.rm(botDir, { recursive: true, force: true });
      console.log(`✅ Файлы бота удалены`);
    } catch (e) {
      console.log('Файлы не найдены или уже удалены');
    }

    res.json({
      success: true,
      message: 'Бот успешно удален'
    });

  } catch (error) {
    console.error('Ошибка удаления бота:', error);
    res.status(500).json({
      success: false,
      message: `Ошибка удаления бота: ${error.message}`
    });
  }
});

/**
 * Повторный запуск остановленного бота
 * Требует аутентификации + ownership!
 */
router.post('/start/:botId', authenticate, async (req, res) => {
  try {
    const { botId } = req.params;
    const userId = req.userId;
    const dbId = parseInt(botId.replace('bot_', ''));
    
    // Проверяем, не запущен ли уже
    if (runningBots.has(botId)) {
      return res.status(400).json({
        success: false,
        message: 'Бот уже запущен'
      });
    }

    // Получаем данные из БД + ownership
    const result = await db.query(
      'SELECT id, name, token, config, telegram_username FROM bots WHERE id = $1 AND user_id = $2',
      [dbId, userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Бот не найден в базе данных'
      });
    }

    const botRecord = result.rows[0];
    const botDir = path.join(__dirname, '../../deployed_bots', botId);

    console.log('🚀 Запускаем бота:', botRecord.name);

    // Запускаем процесс
    const botProcess = spawn('/usr/bin/python3', ['bot.py'], {
      cwd: botDir,
      detached: true,
      stdio: ['ignore', 'pipe', 'pipe']
    });

    botProcess.stdout.on('data', (data) => {
      console.log(`[${botRecord.name}] ${data.toString()}`);
    });

    botProcess.stderr.on('data', (data) => {
      console.error(`[${botRecord.name}] ERROR: ${data.toString()}`);
    });
    
    botProcess.on('exit', async (code) => {
      console.log(`[${botRecord.name}] Процесс завершен с кодом ${code}`);
      runningBots.delete(botId);
      await db.query('UPDATE bots SET status = $1 WHERE id = $2', ['stopped', dbId]);
    });

    runningBots.set(botId, {
      process: botProcess,
      dbId: dbId,
      dir: botDir,
      name: botRecord.name,
      token: botRecord.token,
      username: botRecord.telegram_username,
      settings: botRecord.config,
      pid: botProcess.pid
    });

    botProcess.unref();

    // Обновляем статус в БД
    await db.query('UPDATE bots SET status = $1 WHERE id = $2', ['running', dbId]);

    console.log(`✅ Бот ${botRecord.name} запущен! PID: ${botProcess.pid}`);

    res.json({
      success: true,
      message: 'Бот успешно запущен',
      bot: {
        id: botId,
        name: botRecord.name,
        status: 'running',
        pid: botProcess.pid
      }
    });

  } catch (error) {
    console.error('Ошибка запуска бота:', error);
    res.status(500).json({
      success: false,
      message: `Ошибка запуска бота: ${error.message}`
    });
  }
});

/**
 * API для WebApp - получение данных бота
 */
router.get('/webapp/:botId/data', async (req, res) => {
  try {
    const { botId } = req.params;
    const dbId = parseInt(botId.replace('bot_', ''));
    
    // Получаем данные бота из БД
    const result = await db.query('SELECT config FROM bots WHERE id = $1', [dbId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Бот не найден' });
    }
    
    const config = result.rows[0].config;
    
    // Формируем данные для WebApp
    const webAppData = {
      name: config.name,
      description: config.description,
      category: config.category,
      webAppContent: config.webAppContent || {},
      features: config.features,
      theme: {
        primaryColor: config.category === 'ecommerce' ? '#3b82f6' : '#8b5cf6',
        accentColor: config.category === 'ecommerce' ? '#10b981' : '#ec4899'
      }
    };
    
    res.json({
      success: true,
      data: webAppData
    });
    
  } catch (error) {
    console.error('Ошибка получения данных WebApp:', error);
    res.status(500).json({
      success: false,
      message: `Ошибка: ${error.message}`
    });
  }
});

/**
 * API для WebApp - отправка действия (заказ, регистрация и т.д.)
 */
router.post('/webapp/:botId/action', async (req, res) => {
  try {
    const { botId } = req.params;
    const { action, data, userId } = req.body;
    
    console.log(`📱 WebApp Action: ${action}`, data);
    
    // Здесь можно сохранять действия в БД, отправлять уведомления админу и т.д.
    // Пример: заказ, регистрация на активность, обратная связь
    
    // TODO: Интеграция с ботом - отправить уведомление через Telegram
    
    res.json({
      success: true,
      message: 'Действие выполнено',
      actionId: Date.now()
    });
    
  } catch (error) {
    console.error('Ошибка обработки действия WebApp:', error);
    res.status(500).json({
      success: false,
      message: `Ошибка: ${error.message}`
    });
  }
});

module.exports = router;