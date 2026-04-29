const { checkAdmin, setState } = require('../../core/middlewares');
const settingsController = require('../../../../controllers/settingsController');
const { getSettingsMenuKeyboard, getAdminPanelKeyboard } = require('../../ui/keyboards');

const showSettingsMenu = async (ctx) => {
  const settings = await settingsController.getAll();
  const meta = settingsController.SETTING_META;
  const text = '⚙️ <b>Настройки сайта</b>\n\nКликни любую строку, чтобы изменить значение.\nПоказано текущее значение каждой настройки.';
  const keyboard = getSettingsMenuKeyboard(settings, meta);
  // Пытаемся обновить предыдущее меню; если не вышло — отправляем новое.
  try {
    await ctx.editMessageText(text, { parse_mode: 'HTML', ...keyboard });
  } catch {
    await ctx.reply(text, { parse_mode: 'HTML', ...keyboard });
  }
};

const setupSettingsHandlers = (bot) => {
  // Открыть меню настроек
  bot.action('admin_settings', checkAdmin, async (ctx) => {
    await ctx.answerCbQuery();
    await showSettingsMenu(ctx);
  });

  // Клик по конкретной настройке — переходим в FSM-режим ввода значения
  bot.action(/^edit_setting_(.+)$/, checkAdmin, async (ctx) => {
    const key = ctx.match[1];
    const meta = settingsController.getMeta(key);
    if (!meta) {
      await ctx.answerCbQuery('Неизвестная настройка', { show_alert: true });
      return;
    }
    await ctx.answerCbQuery();
    setState(ctx.from.id, `wait_setting_${key}`);
    const current = await settingsController.get(key);
    const lines = [
      `✏️ <b>${meta.label}</b>`,
      '',
      `Текущее значение: <code>${current ?? '—'}</code>`,
      '',
      `Подсказка: ${meta.hint}`,
      '',
      'Введи новое значение в чат. Для отмены — /cancel.',
    ];
    await ctx.reply(lines.join('\n'), { parse_mode: 'HTML' });
  });
};

module.exports = { setupSettingsHandlers, showSettingsMenu };
