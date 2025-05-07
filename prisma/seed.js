const { PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient();

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

    console.log('Категории созданы:', categoryFullHD, category2K, category4K, categoryMonitors, categoryKeyboards, categoryMice, categoryHeadphones);

    // Создаем товары для Full HD
    const pcFullHD1 = await prisma.product.create({
      data: {
        name: 'GAMING FULL HD PRO',
        price: 85000,
        specs: 'RYZEN 5 7600X, RTX 4060, 16GB RAM, 1TB SSD',
        categoryId: categoryFullHD.id,
        favoriteRank: 2,
      },
    });

    const pcFullHD2 = await prisma.product.create({
      data: {
        name: 'GAMING FULL HD MAX',
        price: 95000,
        specs: 'CORE I5-13600K, RTX 4060 TI, 16GB RAM, 1TB SSD',
        categoryId: categoryFullHD.id,
        favoriteRank: 1,
      },
    });

    // Создаем товары для 2K
    const pc2K1 = await prisma.product.create({
      data: {
        name: 'GAMING 2K PRO',
        price: 120000,
        specs: 'RYZEN 7 7700X, RTX 4070, 32GB RAM, 2TB SSD',
        categoryId: category2K.id,
        favoriteRank: 2,
      },
    });

    const pc2K2 = await prisma.product.create({
      data: {
        name: 'GAMING 2K MAX',
        price: 140000,
        specs: 'CORE I7-13700K, RTX 4070 TI, 32GB RAM, 2TB SSD',
        categoryId: category2K.id,
        favoriteRank: 1,
      },
    });

    // Создаем товары для 4K
    const pc4K1 = await prisma.product.create({
      data: {
        name: 'GAMING 4K PRO',
        price: 180000,
        specs: 'RYZEN 9 7900X, RTX 4080, 32GB RAM, 2TB SSD',
        categoryId: category4K.id,
        favoriteRank: 2,
      },
    });

    const pc4K2 = await prisma.product.create({
      data: {
        name: 'GAMING 4K MAX',
        price: 220000,
        specs: 'CORE I9-13900K, RTX 4090, 64GB RAM, 4TB SSD',
        categoryId: category4K.id,
        favoriteRank: 1,
      },
    });

    // Создаем товары для мониторов
    const monitor1 = await prisma.product.create({
      data: {
        name: 'ASUS TUF VG279Q',
        price: 25000,
        specs: '27" Full HD, 144Hz, IPS, 1ms',
        categoryId: categoryMonitors.id,
        favoriteRank: 3,
      },
    });

    const monitor2 = await prisma.product.create({
      data: {
        name: 'LG 27GP850-B',
        price: 45000,
        specs: '27" 2K, 165Hz, Nano IPS, 1ms',
        categoryId: categoryMonitors.id,
        favoriteRank: 2,
      },
    });

    const monitor3 = await prisma.product.create({
      data: {
        name: 'Samsung Odyssey G7',
        price: 65000,
        specs: '32" 4K, 144Hz, VA, 1ms',
        categoryId: categoryMonitors.id,
        favoriteRank: 1,
      },
    });

    // Создаем товары для клавиатур
    const keyboard1 = await prisma.product.create({
      data: {
        name: 'Logitech G Pro X',
        price: 15000,
        specs: 'Механическая, RGB, Hot-swappable',
        categoryId: categoryKeyboards.id,
        favoriteRank: 2,
      },
    });

    const keyboard2 = await prisma.product.create({
      data: {
        name: 'Razer BlackWidow V3',
        price: 18000,
        specs: 'Механическая, RGB, Green Switches',
        categoryId: categoryKeyboards.id,
        favoriteRank: 1,
      },
    });

    // Создаем товары для мышей
    const mouse1 = await prisma.product.create({
      data: {
        name: 'Logitech G Pro X Superlight',
        price: 12000,
        specs: 'Беспроводная, 25K DPI, 70g',
        categoryId: categoryMice.id,
        favoriteRank: 2,
      },
    });

    const mouse2 = await prisma.product.create({
      data: {
        name: 'Razer DeathAdder V3 Pro',
        price: 14000,
        specs: 'Беспроводная, 30K DPI, 63g',
        categoryId: categoryMice.id,
        favoriteRank: 1,
      },
    });

    // Создаем товары для наушников
    const headphones1 = await prisma.product.create({
      data: {
        name: 'SteelSeries Arctis Pro',
        price: 20000,
        specs: 'Беспроводные, 7.1 Surround, 40 часов работы',
        categoryId: categoryHeadphones.id,
        favoriteRank: 1,
      },
    });

    const headphones2 = await prisma.product.create({
      data: {
        name: 'HyperX Cloud II',
        price: 15000,
        specs: 'Проводные, 7.1 Surround, съемный микрофон',
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
  } catch (error) {
    console.error('Ошибка при заполнении базы данных:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
