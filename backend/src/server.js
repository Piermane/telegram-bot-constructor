const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const logger = require('./utils/logger');
const db = require('./utils/database');
const redis = require('./utils/redis');
const errorHandler = require('./middleware/errorHandler');

// Routes
const authRoutes = require('./routes/auth');
const botsRoutes = require('./routes/bots');
const templatesRoutes = require('./routes/templates');
const analyticsRoutes = require('./routes/analytics');
const healthRoutes = require('./routes/health');
const deployRoutes = require('./routes/deploy');

const app = express();
const PORT = process.env.PORT || 5000;

// Trust proxy for Railway/Heroku
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      connectSrc: ["'self'", "http://localhost:5555", "https://*.railway.app"],
    },
  },
}));

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

// Middleware
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
app.use(morgan('combined', {
  stream: {
    write: (message) => logger.info(message.trim()),
  },
}));

// API Routes FIRST (before static files)
app.use('/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/bots', botsRoutes);
app.use('/api/templates', templatesRoutes);
app.use('/api/analytics', analyticsRoutes);
// Временно убираем auth для деплоя
app.use('/api/deploy', deployRoutes);

// WebApp logic - check if this is WebApp request (BEFORE static files)
const path = require('path');
app.get('/', (req, res) => {
  console.log('🔍 Root request with query:', req.query);
  
  // Check if this is a WebApp request (has bot parameters)
  if (req.query.type || req.query.name || req.query.content) {
    console.log('✅ WebApp request detected!');
    
    // This is WebApp request - serve dynamic content
    const { type, name, content } = req.query;
    
    let parsedContent = {};
    try {
      parsedContent = content ? JSON.parse(decodeURIComponent(content)) : {};
    } catch (error) {
      console.log('Failed to parse content:', error);
    }
    
    res.send(`
      <!DOCTYPE html>
      <html lang="ru">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${decodeURIComponent(name || 'WebApp')}</title>
          <script src="https://telegram.org/js/telegram-web-app.js"></script>
          <style>
              * { margin: 0; padding: 0; box-sizing: border-box; }
              :root {
                  --primary: #007AFF;
                  --primary-dark: #0051D5;
                  --secondary: #5856D6;
                  --success: #30D158;
                  --warning: #FF9F0A;
                  --danger: #FF3B30;
                  --bg-primary: #F2F2F7;
                  --bg-secondary: #FFFFFF;
                  --bg-tertiary: #F2F2F7;
                  --text-primary: #000000;
                  --text-secondary: #8E8E93;
                  --text-tertiary: #C7C7CC;
                  --border: #C6C6C8;
                  --shadow: rgba(0, 0, 0, 0.04);
                  --shadow-heavy: rgba(0, 0, 0, 0.12);
                  --border-radius: 12px;
                  --border-radius-large: 16px;
                  --spacing-xs: 4px;
                  --spacing-sm: 8px;
                  --spacing-md: 16px;
                  --spacing-lg: 24px;
                  --spacing-xl: 32px;
              }
              
              @media (prefers-color-scheme: dark) {
                  :root {
                      --bg-primary: #000000;
                      --bg-secondary: #1C1C1E;
                      --bg-tertiary: #2C2C2E;
                      --text-primary: #FFFFFF;
                      --text-secondary: #8E8E93;
                      --text-tertiary: #48484A;
                      --border: #38383A;
                      --shadow: rgba(255, 255, 255, 0.04);
                      --shadow-heavy: rgba(255, 255, 255, 0.08);
                  }
              }
              
              body {
                  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                  background: var(--tg-theme-bg-color, var(--bg-primary));
                  color: var(--tg-theme-text-color, var(--text-primary));
                  line-height: 1.5;
                  min-height: 100vh;
                  padding: 0;
                  font-size: 16px;
                  -webkit-font-smoothing: antialiased;
                  -moz-osx-font-smoothing: grayscale;
              }
              .container {
                  max-width: 100%;
                  margin: 0 auto;
                  background: var(--tg-theme-bg-color, var(--bg-primary));
                  min-height: 100vh;
                  position: relative;
              }
              .header {
                  background: var(--tg-theme-header-bg-color, var(--bg-secondary));
                  color: var(--tg-theme-text-color, var(--text-primary));
                  padding: var(--spacing-lg) var(--spacing-md);
                  text-align: center;
                  position: sticky;
                  top: 0;
                  z-index: 100;
                  backdrop-filter: blur(20px);
                  -webkit-backdrop-filter: blur(20px);
                  border-bottom: 1px solid var(--border);
              }
              .header h1 {
                  font-size: 28px;
                  font-weight: 700;
                  margin-bottom: var(--spacing-xs);
                  letter-spacing: -0.5px;
              }
              .header p {
                  color: var(--text-secondary);
                  font-size: 16px;
                  font-weight: 400;
              }
              .content {
                  padding: var(--spacing-md);
                  max-width: 100%;
              }
              .section {
                  background: var(--tg-theme-secondary-bg-color, var(--bg-secondary));
                  border-radius: var(--border-radius-large);
                  margin: var(--spacing-md) 0;
                  box-shadow: 0 1px 3px var(--shadow);
                  border: 1px solid var(--border);
                  overflow: hidden;
              }
              .section h2 {
                  background: var(--bg-secondary);
                  color: var(--text-primary);
                  padding: var(--spacing-md);
                  margin: 0;
                  font-size: 20px;
                  font-weight: 600;
                  border-bottom: 1px solid var(--border);
                  letter-spacing: -0.3px;
              }
              .section-content {
                  padding: var(--spacing-md);
              }
              .card {
                  background: var(--bg-secondary);
                  border: 1px solid var(--border);
                  border-radius: var(--border-radius);
                  padding: var(--spacing-md);
                  margin: var(--spacing-sm) 0;
                  transition: all 0.2s cubic-bezier(0.4, 0.0, 0.2, 1);
                  position: relative;
                  overflow: hidden;
              }
              .card:active {
                  transform: scale(0.98);
                  background: var(--bg-tertiary);
              }
              .card:last-child {
                  margin-bottom: 0;
              }
              .card::before {
                  content: '';
                  position: absolute;
                  top: 0;
                  left: 0;
                  width: 3px;
                  height: 100%;
                  background: var(--primary);
                  opacity: 0;
                  transition: opacity 0.2s ease;
              }
              .card:active::before {
                  opacity: 1;
              }
              .card h3 {
                  color: var(--text-primary);
                  font-size: 18px;
                  font-weight: 600;
                  margin-bottom: var(--spacing-xs);
                  letter-spacing: -0.2px;
                  display: flex;
                  align-items: center;
                  gap: var(--spacing-sm);
              }
              .card p {
                  color: var(--text-secondary);
                  margin: var(--spacing-xs) 0;
                  line-height: 1.4;
                  font-size: 15px;
              }
              .card .meta {
                  font-size: 13px;
                  color: var(--text-secondary);
                  margin: var(--spacing-sm) 0;
                  font-weight: 500;
              }
              .btn {
                  background: var(--primary);
                  color: white;
                  border: none;
                  padding: 12px var(--spacing-md);
                  border-radius: var(--border-radius);
                  font-size: 16px;
                  font-weight: 600;
                  cursor: pointer;
                  width: 100%;
                  margin-top: var(--spacing-sm);
                  transition: all 0.2s cubic-bezier(0.4, 0.0, 0.2, 1);
                  box-shadow: 0 1px 3px var(--shadow);
                  letter-spacing: -0.1px;
                  user-select: none;
                  -webkit-user-select: none;
                  -webkit-tap-highlight-color: transparent;
              }
              .btn:active {
                  transform: scale(0.96);
                  background: var(--primary-dark);
                  box-shadow: 0 1px 2px var(--shadow);
              }
              .price {
                  font-size: 20px;
                  font-weight: 700;
                  color: var(--success);
                  margin: var(--spacing-sm) 0;
                  letter-spacing: -0.3px;
              }
              .footer {
                  padding: var(--spacing-lg) var(--spacing-md);
                  text-align: center;
                  border-top: 1px solid var(--border);
                  margin-top: var(--spacing-xl);
                  background: var(--bg-secondary);
              }
              .footer .btn {
                  background: var(--danger);
                  font-weight: 500;
              }
              .footer .btn:active {
                  background: #D12B20;
              }
              .schedule-card {
                  border-left: 3px solid var(--warning);
              }
              .schedule-time {
                  background: var(--bg-tertiary);
                  padding: var(--spacing-sm);
                  border-radius: var(--border-radius);
                  margin: var(--spacing-sm) 0;
                  border: 1px solid var(--border);
              }
              .time-block {
                  display: flex;
                  justify-content: space-between;
                  align-items: center;
                  margin: var(--spacing-xs) 0;
              }
              .time-label {
                  font-weight: 500;
                  color: var(--text-secondary);
                  font-size: 14px;
              }
              .time-value {
                  font-weight: 600;
                  color: var(--text-primary);
                  font-size: 14px;
                  text-align: right;
              }
              .empty-state {
                  text-align: center;
                  padding: var(--spacing-xl) var(--spacing-md);
                  color: var(--text-secondary);
              }
              .empty-state h3 {
                  color: var(--text-primary);
                  margin-bottom: var(--spacing-sm);
              }
              @media (max-width: 480px) {
                  .content { padding: var(--spacing-sm); }
                  .header { padding: var(--spacing-md) var(--spacing-sm); }
                  .header h1 { font-size: 24px; }
                  .section-content { padding: var(--spacing-sm); }
                  .card { padding: var(--spacing-sm); }
                  .btn { padding: 10px var(--spacing-sm); font-size: 15px; }
              }
              
              /* Анимации появления */
              .card {
                  animation: fadeInUp 0.3s ease-out forwards;
                  opacity: 0;
                  transform: translateY(10px);
              }
              .card:nth-child(1) { animation-delay: 0.1s; }
              .card:nth-child(2) { animation-delay: 0.15s; }
              .card:nth-child(3) { animation-delay: 0.2s; }
              .card:nth-child(4) { animation-delay: 0.25s; }
              .card:nth-child(5) { animation-delay: 0.3s; }
              
              @keyframes fadeInUp {
                  to {
                      opacity: 1;
                      transform: translateY(0);
                  }
              }
              
              /* Тактильная обратная связь */
              .btn:active, .card:active {
                  -webkit-tap-highlight-color: transparent;
              }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="header">
                  <h1>${decodeURIComponent(name || 'WebApp')}</h1>
                  <p>Добро пожаловать в наше приложение!</p>
              </div>
              
              <div class="content">
                  ${parsedContent.products ? `
                    <div class="section">
                      <h2>🛒 Товары и услуги</h2>
                      <div class="section-content">
                        ${parsedContent.products.map(product => `
                          <div class="card">
                            <h3>${product.emoji || '⭐'} ${product.name || 'Товар'}</h3>
                            ${product.description ? `<p>${product.description}</p>` : ''}
                            <div class="price">💰 ${product.price || 0} ₽</div>
                            <button class="btn" onclick="buyProduct('${product.id}')">🛍️ Купить сейчас</button>
                          </div>
                        `).join('')}
                      </div>
                    </div>
                  ` : ''}
                  
                  ${parsedContent.surveys ? `
                    <div class="section">
                      <h2>📊 Опросы и анкеты</h2>
                      <div class="section-content">
                        ${parsedContent.surveys.map(survey => `
                          <div class="card">
                            <h3>${survey.emoji || '📋'} ${survey.title || 'Опрос'}</h3>
                            ${survey.description ? `<p>${survey.description}</p>` : ''}
                            <div class="meta">🏆 Максимум баллов: ${survey.maxPoints || 0}</div>
                            <button class="btn" onclick="startSurvey('${survey.id}')">📝 Пройти опрос</button>
                          </div>
                        `).join('')}
                      </div>
                    </div>
                  ` : ''}
                  
                  ${parsedContent.activities ? `
                    <div class="section">
                      <h2>🎯 Активности и игры</h2>
                      <div class="section-content">
                        ${parsedContent.activities.map(activity => `
                          <div class="card">
                            <h3>${activity.emoji || '🎮'} ${activity.name || 'Активность'}</h3>
                            ${activity.description ? `<p>${activity.description}</p>` : ''}
                            <div class="meta">⭐ Награда: ${activity.points || 0} баллов</div>
                            <button class="btn" onclick="joinActivity('${activity.id}')">🚀 Участвовать</button>
                          </div>
                        `).join('')}
                      </div>
                    </div>
                  ` : ''}
                  
                  ${parsedContent.schedule ? `
                    <div class="section">
                      <h2>📅 Расписание мероприятий</h2>
                      <div class="section-content">
                        ${parsedContent.schedule.map(event => `
                          <div class="card schedule-card">
                            <h3>📍 ${event.title || 'Мероприятие'}</h3>
                            ${event.speaker ? `<p><strong>🎤 Спикер:</strong> ${event.speaker}</p>` : ''}
                            <div class="schedule-time">
                              <div class="time-block">
                                <span class="time-label">🕐 Начало:</span>
                                <span class="time-value">${new Date(event.startTime).toLocaleString('ru-RU', {
                                  day: '2-digit',
                                  month: '2-digit', 
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}</span>
                              </div>
                              <div class="time-block">
                                <span class="time-label">🕕 Окончание:</span>
                                <span class="time-value">${new Date(event.endTime).toLocaleString('ru-RU', {
                                  day: '2-digit',
                                  month: '2-digit',
                                  year: 'numeric', 
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}</span>
                              </div>
                            </div>
                            <button class="btn" onclick="addToCalendar('${event.id}')">📅 Добавить в календарь</button>
                          </div>
                        `).join('')}
                      </div>
                    </div>
                  ` : ''}
                  
                  ${!parsedContent.products && !parsedContent.surveys && !parsedContent.activities ? `
                    <div class="empty-state">
                      <h3>🎉 Добро пожаловать!</h3>
                      <p>Скоро здесь появится интересный контент</p>
                    </div>
                  ` : ''}
              </div>
              
              <div class="footer">
                <button class="btn" onclick="closeApp()">❌ Закрыть приложение</button>
              </div>
          </div>

          <script>
              // Инициализация Telegram WebApp
              window.Telegram.WebApp.ready();
              window.Telegram.WebApp.expand();
              
              // Сохраняем контент для использования в функциях
              window.webappContent = ${JSON.stringify(parsedContent)};
              
              // Настройка темы
              const theme = window.Telegram.WebApp.themeParams;
              if (theme) {
                  document.documentElement.style.setProperty('--tg-theme-bg-color', theme.bg_color || '#F2F2F7');
                  document.documentElement.style.setProperty('--tg-theme-text-color', theme.text_color || '#000000');
                  document.documentElement.style.setProperty('--tg-theme-button-color', theme.button_color || '#007AFF');
                  document.documentElement.style.setProperty('--tg-theme-secondary-bg-color', theme.secondary_bg_color || '#FFFFFF');
                  document.documentElement.style.setProperty('--tg-theme-header-bg-color', theme.header_bg_color || '#FFFFFF');
              }
              
              // Показать информацию о пользователе
              if (window.Telegram.WebApp.initDataUnsafe.user) {
                  const user = window.Telegram.WebApp.initDataUnsafe.user;
                  console.log('👤 Пользователь:', user.first_name);
                  
                  // Обновляем заголовок с именем пользователя
                  const header = document.querySelector('.header h1');
                  if (header && user.first_name) {
                      header.innerHTML = \`👋 Привет, \${user.first_name}!\`;
                  }
              }
              
              // Инициализация счетчиков
              document.addEventListener('DOMContentLoaded', () => {
                  updateCartBadge();
                  updatePointsBadge();
              });
              
              // Добавляем анимации для toast
              const style = document.createElement('style');
              style.textContent = \`
                  @keyframes fadeInDown {
                      from { opacity: 0; transform: translate(-50%, -20px); }
                      to { opacity: 1; transform: translate(-50%, 0); }
                  }
                  @keyframes fadeOutUp {
                      from { opacity: 1; transform: translate(-50%, 0); }
                      to { opacity: 0; transform: translate(-50%, -20px); }
                  }
              \`;
              document.head.appendChild(style);
              
              // Вибрация при действиях
              function vibrate() {
                  if (window.Telegram.WebApp.HapticFeedback) {
                      window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
                  }
              }
              
              // Состояние корзины
              let cart = JSON.parse(localStorage.getItem('cart') || '[]');
              let userPoints = parseInt(localStorage.getItem('userPoints') || '0');
              
              function updateCartBadge() {
                  const badge = document.getElementById('cartBadge');
                  if (badge) {
                      badge.textContent = cart.length;
                      badge.style.display = cart.length > 0 ? 'block' : 'none';
                  }
              }
              
              function updatePointsBadge() {
                  const badge = document.getElementById('pointsBadge');
                  if (badge) {
                      badge.textContent = userPoints;
                  }
              }
              
              function showToast(message, type = 'success') {
                  const toast = document.createElement('div');
                  toast.style.cssText = \`
                      position: fixed;
                      top: 20px;
                      left: 50%;
                      transform: translateX(-50%);
                      background: \${type === 'success' ? 'var(--success)' : 'var(--danger)'};
                      color: white;
                      padding: 12px 20px;
                      border-radius: var(--border-radius);
                      font-weight: 500;
                      z-index: 1000;
                      animation: fadeInDown 0.3s ease;
                  \`;
                  toast.textContent = message;
                  document.body.appendChild(toast);
                  
                  setTimeout(() => {
                      toast.style.animation = 'fadeOutUp 0.3s ease';
                      setTimeout(() => document.body.removeChild(toast), 300);
                  }, 2000);
              }
              
              function buyProduct(productId) {
                  vibrate();
                  const product = findProductById(productId);
                  if (!product) return;
                  
                  window.Telegram.WebApp.showConfirm(\`Купить "\${product.name}" за \${product.price}₽?\`, (confirmed) => {
                      if (confirmed) {
                          // Добавляем в корзину
                          cart.push({
                              id: productId,
                              name: product.name,
                              price: product.price,
                              emoji: product.emoji,
                              timestamp: Date.now()
                          });
                          localStorage.setItem('cart', JSON.stringify(cart));
                          updateCartBadge();
                          
                          showToast(\`✅ "\${product.name}" добавлен в корзину!\`);
                          
                          // Отправляем данные боту
                          window.Telegram.WebApp.sendData(JSON.stringify({
                              action: 'buy_product',
                              productId: productId,
                              productName: product.name,
                              price: product.price,
                              cartTotal: cart.length
                          }));
                      }
                  });
              }
              
              function startSurvey(surveyId) {
                  vibrate();
                  const survey = findSurveyById(surveyId);
                  if (!survey) return;
                  
                  showToast(\`📋 Запуск опроса "\${survey.title}"...\`);
                  
                  // Симулируем прохождение опроса
                  setTimeout(() => {
                      const earnedPoints = Math.floor(Math.random() * survey.maxPoints) + 1;
                      userPoints += earnedPoints;
                      localStorage.setItem('userPoints', userPoints.toString());
                      updatePointsBadge();
                      
                      showToast(\`🎉 Опрос завершен! +\${earnedPoints} баллов\`);
                      
                      // Отправляем данные боту
                      window.Telegram.WebApp.sendData(JSON.stringify({
                          action: 'complete_survey',
                          surveyId: surveyId,
                          earnedPoints: earnedPoints,
                          totalPoints: userPoints
                      }));
                  }, 2000);
              }
              
              function joinActivity(activityId) {
                  vibrate();
                  const activity = findActivityById(activityId);
                  if (!activity) return;
                  
                  window.Telegram.WebApp.showConfirm(\`Участвовать в "\${activity.name}"?\`, (confirmed) => {
                      if (confirmed) {
                          showToast(\`🎯 Участие в "\${activity.name}" засчитано!\`);
                          
                          // Добавляем баллы
                          userPoints += activity.points;
                          localStorage.setItem('userPoints', userPoints.toString());
                          updatePointsBadge();
                          
                          showToast(\`⭐ +\${activity.points} баллов! Всего: \${userPoints}\`);
                          
                          // Отправляем данные боту
                          window.Telegram.WebApp.sendData(JSON.stringify({
                              action: 'join_activity',
                              activityId: activityId,
                              earnedPoints: activity.points,
                              totalPoints: userPoints
                          }));
                      }
                  });
              }
              
              function addToCalendar(eventId) {
                  vibrate();
                  const event = findEventById(eventId);
                  if (!event) return;
                  
                  window.Telegram.WebApp.showConfirm(\`Добавить "\${event.title}" в календарь?\`, (confirmed) => {
                      if (confirmed) {
                          // Создаем календарную ссылку
                          const startDate = new Date(event.startTime).toISOString().replace(/[:-]/g, '').split('.')[0] + 'Z';
                          const endDate = new Date(event.endTime).toISOString().replace(/[:-]/g, '').split('.')[0] + 'Z';
                          const calendarUrl = \`https://calendar.google.com/calendar/render?action=TEMPLATE&text=\${encodeURIComponent(event.title)}&dates=\${startDate}/\${endDate}&details=\${encodeURIComponent('Спикер: ' + event.speaker)}\`;
                          
                          showToast(\`📅 "\${event.title}" добавлено в календарь!\`);
                          
                          // Открываем календарь
                          window.Telegram.WebApp.openLink(calendarUrl);
                          
                          // Отправляем данные боту
                          window.Telegram.WebApp.sendData(JSON.stringify({
                              action: 'add_to_calendar',
                              eventId: eventId,
                              eventTitle: event.title
                          }));
                      }
                  });
              }
              
              // Вспомогательные функции поиска
              function findProductById(id) {
                  const content = window.webappContent || {};
                  return (content.products || []).find(p => p.id === id);
              }
              
              function findSurveyById(id) {
                  const content = window.webappContent || {};
                  return (content.surveys || []).find(s => s.id === id);
              }
              
              function findActivityById(id) {
                  const content = window.webappContent || {};
                  return (content.activities || []).find(a => a.id === id);
              }
              
              function findEventById(id) {
                  const content = window.webappContent || {};
                  return (content.schedule || []).find(e => e.id === id);
              }
              
              function closeApp() {
                  vibrate();
                  window.Telegram.WebApp.close();
              }
              
              // Настройка главной кнопки
              window.Telegram.WebApp.MainButton.text = "🏠 Главное меню";
              window.Telegram.WebApp.MainButton.color = "#667eea";
              window.Telegram.WebApp.MainButton.show();
              window.Telegram.WebApp.MainButton.onClick(() => {
                  vibrate();
                  window.Telegram.WebApp.showAlert('Возвращаемся в главное меню...');
                  window.Telegram.WebApp.close();
              });
              
              // Обработка жестов
              let startY = 0;
              document.addEventListener('touchstart', function(e) {
                  startY = e.touches[0].clientY;
              });
              
              document.addEventListener('touchend', function(e) {
                  const endY = e.changedTouches[0].clientY;
                  const diff = startY - endY;
                  
                  // Swipe вверх для закрытия
                  if (diff > 100) {
                      closeApp();
                  }
              });
          </script>
      </body>
      </html>
    `);
  } else {
    console.log('❌ Constructor request - serving React app');
    // This is constructor request - serve React app
    res.sendFile(path.join(__dirname, '../public', 'index.html'));
  }
});

