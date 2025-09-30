const { generateAdvancedPythonBot } = require('./backend/src/utils/advanced-bot-generator');

const testSettings = {
  name: "Test Bot",
  token: "test_token",
  features: {
    polls: true,
    qrCodes: true,
    webApp: true,
    multiLanguage: false,
    analytics: false,
    scheduling: false,
    fileUpload: false,
    voiceMessages: false,
    payments: false,
    geolocation: false,
    notifications: false,
    broadcasts: false
  },
  scenes: [],
  database: {
    users: {
      saveContacts: true,
      saveMessages: false
    }
  },
  integrations: {
    notifications: {
      adminChat: "",
      onNewUser: false,
      onOrder: false,
      onError: false
    }
  }
};

const testBotInfo = {
  username: "test_bot"
};

console.log("🧪 Тестируем генератор...");
try {
  const code = generateAdvancedPythonBot(testSettings, testBotInfo);
  console.log("✅ Код успешно сгенерирован!");
  
  // Проверяем проблемные строки
  const lines = code.split('\n');
  const problemLines = lines.filter((line, index) => 
    line.includes('\\n') && !line.includes('\\\\n')
  );
  
  if (problemLines.length > 0) {
    console.log("❌ Найдены проблемные строки:");
    problemLines.forEach(line => console.log("  ", line));
  } else {
    console.log("✅ Нет проблемных строк с \\n");
  }
  
} catch (error) {
  console.log("❌ Ошибка:", error.message);
}
