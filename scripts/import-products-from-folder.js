/**
 * Импорт ПК из папки `РАБОТА С ТГ МАГАЗОМ` в VK Cloud S3 + сборка манифеста.
 *
 * Что делает:
 *   1. Обходит линейки PRIME (Full HD), PHANTOM (2K), PULSAR (4K).
 *   2. Парсит `конфиг/<...>.txt` → JSON specs (Процессор, Видеокарта, Память, ...).
 *   3. Парсит `ссылки.txt` → videoUrl + fpsVideoUrl (UID игнорим — заполнится позже).
 *   4. Заливает в S3:
 *        - заглавная (`<root>.jpg`)         → field image
 *        - `фпс/*`                          → field fpsImage
 *        - `фото для галлереи/*`            → field allImages (JSON-массив URL)
 *      (`прозрачные/*` пока не используются — нет соответствующего поля в схеме)
 *   5. Записывает `prisma/products-data.json` — манифест для seed-pcs.js.
 *
 * Запуск (из корня проекта или из воркрита):
 *   node scripts/import-products-from-folder.js
 *   node scripts/import-products-from-folder.js "F:/path/to/РАБОТА С ТГ МАГАЗОМ"
 *
 * Требует .env с VK_S3_* + BOT_TOKEN (s3Service.isConfigured проверяет токен).
 */

const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });
const s3Service = require('../services/s3Service');

// ─────────────────────────────────────────────────────────────────
// КОНФИГ ИМПОРТА
// ─────────────────────────────────────────────────────────────────

const DEFAULT_SOURCE = process.argv[2]
  || process.env.SOURCE_FOLDER
  || path.resolve(__dirname, '..', 'РАБОТА С ТГ МАГАЗОМ');

// Линейки ПК. Папка категории на диске → имя категории в БД.
// Категории создаются seed.js с этими именами: 'Full HD', '2K', '4K'.
const PRODUCTS = [
  // PRIME 1-4 — Full HD
  ...[1, 2, 3, 4].map(n => ({
    line: 'PRIME', num: n,
    category: 'Full HD',
    folderRel: path.join('FULL HD', 'FULL HD', `PRIME ${n}`),
  })),
  // PHANTOM 1-4 — 2K
  ...[1, 2, 3, 4].map(n => ({
    line: 'PHANTOM', num: n,
    category: '2K',
    folderRel: path.join('2K', `PHANTOM ${n}`),
  })),
  // PULSAR 1-4 — 4K
  ...[1, 2, 3, 4].map(n => ({
    line: 'PULSAR', num: n,
    category: '4K',
    folderRel: path.join('4K', `PULSAR ${n}`),
  })),
];

// Цены — заглушки под спеки, поправить через админку.
// Pattern: чем выше топ-чип, тем дороже. Цифры под РФ-рынок весна 2026.
const PRICES = {
  'PRIME 1': 75000, 'PRIME 2': 95000, 'PRIME 3': 110000, 'PRIME 4': 125000,
  'PHANTOM 1': 150000, 'PHANTOM 2': 155000, 'PHANTOM 3': 175000, 'PHANTOM 4': 210000,
  'PULSAR 1': 230000, 'PULSAR 2': 260000, 'PULSAR 3': 330000, 'PULSAR 4': 480000,
};

// favoriteRank: 1 — топ показа в категории на лендинге, 2 — второй.
// Берём топовый и предтоповый ПК каждой линейки.
const FAVORITE_RANKS = {
  'PRIME 4': 1,   'PRIME 3': 2,
  'PHANTOM 4': 1, 'PHANTOM 3': 2,
  'PULSAR 4': 1,  'PULSAR 3': 2,
};

// ─────────────────────────────────────────────────────────────────
// ПАРСЕРЫ
// ─────────────────────────────────────────────────────────────────

// Маппинг ключей конфига (UPPER) → ключи в JSON specs.
// Ключи 'Видеокарта' и 'Процессор' жёстко зашиты во фронт (productDetails.tsx, OrderForm.tsx).
const SPEC_KEY_MAP = {
  'ПРОЦЕССОР': 'Процессор',
  'ВИДЕОКАРТА': 'Видеокарта',
  'ОПЕРАТИВНАЯ ПАМЯТЬ': 'Память',
  'НАКОПИТЕЛЬ': 'Накопитель',
  'МАТЕРИНСКАЯ ПЛАТА': 'Материнская плата',
  'ОХЛАЖДЕНИЕ': 'Охлаждение',
  'БЛОК ПИТАНИЯ': 'Блок питания',
  'КОРПУС': 'Корпус',
};

// Порядок в UI (Object.entries сохраняет insertion order).
const SPEC_ORDER = [
  'Процессор', 'Видеокарта', 'Память', 'Накопитель',
  'Материнская плата', 'Охлаждение', 'Блок питания', 'Корпус',
];

