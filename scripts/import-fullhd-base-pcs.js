/**
 * Импорт BASE 1-4 BLACK с b-zone.store/gaming_pc#base в категорию «Full HD».
 * Параллельно — обложка для новой категории «Full HD+» (туда переедут существующие PRIME 1-4).
 *
 * Что делает:
 *   1. Скачивает картинку обложки «Full HD+» с tildacdn → resize webp 1200 → S3.
 *   2. Скачивает по 1 главной фотке для каждого BASE-компа с tildacdn → resize → S3.
 *   3. Пишет манифесты:
 *        - prisma/fullhd-plus-cover.json — { url } для Full HD+ Category.image
 *        - prisma/fullhd-base-data.json   — массив BASE 1-4 для seed-fullhd-rebrand.js
 *
 * Запуск (локально):
 *   node scripts/import-fullhd-base-pcs.js
 */

const fs = require('fs');
const path = require('path');
const axios = require('axios');
const sharp = require('sharp');
const { v4: uuidv4 } = require('uuid');

require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });
const s3Service = require('../services/s3Service');

// Cover для новой категории Full HD+
const FULLHD_PLUS_COVER_URL = 'https://static.tildacdn.com/tild6131-6537-4461-a666-346134376564/FULL_HD__2.jpg';

// 4 BASE-компа с b-zone.store/gaming_pc#base (BLACK-варианты).
// Только Процессор/Видеокарта — других спецификаций со страницы листинга
// сайт не отдаёт. Можно потом догрузить через админ-панель.
const PRODUCTS = [
  {
    productId: 'PC-BASE-1',
    name: 'BASE 1',
    price: 60990,
    tildaUid: '673413941462',
    cpu: 'AMD RYZEN 5 5500',
    gpu: 'NVIDIA GTX 1660 Super',
    imageUrl: 'https://thb.tildacdn.com/tild3938-3237-4332-a661-646439303434/4.webp',
  },
  {
    productId: 'PC-BASE-2',
    name: 'BASE 2',
    price: 67990,
    tildaUid: '182555575872',
    cpu: 'AMD RYZEN 5 5500',
    gpu: 'NVIDIA RTX 2060 Super',
    imageUrl: 'https://thb.tildacdn.com/tild6466-3133-4435-a330-316661353264/4.webp',
  },
  {
    productId: 'PC-BASE-3',
    name: 'BASE 3',
    price: 71990,
    tildaUid: '302431529172',
    cpu: 'AMD RYZEN 5 5600',
    gpu: 'NVIDIA RTX 2060 Super',
    imageUrl: 'https://thb.tildacdn.com/tild6539-3930-4561-b833-663963356435/4.webp',
  },
  {
    productId: 'PC-BASE-4',
    name: 'BASE 4',
    price: 79990,
    tildaUid: '680324800362',
    cpu: 'AMD RYZEN 5 5600',
    gpu: 'NVIDIA RTX 3060 TI',
    imageUrl: 'https://thb.tildacdn.com/tild3737-3537-4762-a662-626336646139/1.webp',
  },
];

function sanitize(name) {
  return String(name).toLowerCase()
    .replace(/[^a-zа-я0-9\-_]/g, '_')
    .replace(/_{2,}/g, '_')
    .replace(/^_|_$/g, '');
}

async function downloadAndResize(url) {
  const r = await axios.get(url, { responseType: 'arraybuffer', timeout: 30000 });
  const orig = Buffer.from(r.data);
  const resized = await sharp(orig)
    .resize({ width: 1200, withoutEnlargement: true })
    .webp({ quality: 85 })
    .toBuffer();
  return { orig, resized };
}

async function uploadCover(srcUrl, categoryName) {
  console.log(`📥 ${categoryName} ← ${srcUrl}`);
  const { resized } = await downloadAndResize(srcUrl);
  const key = `categories/${sanitize(categoryName)}/cover/${uuidv4()}.webp`;
  const url = await s3Service.uploadToS3(resized, key, 'image/webp');
  console.log(`   → ${url}  (${(resized.length / 1024).toFixed(0)}KB)`);
  return url;
}

async function uploadProductMain(productId, srcUrl) {
  const { resized } = await downloadAndResize(srcUrl);
  const key = `products/${sanitize(productId)}/main/${uuidv4()}.webp`;
  const url = await s3Service.uploadToS3(resized, key, 'image/webp');
  return url;
}

async function main() {
  if (!s3Service.isConfigured()) {
    console.error('❌ S3 не сконфигурирован.');
    process.exit(1);
  }

  // 1. Cover для Full HD+
  const coverUrl = await uploadCover(FULLHD_PLUS_COVER_URL, 'Full HD+');
  const coverPath = path.resolve(__dirname, '..', 'prisma', 'fullhd-plus-cover.json');
  fs.writeFileSync(coverPath, JSON.stringify({ url: coverUrl }, null, 2), 'utf8');
  console.log(`💾 ${coverPath}`);

  // 2. BASE 1-4
  console.log('\n--- BASE 1-4 ---');
  const items = [];
  for (const p of PRODUCTS) {
    process.stdout.write(`📦 ${p.name}  CPU=${p.cpu}  GPU=${p.gpu}  ← ${p.imageUrl}\n   uploading… `);
    const imgUrl = await uploadProductMain(p.productId, p.imageUrl);
    console.log('✓');
    items.push({
      productId: p.productId,
      name: p.name,
      price: p.price,
      description: null,
      specs: JSON.stringify({
        'Процессор': p.cpu,
        'Видеокарта': p.gpu,
      }),
      image: imgUrl,
      fpsImage: null,
      allImages: null,
      videoUrl: null,
      fpsVideoUrl: null,
      favoriteRank: 0,
      tildaUid: p.tildaUid,
      categoryName: 'Full HD',
    });
  }

  const itemsPath = path.resolve(__dirname, '..', 'prisma', 'fullhd-base-data.json');
  fs.writeFileSync(itemsPath, JSON.stringify(items, null, 2), 'utf8');
  console.log(`\n💾 ${itemsPath}`);
  console.log(`\n✅ Готово. Дальше — на сервере прогнать seed-fullhd-rebrand.js`);
}

main().catch((e) => { console.error('💥', e); process.exit(1); });
