/**
 * Перебрандинг Full HD: переезд PRIME → Full HD+, заливка BASE 1-4 в Full HD.
 *
 * 1. Создаёт/обновляет категорию «Full HD+» (image — из fullhd-plus-cover.json).
 * 2. Переводит все PC-PRIME-* из категории «Full HD» в «Full HD+».
 * 3. Апсёртит BASE 1-4 (PC-BASE-N) из fullhd-base-data.json в «Full HD».
 *
 * Идемпотентно — повторный запуск ничего не ломает.
 *
 * Запуск (на сервере):
 *   node prisma/seed-fullhd-rebrand.js
 */

const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('../generated/prisma');

const prisma = new PrismaClient();

const PLUS_DESCRIPTION = 'Игровые ПК уровня Full HD+ (топ Full HD-сегмента)';

(async () => {
  const coverPath = path.resolve(__dirname, 'fullhd-plus-cover.json');
  const itemsPath = path.resolve(__dirname, 'fullhd-base-data.json');

  if (!fs.existsSync(coverPath) || !fs.existsSync(itemsPath)) {
    console.error('❌ Не найдены fullhd-plus-cover.json или fullhd-base-data.json');
    console.error('   Сгенерируй их локально: node scripts/import-fullhd-base-pcs.js');
    process.exit(1);
  }

  const { url: plusCoverUrl } = JSON.parse(fs.readFileSync(coverPath, 'utf8'));
  const baseItems = JSON.parse(fs.readFileSync(itemsPath, 'utf8'));

  // 1. Категория Full HD+
  const fullHdPlus = await prisma.category.upsert({
    where: { name: 'Full HD+' },
    update: { image: plusCoverUrl, description: PLUS_DESCRIPTION },
    create: { name: 'Full HD+', description: PLUS_DESCRIPTION, image: plusCoverUrl },
  });
  console.log(`📁 Категория Full HD+ id=${fullHdPlus.id}, обложка обновлена`);

  // 2. Существующая Full HD
  const fullHd = await prisma.category.findUnique({ where: { name: 'Full HD' } });
  if (!fullHd) {
    console.error('❌ Категория «Full HD» не найдена в БД — сначала прогони базовый seed.');
    process.exit(1);
  }

  // 3. Перенос всех PRIME-* из Full HD в Full HD+
  const moved = await prisma.product.updateMany({
    where: {
      productId: { startsWith: 'PC-PRIME-' },
      categoryId: fullHd.id,
    },
    data: { categoryId: fullHdPlus.id },
  });
  console.log(`🔀 PRIME-моделей перенесено в Full HD+: ${moved.count}`);

  // 4. Апсёрт BASE 1-4 в Full HD
  let created = 0, updated = 0;
  for (const item of baseItems) {
    const data = {
      name: item.name,
      price: item.price,
      description: item.description ?? null,
      specs: item.specs ?? null,
      image: item.image ?? null,
      fpsImage: item.fpsImage ?? null,
      allImages: item.allImages ?? null,
      videoUrl: item.videoUrl ?? null,
      fpsVideoUrl: item.fpsVideoUrl ?? null,
      favoriteRank: item.favoriteRank ?? 0,
      tildaUid: item.tildaUid ?? null,
      categoryId: fullHd.id,
    };
    const existing = await prisma.product.findUnique({ where: { productId: item.productId } });
    if (existing) {
      await prisma.product.update({ where: { productId: item.productId }, data });
      updated++;
      console.log(`🔄 ${item.productId} (${item.name}) — обновлён`);
    } else {
      await prisma.product.create({ data: { productId: item.productId, ...data } });
      created++;
      console.log(`✅ ${item.productId} (${item.name}) — создан`);
    }
  }
  console.log(`\n📊 BASE 1-4: создано ${created}, обновлено ${updated}.`);
})()
  .catch((e) => { console.error('💥 Ошибка:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
