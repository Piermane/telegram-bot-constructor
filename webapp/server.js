const https = require('https');
const fs = require('fs');
const path = require('path');
const url = require('url');

// Функция для обслуживания статических страниц
function servePage(res, filename) {
  const filePath = path.join(__dirname, 'src', 'pages', filename);
  
  fs.readFile(filePath, (err, data) => {
    if (err) {
      console.error(`❌ Error reading ${filename}:`, err);
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Page not found');
      return;
    }
    
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(data);
  });
}

// Типы меню для разных категорий ботов
const MENU_TEMPLATES = {
  restaurant_delivery: {
    title: '🍕 Меню ресторана',
    categories: [
      {
        name: '🍕 Пицца',
        items: [
          { id: 'margherita', name: 'Маргарита', price: 890, emoji: '🍕', description: 'Томаты, моцарелла, базилик' },
          { id: 'pepperoni', name: 'Пепперони', price: 1190, emoji: '🍕', description: 'Пепперони, сыр, томатный соус' },
          { id: 'four-cheese', name: 'Четыре сыра', price: 1290, emoji: '🧀', description: 'Горгонзола, пармезан, моцарелла, рикотта' },
          { id: 'meat-lovers', name: 'Мясная', price: 1490, emoji: '🥩', description: 'Бекон, пепперони, колбаса, ветчина' }
        ]
      },
      {
        name: '🍝 Паста',
        items: [
          { id: 'carbonara', name: 'Карбонара', price: 790, emoji: '🍝', description: 'Бекон, яйца, пармезан, сливки' },
          { id: 'bolognese', name: 'Болоньезе', price: 890, emoji: '🍝', description: 'Мясной соус, томаты, базилик' },
          { id: 'alfredo', name: 'Альфредо', price: 850, emoji: '🍝', description: 'Сливочный соус, пармезан, курица' }
        ]
      },
      {
        name: '🥗 Салаты',
        items: [
          { id: 'caesar', name: 'Цезарь', price: 590, emoji: '🥗', description: 'Листья салата, курица, пармезан, сухарики' },
          { id: 'greek', name: 'Греческий', price: 490, emoji: '🥗', description: 'Помидоры, огурцы, фета, оливки' }
        ]
      },
      {
        name: '🥤 Напитки',
        items: [
          { id: 'cola', name: 'Кола', price: 190, emoji: '🥤', description: '0.5л' },
          { id: 'water', name: 'Вода', price: 90, emoji: '💧', description: '0.5л' },
          { id: 'juice', name: 'Сок апельсиновый', price: 250, emoji: '🍊', description: '0.3л' }
        ]
      }
    ]
  },

  electronics_store: {
    title: '📱 Каталог электроники',
    categories: [
      {
        name: '📱 Смартфоны',
        items: [
          { id: 'iphone15', name: 'iPhone 15', price: 79990, emoji: '📱', description: '128GB, все цвета' },
          { id: 'samsung-s24', name: 'Samsung Galaxy S24', price: 69990, emoji: '📱', description: '256GB, 5G' },
          { id: 'xiaomi-14', name: 'Xiaomi 14', price: 49990, emoji: '📱', description: '256GB, камера 50MP' }
        ]
      },
      {
        name: '💻 Ноутбуки',
        items: [
          { id: 'macbook-air', name: 'MacBook Air M3', price: 129990, emoji: '💻', description: '8GB RAM, 256GB SSD' },
          { id: 'dell-xps', name: 'Dell XPS 13', price: 89990, emoji: '💻', description: '16GB RAM, 512GB SSD' }
        ]
      },
      {
        name: '🎧 Аксессуары',
        items: [
          { id: 'airpods', name: 'AirPods Pro', price: 24990, emoji: '🎧', description: 'Шумоподавление, USB-C' },
          { id: 'watch', name: 'Apple Watch', price: 34990, emoji: '⌚', description: 'GPS, 45mm' }
        ]
      }
    ]
  },

  fitness_club: {
    title: '💪 Расписание тренировок',
    categories: [
      {
        name: '🏃‍♂️ Сегодня',
        items: [
          { id: 'morning-yoga', name: 'Йога для начинающих', price: 0, emoji: '🧘‍♀️', description: '08:00 - 09:00, Зал 1, Анна' },
          { id: 'crossfit', name: 'CrossFit', price: 0, emoji: '🏋️‍♂️', description: '19:00 - 20:00, Зал 2, Максим' },
          { id: 'pilates', name: 'Пилатес', price: 0, emoji: '🤸‍♀️', description: '20:00 - 21:00, Зал 1, Елена' }
        ]
      },
      {
        name: '📅 Завтра',
        items: [
          { id: 'strength', name: 'Силовая тренировка', price: 0, emoji: '💪', description: '18:00 - 19:00, Зал 2, Дмитрий' },
          { id: 'zumba', name: 'Zumba', price: 0, emoji: '💃', description: '19:00 - 20:00, Зал 1, Мария' }
        ]
      }
    ]
  },

  medical_clinic: {
    title: '🏥 Запись к врачам',
    categories: [
      {
        name: '👨‍⚕️ Врачи',
        items: [
          { id: 'therapist', name: 'Терапевт', price: 2500, emoji: '👨‍⚕️', description: 'Иванов И.И., ближайший прием: завтра 14:00' },
          { id: 'cardiologist', name: 'Кардиолог', price: 3500, emoji: '❤️', description: 'Петров П.П., ближайший прием: понедельник 10:00' },
          { id: 'dentist', name: 'Стоматолог', price: 3000, emoji: '🦷', description: 'Сидоров С.С., ближайший прием: сегодня 16:00' }
        ]
      },
      {
        name: '🧪 Анализы',
        items: [
          { id: 'blood-test', name: 'Общий анализ крови', price: 800, emoji: '🧪', description: 'Забор крови: пн-пт 8:00-10:00' },
          { id: 'urine-test', name: 'Общий анализ мочи', price: 500, emoji: '🧪', description: 'Прием анализов: пн-сб 8:00-12:00' }
        ]
      }
    ]
  }
};