// Serve static frontend files AFTER webapp route
app.use(express.static(path.join(__dirname, '../public')));

// WebApp endpoint for Telegram bots
app.get('/webapp/:botId?', (req, res) => {
  const { botId } = req.params;
  
  res.send(`
    <!DOCTYPE html>
    <html lang="ru">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Telegram WebApp</title>
        <script src="https://telegram.org/js/telegram-web-app.js"></script>
        <style>
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
                margin: 0;
                padding: 20px;
                background: var(--tg-theme-bg-color, #ffffff);
                color: var(--tg-theme-text-color, #000000);
            }
            .container {
                max-width: 400px;
                margin: 0 auto;
                text-align: center;
            }
            .btn {
                background: var(--tg-theme-button-color, #0088cc);
                color: var(--tg-theme-button-text-color, #ffffff);
                border: none;
                padding: 12px 24px;
                border-radius: 8px;
                font-size: 16px;
                cursor: pointer;
                margin: 8px;
                width: 100%;
                max-width: 300px;
            }
            .info {
                background: var(--tg-theme-secondary-bg-color, #f0f0f0);
                padding: 15px;
                border-radius: 8px;
                margin: 15px 0;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🤖 Telegram WebApp</h1>
            ${botId ? `<p>Bot ID: <code>${botId}</code></p>` : ''}
            
            <div class="info">
                <p><strong>✅ WebApp работает!</strong></p>
                <p>URL: <code>${req.protocol}://${req.get('host')}/webapp</code></p>
            </div>
            
            <button class="btn" onclick="showAlert()">Тест кнопки</button>
            <button class="btn" onclick="closeApp()">Закрыть</button>
            
            <div id="user-info" class="info" style="display: none;">
                <h3>Информация о пользователе:</h3>
                <p id="user-data"></p>
            </div>
        </div>

        <script>
            // Инициализация Telegram WebApp
            window.Telegram.WebApp.ready();
            
            // Показать информацию о пользователе
            if (window.Telegram.WebApp.initDataUnsafe.user) {
                document.getElementById('user-info').style.display = 'block';
                document.getElementById('user-data').innerHTML = 
                    'Имя: ' + window.Telegram.WebApp.initDataUnsafe.user.first_name + '<br>' +
                    'Username: @' + (window.Telegram.WebApp.initDataUnsafe.user.username || 'не указан');
            }
            
            function showAlert() {
                window.Telegram.WebApp.showAlert('Hello from WebApp! 🎉');
            }
            
            function closeApp() {
                window.Telegram.WebApp.close();
            }
            
            // Настройка главной кнопки
            window.Telegram.WebApp.MainButton.text = "Главная кнопка";
            window.Telegram.WebApp.MainButton.show();
            window.Telegram.WebApp.MainButton.onClick(() => {
                window.Telegram.WebApp.showAlert('Главная кнопка нажата!');
            });
        </script>
    </body>
    </html>
  `);
});

