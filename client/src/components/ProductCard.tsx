import type { FC } from "react";
import type { Product } from "../types";

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

const ProductCard: FC<ProductCardProps> = ({ product, onAddToCart }) => {
  const { name, price, image, inStock } = product;

  // Обработчик клика на кнопку добавления в корзину
  const handleAddToCart = () => {
    if (inStock) {
      onAddToCart(product);
    }
  };

  // Форматирование цены
  const formattedPrice = new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    minimumFractionDigits: 0,
  }).format(price);

  return (
    <div className="flex flex-col bg-white rounded-xl overflow-hidden shadow-md">
      {/* Изображение товара */}
      <div className="relative w-full h-48 bg-gray-100">
        {image ? (
          <img src={image} alt={name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-200">
            <span className="text-gray-400">Нет изображения</span>
          </div>
        )}

        {/* Статус наличия */}
        {!inStock && (
          <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-medium px-2 py-1 rounded">
            Нет в наличии
          </div>
        )}
      </div>

      {/* Информация о товаре */}
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-2">
          {name}
        </h3>

        <div className="mt-auto flex justify-between items-center">
          <span className="text-xl font-bold text-gray-900">
            {formattedPrice}
          </span>

          <button
            onClick={handleAddToCart}
            disabled={!inStock}
            className={`rounded-lg px-3 py-2 text-sm font-medium ${
              inStock
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            {inStock ? "В корзину" : "Недоступно"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
