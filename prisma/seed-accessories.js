/**
 * Заливка аксессуаров (клавы/мыши/наушники/микрофоны/мониторы/коврики) в БД.
 *
 * Манифест собирается локально скриптом `scripts/import-accessories-from-folder.js`
 * (он же заливает все картинки в S3). Этот сидер — только запись в Postgres.
 *
 * Идемпотентен: upsert по уникальному `productId`.
 *
 * Запуск (на сервере, где доступна БД):
 *   node prisma/seed-accessories.js
 *
 * Перед запуском:
 *   - DATABASE_URL указывает на Postgres
 *   - Схема накатана: `npx prisma db push`
 *   - Prisma client сгенерирован: `npx prisma generate`
 */

const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('../generated/prisma');

const prisma = new PrismaClient();

async function ensureCategory(name, description, image) {
  // upsert по имени — описание/обложку обновляем, чтобы пере-сидинг
  // подтягивал свежие данные.
  return await prisma.category.upsert({
    where: { name },
    update: {
      ...(description !== undefined ? { description } : {}),
      ...(image !== undefined ? { image } : {}),
    },
    create: { name, description, image },
  });
}

async function main() {
  const manifestPath = path.resolve(__dirname, 'accessories-data.json');
  if (!fs.existsSync(manifestPath)) {
    console.error(`❌ Манифест не найден: ${manifestPath}`);
    console.error('   Сгенерируй: node scripts/import-accessories-from-folder.js');
    process.exit(1);
  }

  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const items = manifest.items || [];
  const categoryCovers = manifest.categoryCovers || {};
  const categoryDescriptions = manifest.categoryDescriptions || {};

  console.log(`📦 Аксессуаров в манифесте: ${items.length}`);

  // Создаём/обновляем все нужные категории заранее.
  const categoriesByName = new Map();
  const allCategoryNames = new Set(items.map(it => it.categoryName));
  for (const catName of allCategoryNames) {
    const cat = await ensureCategory(
      catName,
      categoryDescriptions[catName] ?? null,
      categoryCovers[catName] ?? null,
    );
    categoriesByName.set(catName, cat);
    console.log(`📁 Категория "${catName}" (id=${cat.id})${cat.image ? ' с обложкой' : ''}`);
  }

  let created = 0;
  let updated = 0;

  for (const item of items) {
    if (!item.categoryName) {
      console.warn(`⚠️  ${item.productId}: нет categoryName — пропускаю`);
      continue;
    }
    const category = categoriesByName.get(item.categoryName);
    if (!category) {
      console.warn(`⚠️  ${item.productId}: категория "${item.categoryName}" не создана — пропускаю`);
      continue;
    }

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
      categoryId: category.id,
    };

    const existing = await prisma.product.findUnique({
      where: { productId: item.productId },
    });

    if (existing) {
      await prisma.product.update({
        where: { productId: item.productId },
        data,
      });
      updated++;
    } else {
      await prisma.product.create({
        data: { productId: item.productId, ...data },
      });
      created++;
    }
  }

  console.log(`\n📊 Итог: создано ${created}, обновлено ${updated} (всего ${items.length}).`);
}

main()
  .catch(err => {
    console.error('💥 Ошибка:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
