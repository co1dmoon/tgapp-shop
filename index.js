const express = require('express');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

const ngrok = require("ngrok");
const telegramBot = require("./services/telegram/bot"); // Используем новую модульную структуру
const apiRoutes = require("./routes/api");
const adminRoutes = require("./routes/admin");

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

app.use("/api", apiRoutes);
app.use("/admin", adminRoutes);

// Запуск сервера и настройка ngrok
const startServer = async () => {
  try {
    // Запуск Express сервера
    app.listen(PORT, () => {
      console.log(`Сервер запущен на порту ${PORT}`);
      console.log(
        `Откройте http://localhost:${PORT} в браузере для просмотра сайта`
      );
    });

    // Проверяем нужно ли использовать ngrok (только для локальной разработки)
    const useNgrok = process.env.USE_NGROK !== "false" && 
                     process.env.NGROK_TOKEN && 
                     process.env.NODE_ENV !== "production";
    
    if (useNgrok) {
      console.log("🔗 Запуск ngrok для локальной разработки...");
      await ngrok.authtoken(process.env.NGROK_TOKEN);
      const webAppUrl = await ngrok.connect(WEBAPP_DEV_URL);
      console.log("ngrok URL:", webAppUrl);

      await telegramBot.initBot(webAppUrl);
      console.log("Бот успешно инициализирован с веб-приложением:", webAppUrl);
    } else {
      console.log("🐳 Запуск в Docker окружении или без ngrok...");
      const webAppUrl = WEBAPP_URL || `http://localhost:${PORT}`;
      console.log("WebApp URL:", webAppUrl);
      
      await telegramBot.initBot(webAppUrl);
      console.log("Бот инициализирован с URL:", webAppUrl);
    }
  } catch (error) {
    console.error("Ошибка при запуске сервера или ngrok:", error);
  }
};

// Запуск сервера и бота
startServer();
