/**
 * Форматирует цену в нужный формат с валютой
 * @param price Цена в числовом формате
 * @param currencySymbol Символ валюты (по умолчанию ₽)
 * @returns Отформатированная строка с ценой
 */
export function formatPrice(price: number, currencySymbol = '₽'): string {
  return `${price.toLocaleString('ru-RU')} ${currencySymbol}`;
}

/**
 * Форматирует цену с добавлением налога 10% и форматирует в нужный формат
 * @param price Цена в числовом формате без налога
 * @param currencySymbol Символ валюты (по умолчанию ₽)
 * @returns Отформатированная строка с ценой, включающей налог
 */
export function formatPriceWithTax(price: number, currencySymbol = '₽'): string {
  const priceWithTax = price * 1.1;
  return formatPrice(priceWithTax, currencySymbol);
}

/**
 * Форматирует дату в локальный формат
 * @param dateString Строка с датой или объект Date
 * @returns Отформатированная строка с датой
 */
export function formatDate(dateString: string | Date): string {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  return date.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

/**
 * Обрезает длинный текст и добавляет многоточие
 * @param text Исходный текст
 * @param maxLength Максимальная длина (по умолчанию 100)
 * @returns Обрезанный текст с многоточием если нужно
 */
export function truncateText(text: string, maxLength = 100): string {
  if (!text || text.length <= maxLength) {
    return text;
  }
  return text.substring(0, maxLength) + '...';
} 

