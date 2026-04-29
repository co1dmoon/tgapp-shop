/**
 * Чинит main image для клавиатур и мышек: ставит правильную фотку из тех,
 * что юзер указал по хешам имён файлов. Ресайзит до webp 1200px q85.
 *
 * Маппинг (productId в БД → хеш файла из папки товара):
 *   построен по mapping в начале скрипта.
 * Папки товара берём из accessories-data.json по category + name.
 *
 * После прогона апдейтит accessories-data.json (поле image у нужных товаров).
 *
 * Запуск:  node scripts/fix-main-images.js
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const { v4: uuidv4 } = require('uuid');

require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });
const s3Service = require('../services/s3Service');

const ROOT = 'F:/workwork!/tgapp-shop/РАБОТА С ТГ МАГАЗОМ/аксессуары для ТГ';
const ACC_DATA_PATH = path.resolve(__dirname, '..', 'prisma', 'accessories-data.json');

// productId → хеш файла который должен быть главным.
const MAIN_BY_PRODUCT_ID = {
  // КЛАВИАТУРЫ
  'ACC-201906271382': '33273812', // A4Tech Bloody Q100
  'ACC-600774301592': '56414051', // Akko 5087S
  'ACC-260839849442': '58293423', // MSI Vigor GK20
  'ACC-659749536322': '57120794', // MSI Vigor GK30 Black
  'ACC-874766158902': '28849309', // MSI Vigor GK30 White
  'ACC-550707949762': '34865992', // Razer Ornata V3
  'ACC-275533330632': '35121515', // AJAZZ AK820 Pro
  'ACC-288461846002': '54013865', // ASUS X901 BLACK
  'ACC-206884045532': '19051108', // ASUS X901 WHITE
  'ACC-825999520172': '24258288', // Keychron K8 Pro
  'ACC-791450288922': '74618490', // Machenike KT68
  'ACC-255154022822': '22646423', // Nuphy AIR75v2
  'ACC-799707137862': '46626809', // WOB Rainy 75 pro

  // МЫШИ
  'ACC-827512116732': '32176783', // Logitech G PRO X SUPERLIGHT 2
  'ACC-133585959962': '42924040', // Logitech G PRO X SUPERLIGHT 2 WHITE
  'ACC-171951953222': '30788499', // Logitech Gaming Mouse G703
  'ACC-114420821362': '16156887', // Ajazz AJ139 V2 MC
  'ACC-194526238172': '74368746', // Ajazz AJ139 V2 MC WHITE
  'ACC-998347211932': '30056408', // AJAZZ AJ159 APEX
  'ACC-861986894722': '51782060', // AJAZZ AJ159 APEX WHITE
  'ACC-528486215522': '44150949', // AJAZZ AJ159 NL
  'ACC-156851732372': '18752945', // AJAZZ AJ159 NL WHITE
  'ACC-343553617832': '75034251', // ASUS ROG Keris II ACE
  'ACC-715528460212': '90952665', // ASUS ROG Keris II ACE WHITE
  'ACC-879224950072': '89695836', // MSI Clutch GM51 Lightweight
  'ACC-951001542482': '14187826', // Logitech G102 LIGHTSYNC BLACK
  'ACC-962894687092': '84553175', // Logitech G102 LIGHTSYNC WHITE
  'ACC-452724959422': '18448552', // Logitech G403 HERO
  'ACC-964183480102': '74166343', // MSI Clutch GM11 BLACK
  'ACC-255365606842': '81437253', // MSI Clutch GM11 WHITE
  'ACC-433775196512': '85903505', // Razer Basilisk V3
  'ACC-606153511132': '37578582', // Razer DeathAdder V3
};

function sanitize(name) {
  return String(name).toLowerCase()
    .replace(/[^a-zа-я0-9\-_]/g, '_')
    .replace(/_{2,}/g, '_')
    .replace(/^_|_$/g, '');
}

function findFileByHash(rootDir, hash) {
  const stack = [rootDir];
  while (stack.length) {
    const dir = stack.pop();
    for (const e of fs.readdirSync(dir)) {
      const full = path.join(dir, e);
      const st = fs.statSync(full);
      if (st.isDirectory()) stack.push(full);
      else if (e.startsWith(hash + '.')) return full;
    }
  }
  return null;
}

async function uploadResized(localPath, productId) {
  const buffer = fs.readFileSync(localPath);
  const resized = await sharp(buffer)
    .resize({ width: 1200, withoutEnlargement: true })
    .webp({ quality: 85 })
    .toBuffer();
  const key = `accessories/${sanitize(productId)}/main/${uuidv4()}.webp`;
  return await s3Service.uploadToS3(resized, key, 'image/webp');
}

async function main() {
  if (!s3Service.isConfigured()) {
    console.error('❌ S3 не сконфигурирован.');
    process.exit(1);
  }

  const data = JSON.parse(fs.readFileSync(ACC_DATA_PATH, 'utf8'));
  const items = data.items;

  let fixed = 0;
  for (const [productId, hash] of Object.entries(MAIN_BY_PRODUCT_ID)) {
    const item = items.find(i => i.productId === productId);
    if (!item) {
      console.warn(`⚠ нет в манифесте: ${productId}`);
      continue;
    }
    const localPath = findFileByHash(ROOT, hash);
    if (!localPath) {
      console.warn(`⚠ нет файла с хешем ${hash} (для ${productId} / ${item.name})`);
      continue;
    }
    process.stdout.write(`📦 ${item.name.padEnd(50)}  ← ${path.basename(localPath)}  `);
    const url = await uploadResized(localPath, productId);
    item.image = url;
    fixed++;
    console.log('✓');
  }

  fs.writeFileSync(ACC_DATA_PATH, JSON.stringify(data, null, 2), 'utf8');
  console.log(`\n✅ Обновлено: ${fixed}/${Object.keys(MAIN_BY_PRODUCT_ID).length}`);
}

main().catch(e => { console.error('💥', e); process.exit(1); });
