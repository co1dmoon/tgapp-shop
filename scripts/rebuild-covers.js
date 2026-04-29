/**
 * Перезаливает обложки категорий уменьшенными версиями (max 1200px по ширине, webp q85).
 * Решает проблему «колкости/лесенки» при сильном down-sample в браузере.
 *
 * После прогона печатает SQL-патч для Category.image — либо обновляет манифест ПК-сидера.
 *
 * Источники обложек:
 *   PC категории — берём «главный ПК» каждой линейки (см. CATEGORY_MAIN_PC).
 *     Локальный файл — главная фотка папки этого ПК.
 *   Аксессуар-категории — `аксессуары для ТГ/заглавные фотки/<имя>.jpg`.
 *
 * Запуск:  node scripts/rebuild-covers.js
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const { v4: uuidv4 } = require('uuid');

require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });
const s3Service = require('../services/s3Service');

const SOURCE_ROOT = process.argv[2] || 'F:/workwork!/tgapp-shop/РАБОТА С ТГ МАГАЗОМ';

// Главный ПК каждой PC-категории — его «заглавная» фотка идёт в Category.image.
// Также используется в seed-pcs.js (CATEGORY_MAIN_PRODUCT). При смене — там тоже поменять.
const PC_COVERS = {
  'Full HD': { folder: 'FULL HD/FULL HD/PRIME 3', productName: 'PRIME 3' },
  '2K':      { folder: '2K/PHANTOM 3',            productName: 'PHANTOM 3' },
  '4K':      { folder: '4K/PULSAR 2',             productName: 'PULSAR 2' },  // ← было PULSAR 4
};

const ACC_COVERS = {
  'клавиатуры': 'Клава с подсветкой.jpg',
  'мыши':       'Мышь с подсветкой.jpg',
  'наушники':   'Наушкники с подсветкой.jpg',  // да, опечатка в исходнике
  'микрофоны':  'Микрофон с подсветкой.jpg',
  'мониторы':   'Монитор с подсветкой.jpg',
  'коврики':    'Коврик с подсветкой.jpg',
};

function sanitize(name) {
  return String(name).toLowerCase()
    .replace(/[^a-zа-я0-9\-_]/g, '_')
    .replace(/_{2,}/g, '_')
    .replace(/^_|_$/g, '');
}

function findMainImage(productDir) {
  if (!fs.existsSync(productDir)) return null;
  const files = fs.readdirSync(productDir)
    .filter(f => /\.(jpe?g|png|webp)$/i.test(f) && fs.statSync(path.join(productDir, f)).isFile());
  return files.length ? path.join(productDir, files[0]) : null;
}

async function uploadCover(localPath, categoryName) {
  const buffer = fs.readFileSync(localPath);

  // Ресайз: max 1200px ширины, webp q85, без апскейла.
  const resized = await sharp(buffer)
    .resize({ width: 1200, withoutEnlargement: true })
    .webp({ quality: 85 })
    .toBuffer();

  const key = `categories/${sanitize(categoryName)}/cover/${uuidv4()}.webp`;
  const url = await s3Service.uploadToS3(resized, key, 'image/webp');
  console.log(`  ${categoryName.padEnd(12)} ← ${path.basename(localPath)}  →  ${(resized.length / 1024).toFixed(0)}KB`);
  return url;
}

async function main() {
  if (!s3Service.isConfigured()) {
    console.error('❌ S3 не сконфигурирован.');
    process.exit(1);
  }

  console.log(`📁 Источник: ${SOURCE_ROOT}\n`);

  const result = { pcCovers: {}, accessoryCovers: {} };

  console.log('--- PC категории ---');
  for (const [catName, meta] of Object.entries(PC_COVERS)) {
    const productDir = path.join(SOURCE_ROOT, meta.folder);
    const localPath = findMainImage(productDir);
    if (!localPath) {
      console.warn(`  ⚠ нет главной фотки для ${meta.productName} (${productDir})`);
      continue;
    }
    result.pcCovers[catName] = {
      mainProductName: meta.productName,
      url: await uploadCover(localPath, catName),
    };
  }

  console.log('\n--- Аксессуар-категории ---');
  for (const [catName, fileName] of Object.entries(ACC_COVERS)) {
    const localPath = path.join(SOURCE_ROOT, 'аксессуары для ТГ', 'заглавные фотки', fileName);
    if (!fs.existsSync(localPath)) {
      console.warn(`  ⚠ нет файла: ${localPath}`);
      continue;
    }
    result.accessoryCovers[catName] = await uploadCover(localPath, catName);
  }

  // Записываем для seed-pcs (через products-data.json) и seed-accessories (через accessories-data.json).
  const productsDataPath = path.resolve(__dirname, '..', 'prisma', 'products-data.json');
  const accDataPath = path.resolve(__dirname, '..', 'prisma', 'accessories-data.json');

  // PC manifest сам по себе не хранит обложки — обложки прописывает seed-pcs.js
  // через CATEGORY_MAIN_PRODUCT. Поэтому для PC просто пишем result.pcCovers
  // в отдельный manifest (covers-data.json), а seed-pcs.js будет его подгружать.
  const coversPath = path.resolve(__dirname, '..', 'prisma', 'covers-data.json');
  fs.writeFileSync(coversPath, JSON.stringify(result, null, 2), 'utf8');
  console.log(`\n💾 ${coversPath}`);

  // Также правим accessories-data.json: меняем categoryCovers на свежие URL
  if (fs.existsSync(accDataPath)) {
    const acc = JSON.parse(fs.readFileSync(accDataPath, 'utf8'));
    acc.categoryCovers = { ...(acc.categoryCovers || {}), ...result.accessoryCovers };
    fs.writeFileSync(accDataPath, JSON.stringify(acc, null, 2), 'utf8');
    console.log(`💾 ${accDataPath} — categoryCovers обновлён`);
  }

  console.log('\n✅ Готово. Дальше — обновить seed-pcs.js (PULSAR 2 как 4K cover) и прогнать сидеры.');
}

main().catch(e => { console.error('💥', e); process.exit(1); });
