const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Загрузка переменных окружения
require('dotenv').config();

// Параметры подключения к AmoCRM
const {
  AMO_DOMAIN,
  AMO_CLIENT_ID,
  AMO_CLIENT_SECRET,
  AMO_REDIRECT_URI,
  AMO_ACCESS_TOKEN,
  AMO_REFRESH_TOKEN,
  AMO_PHONE_FIELD_ID,
  AMO_EMAIL_FIELD_ID,
  AMO_PIPELINE_ID,
  AMO_NEW_STATUS_ID,
} = process.env;

// Пути к файлам для хранения токенов
const tokenPath = path.join(__dirname, '..', 'data', 'amo_token.json');

// Проверка наличия директории для данных
const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Проверка токена
async function checkAndRefreshToken() {
  try {
    let tokenData = {};

    // Если файла с токеном нет и есть переменные окружения - используем их
    if (!fs.existsSync(tokenPath) && AMO_ACCESS_TOKEN && AMO_REFRESH_TOKEN) {
      tokenData = {
        access_token: AMO_ACCESS_TOKEN,
        refresh_token: AMO_REFRESH_TOKEN,
        expires_at: Date.now() + 86400000, // +24 часа для первого запуска
      };
      fs.writeFileSync(tokenPath, JSON.stringify(tokenData));
    } else if (fs.existsSync(tokenPath)) {
      tokenData = JSON.parse(fs.readFileSync(tokenPath));
    } else {
      throw new Error('Отсутствуют токены AmoCRM');
    }

    // Проверка на истечение срока действия токена
    if (Date.now() >= tokenData.expires_at) {
      const response = await axios.post(
        `https://${AMO_DOMAIN}/oauth2/access_token`,
        {
          client_id: AMO_CLIENT_ID,
          client_secret: AMO_CLIENT_SECRET,
          grant_type: 'refresh_token',
          refresh_token: tokenData.refresh_token,
          redirect_uri: AMO_REDIRECT_URI,
        }
      );

      tokenData = {
        access_token: response.data.access_token,
        refresh_token: response.data.refresh_token,
        expires_at: Date.now() + response.data.expires_in * 1000,
      };

      fs.writeFileSync(tokenPath, JSON.stringify(tokenData));
    }

    return tokenData.access_token;
  } catch (error) {
    console.error('Ошибка при обновлении токена:', error.message);
    throw error;
  }
}

// Создание сделки в AmoCRM
async function createDeal(userData, cartItems, totalPrice) {
  try {
    const accessToken = await checkAndRefreshToken();

    // Формируем имя контакта
    const contactName =
      userData.first_name +
      (userData.last_name ? ` ${userData.last_name}` : '');

    // Формируем имя сделки
    const dealName = `Заказ из Telegram (${contactName})`;

    // Формируем описание товаров
    const productDescription = cartItems
      .map(
        (item) => `${item.name} - ${item.quantity} шт. по ${item.price} руб.`
      )
      .join('\n');

    // 1. Создаем контакт
    const contactResponse = await axios.post(
      `https://${AMO_DOMAIN}/api/v4/contacts`,
      [
        {
          name: contactName,
          custom_fields_values: [],
        },
      ],
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const contactId = contactResponse.data._embedded.contacts[0].id;

    // 2. Создаем сделку
    const dealResponse = await axios.post(
      `https://${AMO_DOMAIN}/api/v4/leads`,
      [
        {
          name: dealName,
          price: totalPrice,
          pipeline_id: parseInt(AMO_PIPELINE_ID),
          status_id: parseInt(AMO_NEW_STATUS_ID),
          _embedded: {
            contacts: [
              {
                id: contactId,
              },
            ],
          },
        },
      ],
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const dealId = dealResponse.data._embedded.leads[0].id;

    // 3. Добавляем примечание с информацией о заказе
    await axios.post(
      `https://${AMO_DOMAIN}/api/v4/leads/${dealId}/notes`,
      [
        {
          note_type: 'common',
          params: {
            text: `Заказ из Telegram бота\n\nКлиент: ${contactName}\nTelegram ID: ${userData.id}\n\nТовары:\n${productDescription}\n\nИтого: ${totalPrice} руб.`,
          },
        },
      ],
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    return {
      dealId,
      contactId,
    };
  } catch (error) {
    console.error('Ошибка при создании сделки в AmoCRM:', error.message);
    throw error;
  }
}

module.exports = {
  createDeal,
};
