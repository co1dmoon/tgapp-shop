const prisma = require('../models/prisma');

// Дефолты — используются если в БД ещё нет такой настройки.
const DEFAULTS = {
  contact_tg:    'https://t.me/BZoneStoreBot',
  contact_vk:    'https://vk.com/write-209962380',
  contact_phone: '+79999999999',
};

const SETTING_META = {
  contact_tg:    { label: 'Telegram', hint: 'Полная ссылка вида https://t.me/...' },
  contact_vk:    { label: 'ВКонтакте', hint: 'Полная ссылка вида https://vk.com/... или https://vk.com/write-...' },
  contact_phone: { label: 'Телефон', hint: 'В формате +7XXXXXXXXXX' },
};

const getAll = async () => {
  const rows = await prisma.setting.findMany();
  const map = Object.fromEntries(rows.map(r => [r.key, r.value]));
  // Подмешиваем дефолты для ключей, которых ещё нет в БД.
  for (const [k, v] of Object.entries(DEFAULTS)) {
    if (!(k in map)) map[k] = v;
  }
  return map;
};

const get = async (key) => {
  const r = await prisma.setting.findUnique({ where: { key } });
  return r?.value ?? DEFAULTS[key] ?? null;
};

const set = async (key, value) => {
  if (!(key in SETTING_META)) {
    throw new Error(`Неизвестный ключ настройки: ${key}`);
  }
  return await prisma.setting.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  });
};

const getMeta = (key) => SETTING_META[key] || null;
const allKeys = () => Object.keys(SETTING_META);

module.exports = { getAll, get, set, getMeta, allKeys, DEFAULTS, SETTING_META };
