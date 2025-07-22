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

    // Добавляем еще 15 мониторов для тестирования пагинации
    const monitor4 = await prisma.product.create({
      data: {
        id: 5004,
        name: 'ASUS ROG Swift PG259QN',
        price: 55000,
        specs: JSON.stringify({
          Диагональ: '25"',
          Разрешение: 'Full HD',
          Частота: '360Hz',
          Матрица: 'IPS',
          Отклик: '1ms',
        }),
        categoryId: categoryMonitors.id,
        favoriteRank: 0,
      },
    });

    const monitor5 = await prisma.product.create({
      data: {
        id: 5005,
        name: 'Dell Alienware AW3420DW',
        price: 75000,
        specs: JSON.stringify({
          Диагональ: '34"',
          Разрешение: 'UWQHD',
          Частота: '120Hz',
          Матрица: 'IPS',
          Отклик: '2ms',
        }),
        categoryId: categoryMonitors.id,
        favoriteRank: 0,
      },
    });

    const monitor6 = await prisma.product.create({
      data: {
        id: 5006,
        name: 'AOC 24G2U',
        price: 18000,
        specs: JSON.stringify({
          Диагональ: '24"',
          Разрешение: 'Full HD',
          Частота: '144Hz',
          Матрица: 'IPS',
          Отклик: '1ms',
        }),
        categoryId: categoryMonitors.id,
        favoriteRank: 0,
      },
    });

    const monitor7 = await prisma.product.create({
      data: {
        id: 5007,
        name: 'MSI Optix MAG274QRF-QD',
        price: 42000,
        specs: JSON.stringify({
          Диагональ: '27"',
          Разрешение: '2K',
          Частота: '165Hz',
          Матрица: 'IPS',
          Отклик: '1ms',
        }),
        categoryId: categoryMonitors.id,
        favoriteRank: 0,
      },
    });

    const monitor8 = await prisma.product.create({
      data: {
        id: 5008,
        name: 'BenQ ZOWIE XL2546K',
        price: 48000,
        specs: JSON.stringify({
          Диагональ: '25"',
          Разрешение: 'Full HD',
          Частота: '240Hz',
          Матрица: 'TN',
          Отклик: '0.5ms',
        }),
        categoryId: categoryMonitors.id,
        favoriteRank: 0,
      },
    });

    const monitor9 = await prisma.product.create({
      data: {
        id: 5009,
        name: 'ViewSonic Elite XG270QG',
        price: 52000,
        specs: JSON.stringify({
          Диагональ: '27"',
          Разрешение: '2K',
          Частота: '165Hz',
          Матрица: 'IPS',
          Отклик: '1ms',
        }),
        categoryId: categoryMonitors.id,
        favoriteRank: 0,
      },
    });

    const monitor10 = await prisma.product.create({
      data: {
        id: 5010,
        name: 'Acer Predator X27',
        price: 95000,
        specs: JSON.stringify({
          Диагональ: '27"',
          Разрешение: '4K',
          Частота: '144Hz',
          Матрица: 'IPS',
          Отклик: '4ms',
        }),
        categoryId: categoryMonitors.id,
        favoriteRank: 0,
      },
    });

    const monitor11 = await prisma.product.create({
      data: {
        id: 5011,
        name: 'GIGABYTE M27Q',
        price: 35000,
        specs: JSON.stringify({
          Диагональ: '27"',
          Разрешение: '2K',
          Частота: '170Hz',
          Матрица: 'IPS',
          Отклик: '0.5ms',
        }),
        categoryId: categoryMonitors.id,
        favoriteRank: 0,
      },
    });

    const monitor12 = await prisma.product.create({
      data: {
        id: 5012,
        name: 'HP OMEN 27i',
        price: 38000,
        specs: JSON.stringify({
          Диагональ: '27"',
          Разрешение: '2K',
          Частота: '165Hz',
          Матрица: 'IPS',
          Отклик: '1ms',
        }),
        categoryId: categoryMonitors.id,
        favoriteRank: 0,
      },
    });

    const monitor13 = await prisma.product.create({
      data: {
        id: 5013,
        name: 'Xiaomi Mi Curved Gaming',
        price: 28000,
        specs: JSON.stringify({
          Диагональ: '34"',
          Разрешение: 'UWQHD',
          Частота: '144Hz',
          Матрица: 'VA',
          Отклик: '4ms',
        }),
        categoryId: categoryMonitors.id,
        favoriteRank: 0,
      },
    });

    const monitor14 = await prisma.product.create({
      data: {
        id: 5014,
        name: 'Philips 276E8VJSB',
        price: 22000,
        specs: JSON.stringify({
          Диагональ: '27"',
          Разрешение: '4K',
          Частота: '60Hz',
          Матрица: 'IPS',
          Отклик: '5ms',
        }),
        categoryId: categoryMonitors.id,
        favoriteRank: 0,
      },
    });

    const monitor15 = await prisma.product.create({
      data: {
        id: 5015,
        name: 'iiyama ProLite XUB2792QSU',
        price: 32000,
        specs: JSON.stringify({
          Диагональ: '27"',
          Разрешение: '2K',
          Частота: '75Hz',
          Матрица: 'IPS',
          Отклик: '4ms',
        }),
        categoryId: categoryMonitors.id,
        favoriteRank: 0,
      },
    });

    const monitor16 = await prisma.product.create({
      data: {
        id: 5016,
        name: 'ASUS TUF Gaming VG32VQ',
        price: 40000,
        specs: JSON.stringify({
          Диагональ: '32"',
          Разрешение: '2K',
          Частота: '144Hz',
          Матрица: 'VA',
          Отклик: '1ms',
        }),
        categoryId: categoryMonitors.id,
        favoriteRank: 0,
      },
    });

    const monitor17 = await prisma.product.create({
      data: {
        id: 5017,
        name: 'LG UltraGear 38GN950',
        price: 85000,
        specs: JSON.stringify({
          Диагональ: '38"',
          Разрешение: 'UWQHD+',
          Частота: '160Hz',
          Матрица: 'Nano IPS',
          Отклик: '1ms',
        }),
        categoryId: categoryMonitors.id,
        favoriteRank: 0,
      },
    });

    const monitor18 = await prisma.product.create({
      data: {
        id: 5018,
        name: 'Samsung Odyssey G9',
        price: 120000,
        specs: JSON.stringify({
          Диагональ: '49"',
          Разрешение: 'Dual QHD',
          Частота: '240Hz',
          Матрица: 'VA',
          Отклик: '1ms',
        }),
        categoryId: categoryMonitors.id,
        favoriteRank: 0,
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