// Создание HTML для WebApp
function generateWebAppHTML(botType, botName, botDescription, customContent = {}) {
  // Если есть кастомный контент, используем его
  let menuData;
  if (customContent && Object.keys(customContent).length > 0) {
    menuData = {
      title: '🎪 Мероприятие',
      categories: []
    };
    
    // Добавляем товары/услуги
    if (customContent.products && customContent.products.length > 0) {
      menuData.categories.push({
        name: '🛍️ Товары/Услуги',
        items: customContent.products.map(product => ({
          id: product.id,
          name: product.name,
          price: product.price,
          emoji: product.emoji || '⭐',
          description: product.description
        }))
      });
    }
    
    // Добавляем опросы
    if (customContent.surveys && customContent.surveys.length > 0) {
      menuData.categories.push({
        name: '📊 Опросы и викторины',
        items: customContent.surveys.map(survey => ({
          id: survey.id,
          name: survey.title,
          price: survey.maxPoints,
          emoji: survey.emoji || '📊',
          description: survey.description,
          type: 'survey'
        }))
      });
    }
    
    // Добавляем активности
    if (customContent.activities && customContent.activities.length > 0) {
      menuData.categories.push({
        name: '🎯 Активности и задания',
        items: customContent.activities.map(activity => ({
          id: activity.id,
          name: activity.name,
          price: activity.points,
          emoji: activity.emoji || '🎯',
          description: activity.description,
          type: 'activity'
        }))
      });
    }
    
    // Добавляем расписание
    if (customContent.schedule && customContent.schedule.length > 0) {
      menuData.categories.push({
        name: '📅 Расписание мероприятий',
        items: customContent.schedule.map(event => ({
          id: event.id,
          name: event.title,
          price: 0,
          emoji: '📅',
          description: `${event.speaker} • ${new Date(event.startTime).toLocaleString('ru')}`,
          type: 'event'
        }))
      });
    }
  } else {
    // Используем стандартные шаблоны
    menuData = MENU_TEMPLATES[botType] || {
    title: '📋 Услуги',
    categories: [
      {
        name: '🔸 Основные услуги',
        items: [
          { id: 'service1', name: 'Услуга 1', price: 1000, emoji: '⭐', description: 'Описание услуги 1' },
          { id: 'service2', name: 'Услуга 2', price: 1500, emoji: '⭐', description: 'Описание услуги 2' }
        ]
      }
    ]
    };
  }

  return `<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${botName} - WebApp</title>
    <script src="https://telegram.org/js/telegram-web-app.js"></script>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: var(--tg-theme-bg-color, #ffffff);
            color: var(--tg-theme-text-color, #000000);
            padding: 0;
            overflow-x: hidden;
        }
        
        .header {
            background: var(--tg-theme-secondary-bg-color, #f8f9fa);
            padding: 20px;
            text-align: center;
            border-bottom: 1px solid var(--tg-theme-hint-color, #e9ecef);
        }
        
        .header h1 {
            font-size: 20px;
            margin-bottom: 8px;
            color: var(--tg-theme-text-color);
        }
        
        .header p {
            color: var(--tg-theme-hint-color);
            font-size: 14px;
        }
        
        .container {
            padding: 20px;
        }
        
        .category {
            margin-bottom: 30px;
        }
        
        .category-title {
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 15px;
            padding: 10px 0;
            color: var(--tg-theme-text-color);
            border-bottom: 2px solid var(--tg-theme-button-color, #3390ec);
        }
        
        .items-grid {
            display: grid;
            gap: 12px;
        }
        
        .item {
            background: var(--tg-theme-bg-color, #ffffff);
            border: 1px solid var(--tg-theme-hint-color, #e9ecef);
            border-radius: 12px;
            padding: 16px;
            cursor: pointer;
            transition: all 0.2s ease;
            display: flex;
            align-items: center;
            gap: 12px;
        }
        
        .item:hover, .item:active {
            background: var(--tg-theme-secondary-bg-color, #f8f9fa);
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        
        .item-emoji {
            font-size: 24px;
            width: 40px;
            text-align: center;
        }
        
        .item-info {
            flex: 1;
        }
        
        .item-name {
            font-weight: 600;
            font-size: 16px;
            margin-bottom: 4px;
            color: var(--tg-theme-text-color);
        }
        
        .item-description {
            color: var(--tg-theme-hint-color);
            font-size: 12px;
            margin-bottom: 6px;
        }
        
        .item-price {
            font-weight: 600;
            color: var(--tg-theme-button-color, #3390ec);
            font-size: 14px;
        }
        
        .cart-counter {
            background: var(--tg-theme-button-color, #3390ec);
            color: var(--tg-theme-button-text-color, #ffffff);
            border-radius: 50%;
            width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            font-weight: 600;
        }
        
        .cart-info {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            background: var(--tg-theme-button-color, #3390ec);
            color: var(--tg-theme-button-text-color, #ffffff);
            padding: 16px 20px;
            display: none;
            align-items: center;
            justify-content: space-between;
            font-weight: 600;
        }
        
        .cart-info.show {
            display: flex;
        }
        
        .empty-state {
            text-align: center;
            padding: 60px 20px;
            color: var(--tg-theme-hint-color);
        }
        
        .empty-state-emoji {
            font-size: 48px;
            margin-bottom: 16px;
        }
        
        .loading {
            text-align: center;
            padding: 40px;
            color: var(--tg-theme-hint-color);
        }
    </style>
</head>
<body>
    <div class="header">
        <h1 id="bot-title">${botName}</h1>
        <p id="bot-description">${botDescription}</p>
    </div>

    <div class="container" id="content">
        ${menuData.categories.map(category => `
        <div class="category">
            <div class="category-title">${category.name}</div>
            <div class="items-grid">
                ${category.items.map(item => `
                <div class="item" data-item-id="${item.id}" data-price="${item.price}">
                    <div class="item-emoji">${item.emoji}</div>
                    <div class="item-info">
                        <div class="item-name">${item.name}</div>
                        <div class="item-description">${item.description}</div>
                        <div class="item-price">${item.price > 0 ? item.price + '₽' : 'Бесплатно'}</div>
                    </div>
                    <div class="cart-counter" id="counter-${item.id}" style="display: none;">0</div>
                </div>
                `).join('')}
            </div>
        </div>
        `).join('')}
    </div>

    <div class="cart-info" id="cart-info">
        <span id="cart-text">🛒 Корзина • 0₽</span>
        <span>Нажмите для оформления</span>
    </div>

    <script>
        // Инициализация Telegram WebApp
        const tg = window.Telegram.WebApp;
        tg.ready();
        tg.expand();
        
        // Состояние корзины
        let cart = {};
        let total = 0;
        
        // Обработчики кликов по товарам
        document.addEventListener('click', (e) => {
            const item = e.target.closest('.item');
            if (!item) return;
            
            const itemId = item.dataset.itemId;
            const price = parseInt(item.dataset.price);
            const name = item.querySelector('.item-name').textContent;
            
            // Добавляем в корзину
            if (cart[itemId]) {
                cart[itemId].quantity++;
            } else {
                cart[itemId] = {
                    name: name,
                    price: price,
                    quantity: 1
                };
            }
            
            updateUI();
            
            // Анимация
            tg.HapticFeedback.impactOccurred('light');
            item.style.transform = 'scale(0.98)';
            setTimeout(() => {
                item.style.transform = '';
            }, 100);
        });
        
        // Обновление интерфейса
        function updateUI() {
            total = 0;
            let itemCount = 0;
            
            // Сброс счетчиков
            document.querySelectorAll('.cart-counter').forEach(counter => {
                counter.style.display = 'none';
                counter.textContent = '0';
            });
            
            // Подсчет итогов
            Object.entries(cart).forEach(([itemId, item]) => {
                total += item.price * item.quantity;
                itemCount += item.quantity;
                
                const counter = document.getElementById('counter-' + itemId);
                if (counter) {
                    counter.style.display = 'flex';
                    counter.textContent = item.quantity;
                }
            });
            
            // Обновление корзины
            const cartInfo = document.getElementById('cart-info');
            const cartText = document.getElementById('cart-text');
            
            if (itemCount > 0) {
                cartInfo.classList.add('show');
                cartText.textContent = \`🛒 Корзина (\${itemCount}) • \${total}₽\`;
                
                // Настройка главной кнопки Telegram
                tg.MainButton.setText(\`Оформить заказ • \${total}₽\`);
                tg.MainButton.show();
            } else {
                cartInfo.classList.remove('show');
                tg.MainButton.hide();
            }
        }
        
        // Обработчик главной кнопки
        tg.onEvent('mainButtonClicked', () => {
            const cartData = {
                action: 'checkout',
                items: cart,
                total: total,
                itemCount: Object.values(cart).reduce((sum, item) => sum + item.quantity, 0)
            };
            
            tg.sendData(JSON.stringify(cartData));
            tg.close();
        });
        
        // Обработчик клика по корзине
        document.getElementById('cart-info').addEventListener('click', () => {
            const cartData = {
                action: 'view_cart',
                items: cart,
                total: total
            };
            
            tg.sendData(JSON.stringify(cartData));
        });
        
        console.log('WebApp initialized for:', {
            botType: '${botType}',
            botName: '${botName}',
            categories: ${JSON.stringify(menuData.categories.length)}
        });
    </script>
</body>
</html>`;
}

