/**
 * Одноразовый сидер контактных настроек до значений, согласованных с заказчиком.
 * После прогона эти значения можно править через админ-панель в боте.
 *
 * Запуск (на сервере):
 *   node prisma/seed-settings.js
 */

const { PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient();

const VALUES = {
  contact_tg:    'https://t.me/BZoneStoreBot',
  contact_phone: '+7(968)700-94-84',
  contact_email: 'manager@b-zone.store',
  contact_site:  'https://b-zone.store/',
};

(async () => {
  for (const [key, value] of Object.entries(VALUES)) {
    await prisma.setting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
    console.log(`✅ ${key.padEnd(15)} → ${value}`);
  }
  await prisma.$disconnect();
})().catch((e) => {
  console.error('💥 ошибка:', e);
  process.exit(1);
});
