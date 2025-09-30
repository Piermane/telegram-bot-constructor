-- TelegramBot Constructor - Database Initialization
-- This script initializes the database schema for the DEV environment

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create custom types
CREATE TYPE user_role AS ENUM ('admin', 'user');
CREATE TYPE subscription_plan AS ENUM ('free', 'starter', 'business', 'enterprise');
CREATE TYPE bot_status AS ENUM ('draft', 'active', 'inactive', 'error', 'deploying');

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    avatar_url VARCHAR(500),
    role user_role NOT NULL DEFAULT 'user',
    subscription_plan subscription_plan NOT NULL DEFAULT 'free',
    subscription_expires_at TIMESTAMP,
    email_verified BOOLEAN DEFAULT FALSE,
    email_verification_token VARCHAR(255),
    password_reset_token VARCHAR(255),
    password_reset_expires TIMESTAMP,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Bots table
CREATE TABLE bots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    telegram_token VARCHAR(500),
    telegram_username VARCHAR(100),
    telegram_webhook_url VARCHAR(500),
    status bot_status NOT NULL DEFAULT 'draft',
    flow_config JSONB NOT NULL DEFAULT '{"nodes": [], "edges": []}',
    settings JSONB DEFAULT '{}',
    analytics_enabled BOOLEAN DEFAULT TRUE,
    deployed_at TIMESTAMP,
    last_activity TIMESTAMP,
    total_users INTEGER DEFAULT 0,
    total_messages INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Bot sessions для отслеживания состояния пользователей в ботах
CREATE TABLE bot_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bot_id UUID REFERENCES bots(id) ON DELETE CASCADE,
    telegram_user_id BIGINT NOT NULL,
    telegram_username VARCHAR(100),
    telegram_first_name VARCHAR(100),
    telegram_last_name VARCHAR(100),
    current_state VARCHAR(255),
    session_data JSONB DEFAULT '{}',
    variables JSONB DEFAULT '{}',
    last_interaction TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(bot_id, telegram_user_id)
);

-- Analytics events
CREATE TABLE analytics_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bot_id UUID REFERENCES bots(id) ON DELETE CASCADE,
    session_id UUID REFERENCES bot_sessions(id) ON DELETE SET NULL,
    telegram_user_id BIGINT,
    event_type VARCHAR(100) NOT NULL,
    event_data JSONB DEFAULT '{}',
    node_id VARCHAR(255),
    flow_step VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Bot templates (предустановленные шаблоны)
CREATE TABLE bot_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    thumbnail_url VARCHAR(500),
    flow_config JSONB NOT NULL,
    settings JSONB DEFAULT '{}',
    tags TEXT[],
    is_featured BOOLEAN DEFAULT FALSE,
    usage_count INTEGER DEFAULT 0,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- API keys для интеграций
CREATE TABLE api_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    key_hash VARCHAR(255) NOT NULL,
    permissions JSONB DEFAULT '{}',
    last_used TIMESTAMP,
    expires_at TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Webhooks
CREATE TABLE webhooks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bot_id UUID REFERENCES bots(id) ON DELETE CASCADE,
    url VARCHAR(500) NOT NULL,
    secret VARCHAR(255),
    events TEXT[],
    is_active BOOLEAN DEFAULT TRUE,
    last_triggered TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Создаем индексы для производительности
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_bots_user_id ON bots(user_id);
CREATE INDEX idx_bots_status ON bots(status);
CREATE INDEX idx_bots_created_at ON bots(created_at DESC);
CREATE INDEX idx_bot_sessions_bot_id ON bot_sessions(bot_id);
CREATE INDEX idx_bot_sessions_telegram_user_id ON bot_sessions(telegram_user_id);
CREATE INDEX idx_bot_sessions_last_interaction ON bot_sessions(last_interaction DESC);
CREATE INDEX idx_analytics_events_bot_id ON analytics_events(bot_id);
CREATE INDEX idx_analytics_events_created_at ON analytics_events(created_at DESC);
CREATE INDEX idx_analytics_events_event_type ON analytics_events(event_type);
CREATE INDEX idx_bot_templates_category ON bot_templates(category);
CREATE INDEX idx_bot_templates_is_featured ON bot_templates(is_featured);