// SSL сертификаты (самоподписанные для разработки)
const options = {
  key: fs.readFileSync(path.join(__dirname, 'ssl', 'key.pem')),
  cert: fs.readFileSync(path.join(__dirname, 'ssl', 'cert.pem'))
};

// Создание HTTPS сервера
const server = https.createServer(options, (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const query = parsedUrl.query;

  // CORS заголовки
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Professional Event Management pages
  if (pathname === '/dashboard') {
    servePage(res, 'dashboard.html');
  } else if (pathname === '/admin') {
    servePage(res, 'admin.html');
  } else if (pathname === '/schedule') {
    servePage(res, 'schedule.html');
  } else if (pathname === '/activities') {
    servePage(res, 'activities.html');
  } else if (pathname === '/qr-scanner') {
    servePage(res, 'qr-scanner.html');
  } else if (pathname === '/profile') {
    servePage(res, 'profile.html');
  } else if (pathname === '/shop') {
    servePage(res, 'shop.html');
  } else if (pathname === '/orders') {
    servePage(res, 'orders.html');
  } else if (pathname === '/') {
    // Генерируем WebApp на основе параметров
    const botType = query.type || 'universal';
    const botName = query.name || 'WebApp';
    const botDescription = query.description || 'Выберите нужный раздел';
    
    // Парсим весь кастомный контент если передан
    let customContent = {};
    if (query.content) {
      try {
        customContent = JSON.parse(decodeURIComponent(query.content));
      } catch (e) {
        console.log('Ошибка парсинга контента:', e);
      }
    }
    
    // Для обратной совместимости - поддерживаем старый параметр products
    if (query.products && !customContent.products) {
      try {
        customContent.products = JSON.parse(decodeURIComponent(query.products));
      } catch (e) {
        console.log('Ошибка парсинга товаров:', e);
      }
    }

    const html = generateWebAppHTML(botType, botName, botDescription, customContent);

    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(html);
  } else if (pathname === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'OK', timestamp: new Date().toISOString() }));
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});

const PORT = process.env.WEBAPP_PORT || 8443;

server.listen(PORT, () => {
  console.log(`🌐 WebApp HTTPS server running on https://localhost:${PORT}`);
  console.log(`📱 Telegram WebApp готов к использованию!`);
});

// Обработка ошибок
server.on('error', (err) => {
  console.error('❌ WebApp server error:', err);
});

process.on('SIGTERM', () => {
  console.log('🛑 WebApp server stopping...');
  server.close();
});

process.on('SIGINT', () => {
  console.log('🛑 WebApp server stopping...');
  server.close();
  process.exit(0);
});
