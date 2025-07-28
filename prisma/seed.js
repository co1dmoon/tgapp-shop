const { PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient();

async function main() {
  try {
    // Создаем категории
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

    // ПК
    await prisma.product.create({
      data: {
        productId: 'PC-FHD-PRO-001',
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
    await prisma.product.create({
      data: {
        productId: 'PC-FHD-MAX-001',
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
    await prisma.product.create({
      data: {
        productId: 'PC-2K-PRO-001',
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
    await prisma.product.create({
      data: {
        productId: 'PC-2K-MAX-001',
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
    await prisma.product.create({
      data: {
        productId: 'PC-4K-PRO-001',
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
    await prisma.product.create({
      data: {
        productId: 'PC-4K-MAX-001',
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

    // Мониторы (примерно 18 штук, все с productId)
    const monitors = [
      { productId: 'MON-ASUS-001', name: 'ASUS TUF VG279Q', price: 25000, specs: { Диагональ: '27"', Разрешение: 'Full HD', Частота: '144Hz', Матрица: 'IPS', Отклик: '1ms' }, favoriteRank: 3 },
      { productId: 'MON-LG-001', name: 'LG 27GP850-B', price: 45000, specs: { Диагональ: '27"', Разрешение: '2K', Частота: '165Hz', Матрица: 'Nano IPS', Отклик: '1ms' }, favoriteRank: 2 },
      { productId: 'MON-SAMSUNG-001', name: 'Samsung Odyssey G7', price: 65000, specs: { Диагональ: '32"', Разрешение: '4K', Частота: '144Hz', Матрица: 'VA', Отклик: '1ms' }, favoriteRank: 1 },
      { productId: 'MON-ASUS-002', name: 'ASUS ROG Swift PG259QN', price: 55000, specs: { Диагональ: '25"', Разрешение: 'Full HD', Частота: '360Hz', Матрица: 'IPS', Отклик: '1ms' }, favoriteRank: 0 },
      { productId: 'MON-DELL-001', name: 'Dell Alienware AW3420DW', price: 75000, specs: { Диагональ: '34"', Разрешение: 'UWQHD', Частота: '120Hz', Матрица: 'IPS', Отклик: '2ms' }, favoriteRank: 0 },
      { productId: 'MON-AOC-001', name: 'AOC 24G2U', price: 18000, specs: { Диагональ: '24"', Разрешение: 'Full HD', Частота: '144Hz', Матрица: 'IPS', Отклик: '1ms' }, favoriteRank: 0 },
      { productId: 'MON-MSI-001', name: 'MSI Optix MAG274QRF-QD', price: 42000, specs: { Диагональ: '27"', Разрешение: '2K', Частота: '165Hz', Матрица: 'IPS', Отклик: '1ms' }, favoriteRank: 0 },
      { productId: 'MON-BENQ-001', name: 'BenQ ZOWIE XL2546K', price: 48000, specs: { Диагональ: '25"', Разрешение: 'Full HD', Частота: '240Hz', Матрица: 'TN', Отклик: '0.5ms' }, favoriteRank: 0 },
      { productId: 'MON-VIEWSONIC-001', name: 'ViewSonic Elite XG270QG', price: 52000, specs: { Диагональ: '27"', Разрешение: '2K', Частота: '165Hz', Матрица: 'IPS', Отклик: '1ms' }, favoriteRank: 0 },
      { productId: 'MON-ACER-001', name: 'Acer Predator X27', price: 95000, specs: { Диагональ: '27"', Разрешение: '4K', Частота: '144Hz', Матрица: 'IPS', Отклик: '4ms' }, favoriteRank: 0 },
      { productId: 'MON-GIGABYTE-001', name: 'GIGABYTE M27Q', price: 35000, specs: { Диагональ: '27"', Разрешение: '2K', Частота: '170Hz', Матрица: 'IPS', Отклик: '0.5ms' }, favoriteRank: 0 },
      { productId: 'MON-HP-001', name: 'HP OMEN 27i', price: 38000, specs: { Диагональ: '27"', Разрешение: '2K', Частота: '165Hz', Матрица: 'IPS', Отклик: '1ms' }, favoriteRank: 0 },
      { productId: 'MON-XIAOMI-001', name: 'Xiaomi Mi Curved Gaming', price: 28000, specs: { Диагональ: '34"', Разрешение: 'UWQHD', Частота: '144Hz', Матрица: 'VA', Отклик: '4ms' }, favoriteRank: 0 },
      { productId: 'MON-PHILIPS-001', name: 'Philips 276E8VJSB', price: 22000, specs: { Диагональ: '27"', Разрешение: '4K', Частота: '60Hz', Матрица: 'IPS', Отклик: '5ms' }, favoriteRank: 0 },
      { productId: 'MON-IIYAMA-001', name: 'iiyama ProLite XUB2792QSU', price: 32000, specs: { Диагональ: '27"', Разрешение: '2K', Частота: '75Hz', Матрица: 'IPS', Отклик: '4ms' }, favoriteRank: 0 },
      { productId: 'MON-ASUS-003', name: 'ASUS TUF Gaming VG32VQ', price: 40000, specs: { Диагональ: '32"', Разрешение: '2K', Частота: '144Hz', Матрица: 'VA', Отклик: '1ms' }, favoriteRank: 0 },
      { productId: 'MON-LG-002', name: 'LG UltraGear 38GN950', price: 85000, specs: { Диагональ: '38"', Разрешение: 'UWQHD+', Частота: '160Hz', Матрица: 'Nano IPS', Отклик: '1ms' }, favoriteRank: 0 },
      { productId: 'MON-SAMSUNG-002', name: 'Samsung Odyssey G9', price: 120000, specs: { Диагональ: '49"', Разрешение: 'Dual QHD', Частота: '240Hz', Матрица: 'VA', Отклик: '1ms' }, favoriteRank: 0 },
    ];
    for (const m of monitors) {
      await prisma.product.create({
        data: {
          productId: m.productId,
          name: m.name,
          price: m.price,
          specs: JSON.stringify(m.specs),
          categoryId: categoryMonitors.id,
          favoriteRank: m.favoriteRank,
        },
      });
    }

    // Клавиатуры
    await prisma.product.create({
      data: {
        productId: 'KEY-LOGITECH-001',
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
    await prisma.product.create({
      data: {
        productId: 'KEY-RAZER-001',
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

    // Мыши
    await prisma.product.create({
      data: {
        productId: 'MOUSE-LOGITECH-001',
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
    await prisma.product.create({
      data: {
        productId: 'MOUSE-RAZER-001',
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

    // Наушники
    await prisma.product.create({
      data: {
        productId: 'HEAD-STEELSERIES-001',
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
    await prisma.product.create({
      data: {
        productId: 'HEAD-HYPERX-001',
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

    console.log('База данных успешно заполнена');
  } catch (error) {
    console.error('Ошибка при заполнении базы данных:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
