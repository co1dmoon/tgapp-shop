import { useState } from "react";
import { Empty } from "../../components";
import { useCartContext } from "../../store/CartContext";
import { formatPrice } from "../../utils/formatters";
import OrderForm from "./components/OrderForm";
import ProductCard from "./components/ProductCard";

export default function Cart() {
  const { cart } = useCartContext();

  const [orderStatus, setOrderStatus] = useState<"no" | 'start' | 'finish'>('no');

  if (cart.items.length === 0) {
    return (
      <div className="p-4">
        <h1 className="font-display font-thin mb-4">Корзина</h1>
        <Empty>Кажется, вы еще не добавили товары в корзину</Empty>
      </div>
    );
  }

  if (orderStatus === 'start') {
    return <OrderForm setOrder={setOrderStatus} />;
  }

  return (
    <div className="p-4 flex flex-col gap-4">
      <h1 className="font-display font-thin">Корзина</h1>

      <div className="flex flex-col gap-4">
        {cart.items.map((item) => (
          <ProductCard key={item.productId} cartItem={item} />
        ))}
      </div>

      <p className="font-display font-thin mt-4 ml-auto">
        Итого: {formatPrice(cart.total)}
      </p>

      <button className="bg-[#ffff00] text-black font-display rounded-xl flex items-center justify-center p-2 w-full" onClick={() => setOrderStatus('start')}>
        Перейти к оформлению
      </button>
    </div>
  );
}
