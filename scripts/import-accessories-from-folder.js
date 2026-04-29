/**
 * Импорт аксессуаров (клавы/мышки/наушники/микрофоны/мониторы/коврики) в S3 + манифест.
 *
 * Структура источника `аксессуары для ТГ/`:
 *   <тип>/[<подкатегория>/]<имя товара>/
 *     Текстовый документ.txt       ← имя на 1й строке, цена на 2й (NN NNNр.), specs ниже как "ключ: значение"
 *     <hash>.png.webp              ← одна или несколько картинок
 *
 * UID'ы товаров берём из `UID Аксессуары.xlsx` (выгружен в scripts/uid-data.json).
 * Сопоставление folder-name ↔ xlsx-title — нормализованным сравнением (без пробелов/слэшей/регистра).
 *
 * Категория-обложка (Category.image) берётся из `аксессуары для ТГ/заглавные фотки/<имя>.jpg`.
 *
 * На выходе — `prisma/accessories-data.json` для seed-accessories.js на сервере.
 *
 * Запуск:
 *   node scripts/import-accessories-from-folder.js [абсолютный путь к "РАБОТА С ТГ МАГАЗОМ"]
 */

const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });
const s3Service = require('../services/s3Service');

// ─────────────────────────────────────────────────────────────────
// НАСТРОЙКИ
// ─────────────────────────────────────────────────────────────────

const SOURCE_ROOT = process.argv[2]
  || process.env.SOURCE_FOLDER
  || path.resolve(__dirname, '..', 'РАБОТА С ТГ МАГАЗОМ');

const ACCESSORIES_ROOT = path.join(SOURCE_ROOT, 'аксессуары для ТГ');
const UID_DATA_PATH = path.resolve(__dirname, 'uid-data.json');

// type → { folder в источнике, имя категории в БД, имя листа в xlsx, подпапки или null,
//          ключ для категория-обложки, prefix для productId }
const TYPES = [
  {
    type: 'keyboard',
    sourceFolder: 'клавиатуры',
    dbCategory: 'клавиатуры',
    sheetName: 'Клавиатуры',
    subFolders: ['беспроводныен', 'проводные'],
    coverImage: 'Клава с подсветкой.jpg',
  },
  {
    type: 'mouse',
    sourceFolder: 'мышки',
    dbCategory: 'мыши',
    sheetName: 'Мыши',
    subFolders: ['БЕСПРОВОДНЫЕ', 'ПРОВОДНЫЕ'],
    coverImage: 'Мышь с подсветкой.jpg',
  },
  {
    type: 'headphone',
    sourceFolder: 'наушники',
    dbCategory: 'наушники',
    sheetName: 'Наушники',
    subFolders: ['БЕСПРОВОДНЫЕ', 'ПРОВОДНЫЕ'],
    coverImage: 'Наушкники с подсветкой.jpg', // да, в исходнике опечатка
  },
  {
    type: 'mic',
    sourceFolder: 'микрофоны',
    dbCategory: 'микрофоны',
    sheetName: 'Микрофоны',
    subFolders: null, // плоско
    coverImage: 'Микрофон с подсветкой.jpg',
  },
  {
    type: 'monitor',
    sourceFolder: 'мониторы',
    dbCategory: 'мониторы',
    sheetName: 'Мониторы',
    subFolders: ['2k', '4k', 'full hd'],
    coverImage: 'Монитор с подсветкой.jpg',
  },
  {
    type: 'pad',
    sourceFolder: 'коврики',
    dbCategory: 'коврики',
    sheetName: 'Ковры',
    subFolders: null,
    coverImage: 'Коврик с подсветкой.jpg',
  },
];

// Описания категорий — для первичного создания (Category.description).
const CATEGORY_DESCRIPTIONS = {
  'клавиатуры': 'Игровые механические и мембранные клавиатуры',
  'мыши': 'Игровые мыши, проводные и беспроводные',
  'наушники': 'Игровые наушники',
  'микрофоны': 'Игровые и стримерские микрофоны',
  'мониторы': 'Игровые мониторы',
  'коврики': 'Игровые коврики для мыши',
};

// ─────────────────────────────────────────────────────────────────
// ВСПОМОГАТЕЛЬНОЕ
// ─────────────────────────────────────────────────────────────────

function norm(s) {
  return String(s).toLowerCase().replace(/[^a-zа-яё0-9]/gi, '');
}

function sanitize(name) {
  return String(name).toLowerCase()
    .replace(/[^a-zа-я0-9\-_]/g, '_')
    .replace(/_{2,}/g, '_')
    .replace(/^_|_$/g, '');
}

