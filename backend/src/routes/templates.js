const express = require('express');
const router = express.Router();
const { BOT_TEMPLATES } = require('../data/templates');

/**
 * Получение списка шаблонов ботов
 */
router.get('/', async (req, res, next) => {
  try {
    const templates = Object.values(BOT_TEMPLATES).map(template => ({
      id: template.id,
      name: template.name,
      description: template.description,
      category: template.category,
      tags: template.tags,
      preview: template.preview,
      features: Object.keys(template.features).filter(key => template.features[key]),
      scenesCount: template.scenes.length,
      hasWebApp: template.features.webApp,
      hasPayment: template.integrations.payment.enabled
    }));

    res.json({
      success: true,
      templates,
      total: templates.length,
      categories: ['events', 'ecommerce', 'support', 'education', 'business', 'other']
    });

  } catch (error) {
    next(error);
  }
});

/**
 * Получение конкретного шаблона
 */
router.get('/:templateId', async (req, res, next) => {
  try {
    const { templateId } = req.params;
    
    const template = BOT_TEMPLATES[templateId];
    
    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Шаблон не найден'
      });
    }

    res.json({
      success: true,
      template: {
        ...template,
        // Добавляем дополнительную информацию
        estimated_setup_time: getEstimatedSetupTime(template),
        complexity: getComplexity(template),
        required_integrations: getRequiredIntegrations(template)
      }
    });

  } catch (error) {
    next(error);
  }
});

/**
 * Получение шаблонов по категории
 */
router.get('/category/:category', async (req, res, next) => {
  try {
    const { category } = req.params;
    
    const templates = Object.values(BOT_TEMPLATES)
      .filter(template => template.category === category)
      .map(template => ({
        id: template.id,
        name: template.name,
        description: template.description,
        preview: template.preview,
        features: Object.keys(template.features).filter(key => template.features[key]),
        scenesCount: template.scenes.length
      }));

    res.json({
      success: true,
      templates,
      category,
      total: templates.length
    });

  } catch (error) {
    next(error);
  }
});

// Вспомогательные функции
function getEstimatedSetupTime(template) {
  const baseTime = 5; // минут
  const scenesTime = template.scenes.length * 2;
  const featuresTime = Object.values(template.features).filter(Boolean).length * 3;
  return baseTime + scenesTime + featuresTime;
}

function getComplexity(template) {
  const score = template.scenes.length + 
                Object.values(template.features).filter(Boolean).length +
                Object.values(template.integrations).filter(i => i.enabled).length;
  
  if (score <= 3) return 'Простой';
  if (score <= 7) return 'Средний';
  return 'Сложный';
}

function getRequiredIntegrations(template) {
  return Object.keys(template.integrations)
    .filter(key => template.integrations[key].enabled)
    .map(key => {
      switch(key) {
        case 'webhook': return 'Внешние уведомления';
        case 'googleSheets': return 'Google Таблицы';
        case 'payment': return 'Платежная система';
        case 'notifications': return 'Уведомления админа';
        default: return key;
      }
    });
}

module.exports = router;