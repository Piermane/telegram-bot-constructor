/**
 * ПРОМЫШЛЕННЫЕ ШАБЛОНЫ БОТОВ
 * Готовые к продакшну решения на основе реальных бизнес-кейсов
 */

const INDUSTRIAL_TEMPLATES = {
  
  // 1. РЕСТОРАН / ДОСТАВКА ЕДЫ
  restaurant_delivery: {
    id: 'restaurant_delivery',
    name: '🍕 Ресторан с доставкой',
    description: 'Полноценный бот ресторана: меню, заказы, доставка, оплата, отзывы',
    category: 'ecommerce',
    tags: ['ресторан', 'доставка', 'еда', 'заказы', 'оплата'],
    preview: '🍕 Добро пожаловать в "Вкусная Пицца"!\n\n📋 Меню\n🛒 Корзина\n📍 Доставка\n💳 Оплата',
    features: {
      multiLanguage: false,
      analytics: true,
      scheduler: true,
      fileUpload: true,
      voiceMessages: false,
      webApp: true,
      payments: true,
      geolocation: true,
      notifications: true
    },
    scenes: [
      {
        id: 'start',
        name: 'Главное меню',
        trigger: '/start',
        message: '🍕 Добро пожаловать в "Вкусная Пицца"!\n\n🕒 Работаем: 10:00 - 23:00\n🚀 Доставка: 30-45 мин\n💰 Минимальный заказ: 500₽\n\n📱 Выберите действие:',
        buttons: [
          { text: '📋 Посмотреть меню', action: 'webapp', value: '/menu' },
          { text: '🛒 Моя корзина (0)', action: 'callback', value: 'cart' },
          { text: '📍 Адреса доставки', action: 'callback', value: 'delivery_zones' },
          { text: '📞 Контакты', action: 'callback', value: 'contacts' },
          { text: '⭐ Оставить отзыв', action: 'callback', value: 'feedback' }
        ]
      },
      {
        id: 'cart',
        name: 'Корзина',
        trigger: 'cart',
        message: '🛒 Ваша корзина:\n\n{cart_items}\n\n💰 Итого: {total_price}₽\n🚀 Доставка: {delivery_price}₽\n\n💳 К доплате: {final_price}₽',
        buttons: [
          { text: '📋 Добавить блюда', action: 'webapp', value: '/menu' },
          { text: '📍 Указать адрес доставки', action: 'callback', value: 'set_address' },
          { text: '💳 Оформить заказ', action: 'callback', value: 'checkout' },
          { text: '🗑 Очистить корзину', action: 'callback', value: 'clear_cart' },
          { text: '🔙 Главное меню', action: 'callback', value: 'start' }
        ]
      },
      {
        id: 'checkout',
        name: 'Оформление заказа',
        trigger: 'checkout',
        message: '📋 Оформление заказа\n\n📍 Адрес: {delivery_address}\n🛒 Заказ: {cart_summary}\n💰 К оплате: {total_amount}₽\n\n💳 Выберите способ оплаты:',
        buttons: [
          { text: '💳 Картой онлайн', action: 'payment', value: 'online' },
          { text: '💵 Наличными курьеру', action: 'callback', value: 'cash_payment' },
          { text: '📱 СБП/QR-код', action: 'payment', value: 'sbp' },
          { text: '✏️ Изменить адрес', action: 'callback', value: 'change_address' }
        ]
      },
      {
        id: 'order_tracking',
        name: 'Отслеживание заказа',
        trigger: 'order_tracking',
        message: '🍕 Заказ #{order_id}\n\n📊 Статус: {order_status}\n⏰ Время: {estimated_time}\n👨‍🍳 {status_details}\n\n🔄 Обновится автоматически',
        buttons: [
          { text: '📞 Связаться с рестораном', action: 'callback', value: 'call_restaurant' },
          { text: '🚚 Связаться с курьером', action: 'callback', value: 'call_courier' },
          { text: '❌ Отменить заказ', action: 'callback', value: 'cancel_order' },
          { text: '🔙 Главное меню', action: 'callback', value: 'start' }
        ]
      }
    ],
    database: {
      users: { saveContacts: true, saveMessages: true, saveLocation: true },
      customFields: [
        { name: 'full_name', type: 'text', required: true },
        { name: 'phone', type: 'text', required: true },
        { name: 'address', type: 'text', required: true },
        { name: 'floor', type: 'text', required: false },
        { name: 'apartment', type: 'text', required: false },
        { name: 'entrance', type: 'text', required: false },
        { name: 'comment', type: 'text', required: false },
        { name: 'loyalty_points', type: 'number', required: false }
      ]
    },
    integrations: {
      webhook: { enabled: true, url: '', events: ['new_order', 'payment_success', 'order_status'] },
      googleSheets: { enabled: true, sheetId: '', credentials: '' },
      payment: { enabled: true, provider: 'yoomoney', token: '' },
      notifications: { adminChat: '', onNewUser: true, onOrder: true, onError: true }
    },
    menu_categories: [
      { name: '🍕 Пицца', items: ['Маргарита', 'Пепперони', 'Четыре сыра', 'Мясная'] },
      { name: '🍝 Паста', items: ['Карбонара', 'Болоньезе', 'Альфредо'] },
      { name: '🥗 Салаты', items: ['Цезарь', 'Греческий', 'Капрезе'] },
      { name: '🥤 Напитки', items: ['Кола', 'Вода', 'Сок', 'Чай'] }
    ]
  },

  // 2. МЕДИЦИНСКАЯ КЛИНИКА
  medical_clinic: {
    id: 'medical_clinic',
    name: '🏥 Медицинская клиника',
    description: 'Запись к врачам, онлайн-консультации, результаты анализов, напоминания',
    category: 'business',
    tags: ['медицина', 'врачи', 'запись', 'анализы', 'здоровье'],
    preview: '🏥 Медицинский центр "Здоровье"\n\n👨‍⚕️ Записаться к врачу\n📋 Мои записи\n🧪 Результаты анализов',
    features: {
      multiLanguage: false,
      analytics: true,
      scheduler: true,
      fileUpload: true,
      voiceMessages: true,
      webApp: true,
      notifications: true,
      appointments: true
    },
    scenes: [
      {
        id: 'start',
        name: 'Главное меню',
        trigger: '/start',
        message: '🏥 Добро пожаловать в медицинский центр "Здоровье"!\n\n🕒 Работаем: пн-пт 8:00-20:00, сб 9:00-15:00\n📞 Срочные вопросы: +7 (999) 123-45-67\n\nВыберите услугу:',
        buttons: [
          { text: '👨‍⚕️ Записаться к врачу', action: 'webapp', value: '/doctors' },
          { text: '📋 Мои записи', action: 'callback', value: 'my_appointments' },
          { text: '🧪 Результаты анализов', action: 'callback', value: 'test_results' },
          { text: '💊 Онлайн-консультация', action: 'callback', value: 'online_consultation' },
          { text: '📄 Справки и документы', action: 'callback', value: 'documents' },
          { text: '💳 Оплата услуг', action: 'callback', value: 'payments' }
        ]
      },
      {
        id: 'appointment_booking',
        name: 'Запись к врачу',
        trigger: 'appointment_booking',
        message: '👨‍⚕️ Запись к врачу\n\n📋 Специальность: {specialty}\n👨‍⚕️ Врач: {doctor_name}\n📅 Дата: {appointment_date}\n🕐 Время: {appointment_time}\n💰 Стоимость: {price}₽\n\n✅ Подтвердить запись?',
        buttons: [
          { text: '✅ Подтвердить запись', action: 'callback', value: 'confirm_appointment' },
          { text: '📅 Выбрать другое время', action: 'webapp', value: '/schedule' },
          { text: '👨‍⚕️ Выбрать другого врача', action: 'webapp', value: '/doctors' },
          { text: '🔙 Главное меню', action: 'callback', value: 'start' }
        ]
      },
      {
        id: 'test_results',
        name: 'Результаты анализов',
        trigger: 'test_results',
        message: '🧪 Ваши результаты анализов:\n\n📄 Последние исследования:\n{recent_tests}\n\n📎 Полные результаты в прикрепленных файлах\n\n❗ При отклонениях от нормы обязательно проконсультируйтесь с врачом!',
        buttons: [
          { text: '👨‍⚕️ Записаться к врачу', action: 'webapp', value: '/doctors' },
          { text: '📧 Отправить на email', action: 'callback', value: 'email_results' },
          { text: '📱 Поделиться результатами', action: 'callback', value: 'share_results' },
          { text: '🔙 Главное меню', action: 'callback', value: 'start' }
        ]
      }
    ],
    database: {
      users: { saveContacts: true, saveMessages: true, saveLocation: false },
      customFields: [
        { name: 'full_name', type: 'text', required: true },
        { name: 'phone', type: 'text', required: true },
        { name: 'email', type: 'text', required: true },
        { name: 'birth_date', type: 'date', required: true },
        { name: 'gender', type: 'text', required: true },
        { name: 'policy_number', type: 'text', required: false },
        { name: 'allergies', type: 'text', required: false },
        { name: 'chronic_diseases', type: 'text', required: false }
      ]
    },
    integrations: {
      webhook: { enabled: true, url: '', events: ['new_appointment', 'test_ready', 'reminder'] },
      googleSheets: { enabled: true, sheetId: '', credentials: '' },
      payment: { enabled: true, provider: 'yoomoney', token: '' },
      notifications: { adminChat: '', onNewUser: true, onOrder: true, onError: true }
    }
  },

  // 3. ИНТЕРНЕТ-МАГАЗИН ЭЛЕКТРОНИКИ
  electronics_store: {
    id: 'electronics_store',
    name: '📱 Магазин электроники',
    description: 'Продажа гаджетов, консультации, сравнение товаров, гарантийное обслуживание',
    category: 'ecommerce',
    tags: ['электроника', 'гаджеты', 'телефоны', 'сравнение', 'гарантия'],
    preview: '📱 TechStore - ваш магазин электроники\n\n🛍️ Каталог\n🔍 Поиск товаров\n⚖️ Сравнение\n🛡️ Гарантия',
    features: {
      multiLanguage: false,
      analytics: true,
      scheduler: false,
      fileUpload: true,
      voiceMessages: false,
      webApp: true,
      payments: true,
      comparison: true,
      warranty: true
    },
    scenes: [
      {
        id: 'start',
        name: 'Главное меню',
        trigger: '/start',
        message: '📱 Добро пожаловать в TechStore!\n\n🔥 Акции дня: iPhone 15 -15%\n🚚 Бесплатная доставка от 10000₽\n🛡️ Гарантия до 3 лет\n\nЧто вас интересует?',
        buttons: [
          { text: '🛍️ Каталог товаров', action: 'webapp', value: '/catalog' },
          { text: '🔍 Поиск товара', action: 'callback', value: 'search' },
          { text: '⚖️ Сравнить товары', action: 'callback', value: 'compare' },
          { text: '🛒 Корзина', action: 'callback', value: 'cart' },
          { text: '📦 Мои заказы', action: 'callback', value: 'orders' },
          { text: '🛡️ Гарантийный сервис', action: 'callback', value: 'warranty' }
        ]
      },
      {
        id: 'product_details',
        name: 'Карточка товара',
        trigger: 'product_details',
        message: '📱 {product_name}\n\n💰 Цена: {price}₽\n⭐ Рейтинг: {rating}/5\n📦 В наличии: {stock}\n\n📋 Характеристики:\n{specifications}\n\n🔥 {special_offers}',
        buttons: [
          { text: '🛒 Добавить в корзину', action: 'callback', value: 'add_to_cart' },
          { text: '💝 Купить в 1 клик', action: 'callback', value: 'buy_now' },
          { text: '⚖️ Сравнить с другими', action: 'callback', value: 'add_to_compare' },
          { text: '💬 Консультация', action: 'callback', value: 'consultant_chat' },
          { text: '📸 Фото/видео обзор', action: 'callback', value: 'media_review' },
          { text: '🔙 К каталогу', action: 'webapp', value: '/catalog' }
        ]
      },
      {
        id: 'warranty_service',
        name: 'Гарантийный сервис',
        trigger: 'warranty_service',
        message: '🛡️ Гарантийное обслуживание\n\n📱 Введите номер заказа или серийный номер устройства для проверки гарантии:',
        buttons: [
          { text: '📋 Проверить гарантию', action: 'callback', value: 'check_warranty' },
          { text: '🔧 Заявка на ремонт', action: 'callback', value: 'repair_request' },
          { text: '📞 Связаться с сервисом', action: 'callback', value: 'service_contact' },
          { text: '📄 Документы по гарантии', action: 'callback', value: 'warranty_docs' }
        ]
      }
    ],
    database: {
      users: { saveContacts: true, saveMessages: true, saveLocation: true },
      customFields: [
        { name: 'full_name', type: 'text', required: true },
        { name: 'phone', type: 'text', required: true },
        { name: 'email', type: 'text', required: true },
        { name: 'city', type: 'text', required: true },
        { name: 'preferred_brands', type: 'text', required: false },
        { name: 'budget_range', type: 'text', required: false }
      ]
    },
    integrations: {
      webhook: { enabled: true, url: '', events: ['new_order', 'payment', 'warranty_claim'] },
      googleSheets: { enabled: true, sheetId: '', credentials: '' },
      payment: { enabled: true, provider: 'yoomoney', token: '' },
      notifications: { adminChat: '', onNewUser: true, onOrder: true, onError: true }
    }
  },

  // 4. ФИТНЕС-КЛУБ / СПОРТЗАЛ
  fitness_club: {
    id: 'fitness_club',
    name: '💪 Фитнес-клуб',
    description: 'Расписание тренировок, запись к тренерам, программы питания, абонементы',
    category: 'business',
    tags: ['фитнес', 'тренировки', 'спорт', 'тренеры', 'абонементы'],
    preview: '💪 FitLife - твой путь к успеху!\n\n🏃‍♂️ Тренировки\n👨‍💼 Тренеры\n📅 Расписание\n💳 Абонементы',
    features: {
      multiLanguage: false,
      analytics: true,
      scheduler: true,
      fileUpload: true,
      voiceMessages: false,
      webApp: true,
      notifications: true,
      membership: true
    },
    scenes: [
      {
        id: 'start',
        name: 'Главное меню',
        trigger: '/start',
        message: '💪 Добро пожаловать в FitLife!\n\n🎯 Ваша цель - наша миссия!\n🏆 Более 500 довольных клиентов\n📍 3 филиала в городе\n\n💪 Начнем тренировки?',
        buttons: [
          { text: '🏃‍♂️ Расписание тренировок', action: 'webapp', value: '/schedule' },
          { text: '👨‍💼 Наши тренеры', action: 'callback', value: 'trainers' },
          { text: '💳 Купить абонемент', action: 'callback', value: 'memberships' },
          { text: '📊 Мой прогресс', action: 'callback', value: 'progress' },
          { text: '🍎 Программы питания', action: 'callback', value: 'nutrition' },
          { text: '📱 Мобильное приложение', action: 'url', value: 'https://app.fitlife.com' }
        ]
      },
      {
        id: 'workout_booking',
        name: 'Запись на тренировку',
        trigger: 'workout_booking',
        message: '🏃‍♂️ Запись на тренировку\n\n📋 Тип: {workout_type}\n👨‍💼 Тренер: {trainer_name}\n📅 Дата: {date}\n🕐 Время: {time}\n📍 Зал: {hall}\n👥 Мест осталось: {spots_left}\n\n✅ Записаться?',
        buttons: [
          { text: '✅ Записаться', action: 'callback', value: 'confirm_booking' },
          { text: '📅 Другое время', action: 'webapp', value: '/schedule' },
          { text: '👨‍💼 Другой тренер', action: 'callback', value: 'trainers' },
          { text: '❓ Подробнее о тренировке', action: 'callback', value: 'workout_info' }
        ]
      },
      {
        id: 'nutrition_plan',
        name: 'Программа питания',
        trigger: 'nutrition_plan',
        message: '🍎 Персональная программа питания\n\n🎯 Ваша цель: {fitness_goal}\n⚖️ Текущий вес: {current_weight}\n🎯 Целевой вес: {target_weight}\n📊 Калории в день: {daily_calories}\n\n📋 Рекомендации готовы!',
        buttons: [
          { text: '📱 Получить план питания', action: 'callback', value: 'get_nutrition_plan' },
          { text: '🛒 Заказать продукты', action: 'url', value: 'https://delivery.fitlife.com' },
          { text: '👨‍💼 Консультация диетолога', action: 'callback', value: 'nutritionist' },
          { text: '📊 Трекер калорий', action: 'webapp', value: '/calorie-tracker' }
        ]
      }
    ],
    database: {
      users: { saveContacts: true, saveMessages: true, saveLocation: false },
      customFields: [
        { name: 'full_name', type: 'text', required: true },
        { name: 'phone', type: 'text', required: true },
        { name: 'age', type: 'number', required: true },
        { name: 'weight', type: 'number', required: false },
        { name: 'height', type: 'number', required: false },
        { name: 'fitness_goal', type: 'text', required: false },
        { name: 'experience_level', type: 'text', required: false },
        { name: 'medical_restrictions', type: 'text', required: false }
      ]
    },
    integrations: {
      webhook: { enabled: true, url: '', events: ['workout_booking', 'membership_purchase'] },
      googleSheets: { enabled: true, sheetId: '', credentials: '' },
      payment: { enabled: true, provider: 'yoomoney', token: '' },
      notifications: { adminChat: '', onNewUser: true, onOrder: true, onError: true }
    }
  }
};

module.exports = { INDUSTRIAL_TEMPLATES };
