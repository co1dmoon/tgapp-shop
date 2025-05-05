import type { FC } from "react";
import type { CartItem } from "../types";

interface CartProps {
  items: CartItem[];
  onRemoveItem: (productId: number) => void;
  onUpdateQuantity: (productId: number, quantity: number) => void;
  onCheckout: () => void;
}

const Cart: FC<CartProps> = ({
  items,
  onRemoveItem,
  onUpdateQuantity,
  onCheckout,
}) => {
  // Вычисление общей суммы заказа
  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // Форматирование цены
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("ru-RU", {
      style: "currency",
      currency: "RUB",
      minimumFractionDigits: 0,
    }).format(price);
  };

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-6 bg-white rounded-lg shadow-sm">
        <p className="text-gray-500 mb-4">Корзина пуста</p>
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          onClick={() => window.history.back()}
        >
          Вернуться к покупкам
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <h2 className="text-xl font-bold mb-4">Корзина</h2>

      <div className="divide-y divide-gray-200">
        {items.map((item) => (
          <div key={item.productId} className="py-4 flex items-center">
            {/* Изображение товара */}
            <div className="w-16 h-16 mr-4 bg-gray-100 rounded overflow-hidden flex-shrink-0">
              {item.product.image ? (
                <img
                  src={item.product.image}
                  alt={item.product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-200">
                  <span className="text-xs text-gray-400">Нет фото</span>
                </div>
              )}
            </div>

            {/* Информация о товаре */}
            <div className="flex-grow">
              <h3 className="text-sm font-medium line-clamp-1">
                {item.product.name}
              </h3>
              <p className="text-sm text-gray-500">
                {formatPrice(item.price)} за шт.
              </p>
            </div>

            {/* Управление количеством */}
            <div className="flex items-center ml-4">
              <button
                className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200"
                onClick={() =>
                  onUpdateQuantity(
                    item.productId,
                    Math.max(1, item.quantity - 1)
                  )
                }
              >
                -
              </button>
              <span className="mx-2 w-8 text-center">{item.quantity}</span>
              <button
                className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200"
                onClick={() =>
                  onUpdateQuantity(item.productId, item.quantity + 1)
                }
              >
                +
              </button>
            </div>

            {/* Стоимость и удаление */}
            <div className="ml-4 text-right">
              <p className="font-bold">
                {formatPrice(item.price * item.quantity)}
              </p>
              <button
                className="text-sm text-red-600 hover:text-red-800"
                onClick={() => onRemoveItem(item.productId)}
              >
                Удалить
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Итоговая сумма и оформление заказа */}
      <div className="pt-4 mt-4 border-t border-gray-200">
        <div className="flex justify-between mb-4">
          <span className="font-medium">Итого:</span>
          <span className="text-xl font-bold">{formatPrice(total)}</span>
        </div>

        <button
          className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          onClick={onCheckout}
        >
          Оформить заказ
        </button>
      </div>
    </div>
  );
};

export default Cart;
