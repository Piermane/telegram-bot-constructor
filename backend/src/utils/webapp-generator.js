/**
 * Генератор WebApp для ботов
 * Создает индивидуальную HTML страницу для каждого бота
 */

function generateWebAppHTML(botSettings, botId) {
  const { name, description, category, webAppContent = {}, features } = botSettings;
  
  // Определяем цветовую схему в зависимости от категории
  const themes = {
    events_conference: { primary: '#8b5cf6', secondary: '#ec4899', accent: '#f59e0b' },
    ecommerce: { primary: '#3b82f6', secondary: '#10b981', accent: '#06b6d4' },
    healthcare: { primary: '#14b8a6', secondary: '#0ea5e9', accent: '#8b5cf6' },
    education: { primary: '#6366f1', secondary: '#a855f7', accent: '#ec4899' },
    support: { primary: '#f97316', secondary: '#eab308', accent: '#84cc16' },
    default: { primary: '#6366f1', secondary: '#8b5cf6', accent: '#ec4899' }
  };
  
  const theme = themes[category] || themes.default;
  
  return `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>${name}</title>
  
  <!-- Telegram WebApp SDK -->
  <script src="https://telegram.org/js/telegram-web-app.js"></script>
  
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
      -webkit-tap-highlight-color: transparent;
    }
    
    :root {
      --tg-theme-bg-color: ${theme.primary};
      --tg-theme-text-color: #ffffff;
      --tg-theme-hint-color: rgba(255, 255, 255, 0.7);
      --tg-theme-link-color: ${theme.accent};
      --tg-theme-button-color: ${theme.secondary};
      --tg-theme-button-text-color: #ffffff;
      --primary-color: ${theme.primary};
      --secondary-color: ${theme.secondary};
      --accent-color: ${theme.accent};
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background: var(--tg-theme-bg-color, #ffffff);
      color: var(--tg-theme-text-color, #000000);
      overflow-x: hidden;
      -webkit-font-smoothing: antialiased;
      min-height: 100vh;
      padding-bottom: 80px;
    }
    
    .container {
      max-width: 100%;
      padding: 16px;
    }
    
    /* Header */
    .header {
      background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
      padding: 24px 16px;
      color: white;
      text-align: center;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      position: sticky;
      top: 0;
      z-index: 100;
    }
    
    .header h1 {
      font-size: 24px;
      font-weight: 700;
      margin-bottom: 8px;
    }
    
    .header p {
      font-size: 14px;
      opacity: 0.9;
    }
    
    /* Cards */
    .card {
      background: white;
      color: #1a1a1a;
      border-radius: 20px;
      padding: 20px;
      margin-bottom: 16px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.05);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      border: 1px solid rgba(0, 0, 0, 0.05);
    }
    
    .card:active {
      transform: translateY(2px);
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
    }
    
    .card-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 12px;
    }
    
    .card-icon {
      width: 56px;
      height: 56px;
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 28px;
      background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
      color: white;
      box-shadow: 0 4px 16px rgba(139, 92, 246, 0.25);
    }
    
    .card-title {
      font-size: 19px;
      font-weight: 700;
      flex: 1;
      line-height: 1.3;
      color: #1a1a1a;
    }
    
    .card-price {
      font-size: 24px;
      font-weight: 800;
      background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    
    .card-description {
      font-size: 14px;
      color: #666;
      line-height: 1.5;
      margin-bottom: 12px;
    }
    
    .card-meta {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }
    
    .badge {
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 500;
      background: rgba(139, 92, 246, 0.1);
      color: var(--primary-color);
    }
    
    /* Buttons */
    .btn {
      display: block;
      width: 100%;
      padding: 18px;
      border: none;
      border-radius: 16px;
      font-size: 17px;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      text-align: center;
      text-decoration: none;
      position: relative;
      overflow: hidden;
    }
    
    .btn-primary {
      background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
      color: white;
      box-shadow: 0 6px 20px rgba(139, 92, 246, 0.35);
    }
    
    .btn-primary:active {
      transform: scale(0.97);
      box-shadow: 0 3px 10px rgba(139, 92, 246, 0.35);
    }
    
    .btn-outline {
      background: white;
      border: 2px solid var(--primary-color);
      color: var(--primary-color);
    }
    
    /* Grid */
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
      gap: 12px;
      margin-bottom: 16px;
    }
    
    .grid-item {
      background: white;
      color: #1a1a1a;
      border-radius: 12px;
      padding: 16px;
      text-align: center;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      transition: transform 0.2s;
    }
    
    .grid-item:active {
      transform: scale(0.95);
    }
    
    .grid-item-icon {
      font-size: 32px;
      margin-bottom: 8px;
    }
    
    .grid-item-title {
      font-size: 14px;
      font-weight: 600;
      margin-bottom: 4px;
    }
    
    .grid-item-subtitle {
      font-size: 12px;
      color: #666;
    }
    
    /* Loading */
    .loading {
      text-align: center;
      padding: 40px;
      color: var(--tg-theme-hint-color);
    }
    
    .spinner {
      border: 3px solid rgba(255, 255, 255, 0.3);
      border-top: 3px solid white;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      animation: spin 1s linear infinite;
      margin: 0 auto 16px;
    }
    
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    
    /* Empty State */
    .empty-state {
      text-align: center;
      padding: 60px 20px;
      color: var(--tg-theme-hint-color);
    }
    
    .empty-state-icon {
      font-size: 64px;
      margin-bottom: 16px;
      opacity: 0.5;
    }
    
    /* Cart Badge */
    .cart-badge {
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: var(--accent-color);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
      cursor: pointer;
      transition: transform 0.2s;
      z-index: 1000;
    }
    
    .cart-badge:active {
      transform: scale(0.9);
    }
    
    .cart-count {
      position: absolute;
      top: -4px;
      right: -4px;
      background: #ef4444;
      color: white;
      border-radius: 12px;
      padding: 2px 6px;
      font-size: 12px;
      font-weight: 700;
    }
    
    /* Animations */
    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    .fade-in {
      animation: fadeIn 0.4s ease-out;
    }
    
    /* Section */
    .section {
      margin-bottom: 24px;
    }
    
    .section-title {
      font-size: 20px;
      font-weight: 700;
      margin-bottom: 16px;
      padding: 0 16px;
    }
  </style>
</head>
<body>
  <!-- Header -->
  <div class="header">
    <h1>${name}</h1>
    <p>${description || 'Добро пожаловать!'}</p>
  </div>
  
  <!-- Content -->
  <div class="container">
    <!-- Loading State -->
    <div id="loading" class="loading">
      <div class="spinner"></div>
      <p>Загрузка...</p>
    </div>
    
    <!-- Main Content -->
    <div id="content" style="display: none;"></div>
  </div>
  
  <!-- Cart Badge (for ecommerce) -->
  ${category === 'ecommerce' || category === 'events_conference' ? `
  <div id="cart-badge" class="cart-badge" style="display: none;" onclick="openCart()">
    🛒
    <span id="cart-count" class="cart-count" style="display: none;">0</span>
  </div>
  ` : ''}
  
  <script>
    // Telegram WebApp initialization
    let tg = window.Telegram.WebApp;
    tg.expand();
    tg.enableClosingConfirmation();
    
    // Apply Telegram theme
    document.body.style.background = tg.themeParams.bg_color || '#ffffff';
    document.body.style.color = tg.themeParams.text_color || '#000000';
    
    // Global state
    let appData = null;
    let cart = [];
    
    // Initialize
    async function init() {
      try {
        // Load data from API
        const response = await fetch('/api/deploy/webapp/${botId}/data');
        const result = await response.json();
        
        if (result.success) {
          appData = result.data;
          renderContent(appData);
        } else {
          showError('Ошибка загрузки данных');
        }
      } catch (error) {
        console.error('Error loading data:', error);
        showError('Не удалось загрузить данные');
      } finally {
        document.getElementById('loading').style.display = 'none';
        document.getElementById('content').style.display = 'block';
      }
    }
    
    // Render content based on category
    function renderContent(data) {
      const content = document.getElementById('content');
      const webAppContent = data.webAppContent || {};
      
      ${category === 'events_conference' ? `
      // Events content
      renderEventsContent(content, webAppContent);
      ` : category === 'ecommerce' ? `
      // Ecommerce content
      renderEcommerceContent(content, webAppContent);
      ` : category === 'healthcare' ? `
      // Healthcare content
      renderHealthcareContent(content, webAppContent);
      ` : `
      // Default content
      renderDefaultContent(content, webAppContent);
      `}
    }
    
    // Events rendering
    function renderEventsContent(container, content) {
      const { schedule = [], activities = [], products = [] } = content;
      
      let html = '';
      
      // Schedule
      if (schedule.length > 0) {
        html += '<div class="section"><h2 class="section-title">📅 Расписание</h2>';
        schedule.forEach((item, index) => {
          html += \`
            <div class="card fade-in" style="animation-delay: \${index * 0.1}s">
              <div class="card-header">
                <div class="card-icon">🎤</div>
                <div class="card-title">\${item.title || item.name}</div>
              </div>
              <div class="card-description">\${item.description || ''}</div>
              <div class="card-meta">
                <span class="badge">⏰ \${item.time || ''}</span>
                <span class="badge">📍 \${item.location || ''}</span>
              </div>
            </div>
          \`;
        });
        html += '</div>';
      }
      
      // Activities
      if (activities.length > 0) {
        html += '<div class="section"><h2 class="section-title">🎯 Активности</h2>';
        activities.forEach((item, index) => {
          html += \`
            <div class="card fade-in" style="animation-delay: \${index * 0.1}s" onclick="registerForActivity('\${item.id}')">
              <div class="card-header">
                <div class="card-icon">\${item.emoji || '✨'}</div>
                <div class="card-title">\${item.name}</div>
                <div class="card-price">\${item.points || 0} баллов</div>
              </div>
              <div class="card-description">\${item.description || ''}</div>
              <button class="btn btn-primary" onclick="registerForActivity('\${item.id}'); event.stopPropagation();">
                Зарегистрироваться
              </button>
            </div>
          \`;
        });
        html += '</div>';
      }
      
      // Merch Shop
      if (products.length > 0) {
        html += '<div class="section"><h2 class="section-title">🛒 Мерч-шоп</h2>';
        products.forEach((item, index) => {
          html += \`
            <div class="card fade-in" style="animation-delay: \${index * 0.1}s">
              <div class="card-header">
                <div class="card-icon">\${item.emoji || '🎁'}</div>
                <div class="card-title">\${item.name}</div>
                <div class="card-price">\${item.price} ₽</div>
              </div>
              <div class="card-description">\${item.description || ''}</div>
              <button class="btn btn-primary" onclick="addToCart('\${item.id}', '\${item.name}', \${item.price})">
                В корзину
              </button>
            </div>
          \`;
        });
        html += '</div>';
      }
      
      container.innerHTML = html || '<div class="empty-state"><div class="empty-state-icon">📋</div><p>Контент скоро появится</p></div>';
    }
    
    // Ecommerce rendering
    function renderEcommerceContent(container, content) {
      const { products = [] } = content;
      
      let html = '<div class="section"><h2 class="section-title">🛍 Каталог товаров</h2>';
      
      if (products.length > 0) {
        products.forEach((item, index) => {
          html += \`
            <div class="card fade-in" style="animation-delay: \${index * 0.1}s">
              <div class="card-header">
                <div class="card-icon">\${item.emoji || '📦'}</div>
                <div class="card-title">\${item.name}</div>
                <div class="card-price">\${item.price} ₽</div>
              </div>
              <div class="card-description">\${item.description || ''}</div>
              <button class="btn btn-primary" onclick="addToCart('\${item.id}', '\${item.name}', \${item.price})">
                Добавить в корзину
              </button>
            </div>
          \`;
        });
      } else {
        html += '<div class="empty-state"><div class="empty-state-icon">🛒</div><p>Товары скоро появятся</p></div>';
      }
      
      html += '</div>';
      container.innerHTML = html;
    }
    
    // Healthcare rendering
    function renderHealthcareContent(container, content) {
      const { services = [] } = content;
      
      let html = '<div class="section"><h2 class="section-title">🏥 Наши услуги</h2>';
      
      if (services && services.length > 0) {
        services.forEach((item, index) => {
          html += \`
            <div class="card fade-in" style="animation-delay: \${index * 0.1}s">
              <div class="card-header">
                <div class="card-icon">\${item.emoji || '💊'}</div>
                <div class="card-title">\${item.name}</div>
              </div>
              <div class="card-description">\${item.description || ''}</div>
              <button class="btn btn-primary" onclick="bookService('\${item.id}')">
                Записаться
              </button>
            </div>
          \`;
        });
      } else {
        html += '<div class="empty-state"><div class="empty-state-icon">🏥</div><p>Услуги скоро появятся</p></div>';
      }
      
      html += '</div>';
      container.innerHTML = html;
    }
    
    // Default rendering
    function renderDefaultContent(container, content) {
      container.innerHTML = \`
        <div class="card">
          <div class="card-header">
            <div class="card-icon">🤖</div>
            <div class="card-title">Добро пожаловать!</div>
          </div>
          <div class="card-description">
            Это ваш персональный бот. Контент будет добавлен позже.
          </div>
        </div>
      \`;
    }
    
    // Actions
    function addToCart(id, name, price) {
      cart.push({ id, name, price });
      updateCartBadge();
      tg.showPopup({
        title: 'Добавлено в корзину',
        message: \`\${name} добавлен в корзину\`,
        buttons: [{ type: 'ok' }]
      });
      
      // Track analytics
      trackAction('add_to_cart', { productId: id, productName: name, price });
    }
    
    function updateCartBadge() {
      const badge = document.getElementById('cart-badge');
      const count = document.getElementById('cart-count');
      
      if (cart.length > 0) {
        badge.style.display = 'flex';
        count.style.display = 'block';
        count.textContent = cart.length;
      } else {
        badge.style.display = 'none';
      }
    }
    
    function openCart() {
      if (cart.length === 0) {
        tg.showPopup({
          title: 'Корзина пуста',
          message: 'Добавьте товары в корзину',
          buttons: [{ type: 'ok' }]
        });
        return;
      }
      
      const total = cart.reduce((sum, item) => sum + item.price, 0);
      const items = cart.map(item => \`\${item.name} - \${item.price} ₽\`).join('\\n');
      
      tg.showPopup({
        title: 'Ваша корзина',
        message: \`\${items}\\n\\nИтого: \${total} ₽\`,
        buttons: [
          { id: 'order', type: 'default', text: 'Оформить заказ' },
          { type: 'cancel' }
        ]
      }, (buttonId) => {
        if (buttonId === 'order') {
          submitOrder();
        }
      });
    }
    
    async function submitOrder() {
      try {
        tg.MainButton.showProgress();
        
        const response = await fetch('/api/deploy/webapp/${botId}/action', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'order',
            data: { cart, total: cart.reduce((sum, item) => sum + item.price, 0) },
            userId: tg.initDataUnsafe.user?.id
          })
        });
        
        const result = await response.json();
        
        if (result.success) {
          tg.showPopup({
            title: 'Заказ оформлен!',
            message: 'Мы свяжемся с вами в ближайшее время',
            buttons: [{ type: 'ok' }]
          });
          cart = [];
          updateCartBadge();
        }
        
      } catch (error) {
        tg.showPopup({
          title: 'Ошибка',
          message: 'Не удалось оформить заказ',
          buttons: [{ type: 'ok' }]
        });
      } finally {
        tg.MainButton.hideProgress();
      }
    }
    
    async function registerForActivity(activityId) {
      try {
        const response = await fetch('/api/deploy/webapp/${botId}/action', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'register_activity',
            data: { activityId },
            userId: tg.initDataUnsafe.user?.id
          })
        });
        
        const result = await response.json();
        
        if (result.success) {
          tg.showPopup({
            title: 'Успешно!',
            message: 'Вы зарегистрированы на активность',
            buttons: [{ type: 'ok' }]
          });
          trackAction('activity_register', { activityId });
        }
      } catch (error) {
        tg.showPopup({
          title: 'Ошибка',
          message: 'Не удалось зарегистрироваться',
          buttons: [{ type: 'ok' }]
        });
      }
    }
    
    async function bookService(serviceId) {
      try {
        const response = await fetch('/api/deploy/webapp/${botId}/action', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'book_service',
            data: { serviceId },
            userId: tg.initDataUnsafe.user?.id
          })
        });
        
        const result = await response.json();
        
        if (result.success) {
          tg.showPopup({
            title: 'Заявка принята',
            message: 'Мы свяжемся с вами для подтверждения',
            buttons: [{ type: 'ok' }]
          });
          trackAction('service_book', { serviceId });
        }
      } catch (error) {
        tg.showPopup({
          title: 'Ошибка',
          message: 'Не удалось отправить заявку',
          buttons: [{ type: 'ok' }]
        });
      }
    }
    
    // Analytics tracking
    async function trackAction(action, data) {
      try {
        await fetch('/api/deploy/webapp/${botId}/action', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'analytics',
            data: { event: action, ...data },
            userId: tg.initDataUnsafe.user?.id
          })
        });
      } catch (error) {
        console.error('Analytics error:', error);
      }
    }
    
    function showError(message) {
      document.getElementById('content').innerHTML = \`
        <div class="empty-state">
          <div class="empty-state-icon">⚠️</div>
          <p>\${message}</p>
        </div>
      \`;
    }
    
    // Setup Telegram MainButton
    tg.MainButton.setText('Закрыть');
    tg.MainButton.onClick(() => {
      tg.close();
    });
    tg.MainButton.show();
    
    // Initialize app
    init();
    
    // Track page view
    trackAction('page_view', { page: 'main' });
  </script>
</body>
</html>`;
}

module.exports = { generateWebAppHTML };
