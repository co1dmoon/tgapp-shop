import { RiAddLine, RiDeleteBin6Line, RiSubtractLine } from "react-icons/ri";
import { SmartImage } from "../../../components";
import { useAppContext } from "../../../store/AppContext";
import { useCartContext } from "../../../store/CartContext";
import type { CartItem } from "../../../types/cart";
import { formatPrice } from "../../../utils/formatters";

export default function ProductCard({ cartItem }: { cartItem: CartItem }) {


  const { setSelectedProductId, navigateToSection } = useAppContext();

  const { removeFromCart, updateQuantity } = useCartContext();


  return (
    <div
      className="h-[90px] w-full flex items-center gap-[10px] p-2 bg-[#161616] rounded-xl"
      onClick={() => {
        setSelectedProductId(cartItem.productId);
        navigateToSection("catalog");
      }}
    >
      <SmartImage
        src={cartItem.image ?? "/images/categories/игровые-пк.png"}
        alt={cartItem.name}
        className="w-[70px] aspect-square rounded-xl object-cover"
      />
      <div className="flex flex-col gap-2 w-full h-full justify-between">
        <div className="flex gap-2 w-full text-nowrap">


          <p className="text-[12px] font-primary font-thin w-full break-words overflow-hidden text-wrap">
              {cartItem.name}
            </p>

          <button
            className="text-[12px] font-primary font-thin ml-auto"
            onClick={(e) => {
              e.stopPropagation();
              removeFromCart(cartItem.productId);
            }}
          >
            <RiDeleteBin6Line color="#E92919" size={17} />
          </button>
        </div>
        <div className="flex items-center gap-2 justify-between">
          <p className="text-[14px] font-primary w-1/3 text-[#ffff00]">
            {formatPrice(cartItem.price)}
          </p>
          <div className="flex items-center gap-2 bg-[#ffff00] rounded-xl text-[black] justify-between px-2 w-1/3">
            <button
              className="text-[12px] font-primary font-thin w-1/3 flex items-center justify-center"
              onClick={(e) => {
                e.stopPropagation();
                if (cartItem.quantity - 1 === 0) {
                  removeFromCart(cartItem.productId);
                } else {
                  updateQuantity(cartItem.productId, cartItem.quantity - 1);
                }
              }}
            >
              <RiSubtractLine size={12} />
            </button>
            <p className="text-[12px] font-display font-thin w-1/3 text-center">
              {cartItem.quantity}
            </p>
            <button
              className="text-[12px] font-primary font-thin w-1/3 flex items-center justify-center"
              onClick={(e) => {
                e.stopPropagation();
                updateQuantity(cartItem.productId, cartItem.quantity + 1);
              }}
            >
              <RiAddLine size={12} />
            </button>
          </div>
          {cartItem.price !== cartItem.price * cartItem.quantity && (
            <p className="text-[12px] font-primary font-thin ml-auto">
              {formatPrice(cartItem.price * cartItem.quantity)}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
