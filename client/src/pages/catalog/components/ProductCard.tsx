import { useAppContext } from "../../../store/AppContext";
import type { Product } from "../../../types";
import { formatPrice } from "../../../utils/formatters";

export default function ProductCard({ product }: { product: Product }) {
  const { setSelectedProductId, selectedCategory } = useAppContext();

  const isSpecs = !selectedCategory || selectedCategory === "игровые пк";

  const allSpecs: Record<string, string> = JSON.parse(product.specs ?? "{}");

  const specs = [allSpecs["видеокарта"], allSpecs["процессор"]];

  const specsList = specs?.map((spec, index) => {
    return (
      <div
        key={index}
        className="flex items-center justify-center rounded-xl bg-[#222222] px-2 py-1 font-primary text-[10px] text-white overflow-hidden text-ellipsis"
      >
        {spec}
      </div>
    );
  });

  return (
    <div
      onClick={() => setSelectedProductId(product.id)}
      key={product.id}
      className="rounded-xl text-[12px] bg-[#161616] text-white font-display text-nowrap"
    >
      <img
        src={product.image ?? `/images/device-categories/мониторы.png`}
        alt={product.name}
        className="w-full h-auto object-contain mx-auto rounded-xl bg-[#2F2F2F] border-t-2 border-white"
      />
      <div className="flex flex-col items-start px-1 overflow-hidden gap-2 text-ellipsis mt-3">
        {!isSpecs && (
          <h2 className="font-primary max-w-[90%] ml-1 text-[16px] text-left font-thin whitespace-nowrap overflow-hidden text-ellipsis w-full">
            {product.name}
          </h2>
        )}
        {isSpecs && (
          <div className="grid grid-cols-2 gap-2 px-1">{specsList}</div>
        )}
        <p className="flex items-baseline gap-1 ml-1">
          <span className="font-display text-[14px] uppercase text-[#ffff00]">
            {formatPrice(product.price)}
          </span>
          <span className="font-display text-[10px] uppercase text-[#888888] line-through">
            {formatPrice(product.price)}
          </span>
        </p>
        <button className="font-display text-[10px] uppercase text-black bg-[#ffff00] rounded-full py-2 flex items-center justify-center w-[95%] my-2 mx-auto">
          В корзину
        </button>
      </div>
    </div>
  );
}