// API Documentation route
app.get('/docs', (req, res) => {
  res.json({
    name: 'TelegramBot Constructor API',
    version: '1.0.0',
    description: 'API for creating and managing Telegram bots',
    endpoints: {
      health: {
        'GET /health': 'Health check',
        'GET /health/ready': 'Readiness check',
      },
      auth: {
        'POST /api/auth/register': 'Register new user',
        'POST /api/auth/login': 'User login',
        'POST /api/auth/logout': 'User logout',
        'GET /api/auth/me': 'Get current user',
      },
      bots: {
        'GET /api/bots': 'Get user bots',
        'POST /api/bots': 'Create new bot',
        'GET /api/bots/:id': 'Get specific bot',
        'PUT /api/bots/:id': 'Update bot',
        'DELETE /api/bots/:id': 'Delete bot',
        'POST /api/bots/:id/deploy': 'Deploy bot',
        'POST /api/bots/:id/stop': 'Stop bot',
        'POST /api/bots/:id/test': 'Test bot message',
      },
      templates: {
        'GET /api/templates': 'Get bot templates',
        'GET /api/templates/:id': 'Get specific template',
        'POST /api/templates/:id/use': 'Create bot from template',
      },
      analytics: {
        'GET /api/analytics/bots/:id': 'Get bot analytics',
        'GET /api/analytics/bots/:id/stats': 'Get bot statistics',
      },
    },
    baseUrl: `http://localhost:${PORT}`,
  });
});

