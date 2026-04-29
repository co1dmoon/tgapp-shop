const { Markup } = require('telegraf');
const { setState, clearState, getState } = require('../../core/middlewares');
const botUserController = require('../../../../controllers/botUserController');
const { unsubscribeKeyboard } = require('./mailingHandlers');
const { delay } = require('../../core/utils');

// Хранилище подготовленного текста перед отправкой. Простая in-memory мапа
// admin telegramId → текст. На рестарте теряется — это ок, рассылка должна
// собираться и подтверждаться в одной сессии.
const PENDING = new Map();

const handleMailingFSM = async (ctx, userId, state, text) => {
  if (state === 'mailing_compose') {
    if (!text || text.trim().length < 2) {
      return ctx.reply('Слишком короткое сообщение. Попробуй ещё раз или /cancel.');
    }
    PENDING.set(String(userId), text);
    const mailable = await botUserController.countMailable();
    setState(userId, 'mailing_pending');
    // Превью + кнопки подтверждения. Превью отправляем как тестовое сообщение
    // самому админу, чтобы он увидел как оно будет выглядеть.
    try {
      await ctx.reply('📋 <b>Превью сообщения:</b>', { parse_mode: 'HTML' });
      await ctx.reply(text, { parse_mode: 'HTML', ...unsubscribeKeyboard() });
    } catch (e) {
      // Если HTML невалидный — Telegram кинет 400.
      clearState(userId);
      PENDING.delete(String(userId));
      return ctx.reply(
        `❌ Telegram отклонил твой текст: ${e?.description || e?.message || e}\n\n` +
        'Похоже, поломан HTML-тег. Запусти заново через админку.'
      );
    }
    await ctx.reply(
      `Подтверди: отправить это сообщение <b>${mailable}</b> подписчикам?`,
      {
        parse_mode: 'HTML',
        ...Markup.inlineKeyboard([
          [Markup.button.callback('🚀 Отправить', 'mailing_confirm_send')],
          [Markup.button.callback('❌ Отмена', 'mailing_cancel')],
        ]),
      }
    );
    return;
  }
  // mailing_pending — ждём callback на кнопках, текст игнорируем.
  if (state === 'mailing_pending') {
    return ctx.reply('Используй кнопки «🚀 Отправить» / «❌ Отмена» под превью.');
  }
};

// Запуск самой отправки. Вызывается из mailingHandlers по callback.
const runMailing = async (ctx) => {
  const adminId = String(ctx.from.id);
  const text = PENDING.get(adminId);
  if (!text) {
    return ctx.reply('❌ Текст не найден (видимо, бот рестартнулся). Начни рассылку заново.');
  }
  PENDING.delete(adminId);
  clearState(ctx.from.id);

  const ids = await botUserController.getMailableIds();
  if (ids.length === 0) {
    return ctx.reply('Некому отправлять — нет подписанных пользователей.');
  }

  // Отдельное «статус»-сообщение, которое будем редактировать по ходу.
  const statusMsg = await ctx.reply(`🚀 Запускаю рассылку для ${ids.length} получателей...`);
  const statusChatId = statusMsg.chat.id;
  const statusMessageId = statusMsg.message_id;

  let sent = 0;
  let blocked = 0;
  let failed = 0;
  const startedAt = Date.now();
  const PROGRESS_EVERY = 25; // редактируем статус каждые N отправок

  for (let i = 0; i < ids.length; i++) {
    const recipient = ids[i];
    try {
      await ctx.telegram.sendMessage(recipient, text, {
        parse_mode: 'HTML',
        disable_web_page_preview: false,
        ...unsubscribeKeyboard(),
      });
      sent++;
    } catch (e) {
      const code = e?.response?.error_code || e?.code;
      const desc = e?.response?.description || e?.description || e?.message;
      // 403 = бот заблокирован, 400 chat not found = удалил аккаунт
      const isPermanent =
        code === 403 ||
        (typeof desc === 'string' &&
          (desc.includes('blocked') ||
           desc.includes('chat not found') ||
           desc.includes('user is deactivated')));
      if (isPermanent) {
        blocked++;
        await botUserController.markBlocked(recipient, true);
      } else {
        failed++;
        console.error(`[MAILING] ${recipient} → ${desc}`);
      }
    }

    // Прогресс-апдейт.
    if ((i + 1) % PROGRESS_EVERY === 0 || i === ids.length - 1) {
      try {
        await ctx.telegram.editMessageText(
          statusChatId,
          statusMessageId,
          undefined,
          `🚀 Рассылка...\n` +
          `Отправлено: <b>${sent}</b> / ${ids.length}\n` +
          `Заблокировали бота: <b>${blocked}</b>\n` +
          `Ошибок: <b>${failed}</b>`,
          { parse_mode: 'HTML' }
        );
      } catch {/* ничего, просто следующая итерация */}
    }

    // Throttle: ~30 msg/sec по Telegram limit. Берём с запасом — 50ms.
    await delay(50);
  }

  const elapsed = Math.round((Date.now() - startedAt) / 1000);
  await ctx.telegram.editMessageText(
    statusChatId,
    statusMessageId,
    undefined,
    `✅ <b>Рассылка завершена</b>\n\n` +
    `Отправлено: <b>${sent}</b>\n` +
    `Заблокировали бота: <b>${blocked}</b>\n` +
    `Других ошибок: <b>${failed}</b>\n` +
    `Время: ${elapsed}с`,
    { parse_mode: 'HTML' }
  );
};

module.exports = { handleMailingFSM, runMailing };
