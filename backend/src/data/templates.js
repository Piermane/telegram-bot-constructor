/**
 * Шаблоны ботов для разных сценариев использования
 */

const { INDUSTRIAL_TEMPLATES } = require('./industrial-templates');

const BOT_TEMPLATES = {
  // Добавляем промышленные шаблоны
  ...INDUSTRIAL_TEMPLATES,
  // 1. БОТ ДЛЯ МЕРОПРИЯТИЙ
  events: {
    id: 'events',
    name: 'Бот для мероприятий',
    description: 'Идеален для конференций, семинаров, выставок. Регистрация, программа, контакты.',
    category: 'events',
    tags: ['мероприятия', 'регистрация', 'конференции'],
    preview: '🎪 Приветствую на нашем мероприятии!\n\n📅 Программа\n📝 Регистрация\n📞 Контакты',
    features: {
      multiLanguage: false,
      analytics: true,
      scheduler: true,
      fileUpload: false,
      voiceMessages: false,
      webApp: false
    },
    scenes: [
      {
        id: 'start',
        name: 'Главное меню',
        trigger: '/start',
        message: '🎪 Добро пожаловать на наше мероприятие!\n\nВыберите нужное действие:',
        buttons: [
          { text: '📅 Программа мероприятия', action: 'callback', value: 'program' },
          { text: '📝 Регистрация', action: 'callback', value: 'registration' },
          { text: '📞 Контакты организаторов', action: 'callback', value: 'contacts' },
          { text: '❓ Часто задаваемые вопросы', action: 'callback', value: 'faq' }
        ]
      },
      {
        id: 'program',
        name: 'Программа',
        trigger: 'program',
        message: '📅 Программа мероприятия:\n\n🕘 09:00 - Регистрация\n🕙 10:00 - Открытие\n🕐 13:00 - Обед\n🕕 18:00 - Закрытие',
        buttons: [
          { text: '🔙 Назад в меню', action: 'callback', value: 'start' }
        ]
      }
    ],
    database: {
      users: { saveContacts: true, saveMessages: true, saveLocation: false },
      customFields: [
        { name: 'full_name', type: 'text', required: true },
        { name: 'email', type: 'text', required: true },
        { name: 'company', type: 'text', required: false },
        { name: 'position', type: 'text', required: false }
      ]
    },
    integrations: {
      webhook: { enabled: false, url: '', events: [] },
      googleSheets: { enabled: false, sheetId: '', credentials: '' },
      payment: { enabled: false, provider: 'yoomoney', token: '' },
      notifications: { adminChat: '', onNewUser: true, onOrder: false, onError: true }
    }
  },

  // 2. ИНТЕРНЕТ-МАГАЗИН
  ecommerce: {
    id: 'ecommerce',
    name: 'Интернет-магазин',
    description: 'Полноценный магазин в Telegram с каталогом, корзиной, оплатой и доставкой.',
    category: 'ecommerce',
    tags: ['магазин', 'продажи', 'оплата', 'каталог'],
    preview: '🛍️ Добро пожаловать в наш магазин!\n\n📱 Каталог товаров\n🛒 Корзина\n💳 Оплата',
    features: {
      multiLanguage: false,
      analytics: true,
      scheduler: false,
      fileUpload: true,
      voiceMessages: false,
      webApp: true
    },
    scenes: [
      {
        id: 'start',
        name: 'Главная магазина',
        trigger: '/start',
        message: '🛍️ Добро пожаловать в наш интернет-магазин!\n\nЧто вас интересует?',
        buttons: [
          { text: '📱 Каталог товаров', action: 'webapp', value: '/catalog' },
          { text: '🛒 Моя корзина', action: 'callback', value: 'cart' },
          { text: '📦 Мои заказы', action: 'callback', value: 'orders' },
          { text: '📞 Поддержка', action: 'callback', value: 'support' }
        ]
      },
      {
        id: 'cart',
        name: 'Корзина',
        trigger: 'cart',
        message: '🛒 Ваша корзина:\n\nТоваров: 0\nСумма: 0 ₽\n\nДобавьте товары из каталога!',
        buttons: [
          { text: '📱 Каталог', action: 'webapp', value: '/catalog' },
          { text: '🔙 Главная', action: 'callback', value: 'start' }
        ]
      }
    ],
    database: {
      users: { saveContacts: true, saveMessages: false, saveLocation: true },
      customFields: [
        { name: 'full_name', type: 'text', required: true },
        { name: 'phone', type: 'text', required: true },
        { name: 'address', type: 'text', required: false }
      ]
    },
    integrations: {
      webhook: { enabled: true, url: '', events: ['new_order', 'payment'] },
      googleSheets: { enabled: true, sheetId: '', credentials: '' },
      payment: { enabled: true, provider: 'yoomoney', token: '' },
      notifications: { adminChat: '', onNewUser: true, onOrder: true, onError: true }
    }
  },

  // 3. ПОДДЕРЖКА КЛИЕНТОВ
  support: {
    id: 'support',
    name: 'Служба поддержки',
    description: 'Бот для техподдержки с FAQ, тикетами и переводом на оператора.',
    category: 'support',
    tags: ['поддержка', 'faq', 'тикеты', 'операторы'],
    preview: '💬 Служба поддержки\n\n❓ FAQ\n🎫 Создать тикет\n👨‍💻 Связаться с оператором',
    features: {
      multiLanguage: true,
      analytics: true,
      scheduler: true,
      fileUpload: true,
      voiceMessages: true,
      webApp: false
    },
    scenes: [
      {
        id: 'start',
        name: 'Меню поддержки',
        trigger: '/start',
        message: '💬 Добро пожаловать в службу поддержки!\n\nКак мы можем помочь?',
        buttons: [
          { text: '❓ Часто задаваемые вопросы', action: 'callback', value: 'faq' },
          { text: '🎫 Создать тикет', action: 'callback', value: 'create_ticket' },
          { text: '👨‍💻 Связаться с оператором', action: 'callback', value: 'operator' },
          { text: '📊 Статус моих обращений', action: 'callback', value: 'my_tickets' }
        ]
      }
    ],
    database: {
      users: { saveContacts: true, saveMessages: true, saveLocation: false },
      customFields: [
        { name: 'full_name', type: 'text', required: true },
        { name: 'email', type: 'text', required: true },
        { name: 'phone', type: 'text', required: false }
      ]
    },
    integrations: {
      webhook: { enabled: true, url: '', events: ['new_ticket', 'ticket_update'] },
      googleSheets: { enabled: false, sheetId: '', credentials: '' },
      payment: { enabled: false, provider: 'yoomoney', token: '' },
      notifications: { adminChat: '', onNewUser: false, onOrder: false, onError: true }
    }
  },

  // 4. ОБРАЗОВАНИЕ
  education: {
    id: 'education',
    name: 'Образовательный бот',
    description: 'Курсы, уроки, тесты, домашние задания и прогресс студентов.',
    category: 'education',
    tags: ['образование', 'курсы', 'тесты', 'обучение'],
    preview: '📚 Образовательная платформа\n\n📖 Курсы\n✅ Тесты\n📊 Прогресс',
    features: {
      multiLanguage: false,
      analytics: true,
      scheduler: true,
      fileUpload: true,
      voiceMessages: true,
      webApp: true
    },
    scenes: [
      {
        id: 'start',
        name: 'Обучение',
        trigger: '/start',
        message: '📚 Добро пожаловать на образовательную платформу!\n\nВыберите раздел:',
        buttons: [
          { text: '📖 Мои курсы', action: 'webapp', value: '/courses' },
          { text: '✅ Тесты и задания', action: 'callback', value: 'tests' },
          { text: '📊 Мой прогресс', action: 'callback', value: 'progress' },
          { text: '👨‍🏫 Связь с преподавателем', action: 'callback', value: 'teacher' }
        ]
      }
    ],
    database: {
      users: { saveContacts: true, saveMessages: true, saveLocation: false },
      customFields: [
        { name: 'full_name', type: 'text', required: true },
        { name: 'email', type: 'text', required: true },
        { name: 'student_id', type: 'text', required: false },
        { name: 'group', type: 'text', required: false }
      ]
    },
    integrations: {
      webhook: { enabled: true, url: '', events: ['test_completed', 'lesson_viewed'] },
      googleSheets: { enabled: true, sheetId: '', credentials: '' },
      payment: { enabled: true, provider: 'yoomoney', token: '' },
      notifications: { adminChat: '', onNewUser: true, onOrder: false, onError: true }
    }
  },

  // 5. БИЗНЕС CRM
  business: {
    id: 'business',
    name: 'Бизнес и CRM',
    description: 'Управление клиентами, лидами, встречами и продажами.',
    category: 'business',
    tags: ['crm', 'клиенты', 'продажи', 'встречи'],
    preview: '💼 Бизнес-ассистент\n\n👥 Клиенты\n📈 Продажи\n📅 Встречи',
    features: {
      multiLanguage: false,
      analytics: true,
      scheduler: true,
      fileUpload: true,
      voiceMessages: false,
      webApp: true
    },
    scenes: [
      {
        id: 'start',
        name: 'CRM меню',
        trigger: '/start',
        message: '💼 Добро пожаловать в бизнес-ассистент!\n\nВыберите действие:',
        buttons: [
          { text: '👥 База клиентов', action: 'webapp', value: '/clients' },
          { text: '📈 Воронка продаж', action: 'callback', value: 'sales' },
          { text: '📅 Мои встречи', action: 'callback', value: 'meetings' },
          { text: '📊 Отчеты и аналитика', action: 'callback', value: 'reports' }
        ]
      }
    ],
    database: {
      users: { saveContacts: true, saveMessages: true, saveLocation: false },
      customFields: [
        { name: 'company', type: 'text', required: true },
        { name: 'position', type: 'text', required: false },
        { name: 'lead_source', type: 'text', required: false },
        { name: 'deal_value', type: 'number', required: false }
      ]
    },
    integrations: {
      webhook: { enabled: true, url: '', events: ['new_lead', 'deal_update'] },
      googleSheets: { enabled: true, sheetId: '', credentials: '' },
      payment: { enabled: false, provider: 'yoomoney', token: '' },
      notifications: { adminChat: '', onNewUser: true, onOrder: false, onError: true }
    }
  },

  // 6. ПУСТОЙ ШАБЛОН
  custom: {
    id: 'custom',
    name: 'Создать с нуля',
    description: 'Пустой шаблон для создания уникального бота под ваши нужды.',
    category: 'other',
    tags: ['пустой', 'кастом', 'с нуля'],
    preview: 'Настройте бота под ваши задачи',
    features: {
      multiLanguage: false,
      analytics: false,
      scheduler: false,
      fileUpload: false,
      voiceMessages: false,
      webApp: false
    },
    scenes: [
      {
        id: 'start',
        name: 'Приветствие',
        trigger: '/start',
        message: 'Добро пожаловать! Настройте сообщения и кнопки по вашему желанию.',
        buttons: [
          { text: 'Кнопка 1', action: 'callback', value: 'button1' },
          { text: 'Кнопка 2', action: 'callback', value: 'button2' }
        ]
      }
    ],
    database: {
      users: { saveContacts: false, saveMessages: false, saveLocation: false },
      customFields: []
    },
    integrations: {
      webhook: { enabled: false, url: '', events: [] },
      googleSheets: { enabled: false, sheetId: '', credentials: '' },
      payment: { enabled: false, provider: 'yoomoney', token: '' },
      notifications: { adminChat: '', onNewUser: false, onOrder: false, onError: false }
    }
  },

  // EVENT MANAGEMENT TEMPLATE
  professional_event: {
    id: 'professional_event',
    name: '🎪 Управление мероприятиями',
    category: 'events_conference',
    description: 'Бот для управления мероприятиями с полным функционалом: WebApp, QR коды, мерч-шоп, опросы, админ-панель',
    icon: '🎪',
    complexity: 'enterprise',
    tags: ['мероприятие', 'конференция', 'webapp', 'админка', 'события'],
    preview: '🎪 Мероприятие\n\n🌐 WebApp Dashboard\n📱 QR Коды\n🛒 Мерч-шоп\n📊 Аналитика\n⚙️ Админ-панель',
    features: {
      multiLanguage: true,
      analytics: true,
      scheduling: true,
      fileUpload: true,
      voiceMessages: true,
      webApp: true,
      payments: true,
      geolocation: true,
      notifications: true,
      polls: true,
      broadcasts: true,
      qrCodes: true
    },
    scenes: [
      {
        id: 'start',
        name: 'Главная страница',
        trigger: '/start',
        message: 'Добро пожаловать на {{event_name}}! 🎉\\n\\n{{event_description}}\\n\\nВыберите действие:',
        buttons: [
          { text: '🌐 Главное меню', action: 'webapp', value: '/dashboard' },
          { text: '📱 Мой QR', action: 'callback', value: 'my_qr' },
          { text: '📅 Программа', action: 'callback', value: 'schedule' },
          { text: '🛒 Мерч-шоп', action: 'webapp', value: '/shop' }
        ]
      },
      {
        id: 'my_qr',
        name: 'Персональный QR',
        trigger: '/qr',
        message: '📱 Ваш персональный QR код для регистрации на активности:\\n\\n💫 Баллы: {{user_balance}}\\n🎯 Активностей завершено: {{activities_count}}',
        buttons: [
          { text: '🔄 Обновить QR', action: 'callback', value: 'regenerate_qr' },
          { text: '📊 Моя статистика', action: 'webapp', value: '/profile' }
        ]
      },
      {
        id: 'schedule',
        name: 'Программа мероприятия', 
        trigger: '/schedule',
        message: '📅 Программа мероприятия:\\n\\nСегодня доступно {{events_today}} событий',
        buttons: [
          { text: '🌐 Открыть расписание', action: 'webapp', value: '/schedule' },
          { text: '🔔 Мои напоминания', action: 'callback', value: 'reminders' },
          { text: '⭐ Избранные события', action: 'callback', value: 'favorites' }
        ]
      },
      {
        id: 'shop',
        name: 'Мерч-шоп',
        trigger: '/shop',
        message: '🛒 Добро пожаловать в мерч-шоп!\\n\\n💰 Ваш баланс: {{user_balance}} баллов\\n🎁 Доступно товаров: {{available_products}}',
        buttons: [
          { text: '🌐 Открыть каталог', action: 'webapp', value: '/shop' },
          { text: '📦 Мои заказы', action: 'webapp', value: '/orders' },
          { text: '💎 Как заработать баллы', action: 'callback', value: 'earn_points' }
        ]
      },
      {
        id: 'activities',
        name: 'Активности',
        trigger: '/activities',
        message: '🎯 Активности и развлечения:\\n\\n📱 Сканируйте QR коды на стендах для получения баллов!',
        buttons: [
          { text: '🌐 Карта активностей', action: 'webapp', value: '/activities' },
          { text: '📱 QR Сканер', action: 'webapp', value: '/qr-scanner' },
          { text: '🏆 Достижения', action: 'callback', value: 'achievements' }
        ]
      },
      {
        id: 'admin',
        name: 'Админ-панель',
        trigger: '/admin',
        message: '⚙️ Панель администратора:\\n\\n👥 Участников: {{total_users}}\\n📊 Активностей: {{total_activities}}\\n💬 Сообщений: {{total_messages}}',
        buttons: [
          { text: '🌐 Открыть админку', action: 'webapp', value: '/admin' },
          { text: '📊 Статистика', action: 'callback', value: 'admin_stats' },
          { text: '📢 Рассылка', action: 'callback', value: 'broadcast' }
        ],
        permissions: ['admin', 'organizer']
      }
    ],
    database: {
      users: { saveContacts: true, saveMessages: true, saveLocation: true },
      customFields: [
        { name: 'email', type: 'text', required: true },
        { name: 'full_name', type: 'text', required: true },
        { name: 'company', type: 'text', required: false },
        { name: 'position', type: 'text', required: false },
        { name: 'role', type: 'text', required: false, default: 'participant' },
        { name: 'balance', type: 'number', required: false, default: 0 },
        { name: 'activities_completed', type: 'number', required: false, default: 0 },
        { name: 'qr_scans', type: 'number', required: false, default: 0 },
        { name: 'survey_responses', type: 'number', required: false, default: 0 },
        { name: 'is_verified', type: 'boolean', required: false, default: false },
        { name: 'registration_date', type: 'datetime', required: false },
        { name: 'last_activity', type: 'datetime', required: false },
        { name: 'event_check_ins', type: 'json', required: false },
        { name: 'preferences', type: 'json', required: false },
        { name: 'uuid', type: 'text', required: false }
      ]
    },
    webAppPages: [
      {
        name: 'Dashboard',
        route: '/dashboard',
        features: ['user_info', 'quick_stats', 'notifications', 'recent_activities']
      },
      {
        name: 'Schedule',
        route: '/schedule',
        features: ['event_list', 'timeline', 'favorites', 'reminders', 'location_map']
      },
      {
        name: 'Shop',
        route: '/shop',
        features: ['product_catalog', 'cart', 'order_history', 'balance_display']
      },
      {
        name: 'Activities',
        route: '/activities',
        features: ['activity_map', 'completion_status', 'leaderboard']
      },
      {
        name: 'QR Scanner',
        route: '/qr-scanner',
        features: ['camera_scanner', 'scan_history', 'point_rewards']
      },
      {
        name: 'Profile',
        route: '/profile',
        features: ['user_stats', 'achievements', 'settings', 'networking']
      },
      {
        name: 'Admin Panel',
        route: '/admin',
        features: ['user_management', 'analytics', 'content_management', 'broadcasts'],
        permissions: ['admin', 'organizer']
      }
    ],
    webAppContent: {
      products: [
        { id: '1', name: 'Футболка мероприятия', price: 500, emoji: '👕', description: 'Официальная футболка с логотипом' },
        { id: '2', name: 'Кружка', price: 350, emoji: '☕', description: 'Фирменная кружка' },
        { id: '3', name: 'Стикерпак', price: 150, emoji: '🎨', description: 'Набор стикеров' },
        { id: '4', name: 'Блокнот', price: 250, emoji: '📓', description: 'Блокнот участника' }
      ],
      surveys: [
        { id: 's1', title: 'Опрос участников', maxPoints: 50, emoji: '📊', description: 'Помогите нам стать лучше' },
        { id: 's2', title: 'Викторина', maxPoints: 100, emoji: '🎯', description: 'Проверьте свои знания' }
      ],
      activities: [
        { id: 'a1', name: 'Посетить стенд компании А', points: 20, emoji: '🏢', description: 'Узнайте о партнере' },
        { id: 'a2', name: 'Сделать фото в фотозоне', points: 15, emoji: '📸', description: 'Поделитесь моментами' },
        { id: 'a3', name: 'Пройти мастер-класс', points: 50, emoji: '🎓', description: 'Обучение от экспертов' },
        { id: 'a4', name: 'Нетворкинг', points: 30, emoji: '🤝', description: 'Обменяйтесь контактами' }
      ],
      schedule: [
        { id: 'e1', title: 'Регистрация участников', speaker: 'Организаторы', startTime: '2024-01-15T09:00', endTime: '2024-01-15T10:00' },
        { id: 'e2', title: 'Открытие мероприятия', speaker: 'Генеральный директор', startTime: '2024-01-15T10:00', endTime: '2024-01-15T10:30' },
        { id: 'e3', title: 'Основной доклад', speaker: 'Эксперт по AI', startTime: '2024-01-15T10:30', endTime: '2024-01-15T12:00' },
        { id: 'e4', title: 'Обеденный перерыв', speaker: '', startTime: '2024-01-15T12:00', endTime: '2024-01-15T13:00' },
        { id: 'e5', title: 'Панельная дискуссия', speaker: 'Ведущие специалисты', startTime: '2024-01-15T13:00', endTime: '2024-01-15T15:00' }
      ],
      qrEnabled: true,
      qrText: 'Сканируйте QR-коды на стендах',
      qrReward: 10,
      pages: {
        shop: true,
        surveys: true,
        activities: true,
        schedule: true,
        qr: true,
        admin: true
      }
    },
    integrations: {
      webhook: { 
        enabled: true, 
        url: '', 
        events: ['user_registered', 'activity_completed', 'poll_answered', 'qr_scanned', 'order_placed'] 
      },
      payment: { enabled: true, provider: 'yookassa', token: '' },
      notifications: { 
        adminChat: '', 
        onNewUser: true, 
        onOrder: true, 
        onError: true,
        onActivityComplete: true,
        onLowStock: true
      },
      analytics: {
        enabled: true,
        events: ['page_view', 'button_click', 'qr_scan', 'purchase'],
        dashboard: true
      }
    },
    webAppUrl: 'https://webapp-bot-constructor.loca.lt'
  },

};

module.exports = { BOT_TEMPLATES };
