const express = require('express');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

const ngrok = require("ngrok");
const telegramBot = require("./services/telegram/bot"); // Используем новую модульную структуру
const apiRoutes = require("./routes/api");
const adminRoutes = require("./routes/admin");

// Функция инициализации базы данных
async function initializeDatabase() {
  console.log('🔄 Инициализация базы данных...');
  
  const maxRetries = 60;
  let retries = 0;
  
  while (retries < maxRetries) {
    try {
      console.log(`⏳ Попытка подключения к БД (${retries + 1}/${maxRetries})...`);
      await execAsync('npx prisma db push --accept-data-loss --skip-generate');
      console.log('✅ База данных готова, схема синхронизирована');
      return;
    } catch (error) {
      retries++;
      if (retries >= maxRetries) {
        console.error('❌ Не удалось подключиться к базе данных:', error.message);
        process.exit(1);
      }
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
}

const PORT = process.env.PORT || 3001;
const WEBAPP_DEV_URL = process.env.WEBAPP_DEV_URL;
const WEBAPP_URL = process.env.WEBAPP_URL;
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.redirect("/index.html");
});

// Health check endpoint для Docker
app.get("/api/health", (req, res) => {
  res.status(200).json({ 
    status: "healthy", 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

app.use("/api", apiRoutes);
app.use("/admin", adminRoutes);

// Запуск сервера и настройка ngrok
const startServer = async () => {
  try {
    // Инициализация базы данных
    await initializeDatabase();
    
    await new Promise((resolve, reject) => {
      const server = app.listen(PORT, () => {
        console.log(`Сервер запущен на порту ${PORT}`);
        console.log(
          `Откройте http://localhost:${PORT} в браузере для просмотра сайта`
        );
        resolve();
      });
      server.on("error", reject);
    });

    if (process.env.NGROK_TOKEN && process.env.NODE_ENV !== "production") {
      await ngrok.authtoken(process.env.NGROK_TOKEN);
      const webAppUrl = await ngrok.connect(WEBAPP_DEV_URL);
      console.log("ngrok URL:", webAppUrl);

      await telegramBot.initBot(webAppUrl);
      console.log("Бот успешно инициализирован с веб-приложением:", webAppUrl);
    } else {
      await telegramBot.initBot(WEBAPP_URL);
      console.log("Бот инициализирован с локальным URL (без ngrok)");
    }
  } catch (error) {
    console.error("Ошибка при запуске сервера или ngrok:", error);
  }
};

// Запуск сервера и бота
startServer();
