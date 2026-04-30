const prisma = require('../models/prisma');

// Дефолты — используются если в БД ещё нет такой настройки.
const DEFAULTS = {
  contact_tg:    'https://t.me/BZoneStoreBot',
  contact_phone: '+7(968)700-94-84',
  contact_email: 'manager@b-zone.store',
  contact_site:  'https://b-zone.store/',
};

const SETTING_META = {
  contact_tg:    { label: 'Telegram', hint: 'Полная ссылка вида https://t.me/...' },
  contact_phone: { label: 'Телефон',  hint: 'Допустимый формат: +7(XXX)XXX-XX-XX или +7XXXXXXXXXX' },
  contact_email: { label: 'Email',    hint: 'Адрес электронной почты, например manager@b-zone.store' },
  contact_site:  { label: 'Сайт',     hint: 'Полная ссылка на сайт, начинается с https://' },
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
