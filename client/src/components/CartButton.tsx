import { MdAdd, MdRemove } from "react-icons/md";
import { useCartContext } from "../store/CartContext";
import type { Product } from "../types";

interface CartButtonProps extends React.HTMLAttributes<HTMLButtonElement> {
  product: Product;
  className?: string;
  children?: React.ReactNode;
  type: "small" | "large";
}

export default function CartButton({
  product,
  className,
  children = "Добавить в корзину",
  type = "small",
}: CartButtonProps) {
  const { addToCart, cart, updateQuantity, removeFromCart } = useCartContext();
  const cartItem = cart.items.find((item) => item.productId === product.id);

  const clickHandler = (
    e: React.MouseEvent<HTMLButtonElement>,
    product: Product
  ) => {
    e.stopPropagation();
    addToCart(product);
  };

  const handleQuantityChange = (e: React.MouseEvent, newQuantity: number) => {
    e.stopPropagation();
    if (newQuantity < 1) {
      removeFromCart(product.id);
    } else {
      updateQuantity(product.id, newQuantity);
    }
  };

  if (cartItem) {
    return (
      <div
        className={`flex items-center justify-around gap-2 w-full bg-[#ffff00] text-black font-display rounded-xl ${className}`}
      >
        <button
          onClick={(e) => handleQuantityChange(e, cartItem.quantity - 1)}
          className="bg-[#ffff00] text-black font-display rounded-xl flex items-center justify-center p-2 w-1/3 active:bg-[#e2e237] rounded-r-none"
        >
          <MdRemove color="black" size={type === "small" ? 16 : 24} />
        </button>
        <span
          className={`text-black font-display w-1/3 text-center ${
            type === "small" ? "text-[14px]" : "text-[18px]"
          }`}
        >
          {cartItem.quantity}
        </span>
        <button
          onClick={(e) => handleQuantityChange(e, cartItem.quantity + 1)}
          className="bg-[#ffff00] text-black font-display rounded-xl flex items-center transition-colors justify-center p-2 w-1/3 active:bg-[#e2e237] rounded-l-none"
        >
          <MdAdd size={type === "small" ? 16 : 24} />
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={(e) => clickHandler(e, product)}
      className={`bg-[#ffff00] text-black font-display rounded-xl flex items-center justify-center w-full ${
        type === "small" ? "text-[10px] py-2 px-4" : "text-[16px] py-4 px-8"
      } ${className}`}
    >
      {children}
    </button>
  );
}
