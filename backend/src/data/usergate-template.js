// Шаблон на основе архитектуры @Usergate бота
// Conference/Event Management Bot Template

const usergateTemplate = {
  id: 'usergate_conference',
  name: 'Conference & Event Management',
  category: 'events_conference',
  description: 'Профессиональный бот для управления конференциями, мероприятиями и активностями участников',
  icon: '🎤',
  complexity: 'advanced',
  features: {
    multiLanguage: true,
    analytics: true,
    scheduling: true,
    fileUpload: true,
    voiceMessages: false,
    webApp: true,
    payments: true,
    geolocation: true,
    notifications: true,
    polls: true,
    broadcasts: true,
    qrCodes: true
  },
  
  // Модели данных (аналог Laravel Models)
  dataModels: {
    telegramUser: {
      fields: {
        uuid: 'string',
        telegram_id: 'integer',
        username: 'string',
        first_name: 'string', 
        last_name: 'string',
        email: 'string',
        is_verified: 'boolean',
        role: 'string',
        language_code: 'string',
        last_active_at: 'datetime',
        balance: 'integer'
      },
      methods: {
        'get_full_name': 'return f"{self.first_name} {self.last_name}".strip()',
        'mark_active': 'self.last_active_at = datetime.now()',
        'add_points': 'self.balance += points'
      }
    },
    
    event: {
      fields: {
        name: 'string',
        description: 'text',
        start_time: 'datetime',
        end_time: 'datetime',
        location: 'string',
        max_participants: 'integer',
        registration_required: 'boolean',
        points_reward: 'integer'
      }
    },
    
    activity: {
      fields: {
        name: 'string',
        description: 'text',
        location: 'string',
        points: 'integer',
        qr_code: 'string',
        is_active: 'boolean'
      }
    },
    
    survey: {
      fields: {
        title: 'string',
        questions: 'json',
        is_poll: 'boolean',
        poll_id: 'string',
        reward_points: 'integer'
      }
    },
    
    product: {
      fields: {
        name: 'string',
        description: 'text',
        price: 'integer',
        stock: 'integer',
        image: 'string'
      }
    },
    
    order: {
      fields: {
        product_id: 'integer',
        user_id: 'integer',
        price: 'integer',
        status: 'string'
      }
    }
  },

  // Action Classes Pattern (аналог Service Classes)
  actions: {
    start_command: {
      description: 'Обработка команды /start',
      code: `
async def handle_start_command(update, context):
    user = get_or_create_user(update.effective_user)
    
    if not user.email:
        await send_welcome_message(user)
        await request_email_verification(user)
    else:
        await show_main_menu(user)
`
    },
    
    mini_app_command: {
      description: 'Запуск WebApp',
      code: `
async def handle_mini_command(update, context):
    user = get_current_user(update)
    
    keyboard = InlineKeyboardMarkup([
        [InlineKeyboardButton(
            "🌐 Открыть приложение", 
            web_app=WebAppInfo(url=f"{WEBAPP_URL}?user_id={user.telegram_id}")
        )],
        [InlineKeyboardButton("📊 Быстрый опрос", callback_data="quick_survey")]
    ])
    
    await context.bot.send_message(
        chat_id=user.telegram_id,
        text="Добро пожаловать на конференцию! 🎉",
        reply_markup=keyboard
    )
`
    },
    
    handle_qr_scan: {
      description: 'Обработка сканирования QR кода',
      code: `
async def handle_qr_scan(qr_data, user):
    activity = get_activity_by_qr(qr_data)
    
    if not activity:
        return "❌ QR код не найден"
    
    if user.has_completed_activity(activity):
        return "✅ Вы уже участвовали в этой активности"
    
    user.complete_activity(activity)
    user.add_points(activity.points)
    
    return f"🎉 Активность '{activity.name}' завершена! +{activity.points} баллов"
`
    },
    
    survey_handler: {
      description: 'Обработка опросов и poll',
      code: `
async def handle_survey_response(update, context):
    if update.poll_answer:
        # Обработка Poll ответа
        poll_answer = update.poll_answer
        survey = get_survey_by_poll_id(poll_answer.poll_id)
        user = get_user_by_telegram_id(poll_answer.user.id)
        
        save_survey_answer(user, survey, poll_answer.option_ids)
        
        if survey.reward_points:
            user.add_points(survey.reward_points)
            await notify_points_earned(user, survey.reward_points)
    
    elif update.callback_query:
        # Обработка Callback кнопок
        callback_data = update.callback_query.data
        
        if callback_data.startswith('survey_'):
            survey_id = callback_data.split('_')[1]
            await start_survey(update.effective_user, survey_id)
`
    }
  },

  // WebApp компоненты
  webAppPages: {
    homepage: {
      title: 'Главная',
      description: 'Домашняя страница конференции',
      components: ['qr_scanner', 'schedule', 'activities', 'shop', 'profile']
    },
    
    schedule: {
      title: 'Расписание',
      description: 'Программа мероприятий',
      features: ['event_list', 'calendar_view', 'reminders', 'registration']
    },
    
    activities: {
      title: 'Активности',
      description: 'Интерактивные зоны и активности',
      features: ['qr_scanner', 'location_map', 'points_tracker']
    },
    
    shop: {
      title: 'Магазин',
      description: 'Обмен баллов на призы',
      features: ['product_catalog', 'balance_display', 'order_history']
    },
    
    profile: {
      title: 'Профиль',
      description: 'Информация пользователя',
      features: ['user_info', 'achievements', 'qr_code', 'statistics']
    }
  },

  // Команды бота
  commands: [
    {
      command: '/start',
      description: 'Начать работу с ботом',
      action: 'start_command',
      public: true
    },
    {
      command: '/mini',
      description: 'Открыть веб-приложение',
      action: 'mini_app_command',
      public: true
    },
    {
      command: '/schedule',
      description: 'Показать расписание',
      action: 'show_schedule',
      public: true
    },
    {
      command: '/balance',
      description: 'Показать баланс баллов',
      action: 'show_balance',
      public: true
    },
    {
      command: '/help',
      description: 'Помощь и инструкции',
      action: 'show_help',
      public: true
    }
  ],

  // Callback обработчики
  callbacks: [
    {
      pattern: 'survey_*',
      description: 'Запуск опроса',
      action: 'start_survey'
    },
    {
      pattern: 'activity_*',
      description: 'Информация об активности',
      action: 'show_activity'
    },
    {
      pattern: 'register_event_*',
      description: 'Регистрация на мероприятие',
      action: 'register_event'
    },
    {
      pattern: 'verify_email',
      description: 'Подтверждение email',
      action: 'verify_email'
    }
  ],

  // Сценарии (аналог Webhook Handler)
  scenarios: {
    user_registration: {
      name: 'Регистрация пользователя',
      steps: [
        {
          trigger: '/start',
          action: 'welcome_message',
          next: 'email_request'
        },
        {
          trigger: 'email_input',
          action: 'verify_email',
          next: 'email_confirmation'
        },
        {
          trigger: 'email_confirmed',
          action: 'show_main_menu',
          next: 'main_flow'
        }
      ]
    },
    
    activity_completion: {
      name: 'Завершение активности',
      steps: [
        {
          trigger: 'qr_scan',
          action: 'validate_qr',
          next: 'award_points'
        },
        {
          trigger: 'points_awarded',
          action: 'show_achievement',
          next: 'suggest_next_activity'
        }
      ]
    },
    
    survey_completion: {
      name: 'Прохождение опроса',
      steps: [
        {
          trigger: 'survey_start',
          action: 'send_poll',
          next: 'await_response'
        },
        {
          trigger: 'poll_answer',
          action: 'process_answer',
          next: 'reward_user'
        }
      ]
    }
  },

  // Конфигурация
  config: {
    database_tables: [
      'telegram_users',
      'events', 
      'activities',
      'surveys',
      'survey_answers',
      'products',
      'orders',
      'transactions',
      'broadcasts'
    ],
    
    required_env_vars: [
      'TELEGRAM_BOT_TOKEN',
      'WEBAPP_URL',
      'DATABASE_URL',
      'ADMIN_CHAT_ID'
    ],
    
    features: {
      admin_panel: true,
      user_management: true,
      analytics_dashboard: true,
      broadcast_system: true,
      payment_integration: false,
      external_api_integration: true
    }
  },

  // Примеры использования
  use_cases: [
    'Конференции и IT-мероприятия',
    'Корпоративные события',
    'Выставки и экспозиции', 
    'Образовательные программы',
    'Фестивали и культурные мероприятия',
    'Бизнес-форумы',
    'Тренинги и воркшопы'
  ],

  // Готовые интеграции
  integrations: {
    calendar: 'Google Calendar API для синхронизации расписания',
    payment: 'Stripe/PayPal для обработки платежей',
    crm: 'HubSpot/Salesforce для управления участниками',
    email: 'SendGrid для email рассылок',
    analytics: 'Google Analytics для отслеживания активности',
    storage: 'AWS S3 для хранения файлов'
  }
};

module.exports = { usergateTemplate };
