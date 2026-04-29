const prisma = require('../models/prisma');

/**
 * Записываем/обновляем пользователя бота (по /start или другим хукам).
 * Возвращает запись из БД.
 */
const trackUser = async (telegramUser) => {
  if (!telegramUser?.id) return null;
  const telegramId = String(telegramUser.id);
  try {
    return await prisma.botUser.upsert({
      where: { telegramId },
      update: {
        username: telegramUser.username ?? null,
        firstName: telegramUser.first_name ?? null,
        lastName: telegramUser.last_name ?? null,
        // Если юзер вернулся, снимаем флаг blockedBot — раз пишет /start, бот не заблокирован.
        blockedBot: false,
      },
      create: {
        telegramId,
        username: telegramUser.username ?? null,
        firstName: telegramUser.first_name ?? null,
        lastName: telegramUser.last_name ?? null,
      },
    });
  } catch (error) {
    console.error('[BOT_USER] Ошибка trackUser:', error);
    return null;
  }
};

const setSubscription = async (telegramId, subscribed) => {
  return await prisma.botUser.upsert({
    where: { telegramId: String(telegramId) },
    update: { subscribedToMailing: subscribed },
    create: { telegramId: String(telegramId), subscribedToMailing: subscribed },
  });
};

const markBlocked = async (telegramId, blocked = true) => {
  try {
    await prisma.botUser.update({
      where: { telegramId: String(telegramId) },
      data: { blockedBot: blocked, ...(blocked ? { subscribedToMailing: false } : {}) },
    });
  } catch (e) {
    // Если записи нет — не страшно.
    if (e?.code !== 'P2025') console.error('[BOT_USER] markBlocked:', e);
  }
};

const countAll = async () => prisma.botUser.count();

const countMailable = async () =>
  prisma.botUser.count({
    where: { subscribedToMailing: true, blockedBot: false },
  });

const getMailableIds = async () => {
  const rows = await prisma.botUser.findMany({
    where: { subscribedToMailing: true, blockedBot: false },
    select: { telegramId: true },
  });
  return rows.map(r => r.telegramId);
};

module.exports = {
  trackUser,
  setSubscription,
  markBlocked,
  countAll,
  countMailable,
  getMailableIds,
};
