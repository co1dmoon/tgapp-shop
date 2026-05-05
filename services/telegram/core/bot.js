const { Telegraf } = require('telegraf');
const { BOT_TOKEN } = require('./config');
const s3Service = require('../../s3Service');

// Инициализация бота
const initBot = async (webAppUrl) => {
  try {
    console.log('[INIT] Инициализация Telegram бота...');
    
    // Создаем экземпляр бота
    const bot = new Telegraf(BOT_TOKEN);

    // Проверяем конфигурацию S3
    if (!s3Service.isConfigured()) {
      console.warn('⚠️ S3 хранилище не настроено!');
      console.warn('Для загрузки изображений в VK Cloud S3 добавьте в .env:');
      console.warn('VK_S3_ACCESS_KEY_ID=your_access_key');
      console.warn('VK_S3_SECRET_ACCESS_KEY=your_secret_key');
      console.warn('VK_S3_BUCKET_NAME=your_bucket_name');
      console.warn('VK_S3_ENDPOINT=https://hb.bizmrg.com');
      console.warn('VK_S3_REGION=ru-msk');
      console.warn('Бот будет работать, но изображения будут сохраняться как file_id');
    } else {
      console.log('✅ S3 хранилище настроено и готово к работе');
    }

    // Настройка middleware для обработки /cancel
    const { handleCancelCommand } = require('./middlewares');
    bot.use(handleCancelCommand(webAppUrl));

    // Глобальный error-handler: ловим всё, что протекло из action/text/etc.
    // Без него любая необработанная ошибка в хендлере (например, попытка
    // удалить старое сообщение через ctx.deleteMessage()) пробивает
    // polling-loop, бот крашится, контейнер рестартует — юзер видит «всё
    // сломалось». Просто логируем и пытаемся вежливо ответить пользователю.
    bot.catch(async (err, ctx) => {
      const where = ctx?.updateType ? `[${ctx.updateType}]` : '';
      console.error(`[BOT.CATCH] ${where} Ошибка в обработчике:`, err?.message || err);
      console.error(err?.stack || err);
      try {
        if (ctx?.callbackQuery) await ctx.answerCbQuery('Что-то пошло не так. Попробуй ещё раз.', { show_alert: false });
        if (ctx?.chat) await ctx.reply('⚠️ Внутренняя ошибка. Попробуй ещё раз или /admin.');
      } catch (_) { /* и здесь могло упасть — игнорим */ }
    });

    console.log(`[INIT] Telegram бот готов к настройке обработчиков`);
    console.log(`[INIT] WebApp URL используется: ${webAppUrl}`);

    return bot;
  } catch (error) {
    console.error('[CRITICAL] Ошибка при инициализации или запуске бота:', error);
    throw error;
  }
};

module.exports = {
  initBot,
}; 