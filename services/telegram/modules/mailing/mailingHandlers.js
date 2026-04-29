const { Markup } = require('telegraf');
const { checkAdmin, setState, clearState } = require('../../core/middlewares');
const botUserController = require('../../../../controllers/botUserController');

// Inline-кнопка отписки, цепляется к каждому сообщению рассылки.
const unsubscribeKeyboard = () =>
  Markup.inlineKeyboard([
    [Markup.button.callback('🚫 Отписаться от рассылок', 'mailing_unsubscribe')],
  ]);

const showMailingStart = async (ctx) => {
  const total = await botUserController.countAll();
  const mailable = await botUserController.countMailable();
  const text = [
    '📣 <b>Рассылка</b>',
    '',
    `Всего пользователей: <b>${total}</b>`,
    `Получат рассылку: <b>${mailable}</b> (подписаны и не заблокировали бота)`,
    '',
    'Введи текст сообщения. Поддерживается HTML-разметка ' +
      '(<code>&lt;b&gt;</code>, <code>&lt;i&gt;</code>, <code>&lt;a href=&quot;...&quot;&gt;...&lt;/a&gt;</code>).',
    '',
    'В конец сообщения автоматически добавится кнопка «🚫 Отписаться».',
    '',
    'Для отмены — /cancel.',
  ].join('\n');

  setState(ctx.from.id, 'mailing_compose');
  try {
    await ctx.editMessageText(text, { parse_mode: 'HTML' });
  } catch {
    await ctx.reply(text, { parse_mode: 'HTML' });
  }
};

const setupMailingHandlers = (bot) => {
  // Открыть рассылку
  bot.action('admin_mailing', checkAdmin, async (ctx) => {
    await ctx.answerCbQuery();
    await showMailingStart(ctx);
  });

  // Подтверждение отправки
  bot.action('mailing_confirm_send', checkAdmin, async (ctx) => {
    await ctx.answerCbQuery();
    const { runMailing } = require('./mailingFSM');
    await runMailing(ctx);
  });

  // Отмена
  bot.action('mailing_cancel', checkAdmin, async (ctx) => {
    await ctx.answerCbQuery();
    clearState(ctx.from.id);
    try {
      await ctx.editMessageText('Рассылка отменена.');
    } catch {
      await ctx.reply('Рассылка отменена.');
    }
  });

  // Юзер отписывается от рассылок (callback из любого сообщения рассылки)
  bot.action('mailing_unsubscribe', async (ctx) => {
    await ctx.answerCbQuery('Готово, ты отписан 👍');
    try {
      await botUserController.setSubscription(ctx.from.id, false);
      await ctx.reply(
        '🚫 Ты отписался от рассылок. Если передумаешь — отправь /subscribe и снова будешь получать новости.'
      );
    } catch (e) {
      console.error('[MAILING] unsubscribe error:', e);
    }
  });
};

module.exports = { setupMailingHandlers, unsubscribeKeyboard };
