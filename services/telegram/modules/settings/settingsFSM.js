const { clearState } = require('../../core/middlewares');
const settingsController = require('../../../../controllers/settingsController');
const { delay } = require('../../core/utils');
const { showSettingsMenu } = require('./settingsHandlers');

// Простая валидация по типу настройки.
const validate = (key, value) => {
  const v = value.trim();
  if (!v) return { ok: false, error: 'Пустое значение не годится.' };

  if (key === 'contact_phone') {
    // +7XXXXXXXXXX или +XX...
    if (!/^\+\d{10,15}$/.test(v)) {
      return { ok: false, error: 'Телефон должен быть в формате +7XXXXXXXXXX (только цифры со знаком плюса).' };
    }
  } else if (key === 'contact_tg' || key === 'contact_vk') {
    if (!/^https?:\/\/\S+$/i.test(v)) {
      return { ok: false, error: 'Ссылка должна начинаться с http:// или https:// и не содержать пробелов.' };
    }
  }
  return { ok: true, value: v };
};

const handleSettingsFSM = async (ctx, userId, state, text) => {
  const key = state.replace('wait_setting_', '');
  const meta = settingsController.getMeta(key);
  if (!meta) {
    clearState(userId);
    await ctx.reply('Неизвестная настройка. Операция отменена.');
    return;
  }

  const result = validate(key, text);
  if (!result.ok) {
    await ctx.reply(`❌ ${result.error}\n\nПопробуй ещё раз или /cancel.`);
    return;
  }

  try {
    await settingsController.set(key, result.value);
    clearState(userId);
    await ctx.reply(`✅ <b>${meta.label}</b> обновлено:\n<code>${result.value}</code>`, { parse_mode: 'HTML' });
    await delay(400);
    await showSettingsMenu(ctx);
  } catch (e) {
    console.error('[SETTINGS FSM] Ошибка:', e);
    clearState(userId);
    await ctx.reply('❌ Не удалось сохранить настройку. Попробуй ещё раз через /admin.');
  }
};

module.exports = { handleSettingsFSM };
