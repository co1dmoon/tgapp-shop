// Утилиты для работы с клавиатурами
const createKeyboardRows = (buttons, buttonsPerRow = 2) => {
  const keyboardRows = [];
  for (let i = 0; i < buttons.length; i += buttonsPerRow) {
    keyboardRows.push(buttons.slice(i, i + buttonsPerRow));
  }
  return keyboardRows;
};

// Утилиты для валидации
const validateText = (text, minLength, maxLength) => {
  if (!text || text.trim().length < minLength) {
    return { isValid: false, error: `Текст должен содержать минимум ${minLength} символов.` };
  }
  if (text.length > maxLength) {
    return { isValid: false, error: `Текст не должен превышать ${maxLength} символов.` };
  }
  return { isValid: true };
};

const validateNumber = (text, min = 0, max = Infinity) => {
  const number = parseFloat(text.replace(/\s/g, '').replace(',', '.'));
  if (isNaN(number)) {
    return { isValid: false, error: 'Введите корректное число.' };
  }
  if (number <= min) {
    return { isValid: false, error: `Число должно быть больше ${min}.` };
  }
  if (number > max) {
    return { isValid: false, error: `Число не должно превышать ${max}.` };
  }
  return { isValid: true, value: number };
};

const validateId = (text) => {
  const id = parseInt(text);
  if (isNaN(id) || id <= 0) {
    return { isValid: false, error: 'ID должен быть положительным числом.' };
  }
  return { isValid: true, value: id };
};

// Утилиты для работы с изображениями
const validateImageType = (mimeType, supportedTypes) => {
  return supportedTypes.includes(mimeType?.toLowerCase());
};

const validateFileSize = (fileSize, maxSize) => {
  return fileSize <= maxSize;
};

// Утилиты для форматирования
const formatPrice = (price) => {
  return price.toLocaleString('ru-RU') + ' ₽';
};

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('ru-RU');
};

const formatDateTime = (date) => {
  return new Date(date).toLocaleString('ru-RU');
};

// Утилиты для обработки спецификаций
const parseSpecsFromText = (text) => {
  try {
    const specsObj = {};
    const pairs = text.split('\n').map(pair => pair.trim()).filter(pair => pair);
    
    if (pairs.length === 0) {
      throw new Error('Пустые характеристики');
    }
    
    for (const pair of pairs) {
      const colonIndex = pair.indexOf(':');
      if (colonIndex === -1) {
        throw new Error(`Некорректная строка "${pair}". Используйте формат "ключ: значение"`);
      }
      
      const key = pair.substring(0, colonIndex).trim();
      const value = pair.substring(colonIndex + 1).trim();
      
      if (!key || !value) {
        throw new Error(`Некорректная строка "${pair}". Ключ и значение не должны быть пустыми`);
      }
      
      specsObj[key] = value;
    }
    
    return { success: true, specs: JSON.stringify(specsObj) };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const formatSpecsForDisplay = (specsJson) => {
  try {
    if (!specsJson) return 'Не указаны';
    const specs = JSON.parse(specsJson);
    return Object.entries(specs)
      .map(([key, value]) => `• ${key}: ${value}`)
      .join('\n');
  } catch (e) {
    return specsJson; // Возвращаем как есть, если не JSON
  }
};

// Утилиты для пагинации
const getPaginationInfo = (items, page, itemsPerPage) => {
  const totalPages = Math.ceil(items.length / itemsPerPage);
  const currentPage = Math.max(0, Math.min(page, totalPages - 1));
  const startIndex = currentPage * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const pageItems = items.slice(startIndex, endIndex);
  
  return {
    totalPages,
    currentPage,
    startIndex,
    endIndex,
    pageItems,
    hasNextPage: currentPage < totalPages - 1,
    hasPrevPage: currentPage > 0
  };
};

// Утилиты для безопасного выполнения асинхронных операций
const safeAsync = async (asyncFn, errorMessage = 'Произошла ошибка') => {
  try {
    return await asyncFn();
  } catch (error) {
    console.error(errorMessage, error);
    throw new Error(errorMessage);
  }
};

// Утилиты для задержки
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Валидация цены
const validatePrice = (priceText) => {
  const cleanedText = priceText.replace(/\s/g, '').replace(',', '.');
  const price = parseFloat(cleanedText);

  if (isNaN(price) || price <= 0) {
    return { isValid: false, price: null };
  }

  return { isValid: true, price };
};

// Валидация характеристик товара
const validateSpecs = (specsText) => {
  try {
    // Преобразуем формат "ключ: значение" (каждая пара с новой строки) в JSON
    const specsObj = {};
    const pairs = specsText.split('\n').map(pair => pair.trim()).filter(pair => pair);
    
    if (pairs.length === 0) {
      throw new Error('Пустые характеристики');
    }
    
    for (const pair of pairs) {
      const colonIndex = pair.indexOf(':');
      if (colonIndex === -1) {
        throw new Error(`Некорректная строка "${pair}". Используйте формат "ключ: значение"`);
      }
      
      const key = pair.substring(0, colonIndex).trim();
      const value = pair.substring(colonIndex + 1).trim();
      
      if (!key || !value) {
        throw new Error(`Некорректная строка "${pair}". Ключ и значение не должны быть пустыми`);
      }
      
      specsObj[key] = value;
    }
    
    return { isValid: true, specs: JSON.stringify(specsObj) };
  } catch (error) {
    return { 
      isValid: false, 
      specs: null,
      error: `❌ Некорректный формат характеристик!\n\nОшибка: ${error.message}\n\nПравильный формат (каждая с новой строки):\nПроцессор: Intel i7\nВидеокарта: RTX 4070\nRAM: 16GB\n\nПопробуйте еще раз или введите "-" для пропуска:\n\n💡 Для отмены введите /cancel`
    };
  }
};

module.exports = {
  createKeyboardRows,
  validateText,
  validateNumber,
  validateId,
  validateImageType,
  validateFileSize,
  formatPrice,
  formatDate,
  formatDateTime,
  parseSpecsFromText,
  formatSpecsForDisplay,
  getPaginationInfo,
  safeAsync,
  delay,
  validatePrice,
  validateSpecs,
}; 