const IMG_RE = /\.(jpe?g|png|webp)$/i;

function listFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter(f => fs.statSync(path.join(dir, f)).isFile()).sort();
}

function listSubdirs(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter(f => fs.statSync(path.join(dir, f)).isDirectory()).sort();
}

function buildKey(productId, type, sourceFile) {
  const ext = (path.extname(sourceFile).slice(1) || 'jpg').toLowerCase();
  return `accessories/${sanitize(productId)}/${type}/${uuidv4()}.${ext}`;
}

async function uploadFile(localPath, productId, type) {
  const buffer = fs.readFileSync(localPath);
  const key = buildKey(productId, type, localPath);
  const contentType = s3Service.getMimeType(localPath);
  return await s3Service.uploadToS3(buffer, key, contentType);
}

async function uploadCategoryCover(localPath, dbCategory) {
  const ext = (path.extname(localPath).slice(1) || 'jpg').toLowerCase();
  const key = `categories/${sanitize(dbCategory)}/cover/${uuidv4()}.${ext}`;
  const buffer = fs.readFileSync(localPath);
  const contentType = s3Service.getMimeType(localPath);
  return await s3Service.uploadToS3(buffer, key, contentType);
}

// ─────────────────────────────────────────────────────────────────
// ПАРСЕР Текстовый документ.txt
// ─────────────────────────────────────────────────────────────────

// Нормальный формат:
//   <название>           (1)
//   <цена>р.              (2)
//   <key>: <value>        (3+)
//
// Реверс встречается у MSI Vigor GK20 / A4Tech Bloody Q100 — specs первыми, а
// название с ценой в конце. Цена бывает в виде "2590руб" вместо "2 890р.".
//
// Бывают specs без двоеточий ("Разрешение датчика 12000 dpi"). Для таких файлов
// у нас второй проход с словарём ключей, собранным с уже распаршенных файлов.

const PRICE_RE = /^([\d\s]+)\s*р(уб)?\.?$/i;

function isPriceLine(line) {
  return PRICE_RE.test(line);
}

function isSpecLine(line) {
  // строка с ":" или, очевидно, не похожая на название (без латиницы и без типичного начала имени)
  return line.includes(':');
}

