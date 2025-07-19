const express = require('express');
const router = express.Router();
const { bot } = require('../telegramBot');

// Обработка создания заказа
router.post('/createOrder', async (req, res) => {
  try {
    console.log('Получен запрос на создание заказа:', req.body);
    const { userData, cartItems, totalPrice } = req.body;

    if (!userData || !cartItems || cartItems.length === 0) {
      return res.status(400).json({ error: 'Неверные данные заказа' });
    }

    // Генерируем номер заказа
    const orderId = `TG${Date.now().toString().slice(-8)}`;

    // Отправляем сообщение пользователю в Telegram
    try {
      if (userData.id && userData.id !== 'unknown_user') {
        const userId = userData.id;
        const productsList = cartItems
          .map(
            (item) =>
              `• ${item.name} - ${item.quantity} шт. × ${item.price} руб.`
          )
          .join('\n');

        const message =
          `🎉 <b>Ваш заказ №${orderId} успешно оформлен!</b>\n\n` +
          `<b>Товары:</b>\n${productsList}\n\n` +
          `<b>Итого:</b> ${totalPrice} руб.\n\n` +
          `Наш менеджер свяжется с вами в ближайшее время для подтверждения заказа.`;

        await bot.telegram.sendMessage(userId, message, { parse_mode: 'HTML' });
        console.log(`Сообщение о заказе отправлено пользователю ${userId}`);
      }
    } catch (error) {
      console.error('Ошибка при отправке сообщения в Telegram:', error.message);
      // Продолжаем выполнение, даже если отправка сообщения не удалась
    }

    // Возвращаем успешный ответ
    res.status(200).json({
      success: true,
      id: orderId,
      message: 'Заказ успешно создан',
    });
  } catch (error) {
    console.error('Ошибка при создании заказа:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

module.exports = router;