// Fallback for React Router (SPA)
app.get('*', (req, res) => {
  // Don't serve SPA for API routes
  if (req.path.startsWith('/api/') || req.path.startsWith('/health') || req.path.startsWith('/docs')) {
    return res.status(404).json({
      error: 'Not Found',
      message: `Route ${req.originalUrl} not found`,
      availableRoutes: [
        'GET /health',
        'GET /docs',
        'POST /api/auth/login',
        'GET /api/bots',
        'GET /api/templates',
      ],
    });
  }
  
  res.sendFile(path.join(__dirname, '../public', 'index.html'));
});

// Error handling middleware
app.use(errorHandler);

// Graceful shutdown handler
const gracefulShutdown = async (signal) => {
  logger.info(`Received ${signal}, shutting down gracefully...`);
  
  // Close database connections
  if (db.pool) {
    await db.pool.end();
    logger.info('Database connections closed');
  }
  
  // Close Redis connection
  if (redis.client) {
    await redis.client.quit();
    logger.info('Redis connection closed');
  }
  
  process.exit(0);
};

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Start server
const startServer = async () => {
  try {
    // Test database connection
    await db.testConnection();
    logger.info('Database connection established');
    
    // Test Redis connection
    await redis.testConnection();
    logger.info('Redis connection established');
    
    // Start HTTP server
    app.listen(PORT, '0.0.0.0', () => {
      logger.info(`🤖 TelegramBot Constructor API server running on port ${PORT}`);
      logger.info(`📖 API Documentation: http://localhost:${PORT}/docs`);
      logger.info(`🏥 Health Check: http://localhost:${PORT}/health`);
      logger.info(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