function parsePrice(line) {
  const m = line.match(PRICE_RE);
  if (!m) return 0;
  const n = parseInt(m[1].replace(/\s+/g, ''), 10);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

function parseAccessoryText(text, vocabulary = null) {
  const lines = text.split(/\r?\n/).map(l => l.trim());
  const nonEmpty = lines.filter(l => l.length > 0);
  if (nonEmpty.length < 2) return { name: '', price: 0, specs: {} };

  // 1. Цена — первая строка, у которой формат "число + р/руб".
  let priceIdx = -1, price = 0;
  for (let i = 0; i < nonEmpty.length; i++) {
    if (isPriceLine(nonEmpty[i])) {
      price = parsePrice(nonEmpty[i]);
      priceIdx = i;
      break;
    }
  }

  // 2. Имя — строка рядом с ценой, без ":" и не сама цена.
  //    Если цены нет — берём первую строку без ":".
  let name = '';
  const candidate = (i) => i >= 0 && i < nonEmpty.length
    && !isPriceLine(nonEmpty[i])
    && !isSpecLine(nonEmpty[i])
    ? nonEmpty[i] : null;
  if (priceIdx >= 0) {
    name = candidate(priceIdx - 1) || candidate(priceIdx + 1) || '';
  }
  if (!name) {
    for (const line of nonEmpty) {
      if (!isPriceLine(line) && !isSpecLine(line)) { name = line; break; }
    }
  }

  // 3. Specs — все остальные непустые строки (кроме name и price).
  const specs = {};
  for (const line of nonEmpty) {
    if (line === name) continue;
    if (isPriceLine(line)) continue;

    // 3a. Стандарт: "ключ: значение"
    const colon = line.indexOf(':');
    if (colon > 0) {
      const k = line.slice(0, colon).trim();
      const v = line.slice(colon + 1).trim();
      if (k && v) { specs[k] = v; continue; }
    }

    // 3b. Без двоеточия — пробуем словарь известных ключей.
    if (vocabulary) {
      let bestKey = null;
      for (const key of vocabulary) {
        // Ключ должен быть строго в начале строки и оканчиваться пробелом
        if (line.length > key.length
            && line.slice(0, key.length) === key
            && line[key.length] === ' '
            && (!bestKey || key.length > bestKey.length)) {
          bestKey = key;
        }
      }
      if (bestKey) {
        const v = line.slice(bestKey.length).trim();
        if (v) specs[bestKey] = v;
      }
    }
  }

  return { name, price, specs };
}

// ─────────────────────────────────────────────────────────────────
// ОБРАБОТКА ОДНОГО ТОВАРА
// ─────────────────────────────────────────────────────────────────

function readProductTxt(productDir) {
  const txtFiles = listFiles(productDir).filter(f => f.toLowerCase().endsWith('.txt'));
  if (txtFiles.length === 0) {
    throw new Error(`нет .txt с описанием в ${productDir}`);
  }
  return fs.readFileSync(path.join(productDir, txtFiles[0]), 'utf8');
}

async function processProduct(productDir, typeMeta, uidMap, parsed) {
  const folderName = path.basename(productDir);
  const { name: parsedName, price, specs } = parsed;
  const name = parsedName || folderName;

  // ищем UID в xlsx по нормализованному совпадению с папкой ИЛИ с распарсенным именем
  const folderNorm = norm(folderName);
  const nameNorm = norm(name);
  let uid = null;
  let matchedTitle = null;
  for (const [titleNorm, info] of uidMap.entries()) {
    if (titleNorm === folderNorm || titleNorm === nameNorm) {
      uid = info.uid;
      matchedTitle = info.title;
      break;
    }
  }
  if (!uid) {
    // фолбэк: ищем по includes
    for (const [titleNorm, info] of uidMap.entries()) {
      if (titleNorm.includes(folderNorm) || folderNorm.includes(titleNorm)
          || titleNorm.includes(nameNorm) || nameNorm.includes(titleNorm)) {
        uid = info.uid;
        matchedTitle = info.title;
        break;
      }
    }
  }

  const productId = uid ? `ACC-${uid}` : `ACC-${sanitize(folderName).slice(0, 16)}`;

  // Собираем все картинки из папки товара
  const imgFiles = listFiles(productDir).filter(f => IMG_RE.test(f));

  console.log(`  📦 ${folderName}  →  ${productId}`);
  console.log(`     name: ${name}`);
  console.log(`     price: ${price} ₽   uid: ${uid || '— нет в xlsx —'}`);
  if (matchedTitle && matchedTitle !== folderName && matchedTitle !== name) {
    console.log(`     matched-title: ${matchedTitle}`);
  }
  console.log(`     specs: ${Object.keys(specs).length} полей   imgs: ${imgFiles.length}`);

  // Заливка картинок: первая — main, остальные — gallery
  let mainUrl = null;
  const galleryUrls = [];
  for (let i = 0; i < imgFiles.length; i++) {
    const localPath = path.join(productDir, imgFiles[i]);
    if (i === 0) {
      mainUrl = await uploadFile(localPath, productId, 'main');
    } else {
      galleryUrls.push(await uploadFile(localPath, productId, 'gallery'));
    }
  }

  return {
    productId,
    name,
    price,
    description: null,
    specs: Object.keys(specs).length ? JSON.stringify(specs) : null,
    image: mainUrl,
    fpsImage: null,
    allImages: galleryUrls.length ? JSON.stringify(galleryUrls) : null,
    videoUrl: null,
    fpsVideoUrl: null,
    favoriteRank: 0,
    tildaUid: uid,
    categoryName: typeMeta.dbCategory,
    _missingUid: !uid,
  };
}

// ─────────────────────────────────────────────────────────────────
// ОБРАБОТКА ПО ТИПУ (категории)
// ─────────────────────────────────────────────────────────────────

async function processType(typeMeta, uidData) {
  console.log(`\n────────── ${typeMeta.dbCategory.toUpperCase()} ──────────`);

  // Строим карту: norm(title) → {uid, title}
  const sheet = uidData[typeMeta.sheetName];
  if (!sheet) throw new Error(`в xlsx нет листа "${typeMeta.sheetName}"`);
  const uidMap = new Map();
  for (const it of sheet) uidMap.set(norm(it.title), it);
  console.log(`  UID'ов в xlsx: ${uidMap.size}`);

  // Заливаем category cover
  let categoryImageUrl = null;
  if (typeMeta.coverImage) {
    const coverPath = path.join(ACCESSORIES_ROOT, 'заглавные фотки', typeMeta.coverImage);
    if (fs.existsSync(coverPath)) {
      categoryImageUrl = await uploadCategoryCover(coverPath, typeMeta.dbCategory);
      console.log(`  category cover → ${categoryImageUrl}`);
    } else {
      console.warn(`  ⚠ не найдена обложка: ${coverPath}`);
    }
  }

  // Собираем папки товаров
  const typeDir = path.join(ACCESSORIES_ROOT, typeMeta.sourceFolder);
  let productDirs = [];
  if (typeMeta.subFolders) {
    for (const sub of typeMeta.subFolders) {
      const subPath = path.join(typeDir, sub);
      if (!fs.existsSync(subPath)) {
        console.warn(`  ⚠ не найдена подпапка: ${subPath}`);
        continue;
      }
      for (const dirName of listSubdirs(subPath)) {
        productDirs.push(path.join(subPath, dirName));
      }
    }
  } else {
    for (const dirName of listSubdirs(typeDir)) {
      productDirs.push(path.join(typeDir, dirName));
    }
  }

  console.log(`  товаров на диске: ${productDirs.length}`);
  if (productDirs.length !== uidMap.size) {
    console.warn(`  ⚠ количество не сходится с xlsx (${uidMap.size}) — посмотрим, как сматчится`);
  }

  // Pass 1: парсим все .txt без словаря, собираем те, что нашлись (с ":").
  const preParsed = [];
  for (const productDir of productDirs) {
    const txt = readProductTxt(productDir);
    preParsed.push({ productDir, txt, parsed: parseAccessoryText(txt) });
  }

  // Собираем словарь ключей с успешно распарсенных файлов.
  const vocabulary = new Set();
  for (const { parsed } of preParsed) {
    for (const k of Object.keys(parsed.specs)) vocabulary.add(k);
  }

  // Pass 2: для файлов с пустыми specs повторяем парсинг со словарём.
  let recovered = 0;
  for (const item of preParsed) {
    if (Object.keys(item.parsed.specs).length === 0) {
      const reparsed = parseAccessoryText(item.txt, vocabulary);
      if (Object.keys(reparsed.specs).length > 0) {
        item.parsed = reparsed;
        recovered++;
      } else {
        // Имя/цену оставляем из первого парса, но имя могло не определиться без словаря — копируем из reparsed
        if (!item.parsed.name && reparsed.name) item.parsed.name = reparsed.name;
        if (!item.parsed.price && reparsed.price) item.parsed.price = reparsed.price;
      }
    }
  }
  if (recovered > 0) console.log(`  восстановлено через словарь: ${recovered}`);

  // Pass 3: загрузка картинок + сборка манифеста.
  const items = [];
  for (const { productDir, parsed } of preParsed) {
    const item = await processProduct(productDir, typeMeta, uidMap, parsed);
    items.push(item);
  }

  return { items, categoryImageUrl };
}

// ─────────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────────

async function main() {
  if (!s3Service.isConfigured()) {
    console.error('❌ S3 не сконфигурирован. Проверь .env (VK_S3_* и BOT_TOKEN).');
    process.exit(1);
  }
  if (!fs.existsSync(ACCESSORIES_ROOT)) {
    console.error(`❌ Не найден источник: ${ACCESSORIES_ROOT}`);
    process.exit(1);
  }
  if (!fs.existsSync(UID_DATA_PATH)) {
    console.error(`❌ Нет ${UID_DATA_PATH}`);
    console.error('   Запусти: python scripts/dump-uids.py');
    process.exit(1);
  }

  const uidData = JSON.parse(fs.readFileSync(UID_DATA_PATH, 'utf8'));

  console.log(`📁 Источник: ${ACCESSORIES_ROOT}`);
  console.log(`☁  S3 bucket: ${process.env.VK_S3_BUCKET_NAME}\n`);

  const allItems = [];
  const categoryCovers = {};
  let withoutUid = 0;

  for (const typeMeta of TYPES) {
    const { items, categoryImageUrl } = await processType(typeMeta, uidData);
    allItems.push(...items);
    if (categoryImageUrl) categoryCovers[typeMeta.dbCategory] = categoryImageUrl;
    withoutUid += items.filter(x => x._missingUid).length;
  }

  // Очищаем тех. поле перед записью
  for (const it of allItems) delete it._missingUid;

  const outPath = path.resolve(__dirname, '..', 'prisma', 'accessories-data.json');
  fs.writeFileSync(outPath, JSON.stringify({
    items: allItems,
    categoryCovers,
    categoryDescriptions: CATEGORY_DESCRIPTIONS,
  }, null, 2), 'utf8');

  console.log(`\n✅ Готово.`);
  console.log(`   Товаров: ${allItems.length}`);
  console.log(`   Без UID: ${withoutUid}`);
  console.log(`   Категория-обложки: ${Object.keys(categoryCovers).length}`);
  console.log(`   Манифест: ${outPath}`);
}

main().catch(err => {
  console.error('\n💥 Фатал:', err);
  process.exit(1);
});
