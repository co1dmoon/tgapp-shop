import { useEffect, useState } from "react";
import Cart from "./components/Cart";
import CategoryFilter from "./components/CategoryFilter";
import ProductList from "./components/ProductList";
import TelegramWebApp, {
  sendTelegramData,
  showTelegramPopup,
} from "./components/TelegramWebApp";
import { categoryService, orderService, productService } from "./services";
import type { CartItem, Category, OrderData, Product } from "./types";

// Объявление типа для WebApp
declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        initDataUnsafe?: {
          user?: {
            id: number;
            first_name?: string;
            last_name?: string;
          };
        };
      };
    };
  }
}

function App() {
  // Состояния приложения
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Загрузка данных при первом рендере
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [productsData, categoriesData] = await Promise.all([
          productService.getAllProducts(),
          categoryService.getAllCategories(),
        ]);
        setProducts(productsData);
        setCategories(categoriesData);
      } catch (error) {
        console.error("Ошибка загрузки данных:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  // Загрузка товаров при изменении категории
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        if (selectedCategory === null) {
          const data = await productService.getAllProducts();
          setProducts(data);
        } else {
          const data = await productService.getProductsByCategory(
            selectedCategory
          );
          setProducts(data);
        }
      } catch (error) {
        console.error("Ошибка загрузки товаров:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [selectedCategory]);

  // Обработчики для корзины
  const handleAddToCart = (product: Product) => {
    const existingItem = cartItems.find(
      (item) => item.productId === product.id
    );

    if (existingItem) {
      setCartItems(
        cartItems.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setCartItems([
        ...cartItems,
        {
          productId: product.id,
          quantity: 1,
          price: product.price,
          product,
        },
      ]);
    }
  };

  const handleRemoveFromCart = (productId: number) => {
    setCartItems(cartItems.filter((item) => item.productId !== productId));
  };

  const handleUpdateQuantity = (productId: number, quantity: number) => {
    setCartItems(
      cartItems.map((item) =>
        item.productId === productId ? { ...item, quantity } : item
      )
    );
  };

  const handleCheckout = async () => {
    if (cartItems.length === 0) return;

    try {
      const total = cartItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );

      // Получаем данные пользователя из Telegram WebApp
      const telegramUser = window.Telegram?.WebApp?.initDataUnsafe?.user || {
        id: "unknown_user" as unknown as number,
      };

      const orderData: OrderData = {
        userId: telegramUser.id.toString(),
        userName: `${telegramUser.first_name || ""} ${
          telegramUser.last_name || ""
        }`.trim(),
        cart: cartItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
        })),
        total,
      };

      // Отправляем заказ на сервер
      await orderService.createOrder(orderData);

      // Отправляем данные в Telegram WebApp
      sendTelegramData(JSON.parse(JSON.stringify(orderData)));

      // Показываем сообщение успеха
      showTelegramPopup(
        "Заказ успешно оформлен! Наш менеджер свяжется с вами в ближайшее время."
      );

      // Очищаем корзину
      setCartItems([]);
      setIsCartOpen(false);
    } catch (error) {
      console.error("Ошибка при оформлении заказа:", error);
      showTelegramPopup(
        "Произошла ошибка при оформлении заказа. Пожалуйста, попробуйте позже."
      );
    }
  };

  // Переключение между каталогом и корзиной
  const toggleCart = () => {
    setIsCartOpen(!isCartOpen);
  };

  // Подсчет количества товаров в корзине
  const cartItemsCount = cartItems.reduce(
    (count, item) => count + item.quantity,
    0
  );

  return (
    <TelegramWebApp onClose={() => isCartOpen && setIsCartOpen(false)}>
      <div className="min-h-screen bg-gray-50 px-4 py-6">
        {/* Заголовок и кнопка корзины */}
        <header className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            {isCartOpen ? "Корзина" : "Каталог товаров"}
          </h1>

          {!isCartOpen && (
            <button
              className="relative p-2 rounded-full bg-blue-600 text-white"
              onClick={toggleCart}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>

              {cartItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartItemsCount}
                </span>
              )}
            </button>
          )}

          {isCartOpen && (
            <button
              className="p-2 rounded-full bg-gray-200 text-gray-700"
              onClick={toggleCart}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </header>

        {/* Основной контент */}
        <main>
          {isCartOpen ? (
            <Cart
              items={cartItems}
              onRemoveItem={handleRemoveFromCart}
              onUpdateQuantity={handleUpdateQuantity}
              onCheckout={handleCheckout}
            />
          ) : (
            <>
              {/* Фильтр по категориям */}
              {categories.length > 0 && (
                <CategoryFilter
                  categories={categories}
                  selectedCategoryId={selectedCategory}
                  onSelectCategory={setSelectedCategory}
                />
              )}

              {/* Список товаров */}
              <ProductList
                products={products}
                onAddToCart={handleAddToCart}
                isLoading={loading}
              />
            </>
          )}
        </main>
      </div>
    </TelegramWebApp>
  );
}

export default App;
