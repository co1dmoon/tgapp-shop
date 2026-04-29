/**
 * Заливка ПК в БД из манифеста `prisma/products-data.json`.
 *
 * Манифест собирается локально скриптом `scripts/import-products-from-folder.js`
 * (он же заливает картинки в S3). Этот сидер — только запись в Postgres.
 *
 * Идемпотентен: использует `prisma.product.upsert` по уникальному `productId`.
 * При повторном запуске обновит поля у существующих записей.
 *
 * Запуск (на сервере, где доступна БД):
 *   node prisma/seed-pcs.js
 *
 * Перед запуском убедиться:
 *   - DATABASE_URL в окружении указывает на Postgres
 *   - Схема накатана: `npx prisma db push`
 *   - Prisma client сгенерирован: `npx prisma generate`
 */

const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('../generated/prisma');

const prisma = new PrismaClient();

// Маппинг имени категории из манифеста → описание (используется при создании, если категории ещё нет).
const CATEGORY_DESCRIPTIONS = {
  'Full HD': 'Игровые ПК для разрешения 1920x1080',
  '2K': 'Игровые ПК для разрешения 2560x1440',
  '4K': 'Игровые ПК для разрешения 3840x2160',
};

// «Главный» ПК каждой категории — его картинка идёт в Category.image на лендинге.
// Full HD — середина (PRIME 3), 2K — середина (PHANTOM 3), 4K — PULSAR 2 (по запросу пользователя).
const CATEGORY_MAIN_PRODUCT = {
  'Full HD': 'PC-PRIME-3',
  '2K': 'PC-PHANTOM-3',
  '4K': 'PC-PULSAR-2',
};

// Если есть covers-data.json — берём оттуда уменьшенные webp-обложки (чтобы не «лесенило»
// при ресайзе в браузере). Если файла нет — фолбэк на main image товара.
const COVERS_PATH = path.resolve(__dirname, 'covers-data.json');
const RESIZED_COVERS = fs.existsSync(COVERS_PATH)
  ? JSON.parse(fs.readFileSync(COVERS_PATH, 'utf8')).pcCovers || {}
  : {};

async function ensureCategory(name) {
  const description = CATEGORY_DESCRIPTIONS[name] || null;
  return await prisma.category.upsert({
    where: { name },
    update: {},
    create: { name, description },
  });
}

async function main() {
  const manifestPath = path.resolve(__dirname, 'products-data.json');
  if (!fs.existsSync(manifestPath)) {
    console.error(`❌ Манифест не найден: ${manifestPath}`);
    console.error('   Сгенерируй его командой: node scripts/import-products-from-folder.js');
    process.exit(1);
  }

  const items = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  console.log(`📦 Товаров в манифесте: ${items.length}`);

  // Кэшируем категории (по имени → id), чтобы не дёргать БД на каждом товаре.
  const categoriesByName = new Map();

  let created = 0;
  let updated = 0;

  for (const item of items) {
    if (!item.categoryName) {
      console.warn(`⚠️  Пропускаю ${item.productId}: нет categoryName`);
      continue;
    }

    let category = categoriesByName.get(item.categoryName);
    if (!category) {
      category = await ensureCategory(item.categoryName);
      categoriesByName.set(item.categoryName, category);
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
      console.log(`🔄 ${item.productId} (${item.name}) — обновлён`);
    } else {
      await prisma.product.create({
        data: { productId: item.productId, ...data },
      });
      created++;
      console.log(`✅ ${item.productId} (${item.name}) — создан`);
    }
  }

  console.log(`\n📊 Товары: создано ${created}, обновлено ${updated}.`);

  // Обновляем Category.image у Full HD/2K/4K. Приоритет — уменьшенный webp из covers-data.json,
  // фолбэк — главная фотка товара (большой исходник).
  for (const [categoryName, mainProductId] of Object.entries(CATEGORY_MAIN_PRODUCT)) {
    const resized = RESIZED_COVERS[categoryName]?.url;
    let coverUrl = resized;
    let source = 'webp 1200px';
    if (!coverUrl) {
      const mainItem = items.find(it => it.productId === mainProductId);
      coverUrl = mainItem?.image;
      source = `${mainProductId} main`;
    }
    if (!coverUrl) {
      console.warn(`⚠️  Не нашёл обложку для "${categoryName}"`);
      continue;
    }
    const category = categoriesByName.get(categoryName);
    if (!category) {
      console.warn(`⚠️  Категория "${categoryName}" не найдена в кэше`);
      continue;
    }
    await prisma.category.update({
      where: { id: category.id },
      data: { image: coverUrl },
    });
    console.log(`🖼  Обложка "${categoryName}" → ${source}`);
  }
}

main()
  .catch(err => {
    console.error('💥 Ошибка:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