// Чиним очевидные опечатки в исходных конфигах.
function fixTypos(value) {
  return value
    .replace(/\bINTE\b/g, 'INTEL')           // INTE CORE → INTEL CORE
    .replace(/X3XD/gi, 'X3D')                // 7800X3XD → 7800X3D, 9800X3XD → 9800X3D
                                              // (без \b — он не работает между цифрой и буквой)
    .replace(/\s+/g, ' ')                    // схлопнуть лишние пробелы
    .trim();
}

function parseConfig(text) {
  const lines = text.split(/\r?\n/);
  const raw = {};
  let pendingKey = null;

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;
    if (line.startsWith('НАЗВАНИЕ ПК')) {
      pendingKey = null;
      continue;
    }
    const upper = line.toUpperCase();
    if (SPEC_KEY_MAP[upper]) {
      pendingKey = SPEC_KEY_MAP[upper];
      continue;
    }
    if (pendingKey && raw[pendingKey] === undefined) {
      raw[pendingKey] = fixTypos(line);
      pendingKey = null;
    }
  }

  // Возвращаем в фиксированном порядке.
  const ordered = {};
  for (const key of SPEC_ORDER) {
    if (raw[key]) ordered[key] = raw[key];
  }
  // Ловим вдруг пропущенные (не должно быть, но на всякий).
  for (const [k, v] of Object.entries(raw)) {
    if (!(k in ordered)) ordered[k] = v;
  }
  return ordered;
}

function parseLinks(text) {
  const result = { videoUrl: null, fpsVideoUrl: null };
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line) continue;
    const m = line.match(/https?:\/\/\S+/);
    if (!m) continue;
    const url = m[0];
    // ВАЖНО: проверяем "видео фпс" ДО "видео" — иначе перезатрётся.
    if (/^видео\s*фпс/i.test(line)) {
      result.fpsVideoUrl = url;
    } else if (/^видео/i.test(line)) {
      result.videoUrl = url;
    }
  }
  return result;
}

// ─────────────────────────────────────────────────────────────────
// ПОИСК ФАЙЛОВ В ПАПКЕ ПК
// ─────────────────────────────────────────────────────────────────

const IMG_RE = /\.(jpe?g|png|webp)$/i;

function listFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter(name => fs.statSync(path.join(dir, name)).isFile())
    .sort();
}

// Главная картинка — JPG/PNG в корне папки ПК (не в подпапках).
function findMainImage(productDir) {
  const files = listFiles(productDir).filter(f => IMG_RE.test(f));
  if (files.length === 0) return null;
  return path.join(productDir, files[0]);
}

// FPS картинка — единственная картинка в подпапке `фпс/`.
function findFpsImage(productDir) {
  const dir = path.join(productDir, 'фпс');
  const files = listFiles(dir).filter(f => IMG_RE.test(f));
  if (files.length === 0) return null;
  return path.join(dir, files[0]);
}

// Галерея — содержимое `фото для галлереи/` (с возможной вложенной папкой ФОН/).
function findGallery(productDir) {
  let dir = path.join(productDir, 'фото для галлереи');
  if (!fs.existsSync(dir)) return [];

  let entries = fs.readdirSync(dir);
  // У PRIME 1, PRIME 2 фото лежат внутри `ФОН/`.
  if (entries.length === 1) {
    const inner = path.join(dir, entries[0]);
    if (fs.existsSync(inner) && fs.statSync(inner).isDirectory()) {
      dir = inner;
    }
  }
  return listFiles(dir)
    .filter(f => IMG_RE.test(f))
    .map(f => path.join(dir, f));
}

// Конфиг — единственный .txt в `конфиг/` (имя файла бывает разное).
function findConfigText(productDir) {
  const dir = path.join(productDir, 'конфиг');
  const files = listFiles(dir).filter(f => f.toLowerCase().endsWith('.txt'));
  if (files.length === 0) {
    throw new Error(`нет конфига в ${dir}`);
  }
  return fs.readFileSync(path.join(dir, files[0]), 'utf8');
}

function findLinksText(productDir) {
  const file = path.join(productDir, 'ссылки.txt');
  if (!fs.existsSync(file)) return '';
  return fs.readFileSync(file, 'utf8');
}

// ─────────────────────────────────────────────────────────────────
// ЗАЛИВКА В S3
// ─────────────────────────────────────────────────────────────────

function sanitize(name) {
  return String(name).toLowerCase()
    .replace(/[^a-zа-я0-9\-_]/g, '_')
    .replace(/_{2,}/g, '_')
    .replace(/^_|_$/g, '');
}

