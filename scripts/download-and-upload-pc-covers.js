/**
 * Скачивает тильдовские обложки PC-категорий, ресайзит до 1200px webp q85
 * и заливает в наш S3. Обновляет covers-data.json.
 *
 * Запуск: node scripts/download-and-upload-pc-covers.js
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });
const s3Service = require('../services/s3Service');

const TILDA_COVERS = {
  'Full HD': 'https://static.tildacdn.com/tild3433-3839-4236-b264-383363353261/FULL_HD_2.jpg',
  '2K':      'https://static.tildacdn.com/tild6365-6662-4265-a133-663634666361/2k_2.jpg',
  '4K':      'https://static.tildacdn.com/tild3433-3639-4335-b233-333866326239/4k_2.jpg',
};

function sanitize(name) {
  return String(name).toLowerCase()
    .replace(/[^a-zа-я0-9\-_]/g, '_')
    .replace(/_{2,}/g, '_')
    .replace(/^_|_$/g, '');
}

async function processOne(catName, url) {
  console.log(`\n📥 ${catName} ← ${url}`);
  const resp = await axios.get(url, { responseType: 'arraybuffer' });
  const orig = Buffer.from(resp.data);
  console.log(`   downloaded: ${(orig.length / 1024).toFixed(0)}KB`);

  const resized = await sharp(orig)
    .resize({ width: 1200, withoutEnlargement: true })
    .webp({ quality: 85 })
    .toBuffer();
  console.log(`   resized: ${(resized.length / 1024).toFixed(0)}KB`);

  const key = `categories/${sanitize(catName)}/cover/${uuidv4()}.webp`;
  const publicUrl = await s3Service.uploadToS3(resized, key, 'image/webp');
  return publicUrl;
}

async function main() {
  if (!s3Service.isConfigured()) {
    console.error('❌ S3 не сконфигурирован.');
    process.exit(1);
  }

  const coversPath = path.resolve(__dirname, '..', 'prisma', 'covers-data.json');
  const covers = fs.existsSync(coversPath)
    ? JSON.parse(fs.readFileSync(coversPath, 'utf8'))
    : { pcCovers: {}, accessoryCovers: {} };

  for (const [catName, url] of Object.entries(TILDA_COVERS)) {
    const publicUrl = await processOne(catName, url);
    covers.pcCovers[catName] = {
      ...(covers.pcCovers[catName] || {}),
      url: publicUrl,
      source: 'tilda',
    };
  }

  fs.writeFileSync(coversPath, JSON.stringify(covers, null, 2), 'utf8');
  console.log(`\n💾 ${coversPath} обновлён`);
}

main().catch(e => { console.error('💥', e); process.exit(1); });
