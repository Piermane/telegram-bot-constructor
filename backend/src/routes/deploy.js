const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');
const { spawn, exec } = require('child_process');
const https = require('https');
const { generateAdvancedPythonBot } = require('../utils/advanced-bot-generator');

// Хранилище запущенных ботов
const runningBots = new Map();

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
 * Создание и развертывание НАСТОЯЩЕГО бота
 */
router.post('/create', async (req, res) => {
  try {
    const { botSettings } = req.body;

    if (!botSettings || !botSettings.name || !botSettings.token) {
      return res.status(400).json({ 
        success: false, 
        message: 'Название бота и токен обязательны' 
      });
    }

    console.log('🚀 Создаем НАСТОЯЩЕГО бота:', botSettings.name);

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

    // 2. СОЗДАЕМ ДИРЕКТОРИЮ для бота
    const botId = `bot_${Date.now()}`;
    const botDir = path.join(__dirname, '../../deployed_bots', botId);
    await fs.mkdir(botDir, { recursive: true });

    // 3. ГЕНЕРИРУЕМ продвинутый Python код бота
    const pythonCode = generateAdvancedPythonBot(botSettings, botInfo);

    await fs.writeFile(path.join(botDir, 'bot.py'), pythonCode);

    // 4. СОЗДАЕМ requirements.txt
    await fs.writeFile(path.join(botDir, 'requirements.txt'), 'python-telegram-bot==20.7');

    // 5. ЗАПУСКАЕМ бота как отдельный процесс
    console.log('🤖 Запускаем бота...');
    const botProcess = spawn('python3', ['bot.py'], {
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

    // Сохраняем информацию о запущенном боте
    runningBots.set(botId, {
      process: botProcess,
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

    // 6. ВОЗВРАЩАЕМ результат
    res.status(201).json({
      success: true,
      message: 'НАСТОЯЩИЙ бот успешно создан и запущен!',
      bot: {
        id: botId,
        name: botSettings.name,
        username: botInfo.username,
        status: 'running',
        url: `https://t.me/${botInfo.username}`,
        realBot: true,
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
 * Список запущенных ботов
 */
router.get('/list', async (req, res) => {
  try {
    const botsList = Array.from(runningBots.entries()).map(([id, info]) => ({
      id,
      name: info.name,
      username: info.username,
      status: 'running',
      url: `https://t.me/${info.username}`,
      startedAt: info.startedAt,
      pid: info.pid,
      scenes: info.settings.scenes?.length || 0,
      settings: info.settings // Добавляем настройки для редактирования
    }));

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
 */
router.get('/:botId/settings', async (req, res) => {
  try {
    const { botId } = req.params;
    const botInfo = runningBots.get(botId);

    if (!botInfo) {
      return res.status(404).json({
        success: false,
        message: 'Бот не найден'
      });
    }

    res.json({
      success: true,
      settings: botInfo.settings
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
 * Обновление бота без остановки (Hot Reload)
 */
router.put('/:botId/update', async (req, res) => {
  try {
    const { botId } = req.params;
    const { botSettings } = req.body;
    const botInfo = runningBots.get(botId);

    if (!botInfo) {
      return res.status(404).json({
        success: false,
        message: 'Бот не найден'
      });
    }

    console.log('🔄 Обновляем бота:', botId);

    // Валидация токена (если изменился)
    if (botSettings.token !== botInfo.settings.token) {
      const tokenValidation = await validateBotToken(botSettings.token);
      if (!tokenValidation.valid) {
        return res.status(400).json({
          success: false,
          message: `❌ Неверный токен: ${tokenValidation.error}`
        });
      }
    }

    // Генерируем новый код бота
    const botInfoForGeneration = {
      username: botInfo.username,
      ...botInfo
    };
    const newPythonCode = generateAdvancedPythonBot(botSettings, botInfoForGeneration);

    // Сохраняем новый код
    await fs.writeFile(path.join(botInfo.dir, 'bot.py'), newPythonCode);

    // Останавливаем старый процесс
    try {
      process.kill(botInfo.process.pid, 'SIGTERM');
    } catch (e) {
      console.log('Процесс уже остановлен');
    }

    // Запускаем новый процесс
    const newBotProcess = spawn('python3', ['bot.py'], {
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

    newBotProcess.unref();

    // Обновляем информацию о боте
    runningBots.set(botId, {
      ...botInfo,
      process: newBotProcess,
      settings: botSettings,
      pid: newBotProcess.pid,
      updatedAt: new Date()
    });

    console.log(`🔄 Бот ${botInfo.username} обновлен! Новый PID: ${newBotProcess.pid}`);

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
 * Остановка бота
 */
router.delete('/stop/:botId', async (req, res) => {
  try {
    const { botId } = req.params;
    const botInfo = runningBots.get(botId);

    if (!botInfo) {
      return res.status(404).json({
        success: false,
        message: 'Бот не найден'
      });
    }

    console.log('🛑 Останавливаем бота:', botInfo.username);

    // Останавливаем процесс
    try {
      process.kill(botInfo.process.pid, 'SIGTERM');
      console.log(`✅ Процесс бота ${botInfo.username} остановлен (PID: ${botInfo.process.pid})`);
    } catch (e) {
      console.log('Процесс уже остановлен');
    }

    // Удаляем из списка запущенных
    runningBots.delete(botId);

    // Удаляем файлы бота
    try {
      await fs.rm(botInfo.dir, { recursive: true, force: true });
      console.log(`✅ Файлы бота ${botInfo.username} удалены`);
    } catch (e) {
      console.log('Файлы уже удалены');
    }

    res.json({
      success: true,
      message: `Бот ${botInfo.username} успешно остановлен и удален`
    });

  } catch (error) {
    console.error('Ошибка остановки бота:', error);
    res.status(500).json({
      success: false,
      message: `Ошибка остановки бота: ${error.message}`
    });
  }
});

module.exports = router;