// Ключ в S3 формы: products/<productId>/<type>/<uuid>.<ext>
// Не используем s3Service.generateFileName — он зашит на ext='jpg'.
function buildKey(productId, type, sourceFile) {
  const ext = (path.extname(sourceFile).slice(1) || 'jpg').toLowerCase();
  return `products/${sanitize(productId)}/${type}/${uuidv4()}.${ext}`;
}

async function uploadFile(localPath, productId, type) {
  const buffer = fs.readFileSync(localPath);
  const key = buildKey(productId, type, localPath);
  const contentType = s3Service.getMimeType(localPath);
  // s3Service.uploadToS3 возвращает публичный URL.
  return await s3Service.uploadToS3(buffer, key, contentType);
}

// ─────────────────────────────────────────────────────────────────
// ОБРАБОТКА ОДНОГО ПК
// ─────────────────────────────────────────────────────────────────

async function processProduct(cfg, sourceRoot) {
  const productDir = path.join(sourceRoot, cfg.folderRel);
  const productName = `${cfg.line} ${cfg.num}`;
  const productId = `PC-${cfg.line}-${cfg.num}`; // напр. PC-PHANTOM-1

  if (!fs.existsSync(productDir)) {
    throw new Error(`папка не найдена: ${productDir}`);
  }

  console.log(`\n📦 ${productName} (${cfg.category})`);

  // 1. Конфиг + ссылки
  const specs = parseConfig(findConfigText(productDir));
  const { videoUrl, fpsVideoUrl } = parseLinks(findLinksText(productDir));
  console.log(`   specs: ${Object.keys(specs).length} полей`);
  if (videoUrl) console.log(`   videoUrl: ${videoUrl}`);
  if (fpsVideoUrl) console.log(`   fpsVideoUrl: ${fpsVideoUrl}`);

  // 2. Картинки
  const mainPath = findMainImage(productDir);
  const fpsPath = findFpsImage(productDir);
  const galleryPaths = findGallery(productDir);

  console.log(`   main: ${mainPath ? path.basename(mainPath) : '—'}`);
  console.log(`   fps : ${fpsPath ? path.basename(fpsPath) : '—'}`);
  console.log(`   gallery: ${galleryPaths.length} шт`);

  // 3. Заливка в S3
  let imageUrl = null;
  let fpsImageUrl = null;
  const galleryUrls = [];

  if (mainPath) {
    imageUrl = await uploadFile(mainPath, productId, 'main');
  }
  if (fpsPath) {
    fpsImageUrl = await uploadFile(fpsPath, productId, 'fps');
  }
  for (const p of galleryPaths) {
    const url = await uploadFile(p, productId, 'gallery');
    galleryUrls.push(url);
  }

  return {
    productId,
    name: productName,
    price: PRICES[productName] ?? 0,
    description: null,
    specs: JSON.stringify(specs),
    image: imageUrl,
    fpsImage: fpsImageUrl,
    allImages: galleryUrls.length ? JSON.stringify(galleryUrls) : null,
    videoUrl,
    fpsVideoUrl,
    favoriteRank: FAVORITE_RANKS[productName] ?? 0,
    categoryName: cfg.category, // seed-скрипт мапит в categoryId по имени
  };
}

// ─────────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────────

async function main() {
  if (!s3Service.isConfigured()) {
    console.error('❌ S3 не сконфигурирован. Проверь .env (VK_S3_* и BOT_TOKEN).');
    process.exit(1);
  }

  const sourceRoot = DEFAULT_SOURCE;
  if (!fs.existsSync(sourceRoot)) {
    console.error(`❌ Папка с данными не найдена: ${sourceRoot}`);
    console.error('   Передай путь аргументом или через SOURCE_FOLDER env.');
    process.exit(1);
  }

  console.log(`📁 Источник: ${sourceRoot}`);
  console.log(`☁  S3 bucket: ${process.env.VK_S3_BUCKET_NAME}`);
  console.log(`📦 Товаров: ${PRODUCTS.length}\n`);

  const results = [];
  for (const cfg of PRODUCTS) {
    try {
      const data = await processProduct(cfg, sourceRoot);
      results.push(data);
    } catch (e) {
      console.error(`\n❌ ${cfg.line} ${cfg.num}: ${e.message}`);
      throw e;
    }
  }

  const outPath = path.resolve(__dirname, '..', 'prisma', 'products-data.json');
  fs.writeFileSync(outPath, JSON.stringify(results, null, 2), 'utf8');

  console.log(`\n✅ Готово.`);
  console.log(`   Загружено товаров: ${results.length}`);
  console.log(`   Манифест: ${outPath}`);
  console.log(`\nДальше — на сервере:  node prisma/seed-pcs.js`);
}

main().catch(err => {
  console.error('\n💥 Фатал:', err);
  process.exit(1);
});
