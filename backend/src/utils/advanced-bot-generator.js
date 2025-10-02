/**
 * Продвинутый генератор Python кода для промышленных ботов
 */

function generateAdvancedPythonBot(botSettings, botInfo, botId) {
  // Валидация: botId обязателен
  if (!botId) {
    throw new Error('botId is required parameter for generateAdvancedPythonBot');
  }
  
  const hasWebApp = botSettings.features?.webApp || false;
  const hasPayments = botSettings.features?.payments || botSettings.integrations?.payment?.enabled || false;
  const hasGeolocation = botSettings.features?.geolocation || false;
  const hasNotifications = botSettings.features?.notifications || botSettings.integrations?.notifications?.onNewUser || false;
  const hasPolls = botSettings.features?.polls || false;
  const hasBroadcasts = botSettings.features?.broadcasts || false;
  const hasQrCodes = botSettings.features?.qrCodes || false;
  
  // Получаем контент для WebApp
  const webAppProducts = botSettings.webAppContent?.products || [];
  const webAppSurveys = botSettings.webAppContent?.surveys || [];
  const webAppActivities = botSettings.webAppContent?.activities || [];
  const webAppSchedule = botSettings.webAppContent?.schedule || [];
  
  return `#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
${botSettings.name} - Telegram Bot
Создан с помощью Telegram Bot Constructor

🤖 Бот: @${botInfo.username}
📂 Категория: ${botSettings.category}
📝 Описание: ${botSettings.description}

⚙️ ФУНКЦИИ:
${hasWebApp ? '📱 Web App интеграция' : ''}
${hasPayments ? '💳 Платежная система' : ''}
${hasGeolocation ? '📍 Геолокация и доставка' : ''}
🔔 Уведомления администратора
📊 Аналитика и статистика
🗄️ База данных SQLite
⚡ Асинхронная обработка
"""

import os
import logging
import sqlite3
import json
import datetime
import asyncio
import hashlib
import uuid
import urllib.parse
from pathlib import Path
from typing import Dict, List, Optional, Any

from telegram import (
    Update, 
    InlineKeyboardButton, 
    InlineKeyboardMarkup, 
    ReplyKeyboardMarkup, 
    KeyboardButton,
    WebAppInfo,
    LabeledPrice,
    PreCheckoutQuery,
    BotCommand${hasPolls ? ',\n    Poll' : ''}${hasQrCodes ? ',\n    InputFile' : ''}
)
from telegram.ext import (
    Application, 
    CommandHandler, 
    CallbackQueryHandler, 
    MessageHandler, 
    filters, 
    ContextTypes,
    PreCheckoutQueryHandler${hasPolls ? ',\n    PollAnswerHandler' : ''}
)

# ==================== КОНФИГУРАЦИЯ ====================

# Основные настройки
BOT_TOKEN = "${botSettings.token}"
BOT_NAME = "${botSettings.name}"
BOT_USERNAME = "${botInfo.username}"
CATEGORY = "${botSettings.category}"

# WebApp контент для команд (доступ к реальным данным)
WEBAPP_CONTENT = {
    'schedule': ${JSON.stringify(webAppSchedule)},
    'products': ${JSON.stringify(webAppProducts)},
    'activities': ${JSON.stringify(webAppActivities)},
    'surveys': ${JSON.stringify(webAppSurveys)},
    'pages': ${JSON.stringify(botSettings.webAppContent?.pages || {})}
}

# Администраторы бота (доступ к админке)
ADMIN_USERS = ${JSON.stringify(botSettings.adminUsers || [])}  # Telegram ID администраторов

# Настройки платежей
${hasPayments ? `
PAYMENT_PROVIDER_TOKEN = "${botSettings.integrations.payment.token}"
PAYMENT_PROVIDER = "${botSettings.integrations.payment.provider}"
CURRENCY = "RUB"
` : '# Платежи отключены'}

# Настройки WebApp
${hasWebApp ? `
# URL сервера (из переменной окружения или дефолт)
SERVER_URL = os.getenv('SERVER_URL', '${botSettings.serverUrl || process.env.SERVER_URL || 'http://localhost:5000'}')
WEBAPP_URL = f"{SERVER_URL}/bot-webapp/${botId}"  # Индивидуальный WebApp для этого бота
WEBAPP_TYPE = "${botSettings.category}"
` : '# WebApp отключен'}

# Настройки уведомлений
ADMIN_CHAT_ID = "${botSettings.integrations.notifications.adminChat || ''}"
NOTIFY_NEW_USERS = ${botSettings.integrations.notifications.onNewUser ? 'True' : 'False'}
NOTIFY_ORDERS = ${botSettings.integrations.notifications.onOrder ? 'True' : 'False'}
NOTIFY_ERRORS = ${botSettings.integrations.notifications.onError ? 'True' : 'False'}

# ==================== ЛОГИРОВАНИЕ ====================

logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.INFO,
    handlers=[
        logging.FileHandler(f'{BOT_NAME.replace(" ", "_")}_bot.log', encoding='utf-8'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# ==================== ACTION CLASSES (Usergate Pattern) ====================

class UserAction:
    """Базовый класс для Action паттерна (аналог Service Classes из Laravel)"""
    
    def __init__(self, bot, user_id: int):
        self.bot = bot
        self.user_id = user_id
    
    async def execute(self, *args, **kwargs):
        """Основной метод для выполнения действия"""
        raise NotImplementedError

# ==================== БАЗА ДАННЫХ ====================

class DatabaseManager:
    def __init__(self, db_path: str = 'bot_database.db'):
        self.db_path = db_path
        # Регистрация адаптеров для datetime (Python 3.12+)
        sqlite3.register_adapter(datetime.datetime, lambda val: val.isoformat())
        sqlite3.register_adapter(datetime.date, lambda val: val.isoformat())
        self.init_database()
    
    def init_database(self):
        """Инициализация всех таблиц"""
        conn = sqlite3.connect(self.db_path, detect_types=sqlite3.PARSE_DECLTYPES)
        cursor = conn.cursor()
        
        # Таблица пользователей
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS users (
                user_id INTEGER PRIMARY KEY,
                username TEXT,
                first_name TEXT,
                last_name TEXT,
                phone TEXT,
                email TEXT${
                    botSettings.database?.customFields && botSettings.database.customFields
                        .filter(field => !['phone', 'email', 'username', 'first_name', 'last_name', 'user_id', 'language_code', 'is_premium', 'loyalty_points', 'created_at', 'last_activity'].includes(field.name))
                        .length > 0 
                    ? ',\n                ' + botSettings.database.customFields
                        .filter(field => !['phone', 'email', 'username', 'first_name', 'last_name', 'user_id', 'language_code', 'is_premium', 'loyalty_points', 'created_at', 'last_activity'].includes(field.name))
                        .map(field => 
                            `${field.name} ${field.type === 'number' ? 'INTEGER' : field.type === 'date' ? 'DATE' : 'TEXT'}`
                        ).join(',\n                ')
                    : ''
                },
                language_code TEXT DEFAULT 'ru',
                is_premium BOOLEAN DEFAULT 0,
                loyalty_points INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Таблица заказов/бронирований
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS orders (
                order_id TEXT PRIMARY KEY,
                user_id INTEGER,
                order_type TEXT,
                status TEXT DEFAULT 'pending',
                items TEXT,
                total_amount REAL,
                delivery_address TEXT,
                payment_method TEXT,
                payment_status TEXT DEFAULT 'pending',
                notes TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (user_id)
            )
        ''')
        
        # Таблица корзины
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS cart (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                item_id TEXT,
                item_name TEXT,
                quantity INTEGER DEFAULT 1,
                price REAL,
                options TEXT,
                added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (user_id)
            )
        ''')
        
        # Таблица сообщений
        ${botSettings.database.users.saveMessages ? `
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS messages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                message_type TEXT,
                message_text TEXT,
                scene_id TEXT,
                media_url TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (user_id)
            )
        ''')
        ` : '# Сохранение сообщений отключено'}
        
        # Таблица аналитики
        ${botSettings.features.analytics ? `
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS analytics (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                event_type TEXT,
                user_id INTEGER,
                scene_id TEXT,
                data TEXT,
                session_id TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        ` : '# Аналитика отключена'}
        
        # Таблица для WebApp данных
        ${hasWebApp ? `
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS webapp_data (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                data_type TEXT,
                data_value TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (user_id)
            )
        ''')
        ` : '# WebApp отключен'}
        
        conn.commit()
        conn.close()
        logger.info("🗄️ База данных инициализирована")

    def execute_query(self, query: str, params: tuple = (), fetch: bool = False):
        """Выполнение SQL запроса"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        try:
            cursor.execute(query, params)
            if fetch:
                result = cursor.fetchall()
            else:
                result = cursor.rowcount
            conn.commit()
            return result
        except Exception as e:
            logger.error(f"Ошибка выполнения запроса: {e}")
            conn.rollback()
            raise
        finally:
            conn.close()

# Инициализируем базу данных
db = DatabaseManager()

# ==================== ПОЛЬЗОВАТЕЛИ ====================

class UserManager:
    @staticmethod
    def save_user(user_id: int, username: str, first_name: str, last_name: str, **kwargs):
        """Сохранение пользователя"""
        db.execute_query('''
            INSERT OR REPLACE INTO users (
                user_id, username, first_name, last_name, last_activity
            ) VALUES (?, ?, ?, ?, ?)
        ''', (user_id, username, first_name, last_name, datetime.datetime.now()))
    
    @staticmethod
    def get_user(user_id: int) -> Optional[Dict]:
        """Получение пользователя"""
        result = db.execute_query(
            'SELECT * FROM users WHERE user_id = ?', 
            (user_id,), 
            fetch=True
        )
        return dict(zip([col[0] for col in db.execute_query('PRAGMA table_info(users)', fetch=True)], result[0])) if result else None
    
    @staticmethod
    def update_user_field(user_id: int, field: str, value: Any):
        """Обновление поля пользователя"""
        db.execute_query(f'UPDATE users SET {field} = ? WHERE user_id = ?', (value, user_id))

# ==================== КОРЗИНА ====================

${botSettings.category === 'ecommerce' ? `
class CartManager:
    @staticmethod
    def add_item(user_id: int, item_id: str, item_name: str, price: float, quantity: int = 1, options: str = ''):
        """Добавление товара в корзину"""
        db.execute_query('''
            INSERT INTO cart (user_id, item_id, item_name, quantity, price, options)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (user_id, item_id, item_name, quantity, price, options))
    
    @staticmethod
    def get_cart(user_id: int) -> List[Dict]:
        """Получение корзины пользователя"""
        result = db.execute_query(
            'SELECT * FROM cart WHERE user_id = ?', 
            (user_id,), 
            fetch=True
        )
        columns = ['id', 'user_id', 'item_id', 'item_name', 'quantity', 'price', 'options', 'added_at']
        return [dict(zip(columns, row)) for row in result]
    
    @staticmethod
    def clear_cart(user_id: int):
        """Очистка корзины"""
        db.execute_query('DELETE FROM cart WHERE user_id = ?', (user_id,))
    
    @staticmethod
    def get_cart_total(user_id: int) -> float:
        """Получение общей суммы корзины"""
        result = db.execute_query(
            'SELECT SUM(price * quantity) FROM cart WHERE user_id = ?', 
            (user_id,), 
            fetch=True
        )
        return result[0][0] if result and result[0][0] else 0.0
` : '# Корзина доступна только для ecommerce'}

# ==================== АНАЛИТИКА ====================

${botSettings.features.analytics ? `
class AnalyticsManager:
    @staticmethod
    def log_event(event_type: str, user_id: int, scene_id: str = None, data: Dict = None):
        """Логирование события"""
        session_id = hashlib.md5(f"{user_id}_{datetime.date.today()}".encode()).hexdigest()
        db.execute_query('''
            INSERT INTO analytics (event_type, user_id, scene_id, data, session_id)
            VALUES (?, ?, ?, ?, ?)
        ''', (event_type, user_id, scene_id, json.dumps(data) if data else None, session_id))
    
    @staticmethod
    def get_stats() -> Dict:
        """Получение статистики"""
        stats = {}
        
        # Общее количество пользователей
        result = db.execute_query('SELECT COUNT(*) FROM users', fetch=True)
        stats['total_users'] = result[0][0] if result else 0
        
        # Активные пользователи сегодня
        result = db.execute_query(
            "SELECT COUNT(DISTINCT user_id) FROM analytics WHERE date(created_at) = date('now')", 
            fetch=True
        )
        stats['active_today'] = result[0][0] if result else 0
        
        # Популярные сцены
        result = db.execute_query('''
            SELECT scene_id, COUNT(*) as count 
            FROM analytics 
            WHERE event_type = 'scene_viewed' AND scene_id IS NOT NULL
            GROUP BY scene_id 
            ORDER BY count DESC 
            LIMIT 5
        ''', fetch=True)
        stats['popular_scenes'] = result
        
        return stats
` : '# Аналитика отключена'}

# ==================== СЦЕНАРИИ БОТА ====================

SCENES = {
${(botSettings.scenes && botSettings.scenes.length > 0) ? botSettings.scenes.map(scene => `
    "${scene.id}": {
        "name": "${scene.name}",
        "trigger": "${scene.trigger}",
        "message": """${scene.message}""",
        "buttons": [
${scene.buttons && scene.buttons.length > 0 ? scene.buttons.map(button => `
            {
                "text": "${button.text}", 
                "action": "${button.action}", 
                "value": "${button.value}"
            }`).join(',\n') : ''}
        ]
    }`).join(',\n') : `
    "start": {
        "name": "Главная страница",
        "trigger": "/start",
        "message": """Добро пожаловать! 🎉

Я ваш персональный помощник. 

Выберите действие:""",
        "buttons": [
            {
                "text": "📞 Связаться", 
                "action": "callback", 
                "value": "contact"
            },
            {
                "text": "❓ Помощь", 
                "action": "callback", 
                "value": "help"
            }
        ]
    }`}
}

# ==================== КЛАВИАТУРЫ ====================

def create_keyboard(scene_id: str, user_data: Dict = None) -> Optional[InlineKeyboardMarkup]:
    """Создание клавиатуры для сцены"""
    if scene_id not in SCENES:
        return None
    
    scene = SCENES[scene_id]
    if not scene["buttons"]:
        return None
    
    keyboard = []
    row = []
    
    for i, button in enumerate(scene["buttons"]):
        btn = None
        
        if button["action"] == "callback":
            btn = InlineKeyboardButton(button["text"], callback_data=button["value"])
        elif button["action"] == "url":
            btn = InlineKeyboardButton(button["text"], url=button["value"])
        elif button["action"] == "webapp":
            # Создаем настоящую WebApp кнопку
            webapp_url = f"{WEBAPP_URL}?type={WEBAPP_TYPE}&name={BOT_NAME}&description={urllib.parse.quote(button.get('description', 'WebApp'))}"
            
            # Добавляем весь контент WebApp в URL
            webapp_content = {}
            
            ${webAppProducts.length > 0 ? `
            # Товары/услуги
            webapp_content["products"] = [
                ${webAppProducts.map(product => `{
                    "id": "${product.id}",
                    "name": "${product.name.replace(/"/g, '\\"')}",
                    "price": ${product.price},
                    "emoji": "${product.emoji}",
                    "description": "${product.description.replace(/"/g, '\\"')}"
                }`).join(',\n                ')}
            ]
            ` : ''}
            
            ${webAppSurveys.length > 0 ? `
            # Опросы и викторины
            webapp_content["surveys"] = [
                ${webAppSurveys.map(survey => `{
                    "id": "${survey.id}",
                    "title": "${survey.title.replace(/"/g, '\\"')}",
                    "maxPoints": ${survey.maxPoints},
                    "emoji": "${survey.emoji}",
                    "description": "${survey.description.replace(/"/g, '\\"')}"
                }`).join(',\n                ')}
            ]
            ` : ''}
            
            ${webAppActivities.length > 0 ? `
            # Активности и задания
            webapp_content["activities"] = [
                ${webAppActivities.map(activity => `{
                    "id": "${activity.id}",
                    "name": "${activity.name.replace(/"/g, '\\"')}",
                    "points": ${activity.points},
                    "emoji": "${activity.emoji}",
                    "description": "${activity.description.replace(/"/g, '\\"')}"
                }`).join(',\n                ')}
            ]
            ` : ''}
            
            ${webAppSchedule.length > 0 ? `
            # Расписание и мероприятия
            webapp_content["schedule"] = [
                ${webAppSchedule.map(event => `{
                    "id": "${event.id}",
                    "title": "${event.title.replace(/"/g, '\\"')}",
                    "speaker": "${event.speaker.replace(/"/g, '\\"')}",
                    "startTime": "${event.startTime}",
                    "endTime": "${event.endTime}"
                }`).join(',\n                ')}
            ]
            ` : ''}
            
            if webapp_content:
                content_json = json.dumps(webapp_content)
                webapp_url += f"&content={urllib.parse.quote(content_json)}"
            
            btn = InlineKeyboardButton(button["text"], web_app=WebAppInfo(url=webapp_url)) 
        elif button["action"] == "payment":
            btn = InlineKeyboardButton(button["text"], callback_data=f"pay_{button['value']}")
        elif button["action"] == "contact":
            return ReplyKeyboardMarkup(
                [[KeyboardButton(button["text"], request_contact=True)]], 
                resize_keyboard=True, 
                one_time_keyboard=True
            )
        elif button["action"] == "location":
            return ReplyKeyboardMarkup(
                [[KeyboardButton(button["text"], request_location=True)]], 
                resize_keyboard=True, 
                one_time_keyboard=True
            )
        
        if btn:
            row.append(btn)
            
            # Создаем новую строку каждые 2 кнопки или в конце
            if len(row) == 2 or i == len(scene["buttons"]) - 1:
                keyboard.append(row)
                row = []
    
    return InlineKeyboardMarkup(keyboard) if keyboard else None

# ==================== ОБРАБОТЧИКИ СЦЕН ====================

async def send_scene(update: Update, context: ContextTypes.DEFAULT_TYPE, scene_id: str, **kwargs):
    """Отправка сцены пользователю"""
    if scene_id not in SCENES:
        await update.message.reply_text("🚫 Сцена не найдена")
        return
    
    scene = SCENES[scene_id]
    user_id = update.effective_user.id
    
    # Персонализация сообщения
    message = scene["message"]
    if kwargs:
        try:
            message = message.format(**kwargs)
        except KeyError as e:
            logger.warning(f"Отсутствует переменная для персонализации: {e}")
    
    # Создание клавиатуры
    keyboard = create_keyboard(scene_id, kwargs)
    
    # Логирование
    ${botSettings.features.analytics ? `
    AnalyticsManager.log_event("scene_viewed", user_id, scene_id, {"scene_name": scene["name"]})
    ` : ''}
    
    # Отправка сообщения
    # Получаем постоянную клавиатуру команд если она есть
    persistent_keyboard = context.user_data.get('reply_markup') if hasattr(context, 'user_data') else None
    
    if keyboard:
        await update.message.reply_text(message, reply_markup=keyboard, parse_mode='HTML')
    elif persistent_keyboard:
        await update.message.reply_text(message, reply_markup=persistent_keyboard, parse_mode='HTML')
    else:
        await update.message.reply_text(message, parse_mode='HTML')

# ==================== КОМАНДЫ ====================

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Обработчик команды /start"""
    user = update.effective_user
    UserManager.save_user(user.id, user.username, user.first_name, user.last_name)
    
    ${botSettings.features.analytics ? `
    AnalyticsManager.log_event("bot_started", user.id)
    ` : ''}
    
    logger.info(f"👤 Пользователь {user.first_name} (@{user.username or 'без username'}) запустил бота")
    
    # Уведомление админа о новом пользователе
    ${botSettings.integrations.notifications.onNewUser ? `
    if ADMIN_CHAT_ID and NOTIFY_NEW_USERS:
        try:
            await context.bot.send_message(
                chat_id=ADMIN_CHAT_ID,
                text=f"👤 Новый пользователь в боте {BOT_NAME}!\\n\\n"
                     f"👤 Имя: {user.first_name} {user.last_name or ''}\\n"
                     f"🆔 Username: @{user.username or 'не указан'}\\n"
                     f"🔢 ID: {user.id}\\n"
                     f"🌍 Язык: {user.language_code or 'не указан'}"
            )
        except Exception as e:
            logger.error(f"Ошибка отправки уведомления админу: {e}")
    ` : ''}
    
    # Создаем постоянную клавиатуру с командами
    ${
      botSettings.scenes && botSettings.scenes.some(s => s.trigger && s.trigger.startsWith('/') && s.trigger !== '/start')
        ? `
    keyboard_buttons = []
    # Добавляем кнопки команд из сцен
    ${botSettings.scenes
      .filter(scene => scene.trigger && scene.trigger.startsWith('/') && scene.trigger !== '/start')
      .map(scene => {
        const buttonText = scene.name || scene.trigger;
        return `keyboard_buttons.append(KeyboardButton("${buttonText}"))`;
      })
      .join('\n    ')}
    
    # Формируем клавиатуру по 2 кнопки в ряд
    keyboard_layout = []
    for i in range(0, len(keyboard_buttons), 2):
        keyboard_layout.append(keyboard_buttons[i:i+2])
    
    # Добавляем кнопку помощи в последний ряд
    keyboard_layout.append([KeyboardButton("❓ Помощь")])
    
    reply_markup = ReplyKeyboardMarkup(keyboard_layout, resize_keyboard=True, one_time_keyboard=False)
    context.user_data['reply_markup'] = reply_markup
    `
        : ''
    }
    
    await send_scene(update, context, "start")

${
  // Генерируем обработчики для всех команд из сцен
  botSettings.scenes && botSettings.scenes.length > 0
    ? botSettings.scenes
        .filter(scene => scene.trigger && scene.trigger.startsWith('/') && scene.trigger !== '/start')
        .map(scene => {
          const commandName = scene.trigger.slice(1); // убираем /
          
          // Определяем тип команды для умной обработки
          const isSchedule = commandName.includes('schedule') || scene.id.includes('schedule');
          const isShop = commandName.includes('shop') || scene.id.includes('shop');
          const isActivities = commandName.includes('activit') || scene.id.includes('activit');
          const isQR = commandName.includes('qr') || scene.id.includes('qr');
          
          return `
async def ${commandName}_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Обработчик команды ${scene.trigger}"""
    user = update.effective_user
    logger.info(f"👤 {user.first_name} вызвал команду ${scene.trigger}")
    
    ${botSettings.features.analytics ? `
    AnalyticsManager.log_event("command_used", user.id, "${scene.id}", {"command": "${scene.trigger}"})
    ` : ''}
    
    ${isSchedule ? `
    # Показываем реальное расписание
    schedule_items = WEBAPP_CONTENT.get('schedule', [])
    if schedule_items:
        message = "📅 <b>Расписание мероприятия</b>\\n\\n"
        for item in schedule_items:
            message += f"🎤 <b>{item.get('title', item.get('name', 'Событие'))}</b>\\n"
            if item.get('time'):
                message += f"⏰ {item['time']}\\n"
            if item.get('location'):
                message += f"📍 {item['location']}\\n"
            if item.get('description'):
                message += f"📝 {item['description']}\\n"
            message += "\\n"
        
        await update.message.reply_text(message, parse_mode='HTML')
    else:
        await send_scene(update, context, "${scene.id}")
    ` : isShop ? `
    # Показываем товары из магазина
    products = WEBAPP_CONTENT.get('products', [])
    if products:
        message = "🛒 <b>Наш магазин</b>\\n\\n"
        for product in products[:10]:  # Показываем первые 10
            message += f"{product.get('emoji', '🎁')} <b>{product.get('name', 'Товар')}</b>\\n"
            message += f"💰 {product.get('price', 0)} ₽\\n"
            if product.get('description'):
                message += f"📝 {product['description']}\\n"
            message += "\\n"
        
        # Кнопка для открытия WebApp с полным каталогом
        keyboard = [[InlineKeyboardButton(
            "🌐 Открыть каталог",
            web_app=WebAppInfo(url=WEBAPP_URL)
        )]]
        reply_markup = InlineKeyboardMarkup(keyboard)
        
        await update.message.reply_text(
            message,
            parse_mode='HTML',
            reply_markup=reply_markup
        )
    else:
        await send_scene(update, context, "${scene.id}")
    ` : isActivities ? `
    # Показываем активности
    activities = WEBAPP_CONTENT.get('activities', [])
    if activities:
        message = "🎯 <b>Доступные активности</b>\\n\\n"
        for activity in activities:
            message += f"{activity.get('emoji', '✨')} <b>{activity.get('name', 'Активность')}</b>\\n"
            message += f"🏆 {activity.get('points', 0)} баллов\\n"
            if activity.get('description'):
                message += f"📝 {activity['description']}\\n"
            message += "\\n"
        
        # Кнопка для WebApp
        keyboard = [[InlineKeyboardButton(
            "🌐 Зарегистрироваться",
            web_app=WebAppInfo(url=WEBAPP_URL)
        )]]
        reply_markup = InlineKeyboardMarkup(keyboard)
        
        await update.message.reply_text(
            message,
            parse_mode='HTML',
            reply_markup=reply_markup
        )
    else:
        await send_scene(update, context, "${scene.id}")
    ` : isQR ? `
    # Генерируем QR код пользователя
    try:
        import qrcode
        from io import BytesIO
        
        # Генерируем уникальный QR для пользователя
        qr_data = f"BOT:{BOT_USERNAME}:USER:{user.id}:NAME:{user.first_name}"
        
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_L,
            box_size=10,
            border=2,
        )
        qr.add_data(qr_data)
        qr.make(fit=True)
        
        img = qr.make_image(fill_color="#8b5cf6", back_color="white")
        
        # Сохраняем в BytesIO
        bio = BytesIO()
        img.save(bio, 'PNG')
        bio.seek(0)
        
        await update.message.reply_photo(
            photo=bio,
            caption=f"📱 <b>Ваш персональный QR код</b>\\n\\n"
                    f"👤 {user.first_name}\\n"
                    f"🆔 ID: {user.id}\\n\\n"
                    f"Покажите этот QR код для регистрации на мероприятиях!",
            parse_mode='HTML'
        )
    except ImportError:
        # Если qrcode не установлен, отправляем текстовую версию
        await update.message.reply_text(
            f"📱 <b>Ваш персональный код</b>\\n\\n"
            f"👤 {user.first_name}\\n"
            f"🆔 ID: <code>{user.id}</code>\\n\\n"
            f"Назовите этот ID при регистрации на мероприятиях!",
            parse_mode='HTML'
        )
    ` : `
    # Стандартная обработка через сцену
    await send_scene(update, context, "${scene.id}")
    `}
`;
        })
        .join('\n')
    : ''
}

async def help_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Команда помощи"""
    help_text = f"""
❓ <b>Справка по боту {BOT_NAME}</b>

🤖 <b>Доступные команды:</b>
/start - Главное меню
/help - Эта справка
${botSettings.features.analytics ? '/stats - Статистика (для админов)' : ''}

📱 <b>Возможности бота:</b>
${hasWebApp ? '• 📱 Web-приложение' : ''}
${hasPayments ? '• 💳 Онлайн-оплата' : ''}
${hasGeolocation ? '• 📍 Определение местоположения' : ''}
• 🔔 Уведомления
• 📊 Аналитика действий
• 💾 Сохранение данных

🆘 <b>Нужна помощь?</b>
${botSettings.integrations.notifications.adminChat ? `Обратитесь к администратору: @admin` : 'Используйте кнопки меню для навигации'}
    """
    
    await update.message.reply_text(help_text, parse_mode='HTML')

# ==================== АДМИНКА ====================

async def admin_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Быстрая статистика для админов (подробная аналитика в конструкторе!)"""
    user_id = update.effective_user.id
    
    # Проверка прав доступа
    if user_id not in ADMIN_USERS:
        await update.message.reply_text(
            "⛔ <b>Доступ запрещен</b>\\n\\n"
            "У вас нет прав для доступа к админ-панели.\\n"
            "Обратитесь к владельцу бота.",
            parse_mode='HTML'
        )
        return
    
    # Получаем ТОЛЬКО быструю статистику
    total_users = len(db.fetch_all('SELECT id FROM users'))
    
    ${botSettings.features.analytics ? `
    total_events = len(db.fetch_all('SELECT id FROM analytics_events'))
    ` : 'total_events = 0'}
    
    total_webapp = len(db.fetch_all('SELECT id FROM webapp_data')) if db.table_exists('webapp_data') else 0
    
    # МИНИМАЛЬНОЕ меню для СРОЧНЫХ действий
    keyboard = [
        [
            InlineKeyboardButton("📨 Рассылка", callback_data="admin_broadcast")
        ],
        [
            InlineKeyboardButton("🌐 Открыть аналитику", url=f"{os.getenv('SERVER_URL', 'http://localhost:5555')}/bots/{BOT_USERNAME.replace('@', '')}/analytics")
        ]
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)
    
    admin_text = f"""🔧 <b>Админ-панель</b>

👨‍💼 {update.effective_user.first_name}
🆔 ID: <code>{user_id}</code>

📊 <b>Быстрая статистика:</b>
👥 Пользователей: {total_users}
📈 События: {total_events}
📱 WebApp действий: {total_webapp}

💡 <b>Для подробной аналитики:</b>
Откройте конструктор → выберите бота → "📊 Аналитика"
Там вы найдете:
• 📈 Графики активности
• 👥 Таблицы пользователей
• 📥 Экспорт в CSV
• 🎯 Популярные команды
• 📱 Данные WebApp
"""
    
    await update.message.reply_text(
        admin_text,
        parse_mode='HTML',
        reply_markup=reply_markup
    )

${botSettings.features.analytics ? `
async def stats_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Статистика (только для админов)"""
    user_id = update.effective_user.id
    
    if user_id not in ADMIN_USERS:
        await update.message.reply_text("🚫 У вас нет прав для просмотра статистики")
        return
    
    stats = AnalyticsManager.get_stats()
    
    stats_text = f"""📊 <b>Статистика бота {BOT_NAME}</b>

👥 Всего пользователей: {stats.get('total_users', 0)}
🟢 Активных сегодня: {stats.get('active_today', 0)}

🔥 <b>Популярные сцены:</b>
"""
    
    for scene_id, count in stats.get('popular_scenes', []):
        scene_name = SCENES.get(scene_id, {}).get('name', scene_id)
        stats_text += f"• {scene_name}: {count}\\n"
    
    await update.message.reply_text(stats_text, parse_mode='HTML')
` : ''}

# ==================== ОБРАБОТЧИКИ АДМИНКИ ====================

async def handle_admin_callback(query, context, callback_data: str):
    """Обработка кнопок админ-панели (минимальный функционал)"""
    user_id = query.from_user.id
    
    # Проверка прав доступа
    if user_id not in ADMIN_USERS:
        await query.answer("⛔ Доступ запрещен", show_alert=True)
        return
    
    if callback_data == 'admin_broadcast':
        # Рассылка (единственная срочная функция в боте)
        await query.edit_message_text(
            "📨 <b>Рассылка сообщений</b>\\n\\n"
            "Для запуска рассылки отправьте текст сообщения в следующем формате:\\n\\n"
            "<code>/broadcast Текст вашего сообщения</code>\\n\\n"
            "⚠️ Рассылка будет отправлена ВСЕМ пользователям бота!\\n\\n"
            "💡 Для подробной аналитики, экспорта данных и управления пользователями используйте конструктор.",
            parse_mode='HTML'
        )
        await query.answer()

# ==================== ОБРАБОТЧИКИ CALLBACK ====================

async def button_callback(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Обработчик нажатий на кнопки"""
    query = update.callback_query
    await query.answer()
    
    user_id = query.from_user.id
    callback_data = query.data
    
    ${botSettings.features.analytics ? `
    AnalyticsManager.log_event("button_clicked", user_id, data={"callback_data": callback_data})
    ` : ''}
    
    logger.info(f"🖱️ Пользователь {user_id} нажал кнопку: {callback_data}")
    
    # Обработка специальных команд
    if callback_data.startswith('admin_'):
        # Обработка кнопок админки
        await handle_admin_callback(query, context, callback_data)
    elif callback_data.startswith('pay_'):
        await handle_payment_request(query, context, callback_data[4:])
    elif callback_data in SCENES:
        # Переход к сцене - отправляем новое сообщение
        scene = SCENES.get(callback_data)
        if scene:
            # Формируем сообщение сцены
            scene_text = scene.get('text', f"📋 {scene.get('name', 'Раздел')}")
            
            # Формируем клавиатуру для сцены
            buttons = []
            for button in scene.get('buttons', []):
                if button.get('web_app'):
                    buttons.append([InlineKeyboardButton(button['text'], web_app=WebAppInfo(url=button['web_app']))])
                elif button.get('callback_data'):
                    buttons.append([InlineKeyboardButton(button['text'], callback_data=button['callback_data'])])
                elif button.get('url'):
                    buttons.append([InlineKeyboardButton(button['text'], url=button['url'])])
            
            keyboard = InlineKeyboardMarkup(buttons) if buttons else None
            
            # Редактируем сообщение
            try:
                await query.edit_message_text(text=scene_text, reply_markup=keyboard)
            except Exception as e:
                logger.error(f"Ошибка редактирования сообщения: {e}")
                await context.bot.send_message(
                    chat_id=query.from_user.id,
                    text=scene_text,
                    reply_markup=keyboard
                )
    else:
        # Обработка кастомных callback'ов
        await handle_custom_callback(query, context, callback_data)

async def handle_custom_callback(query, context, callback_data: str):
    """Обработка кастомных callback'ов"""
    user_id = query.from_user.id
    
    # Проверяем, может это команда из сценариев (my_qr -> /qr, schedule -> /schedule и т.д.)
    # Ищем сцену с trigger, который содержит callback_data
    matching_scene = None
    for scene_id, scene in SCENES.items():
        if scene.get('trigger'):
            command_name = scene['trigger'].lstrip('/')
            # Сравниваем: my_qr == qr, schedule == schedule и т.д.
            if callback_data == command_name or callback_data == f'my_{command_name}':
                matching_scene = scene
                break
    
    if matching_scene:
        # Нашли соответствующую сцену - вызываем её
        scene_text = matching_scene.get('text', f"📋 {matching_scene.get('name', 'Раздел')}")
        
        # Формируем клавиатуру для сцены
        buttons = []
        for button in matching_scene.get('buttons', []):
            if button.get('web_app'):
                buttons.append([InlineKeyboardButton(button['text'], web_app=WebAppInfo(url=button['web_app']))])
            elif button.get('callback_data'):
                buttons.append([InlineKeyboardButton(button['text'], callback_data=button['callback_data'])])
            elif button.get('url'):
                buttons.append([InlineKeyboardButton(button['text'], url=button['url'])])
        
        keyboard = InlineKeyboardMarkup(buttons) if buttons else None
        
        try:
            await query.edit_message_text(text=scene_text, reply_markup=keyboard)
        except Exception as e:
            logger.error(f"Ошибка редактирования: {e}")
            await context.bot.send_message(
                chat_id=query.from_user.id,
                text=scene_text,
                reply_markup=keyboard
            )
        return
    
    # Обработка меню и каталогов
    if callback_data == '/menu' or callback_data == '/catalog':
        menu_text = f"📋 Меню {BOT_NAME}\\n\\n"
        
        ${botSettings.category === 'ecommerce' && botSettings.id === 'restaurant_delivery' ? `
        menu_text += """🍕 ПИЦЦА:
• Маргарита - 890₽
• Пепперони - 1190₽
• Четыре сыра - 1290₽

🍝 ПАСТА:
• Карбонара - 790₽
• Болоньезе - 890₽

🥤 НАПИТКИ:
• Кола - 190₽
• Вода - 90₽

🛒 Для заказа напишите номер блюда"""
        ` : botSettings.category === 'ecommerce' && botSettings.id === 'electronics_store' ? `
        menu_text += """📱 СМАРТФОНЫ:
• iPhone 15 - 79990₽
• Samsung S24 - 69990₽

💻 НОУТБУКИ:
• MacBook Air - 129990₽
• Dell XPS - 89990₽

💬 Для консультации напишите модель"""
        ` : `
        menu_text += """📋 Основные разделы:
• Информация о компании
• Наши услуги  
• Контакты
• Часто задаваемые вопросы

💬 Напишите что вас интересует"""
        `}
        
        await query.edit_message_text(menu_text)
    
    ${botSettings.category === 'ecommerce' ? `
    elif callback_data == 'cart':
        cart_items = CartManager.get_cart(user_id) if 'CartManager' in globals() else []
        
        if not cart_items:
            cart_text = "🛒 Ваша корзина пуста\\n\\nВыберите товары из меню!"
        else:
            cart_text = "🛒 Ваша корзина:\\n\\n"
            total = 0
            for item in cart_items:
                item_total = item['price'] * item['quantity']
                cart_text += f"• {item['item_name']} x{item['quantity']} = {item_total}₽\\n"
                total += item_total
            cart_text += f"\\n💰 Итого: {total}₽\\n\\n💳 Готовы оформить заказ?"
        
        await query.edit_message_text(cart_text)
    ` : ''}
    
    elif callback_data == 'contacts':
        await query.edit_message_text(
            f"📞 Контакты {BOT_NAME}\\n\\n"
            f"📧 Email: info@company.ru\\n"
            f"📱 Телефон: +7 (999) 123-45-67\\n"
            f"🌐 Сайт: www.company.ru\\n"
            f"📍 Адрес: г. Москва, ул. Примерная, 1\\n\\n"
            f"🕒 Работаем: Пн-Пт 9:00-18:00"
        )
    
    elif callback_data == 'help':
        await query.edit_message_text(
            f"❓ Справка по боту {BOT_NAME}\\n\\n"
            f"Доступные команды:\\n"
            f"/start - Главное меню\\n"
            f"/help - Справка\\n\\n"
            f"🤖 Возможности:\\n"
            f"• {len(SCENES)} интерактивных сценариев\\n"
            f"• {'Аналитика включена' if ${botSettings.features.analytics ? 'True' : 'False'} else 'Базовая версия'}\\n"
            f"• {'Поддержка файлов' if ${botSettings.features.fileUpload ? 'True' : 'False'} else 'Только текст'}"
        )
    
    # Добавьте здесь обработку других команд
    else:
        await query.edit_message_text(f"ℹ️ Раздел '{callback_data}' в разработке\\n\\nИспользуйте /start для возврата в меню")

${hasPayments ? `
# ==================== ПЛАТЕЖИ ====================

async def handle_payment_request(query, context, payment_type: str):
    """Обработка запроса на оплату"""
    user_id = query.from_user.id
    
    ${botSettings.category === 'ecommerce' ? `
    # Для магазина - оплата корзины
    cart_total = CartManager.get_cart_total(user_id)
    if cart_total <= 0:
        await query.edit_message_text("🛒 Корзина пуста! Добавьте товары для оплаты.")
        return
    
    title = f"Заказ в {BOT_NAME}"
    description = "Оплата товаров из корзины"
    prices = [LabeledPrice("Товары", int(cart_total * 100))]  # в копейках
    ` : `
    # Базовая оплата
    title = f"Услуга в {BOT_NAME}"
    description = "Оплата услуги"
    prices = [LabeledPrice("Услуга", 100000)]  # 1000 рублей в копейках
    `}
    
    await context.bot.send_invoice(
        chat_id=user_id,
        title=title,
        description=description,
        payload=f"payment_{user_id}_{payment_type}",
        provider_token=PAYMENT_PROVIDER_TOKEN,
        currency=CURRENCY,
        prices=prices,
        start_parameter=f"payment_{payment_type}"
    )

async def precheckout_callback(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Предварительная проверка платежа"""
    query = update.pre_checkout_query
    await query.answer(ok=True)

async def successful_payment_callback(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Успешная оплата"""
    user_id = update.effective_user.id
    payment = update.message.successful_payment
    
    logger.info(f"💰 Успешная оплата: {payment.total_amount/100}₽ от пользователя {user_id}")
    
    ${botSettings.category === 'ecommerce' ? `
    # Очищаем корзину после оплаты
    CartManager.clear_cart(user_id)
    ` : ''}
    
    # Уведомление админа
    if ADMIN_CHAT_ID and NOTIFY_ORDERS:
        try:
            await context.bot.send_message(
                chat_id=ADMIN_CHAT_ID,
                text=f"💰 Новая оплата в боте {BOT_NAME}!\\n\\n"
                     f"💵 Сумма: {payment.total_amount/100}₽\\n"
                     f"👤 Пользователь: {user_id}\\n"
                     f"🆔 Payment ID: {payment.provider_payment_charge_id}"
            )
        except Exception as e:
            logger.error(f"Ошибка отправки уведомления о платеже: {e}")
    
    await update.message.reply_text(
        f"✅ Платеж успешно обработан!\\n\\n"
        f"💰 Оплачено: {payment.total_amount/100}₽\\n"
        f"🆔 ID транзакции: {payment.provider_payment_charge_id}\\n\\n"
        f"Спасибо за покупку! 🎉"
    )
` : ''}

# ==================== ОБРАБОТЧИКИ СООБЩЕНИЙ ====================

async def handle_message(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Обработчик текстовых сообщений"""
    user_id = update.effective_user.id
    message_text = update.message.text
    
    ${botSettings.database.users.saveMessages ? `
    # Сохраняем сообщение
    db.execute_query('''
        INSERT INTO messages (user_id, message_type, message_text, scene_id)
        VALUES (?, ?, ?, ?)
    ''', (user_id, 'text', message_text, 'text_message'))
    ` : ''}
    
    ${botSettings.features.analytics ? `
    AnalyticsManager.log_event("message_received", user_id, data={"message_length": len(message_text)})
    ` : ''}
    
    # Обработка кнопок клавиатуры
    ${
      botSettings.scenes && botSettings.scenes.length > 0
        ? botSettings.scenes
            .filter(scene => scene.trigger && scene.trigger.startsWith('/') && scene.trigger !== '/start')
            .map(scene => {
              const buttonText = scene.name || scene.trigger;
              const commandName = scene.trigger.slice(1);
              return `if message_text == "${buttonText}":
        await ${commandName}_command(update, context)
        return`;
            })
            .join('\n    ')
        : ''
    }
    
    # Обработка команд помощи
    if message_text.lower() in ['помощь', 'help', 'справка', '❓ помощь']:
        await help_command(update, context)
        return
    
    # Автоответ для неизвестных команд
    await update.message.reply_text(
        f"🤖 Спасибо за сообщение!\\n\\n"
        f"Используйте кнопки ниже или команду /start для главного меню.",
        reply_markup=context.user_data.get('reply_markup') if hasattr(context, 'user_data') else None
    )

${hasGeolocation ? `
async def handle_location(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Обработчик геолокации"""
    user_id = update.effective_user.id
    location = update.message.location
    
    # Сохраняем локацию пользователя
    UserManager.update_user_field(user_id, 'latitude', location.latitude)
    UserManager.update_user_field(user_id, 'longitude', location.longitude)
    
    await update.message.reply_text(
        f"📍 Местоположение получено!\\n\\n"
        f"🗺️ Координаты: {location.latitude:.6f}, {location.longitude:.6f}\\n"
        f"✅ Данные сохранены для доставки"
    )
` : ''}

# ==================== ОБРАБОТЧИК ОШИБОК ====================

async def error_handler(update: object, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Обработчик ошибок"""
    logger.error(f"💥 Ошибка: {context.error}")
    logger.error(f"📄 Update: {update}")
    
    # Уведомление админа об ошибке
    ${botSettings.integrations.notifications.onError ? `
    if ADMIN_CHAT_ID and NOTIFY_ERRORS:
        try:
            await context.bot.send_message(
                chat_id=ADMIN_CHAT_ID,
                text=f"🚨 Ошибка в боте {BOT_NAME}:\\n\\n"
                     f"❌ {str(context.error)[:500]}..."
            )
        except:
            pass
    ` : ''}

# ==================== ОСНОВНАЯ ФУНКЦИЯ ====================

def main() -> None:
    """Запуск бота"""
    logger.info(f"🚀 Запуск бота: {BOT_NAME}")
    logger.info(f"🤖 Username: @{BOT_USERNAME}")
    logger.info(f"📂 Категория: {CATEGORY}")
    logger.info(f"🎭 Сценариев: {len(SCENES)}")
    logger.info(f"⚙️ Функции:")
    ${hasWebApp ? `logger.info("  📱 WebApp: включен")` : ''}
    ${hasPayments ? `logger.info("  💳 Платежи: включены")` : ''}
    ${hasGeolocation ? `logger.info("  📍 Геолокация: включена")` : ''}
    ${botSettings.features.analytics ? `logger.info("  📊 Аналитика: включена")` : `logger.info("  📊 Аналитика: отключена")`}
    
    # Создание приложения
    application = Application.builder().token(BOT_TOKEN).build()
    
    # Установка команд в меню бота (как в BotFather)
    async def post_init(app):
        """Установка команд в меню после инициализации"""
        commands = [
            BotCommand("start", "🏠 Главное меню"),
            BotCommand("help", "❓ Помощь"),
${botSettings.adminUsers && botSettings.adminUsers.length > 0 ? `            BotCommand("admin", "🔧 Админ-панель"),` : ''}
${botSettings.features.analytics ? `            BotCommand("stats", "📊 Статистика"),` : ''}
${
  botSettings.scenes && botSettings.scenes.length > 0
    ? botSettings.scenes
        .filter(scene => scene.trigger && scene.trigger.startsWith('/') && scene.trigger !== '/start')
        .map(scene => {
          const commandName = scene.trigger.slice(1);
          const commandDesc = scene.name || commandName;
          // Ограничиваем длину описания до 60 символов (лимит Telegram)
          const desc = commandDesc.length > 56 ? commandDesc.substring(0, 56) + '...' : commandDesc;
          return `            BotCommand("${commandName}", "${desc}"),`;
        })
        .join('\n')
    : ''
}
        ]
        await app.bot.set_my_commands(commands)
        logger.info(f"✅ Установлено {len(commands)} команд в меню бота")
    
    application.post_init = post_init

    # Регистрация обработчиков команд
    application.add_handler(CommandHandler("start", start))
    application.add_handler(CommandHandler("help", help_command))
    application.add_handler(CommandHandler("admin", admin_command))  # Админ-панель
    ${botSettings.features.analytics ? `application.add_handler(CommandHandler("stats", stats_command))` : ''}
${
      // Регистрируем все команды из сцен
      botSettings.scenes && botSettings.scenes.length > 0
        ? botSettings.scenes
            .filter(scene => scene.trigger && scene.trigger.startsWith('/') && scene.trigger !== '/start')
            .map(scene => {
              const commandName = scene.trigger.slice(1);
              return `    application.add_handler(CommandHandler("${commandName}", ${commandName}_command))`;
            })
            .join('\n')
        : ''
    }

    # Регистрация обработчиков callback'ов
    application.add_handler(CallbackQueryHandler(button_callback))

    ${hasPayments ? `
    # Регистрация обработчиков платежей
    application.add_handler(PreCheckoutQueryHandler(precheckout_callback))
    application.add_handler(MessageHandler(filters.SUCCESSFUL_PAYMENT, successful_payment_callback))
    ` : ''}

    ${hasGeolocation ? `
    # Обработчик геолокации
    application.add_handler(MessageHandler(filters.LOCATION, handle_location))
    ` : ''}

    # Обработчик текстовых сообщений
    application.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, handle_message))
    
    ${hasWebApp ? `
    # Обработчик данных от WebApp
    async def handle_webapp_data(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
        """Обработка данных отправленных из WebApp через tg.sendData()"""
        user = update.effective_user
        web_app_data = update.message.web_app_data.data
        
        try:
            data = json.loads(web_app_data)
            action = data.get('action')
            
            logger.info(f"📱 WebApp data от {user.first_name}: {action}")
            
            if action == 'register_activity':
                # Регистрация на активность
                activity_id = data.get('activityId')
                activity_name = data.get('activityName')
                
                # Сохраняем в БД
                db.execute_query('''
                    INSERT INTO webapp_data (user_id, action, data)
                    VALUES (?, ?, ?)
                ''', (user.id, 'register_activity', web_app_data))
                
                await update.message.reply_text(
                    f"✅ Отлично, {user.first_name}!\\n\\n"
                    f"Вы зарегистрированы на активность:\\n"
                    f"🎯 <b>{activity_name}</b>\\n\\n"
                    f"Мы отправим вам напоминание перед началом!",
                    parse_mode='HTML'
                )
                
                ${botSettings.features.analytics ? `
                AnalyticsManager.log_event("activity_registration", user.id, activity_id, {"activity_name": activity_name})
                ` : ''}
                
            elif action == 'start_survey':
                # Начало опроса
                survey_id = data.get('surveyId')
                survey_title = data.get('surveyTitle')
                
                # Сохраняем в БД
                db.execute_query('''
                    INSERT INTO webapp_data (user_id, action, data)
                    VALUES (?, ?, ?)
                ''', (user.id, 'start_survey', web_app_data))
                
                await update.message.reply_text(
                    f"📊 Начинаем опрос: <b>{survey_title}</b>\\n\\n"
                    f"Пожалуйста, ответьте на следующие вопросы:",
                    parse_mode='HTML'
                )
                
                ${botSettings.features.analytics ? `
                AnalyticsManager.log_event("survey_started", user.id, survey_id, {"survey_title": survey_title})
                ` : ''}
                
            elif action == 'purchase':
                # Покупка товара
                cart = data.get('cart', [])
                total = sum(item.get('price', 0) * item.get('quantity', 1) for item in cart)
                
                await update.message.reply_text(
                    f"🛒 <b>Ваш заказ:</b>\\n\\n" + 
                    "\\n".join([f"• {item['name']} x{item.get('quantity', 1)} = {item['price'] * item.get('quantity', 1)}₽" for item in cart]) +
                    f"\\n\\n💰 <b>Итого: {total}₽</b>\\n\\n" +
                    f"Для оплаты используйте команду /pay",
                    parse_mode='HTML'
                )
                
                ${botSettings.features.analytics ? `
                AnalyticsManager.log_event("cart_checkout", user.id, "checkout", {"total": total, "items_count": len(cart)})
                ` : ''}
            
            else:
                logger.warning(f"⚠️ Неизвестное действие от WebApp: {action}")
                
        except json.JSONDecodeError:
            logger.error(f"❌ Ошибка парсинга WebApp data: {web_app_data}")
        except Exception as e:
            logger.error(f"❌ Ошибка обработки WebApp data: {e}")
    
    application.add_handler(MessageHandler(filters.StatusUpdate.WEB_APP_DATA, handle_webapp_data))
    ` : ''}

    # Обработчик ошибок
    application.add_error_handler(error_handler)

    # Запуск бота
    logger.info("✅ Бот запущен и готов к работе!")
    logger.info("📱 Протестируйте в Telegram: /start")
    logger.info("🛑 Для остановки: Ctrl+C")
    
    # Запуск polling
    application.run_polling(allowed_updates=Update.ALL_TYPES)

if __name__ == '__main__':
    main()
`;
}

module.exports = { generateAdvancedPythonBot };