-- Создаем функцию для обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Создаем триггеры для автоматического обновления updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bots_updated_at BEFORE UPDATE ON bots
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bot_templates_updated_at BEFORE UPDATE ON bot_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Функция для получения статистики бота
CREATE OR REPLACE FUNCTION get_bot_stats(bot_uuid UUID)
RETURNS TABLE(
    total_users BIGINT,
    total_messages BIGINT,
    active_sessions BIGINT,
    messages_today BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        (SELECT COUNT(DISTINCT telegram_user_id) FROM bot_sessions WHERE bot_id = bot_uuid),
        (SELECT COUNT(*) FROM analytics_events WHERE bot_id = bot_uuid AND event_type = 'message_received'),
        (SELECT COUNT(*) FROM bot_sessions WHERE bot_id = bot_uuid AND last_interaction > NOW() - INTERVAL '24 hours'),
        (SELECT COUNT(*) FROM analytics_events WHERE bot_id = bot_uuid AND event_type = 'message_received' AND created_at > CURRENT_DATE);
END;
$$ LANGUAGE plpgsql;

-- Создаем пользователя для разработки
INSERT INTO users (email, password_hash, first_name, last_name, role) VALUES 
('dev@example.com', crypt('password123', gen_salt('bf')), 'Dev', 'User', 'admin');

-- Создаем несколько тестовых шаблонов
INSERT INTO bot_templates (name, description, category, flow_config, tags, is_featured) VALUES 
(
    'Простой приветственный бот',
    'Базовый бот для приветствия новых пользователей',
    'welcome',
    '{
        "nodes": [
            {
                "id": "start",
                "type": "start",
                "position": {"x": 100, "y": 100},
                "data": {"label": "Начало"}
            },
            {
                "id": "welcome",
                "type": "message",
                "position": {"x": 300, "y": 100},
                "data": {
                    "message": "Привет! 👋 Добро пожаловать!",
                    "parseMode": "Markdown"
                }
            },
            {
                "id": "menu",
                "type": "keyboard",
                "position": {"x": 500, "y": 100},
                "data": {
                    "buttons": [
                        [{"text": "ℹ️ Информация", "action": "info"}],
                        [{"text": "📞 Контакты", "action": "contacts"}]
                    ]
                }
            }
        ],
        "edges": [
            {"id": "start-welcome", "source": "start", "target": "welcome"},
            {"id": "welcome-menu", "source": "welcome", "target": "menu"}
        ]
    }',
    ARRAY['welcome', 'basic', 'template'],
    true
),
(
    'Бот поддержки клиентов',
    'Шаблон для службы поддержки с FAQ и тикетами',
    'support',
    '{
        "nodes": [
            {
                "id": "start",
                "type": "start",
                "position": {"x": 100, "y": 100},
                "data": {"label": "Начало"}
            },
            {
                "id": "greeting",
                "type": "message",
                "position": {"x": 300, "y": 100},
                "data": {
                    "message": "Здравствуйте! Я бот службы поддержки. Как могу помочь?",
                    "parseMode": "Markdown"
                }
            },
            {
                "id": "support_menu",
                "type": "keyboard",
                "position": {"x": 500, "y": 100},
                "data": {
                    "buttons": [
                        [{"text": "❓ Часто задаваемые вопросы", "action": "faq"}],
                        [{"text": "📝 Создать заявку", "action": "ticket"}],
                        [{"text": "👤 Связаться с оператором", "action": "operator"}]
                    ]
                }
            }
        ],
        "edges": [
            {"id": "start-greeting", "source": "start", "target": "greeting"},
            {"id": "greeting-menu", "source": "greeting", "target": "support_menu"}
        ]
    }',
    ARRAY['support', 'customer-service', 'business'],
    true
),
(
    'Квизз бот',
    'Интерактивный бот для проведения опросов и викторин',
    'quiz',
    '{
        "nodes": [
            {
                "id": "start",
                "type": "start",
                "position": {"x": 100, "y": 100},
                "data": {"label": "Начало"}
            },
            {
                "id": "quiz_intro",
                "type": "message",
                "position": {"x": 300, "y": 100},
                "data": {
                    "message": "🧠 Добро пожаловать в квиз! Готовы проверить свои знания?",
                    "parseMode": "Markdown"
                }
            },
            {
                "id": "start_quiz",
                "type": "keyboard",
                "position": {"x": 500, "y": 100},
                "data": {
                    "buttons": [
                        [{"text": "🚀 Начать квиз", "action": "start_quiz"}],
                        [{"text": "📊 Посмотреть результаты", "action": "results"}]
                    ]
                }
            }
        ],
        "edges": [
            {"id": "start-intro", "source": "start", "target": "quiz_intro"},
            {"id": "intro-start", "source": "quiz_intro", "target": "start_quiz"}
        ]
    }',
    ARRAY['quiz', 'education', 'interactive'],
    false
);

-- Создаем представление для аналитики
CREATE VIEW bot_analytics_summary AS
SELECT 
    b.id,
    b.name,
    b.status,
    b.created_at,
    COUNT(DISTINCT bs.telegram_user_id) as unique_users,
    COUNT(ae.id) as total_events,
    COUNT(CASE WHEN ae.event_type = 'message_received' THEN 1 END) as messages_received,
    COUNT(CASE WHEN ae.event_type = 'message_sent' THEN 1 END) as messages_sent,
    MAX(ae.created_at) as last_activity
FROM bots b
LEFT JOIN bot_sessions bs ON b.id = bs.bot_id
LEFT JOIN analytics_events ae ON b.id = ae.bot_id
GROUP BY b.id, b.name, b.status, b.created_at;

-- Функция для очистки старых сессий
CREATE OR REPLACE FUNCTION cleanup_old_sessions()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM bot_sessions 
    WHERE last_interaction < NOW() - INTERVAL '30 days';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;
