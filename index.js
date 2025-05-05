const express = require('express');
const path = require('path');
require('dotenv').config();

const telegramBot = require('./services/telegramBot');
const apiRoutes = require('./routes/api');
const adminRoutes = require('./routes/admin');

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.redirect("/index.html");
});

app.use('/api', apiRoutes);
app.use('/admin', adminRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
  console.log(
    `Откройте http://localhost:${PORT} в браузере для просмотра сайта`
  );
});

telegramBot
  .initBot()
  .then(() => console.log('Бот успешно инициализирован'))
  .catch((err) => console.error('Ошибка при инициализации бота:', err));
