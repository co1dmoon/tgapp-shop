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
  }
}

async function main() {
  try {
    // Создаем категории по разрешениям для ПК
    const categoryFullHD = await prisma.category.create({
      data: {
        name: 'Full HD',
        description: 'Игровые ПК для разрешения 1920x1080',
      },
    });

    const category2K = await prisma.category.create({
      data: {
        name: '2K',
        description: 'Игровые ПК для разрешения 2560x1440',
      },
    });

    const category4K = await prisma.category.create({
      data: {
        name: '4K',
        description: 'Игровые ПК для разрешения 3840x2160',
      },
    });

    // Создаем категории периферии
    const categoryMonitors = await prisma.category.create({
      data: {
        name: 'мониторы',
        description: 'Игровые и профессиональные мониторы',
      },
    });

    const categoryKeyboards = await prisma.category.create({
      data: {
        name: 'клавиатуры',
        description: 'Механические и мембранные клавиатуры',
      },
    });

    const categoryMice = await prisma.category.create({
      data: {
        name: 'игровые мыши',
        description: 'Игровые и офисные мыши',
      },
    });

    const categoryHeadphones = await prisma.category.create({
      data: {
        name: 'наушники',
        description: 'Игровые и музыкальные наушники',
      },
    });

    console.log(
      'Категории созданы:',
      categoryFullHD,
      category2K,
      category4K,
      categoryMonitors,
      categoryKeyboards,
      categoryMice,
      categoryHeadphones
    );

    // Создаем товары для Full HD
    const pcFullHD1 = await prisma.product.create({
      data: {
        id: 1001,
        name: 'GAMING FULL HD PRO',
        price: 85000,
        specs: JSON.stringify({
          Процессор: 'RYZEN 5 7600X',
          Видеокарта: 'RTX 4060',
          Память: '16GB',
          Накопитель: '1TB SSD',
        }),
        categoryId: categoryFullHD.id,
        favoriteRank: 2,
      },
    });

    const pcFullHD2 = await prisma.product.create({
      data: {
        id: 1002,
        name: 'GAMING FULL HD MAX',
        price: 95000,
        specs: JSON.stringify({
          Процессор: 'CORE I5-13600K',
          Видеокарта: 'RTX 4060 TI',
          Память: '16GB',
          Накопитель: '1TB SSD',
        }),
        categoryId: categoryFullHD.id,
        favoriteRank: 1,
      },
    });

    // Создаем товары для 2K
    const pc2K1 = await prisma.product.create({
      data: {
        id: 2001,
        name: 'GAMING 2K PRO',
        price: 120000,
        specs: JSON.stringify({
          Процессор: 'RYZEN 7 7700X',
          Видеокарта: 'RTX 4070',
          Память: '32GB',
          Накопитель: '2TB SSD',
        }),
        categoryId: category2K.id,
        favoriteRank: 2,
      },
    });

    const pc2K2 = await prisma.product.create({
      data: {
        id: 2002,
        name: 'GAMING 2K MAX',
        price: 140000,
        specs: JSON.stringify({
          Процессор: 'CORE I7-13700K',
          Видеокарта: 'RTX 4070 TI',
          Память: '32GB',
          Накопитель: '2TB SSD',
        }),
        categoryId: category2K.id,
        favoriteRank: 1,
      },
    });

    // Создаем товары для 4K
    const pc4K1 = await prisma.product.create({
      data: {
        id: 4001,
        name: 'GAMING 4K PRO',
        price: 180000,
        specs: JSON.stringify({
          Процессор: 'RYZEN 9 7900X',
          Видеокарта: 'RTX 4080',
          Память: '32GB',
          Накопитель: '2TB SSD',
        }),
        categoryId: category4K.id,
        favoriteRank: 2,
      },
    });

    const pc4K2 = await prisma.product.create({
      data: {
        id: 4002,
        name: 'GAMING 4K MAX',
        price: 220000,
        specs: JSON.stringify({
          Процессор: 'CORE I9-13900K',
          Видеокарта: 'RTX 4090',
          Память: '64GB',
          Накопитель: '4TB SSD',
        }),
        categoryId: category4K.id,
        favoriteRank: 1,
      },
    });

    // Создаем товары для мониторов
    const monitor1 = await prisma.product.create({
      data: {
        id: 5001,
        name: 'ASUS TUF VG279Q',
        price: 25000,
        specs: JSON.stringify({
          Диагональ: '27"',
          Разрешение: 'Full HD',
          Частота: '144Hz',
          Матрица: 'IPS',
          Отклик: '1ms',
        }),
        categoryId: categoryMonitors.id,
        favoriteRank: 3,
      },
    });

    const monitor2 = await prisma.product.create({
      data: {
        id: 5002,
        name: 'LG 27GP850-B',
        price: 45000,
        specs: JSON.stringify({
          Диагональ: '27"',
          Разрешение: '2K',
          Частота: '165Hz',
          Матрица: 'Nano IPS',
          Отклик: '1ms',
        }),
        categoryId: categoryMonitors.id,
        favoriteRank: 2,
      },
    });

    const monitor3 = await prisma.product.create({
      data: {
        id: 5003,
        name: 'Samsung Odyssey G7',
        price: 65000,
        specs: JSON.stringify({
          Диагональ: '32"',
          Разрешение: '4K',
          Частота: '144Hz',
          Матрица: 'VA',
          Отклик: '1ms',
        }),
        categoryId: categoryMonitors.id,
        favoriteRank: 1,
      },
    });

    // Создаем товары для клавиатур
    const keyboard1 = await prisma.product.create({
      data: {
        id: 6001,
        name: 'Logitech G Pro X',
        price: 15000,
        specs: JSON.stringify({
          Тип: 'Механическая',
          Подсветка: 'RGB',
          Особенности: 'Hot-swappable',
        }),
        categoryId: categoryKeyboards.id,
        favoriteRank: 2,
      },
    });

    const keyboard2 = await prisma.product.create({
      data: {
        id: 6002,
        name: 'Razer BlackWidow V3',
        price: 18000,
        specs: JSON.stringify({
          Тип: 'Механическая',
          Подсветка: 'RGB',
          Переключатели: 'Green Switches',
        }),
        categoryId: categoryKeyboards.id,
        favoriteRank: 1,
      },
    });

    // Создаем товары для мышей
    const mouse1 = await prisma.product.create({
      data: {
        id: 7001,
        name: 'Logitech G Pro X Superlight',
        price: 12000,
        specs: JSON.stringify({
          Подключение: 'Беспроводная',
          Разрешение: '25K DPI',
          Вес: '70g',
        }),
        categoryId: categoryMice.id,
        favoriteRank: 2,
      },
    });

    const mouse2 = await prisma.product.create({
      data: {
        id: 7002,
        name: 'Razer DeathAdder V3 Pro',
        price: 14000,
        specs: JSON.stringify({
          Подключение: 'Беспроводная',
          Разрешение: '30K DPI',
          Вес: '63g',
        }),
        categoryId: categoryMice.id,
        favoriteRank: 1,
      },
    });

    // Создаем товары для наушников
    const headphones1 = await prisma.product.create({
      data: {
        id: 8001,
        name: 'SteelSeries Arctis Pro',
        price: 20000,
        specs: JSON.stringify({
          Подключение: 'Беспроводные',
          Звук: '7.1 Surround',
          Автономность: '40 часов работы',
        }),
        categoryId: categoryHeadphones.id,
        favoriteRank: 1,
      },
    });

    const headphones2 = await prisma.product.create({
      data: {
        id: 8002,
        name: 'HyperX Cloud II',
        price: 15000,
        specs: JSON.stringify({
          Подключение: 'Проводные',
          Звук: '7.1 Surround',
          Микрофон: 'съемный микрофон',
        }),
        categoryId: categoryHeadphones.id,
        favoriteRank: 2,
      },
    });

    console.log(
      'Товары созданы:',
      pcFullHD1,
      pcFullHD2,
      pc2K1,
      pc2K2,
      pc4K1,
      pc4K2,
      monitor1,
      monitor2,
      monitor3,
      keyboard1,
      keyboard2,
      mouse1,
      mouse2,
      headphones1,
      headphones2
    );

    console.log('База данных успешно заполнена');

    // Вызываем функцию создания тестовых заказов
    await seedOrders();
  } catch (error) {
    console.error('Ошибка при заполнении базы данных:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
