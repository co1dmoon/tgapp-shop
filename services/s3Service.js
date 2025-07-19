const { S3Client, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { v4: uuidv4 } = require('uuid');
const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

class S3Service {
  constructor() {
    this.s3Client = new S3Client({
      region: process.env.VK_S3_REGION || 'ru-msk',
      endpoint: process.env.VK_S3_ENDPOINT || 'https://hb.bizmrg.com',
      credentials: {
        accessKeyId: process.env.VK_S3_ACCESS_KEY_ID,
        secretAccessKey: process.env.VK_S3_SECRET_ACCESS_KEY,
      },
      forcePathStyle: true, // Важно для VK Cloud
    });
    
    this.bucketName = process.env.VK_S3_BUCKET_NAME;
    this.telegramToken = process.env.BOT_TOKEN;
  }

  /**
   * Скачивает файл из Telegram по file_id
   * @param {string} fileId - ID файла в Telegram
   * @returns {Promise<Buffer>} - Буфер с данными файла
   */
  async downloadTelegramFile(fileId) {
    try {
      console.log(`Скачиваю файл из Telegram: ${fileId}`);
      
      // Получаем информацию о файле
      const fileInfoResponse = await axios.get(
        `https://api.telegram.org/bot${this.telegramToken}/getFile?file_id=${fileId}`
      );
      
      if (!fileInfoResponse.data.ok) {
        throw new Error(`Ошибка получения информации о файле: ${fileInfoResponse.data.description}`);
      }
      
      const filePath = fileInfoResponse.data.result.file_path;
      
      // Скачиваем файл
      const fileResponse = await axios.get(
        `https://api.telegram.org/file/bot${this.telegramToken}/${filePath}`,
        { responseType: 'arraybuffer' }
      );
      
      console.log(`Файл успешно скачан: ${filePath}`);
      return Buffer.from(fileResponse.data);
      
    } catch (error) {
      console.error('Ошибка при скачивании файла из Telegram:', error);
      throw new Error(`Не удалось скачать файл: ${error.message}`);
    }
  }

  /**
   * Загружает файл в S3
   * @param {Buffer} fileBuffer - Буфер с данными файла
   * @param {string} fileName - Имя файла в S3
   * @param {string} contentType - MIME тип файла
   * @returns {Promise<string>} - Публичная ссылка на файл
   */
  async uploadToS3(fileBuffer, fileName, contentType = 'image/jpeg') {
    try {
      console.log(`Загружаю файл в S3: ${fileName}`);
      
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: fileName,
        Body: fileBuffer,
        ContentType: contentType,
        // Делаем файл публично доступным для чтения
        ACL: 'public-read',
      });

      await this.s3Client.send(command);
      
      // Формируем публичную ссылку
      const publicUrl = `https://${this.bucketName}.${process.env.VK_S3_ENDPOINT?.replace('https://', '') || 'hb.bizmrg.com'}/${fileName}`;
      
      console.log(`Файл успешно загружен: ${publicUrl}`);
      return publicUrl;
      
    } catch (error) {
      console.error('Ошибка при загрузке в S3:', error);
      throw new Error(`Не удалось загрузить файл в S3: ${error.message}`);
    }
  }

  /**
   * Определяет MIME тип по расширению файла
   * @param {string} fileName - Имя файла
   * @returns {string} - MIME тип
   */
  getMimeType(fileName) {
    const extension = fileName.toLowerCase().split('.').pop();
    const mimeTypes = {
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'webp': 'image/webp',
      'gif': 'image/gif'
    };
    return mimeTypes[extension] || 'image/jpeg';
  }

  /**
   * Генерирует уникальное имя файла с учетом категории
   * @param {string} categoryName - Название категории
   * @param {number} categoryId - ID категории
   * @param {string} productName - Название товара
   * @param {string} productId - ID товара
   * @param {string} type - Тип изображения (main, fps, additional)
   * @param {number} index - Индекс для дополнительных изображений
   * @returns {string} - Имя файла
   */
  generateFileName(categoryName, categoryId, productName, productId, type, index = null) {
    const uuid = uuidv4();
    const extension = 'jpg'; // По умолчанию используем jpg
    
    // Очищаем названия от специальных символов для безопасных путей
    const safeCategoryName = this.sanitizeFileName(categoryName);
    const safeProductName = this.sanitizeFileName(productName);
    
    // Формируем базовый путь: products/categoryName-categoryId/productName-productId/
    const basePath = `products/${safeCategoryName}-${categoryId}/${safeProductName}-${productId}`;
    
    switch (type) {
      case 'main':
        return `${basePath}/main/image-${uuid}.${extension}`;
      case 'fps':
        return `${basePath}/fps/fps-${uuid}.${extension}`;
      case 'additional':
        return `${basePath}/additional/${index}-${uuid}.${extension}`;
      default:
        return `${basePath}/other/file-${uuid}.${extension}`;
    }
  }

  /**
   * Очищает название файла от специальных символов
   * @param {string} name - Исходное название
   * @returns {string} - Безопасное название для использования в пути
   */
  sanitizeFileName(name) {
    return name
      .toLowerCase()
      .replace(/[^a-zа-я0-9\-_]/g, '_')  // Заменяем спецсимволы на подчеркивания
      .replace(/_{2,}/g, '_')             // Убираем множественные подчеркивания
      .replace(/^_|_$/g, '');             // Убираем подчеркивания в начале и конце
  }

  /**
   * Загружает все изображения товара в S3 с организацией по категориям
   * @param {Object} images - Объект с file_id изображений
   * @param {Object} productInfo - Информация о товаре и категории
   * @returns {Promise<Object>} - Объект с ссылками на загруженные изображения
   */
  async uploadProductImages({ mainImage, fpsImage, additionalImages, productInfo }) {
    const { productId, productName, categoryId, categoryName } = productInfo;
    const results = {};
    const uploadedFiles = []; // Для отката в случае ошибки
    
    try {
      console.log(`Начинаю загрузку изображений для товара ${productName} (ID: ${productId}) в категории ${categoryName} (ID: ${categoryId})`);
      
      // Загружаем основное изображение
      if (mainImage && mainImage !== 'null') {
        console.log('Загружаю основное изображение...');
        const fileBuffer = await this.downloadTelegramFile(mainImage);
        const fileName = this.generateFileName(categoryName, categoryId, productName, productId, 'main');
        const url = await this.uploadToS3(fileBuffer, fileName, this.getMimeType(fileName));
        results.mainImageUrl = url;
        uploadedFiles.push(fileName);
      }
      
      // Загружаем FPS изображение
      if (fpsImage && fpsImage !== 'null') {
        console.log('Загружаю FPS изображение...');
        const fileBuffer = await this.downloadTelegramFile(fpsImage);
        const fileName = this.generateFileName(categoryName, categoryId, productName, productId, 'fps');
        const url = await this.uploadToS3(fileBuffer, fileName, this.getMimeType(fileName));
        results.fpsImageUrl = url;
        uploadedFiles.push(fileName);
      }
      
      // Загружаем дополнительные изображения
      if (additionalImages && additionalImages !== 'null') {
        console.log('Загружаю дополнительные изображения...');
        const fileIds = JSON.parse(additionalImages);
        const additionalUrls = [];
        
        for (let i = 0; i < fileIds.length; i++) {
          const fileBuffer = await this.downloadTelegramFile(fileIds[i]);
          const fileName = this.generateFileName(categoryName, categoryId, productName, productId, 'additional', i + 1);
          const url = await this.uploadToS3(fileBuffer, fileName, this.getMimeType(fileName));
          additionalUrls.push(url);
          uploadedFiles.push(fileName);
        }
        
        results.additionalImagesUrls = JSON.stringify(additionalUrls);
      }
      
      console.log(`Все изображения товара ${productName} успешно загружены в категорию ${categoryName}`);
      return results;
      
    } catch (error) {
      console.error('Ошибка при загрузке изображений:', error);
      
      // Откатываем загруженные файлы
      console.log('Откатываю загруженные файлы...');
      await this.cleanupFiles(uploadedFiles);
      
      throw new Error(`Не удалось загрузить изображения: ${error.message}`);
    }
  }

  /**
   * Удаляет файлы из S3 (для отката операций)
   * @param {string[]} fileNames - Массив имен файлов для удаления
   */
  async cleanupFiles(fileNames) {
    for (const fileName of fileNames) {
      try {
        const command = new DeleteObjectCommand({
          Bucket: this.bucketName,
          Key: fileName,
        });
        await this.s3Client.send(command);
        console.log(`Файл удален: ${fileName}`);
      } catch (error) {
        console.error(`Ошибка при удалении файла ${fileName}:`, error);
      }
    }
  }

  /**
   * Проверяет настройки S3
   * @returns {boolean} - true если настройки корректны
   */
  isConfigured() {
    return !!(
      process.env.VK_S3_ACCESS_KEY_ID &&
      process.env.VK_S3_SECRET_ACCESS_KEY &&
      process.env.VK_S3_BUCKET_NAME &&
      this.telegramToken
    );
  }
}

module.exports = new S3Service(); 