const { setState, clearState } = require('../../core/middlewares');
const adminController = require('../../../../controllers/adminController');
const { delay } = require('../../core/utils');
const { showAdmins } = require('./adminsHandlers');

const handleAdminsFSM = async (ctx, userId, state, text) => {
  if (state === 'admin_add_id') {
    const id = (text || '').trim();
    if (!/^\d{5,20}$/.test(id)) {
      return ctx.reply('❌ Telegram ID — это число (5–20 цифр). Попробуй ещё раз или /cancel.');
    }
    if (await adminController.isAdmin(id)) {
      clearState(userId);
      await ctx.reply(`Этот ID уже админ.`);
      await delay(400);
      return showAdmins(ctx);
    }
    setState(userId, `admin_add_name_${id}`);
    return ctx.reply('Введи имя для этого админа (любая строка). Или «-», чтобы оставить «Admin».');
  }

  if (state.startsWith('admin_add_name_')) {
    const id = state.replace('admin_add_name_', '');
    const raw = (text || '').trim();
    const name = !raw || raw === '-' ? 'Admin' : raw.slice(0, 50);
    try {
      await adminController.addAdmin(id, name);
      clearState(userId);
      await ctx.reply(`✅ Админ добавлен: <b>${name}</b> <code>${id}</code>`, { parse_mode: 'HTML' });
      await delay(400);
      return showAdmins(ctx);
    } catch (e) {
      console.error('[ADMINS_FSM] add:', e);
      clearState(userId);
      return ctx.reply('❌ Не получилось добавить. Возможно, такой ID уже есть.');
    }
  }
};

module.exports = { handleAdminsFSM };
