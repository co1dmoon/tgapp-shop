const express = require('express');
const router = express.Router();

const categoryController = require('../controllers/categoryController');
const productController = require('../controllers/productController');
const orderController = require('../controllers/orderController');
const userController = require('../controllers/userController');
// API для категорий
router.get('/categories', async (req, res) => {
  try {
    const categories = await categoryController.getAllCategories();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при получении категорий' });
  }
});

router.get('/categories/:id', async (req, res) => {
  try {
    const category = await categoryController.getCategoryById(req.params.id);
    if (!category) {
      return res.status(404).json({ error: 'Категория не найдена' });
    }
    res.json(category);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при получении категории' });
  }
});

router.get("/:categories/:id/price", async (req, res) => {
  try {
    const price = await categoryController.getPriceCategory(req.params.id);
    res.json(price);
  } catch (error) {
    res.status(500).json({ error: "Ошибка при получении категории" });
  }
});

// API для товаров
router.get('/products', async (req, res) => {
  try {
    const { categoryId, categories, bestOffers } = req.query;
    let products;
    if (categoryId) {
      products = await productController.getProductsByCategory(categoryId);
    } else if (bestOffers) {
      products = await productController.getBestOffersProducts(categories);
    } else if (categories) {
      products = await productController.getProductsByCategories(categories);
    } else {
      products = await productController.getAllProducts();
    }

    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при получении товаров' });
  }
});

router.get('/products/:id', async (req, res) => {
  try {
    const product = await productController.getProductById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Товар не найден' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при получении товара' });
  }
});

// API для работы с заказами
router.post('/orders', async (req, res) => {
  try {

    const order = await orderController.createOrder(req.body);
    res.status(201).json(order);
  } catch (error) {
    console.error('Ошибка при создании заказа:', error);
    res.status(500).json({ error: 'Ошибка при создании заказа' });
  }
});

router.get('/orders/:id', async (req, res) => {
  try {
    const order = await orderController.getOrderById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Заказ не найден' });
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при получении заказа' });
  }
});

router.get('/user/:userId/orders', async (req, res) => {
  try {
    const orders = await orderController.getUserOrders(req.params.userId);
    res.json(orders);
  } catch (error) {
    res
      .status(500)
      .json({ error: 'Ошибка при получении заказов пользователя' });
  }
});

router.get('/user/:userId', async (req, res) => {
  try {
    const user = await userController.getUserByTelegramId(req.params.userId);
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при получении пользователя' });
  }
});

module.exports = router;
