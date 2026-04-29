const { Markup } = require('telegraf');
const { checkAdmin, setState, clearState } = require('../../core/middlewares');
const adminController = require('../../../../controllers/adminController');

const showAdmins = async (ctx) => {
  const admins = await adminController.getAllAdmins();
  const myId = String(ctx.from.id);
  const lines = ['👥 <b>Админы</b>', ''];
  if (admins.length === 0) {
    lines.push('Пока никого нет.');
  } else {
    for (const a of admins) {
      const me = String(a.telegramId) === myId ? '  ← это ты' : '';
      lines.push(`• <b>${a.name}</b>  <code>${a.telegramId}</code>${me}`);
    }
  }
  lines.push('');
  lines.push('Чтобы удалить — кликни на ❌ напротив. Себя удалить нельзя.');

  const rows = [];
  for (const a of admins) {
    if (String(a.telegramId) === myId) continue; // себя не удаляем
    rows.push([
      Markup.button.callback(`❌ ${a.name} (${a.telegramId})`, `admin_remove_${a.telegramId}`),
    ]);
  }
  rows.push([Markup.button.callback('➕ Добавить админа', 'admin_add')]);
  rows.push([Markup.button.callback('🔙 Назад', 'admin_panel')]);

  const opts = { parse_mode: 'HTML', ...Markup.inlineKeyboard(rows) };
  try {
    await ctx.editMessageText(lines.join('\n'), opts);
  } catch {
    await ctx.reply(lines.join('\n'), opts);
  }
};

const setupAdminsHandlers = (bot) => {
  bot.action('admin_admins', checkAdmin, async (ctx) => {
    await ctx.answerCbQuery();
    await showAdmins(ctx);
  });

  // Удаление по кнопке
  bot.action(/^admin_remove_(\d+)$/, checkAdmin, async (ctx) => {
    const telegramId = ctx.match[1];
    if (telegramId === String(ctx.from.id)) {
      return ctx.answerCbQuery('Себя удалить нельзя 😉', { show_alert: true });
    }
    try {
      await adminController.removeAdmin(telegramId);
      await ctx.answerCbQuery('Админ удалён');
      await showAdmins(ctx);
    } catch (e) {
      console.error('[ADMINS] remove:', e);
      await ctx.answerCbQuery('Не получилось удалить', { show_alert: true });
    }
  });

  // Старт добавления — FSM шаг 1
  bot.action('admin_add', checkAdmin, async (ctx) => {
    await ctx.answerCbQuery();
    setState(ctx.from.id, 'admin_add_id');
    await ctx.reply(
      '🆔 Введи Telegram ID нового админа (только цифры).\n\n' +
      'Самый простой способ узнать ID — попроси этого человека написать боту @userinfobot.\n\n' +
      'Для отмены — /cancel.'
    );
  });
};

module.exports = { setupAdminsHandlers, showAdmins };
