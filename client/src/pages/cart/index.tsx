import { Empty } from "../../components";
import { useCartContext } from "../../store/CartContext";
import { formatPrice } from "../../utils/formatters";
import ProductCard from "./components/ProductCard";

export default function Cart() {
  const { cart } = useCartContext();

  // Маппинг наших категорий на slug страниц b-zone.store.
  // PC (Full HD/2K/4K) → /gaming_pc, аксессуары — каждый со своим путём.
  const STORE_SLUG: Record<string, string> = {
    'Full HD': 'gaming_pc', 'Full HD+': 'gaming_pc', '2K': 'gaming_pc', '4K': 'gaming_pc',
    'клавиатуры': 'keyboards',
    'мыши': 'mice',
    'наушники': 'headphones',
    'микрофоны': 'microphones',
    'мониторы': 'monitors',
    'коврики': 'mats',
  };

  const createCheckoutUrl = () => {
    // Берём только товары с tildaUid (без него корзина b-zone.store не откроется).
    const validItems = cart.items.filter(i => i.tildaUid);
    if (validItems.length === 0) return null;

    // Slug страницы — по категории первого товара. Если в корзине намешано
    // ПК и аксы — выбираем slug первого, b-zone.store разберётся.
    const firstCat = validItems[0].category?.name ?? '';
    const slug = STORE_SLUG[firstCat] ?? 'gaming_pc';

    const cartParams = validItems
      .map(item => `${item.tildaUid}:${item.quantity}`)
      .join(',');

    const url = new URL(`https://b-zone.store/${slug}`);
    url.searchParams.set('cart', cartParams);
    url.hash = 'order';
    return url.toString();
  };

  const checkoutUrl = createCheckoutUrl();

  if (cart.items.length === 0) {
    return (
      <div className="p-4">
        <h1 className="font-display font-thin mb-4">Корзина</h1>
        <Empty>Кажется, вы еще не добавили товары в корзину</Empty>
      </div>
    );
  }


  return (
    <div className="p-4 flex flex-col gap-4">
      <h1 className="font-display font-thin">Корзина</h1>

      <div className="flex flex-col gap-4">
        {cart.items.map((item) => (
          <ProductCard key={`${item.productId}-${item.productStringId}`} cartItem={item} />
        ))}
      </div>

      <p className="font-display font-thin mt-4 ml-auto">
        Итого: {formatPrice(cart.total)}
      </p>

      {checkoutUrl ? (
        <a
          className="bg-[#ffff00] text-black font-display rounded-xl flex items-center justify-center p-2 w-full"
          href={checkoutUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          Перейти к оформлению
        </a>
      ) : (
        <div className="bg-[#222222] text-gray-400 font-display rounded-xl flex items-center justify-center p-2 w-full text-center text-[12px]">
          Не удалось собрать корзину — у товаров нет ID для сайта
        </div>
      )}
    </div>
  );
}
