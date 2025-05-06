const { PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient();

async function main() {
  try {
    // Создаем категории
    const category3 = await prisma.category.create({
      data: {
        name: 'Девайсы',
        description: 'Девайсы для игр и работы',
      },
    });
    const category1 = await prisma.category.create({
      data: {
        name: 'Игровые ПК',
        description: 'Мощные компьютеры для современных игр',
      },
    });

    const category2 = await prisma.category.create({
      data: {
        name: 'Рабочие станции',
        description: 'Компьютеры для профессиональной работы',
      },
    });


    console.log('Категории созданы:', category1, category2, category3);

    // Создаем товары
    const product1 = await prisma.product.create({
      data: {
        name: 'TITANIUM PRO',
        price: 168000,
        specs: 'RYZEN 9 7950X, RTX 4070 SUPER, 32GB RAM, 2TB SSD',
        image: 'titanium_pro.jpg',
        categoryId: category1.id,
      },
    });

    const product2 = await prisma.product.create({
      data: {
        name: 'TITANIUM LITE',
        price: 150000,
        specs: 'RYZEN 7 7700X, RTX 4070, 32GB RAM, 1TB SSD',
        image: 'titanium_lite.jpg',
        categoryId: category1.id,
      },
    });

    const product3 = await prisma.product.create({
      data: {
        name: 'DIAMOND PRO',
        price: 175000,
        specs: 'CORE I9-14900K, RTX 4070 TI SUPER, 32GB RAM, 2TB SSD',
        image: 'diamond_pro.jpg',
        categoryId: category1.id,
      },
    });

    const product4 = await prisma.product.create({
      data: {
        name: 'AQUAMARINE',
        price: 225000,
        specs: 'RYZEN 9 7950X, RTX 4080 SUPER, 64GB RAM, 4TB SSD',
        image: 'aquamarine.jpg',
        categoryId: category2.id,
      },
    });

    const product5 = await prisma.product.create({
      data: {
        name: 'WORKSTATION PRO',
        price: 195000,
        specs: 'CORE i9-14900K, RTX 4000 ADA, 128GB RAM, 4TB SSD',
        image: 'workstation_pro.jpg',
        categoryId: category2.id,
      },
    });

    console.log(
      'Товары созданы:',
      product1,
      product2,
      product3,
      product4,
      product5
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
