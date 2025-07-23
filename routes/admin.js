const express = require('express');
const router = express.Router();

const categoryController = require('../controllers/categoryController');
const productController = require('../controllers/productController');
// const orderController = require('../controllers/orderController'); // Удален - заказы не нужны
const adminController = require('../controllers/adminController');

const checkAdmin = async (req, res, next) => {
  const adminId = req.headers['x-admin-id'];

  if (!adminId) {
    return res
      .status(401)
      .json({ error: 'Доступ запрещен. Требуется аутентификация.' });
  }

  const isAdmin = await adminController.isAdmin(adminId);

  if (!isAdmin) {
    return res
      .status(403)
      .json({ error: 'Доступ запрещен. Недостаточно прав.' });
  }

  next();
};

router.use(checkAdmin);
router.post('/categories', async (req, res) => {
  try {
    const categoryData = req.body;
    const category = await categoryController.createCategory(categoryData);
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при создании категории' });
  }
});

router.put('/categories/:id', async (req, res) => {
  try {
    const categoryData = req.body;
    const category = await categoryController.updateCategory(
      req.params.id,
      categoryData
    );
    res.json(category);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при обновлении категории' });
  }
});

router.delete('/categories/:id', async (req, res) => {
  try {
    await categoryController.deleteCategory(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при удалении категории' });
  }
});

router.post('/products', async (req, res) => {
  try {
    const productData = req.body;
    const product = await productController.createProduct(productData);
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при создании товара' });
  }
});

router.put('/products/:id', async (req, res) => {
  try {
    const productData = req.body;
    const product = await productController.updateProduct(
      req.params.id,
      productData
    );
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при обновлении товара' });
  }
});

router.delete('/products/:id', async (req, res) => {
  try {
    await productController.deleteProduct(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при удалении товара' });
  }
});

// API для заказов - УДАЛЕНО
// router.get('/orders', async (req, res) => {
//   try {
//     const orders = await orderController.getAllOrders();
//     res.json(orders);
//   } catch (error) {
//     res.status(500).json({ error: 'Ошибка при получении заказов' });
//   }
// });

// router.put('/orders/:id/status', async (req, res) => {
//   try {
//     const { status } = req.body;
//     if (!status) {
//       return res.status(400).json({ error: 'Статус не указан' });
//     }

//     const order = await orderController.updateOrderStatus(
//       req.params.id,
//       status
//     );
//     res.json(order);
//   } catch (error) {
//     res.status(500).json({ error: 'Ошибка при обновлении статуса заказа' });
//   }
// });

// API для администраторов
router.get('/admins', async (req, res) => {
  try {
    const admins = await adminController.getAllAdmins();
    res.json(admins);
  } catch (error) {
    res
      .status(500)
      .json({ error: 'Ошибка при получении списка администраторов' });
  }
});

router.post('/admins', async (req, res) => {
  try {
    const { telegramId, username } = req.body;
    if (!telegramId) {
      return res.status(400).json({ error: 'Telegram ID не указан' });
    }

    const admin = await adminController.addAdmin(telegramId, username);
    res.status(201).json(admin);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при добавлении администратора' });
  }
});

router.delete('/admins/:telegramId', async (req, res) => {
  try {
    await adminController.removeAdmin(req.params.telegramId);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при удалении администратора' });
  }
});

module.exports = router;
