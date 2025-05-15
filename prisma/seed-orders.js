const { PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient();

async function seedOrders() {
  try {
    console.log('Начинаем создание тестовых заказов...');

    // Получаем всех пользователей
    const users = await prisma.user.findMany();
    console.log(`Найдено ${users.length} пользователей`);

    if (users.length === 0) {
      console.log('Нет пользователей для создания заказов. Пропускаем.');
      return;
    }

    // Получаем все продукты
    const products = await prisma.product.findMany();
    console.log(`Найдено ${products.length} продуктов`);

    if (products.length === 0) {
      console.log('Нет продуктов для создания заказов. Пропускаем.');
      return;
    }

    // Возможные статусы заказов
    const statuses = [
      'new',
      'processing',
      'paid',
      'confirmed',
      'shipped',
      'delivered',
      'completed',
      'cancelled',
    ];

    // Для каждого пользователя создаем заказ
    for (const user of users) {
      // Выбираем случайные 1-3 продукта для заказа
      const orderProducts = [];
      const numProducts = Math.floor(Math.random() * 3) + 1; // 1-3 продукта

      for (let i = 0; i < numProducts; i++) {
        const randomProduct =
          products[Math.floor(Math.random() * products.length)];
        const quantity = Math.floor(Math.random() * 3) + 1; // 1-3 шт.

        // Проверяем, не добавлен ли уже этот продукт
        if (!orderProducts.some((p) => p.productId === randomProduct.id)) {
          orderProducts.push({
            productId: randomProduct.id,
            quantity: quantity,
            price: randomProduct.price,
          });
        }
      }

      // Вычисляем общую сумму
      const total = orderProducts.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );

      // Выбираем случайный статус
      const randomStatus =
        statuses[Math.floor(Math.random() * statuses.length)];

      // Создаем заказ
      const order = await prisma.order.create({
        data: {
          userId: user.telegramId,
          userName:
            `${user.firstName || ''} ${user.lastName || ''}`.trim() ||
            'Тестовый пользователь',
          total: total,
          status: randomStatus,
          userModelId: user.id,
          items: {
            create: orderProducts.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.price,
            })),
          },
        },
        include: {
          items: true,
        },
      });

      console.log(
        `Создан тестовый заказ #${order.id} для пользователя ${user.telegramId} со статусом ${randomStatus}`
      );
    }

    console.log('Тестовые заказы успешно созданы!');
  } catch (error) {
    console.error('Ошибка при создании тестовых заказов:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Запускаем функцию создания тестовых заказов
seedOrders();
