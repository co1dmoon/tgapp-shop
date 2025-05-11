import { IoChevronBack } from "react-icons/io5";
import { CartButton } from "../../../components";
import {
  DeliveryIcon,
  SupportIcon,
  WarrantyIcon,
} from "../../../components/icons";
import { useProduct } from "../../../hooks";
import { useAppContext } from "../../../store/AppContext";
import { formatPrice, formatPriceWithTax } from "../../../utils/formatters";

export default function ProductDetails() {
  const { selectedProductId, setSelectedProductId } = useAppContext();

  const { data: product } = useProduct(selectedProductId ?? NaN);

  const specs = JSON.parse(product?.specs ?? "{}");
  const allList = Object.entries(specs);

  const pcCategories = ["full-hd", "2k", "4k"];

  const isPc = pcCategories.includes(
    product?.category?.name.toLowerCase() ?? ""
  );

  const advantages = [
    {
      title: "Бесплатная доставка",
      icon: <DeliveryIcon width={32} height={32} />,
    },
    {
      title: "Гарантия до 3 лет",
      icon: <WarrantyIcon width={32} height={32} />,
    },
    {
      title: "Ежедневная тех. поддержка",
      icon: <SupportIcon width={32} height={32} />,
    },
  ];

  const handleGoBack = () => {
    setSelectedProductId(null);
  };

  if (!product || !selectedProductId) return null;

  return (
    <div className="flex flex-col gap-8 p-4">
      <button
        onClick={handleGoBack}
        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
      >
        <IoChevronBack size={20} />
        <span className="font-primary text-[14px]">Назад</span>
      </button>

      <img
        src={product.image ?? "/images/categories/игровые-пк.png"}
        alt={product.name}
        className="w-full aspect-square object-contain mx-auto rounded-xl bg-[#2F2F2F]"
      />
      <h1 className="text-[20px] text-left font-display">{product.name}</h1>
      <div className="flex items-baseline gap-2 rounded-xl bg-[#161616] py-2 px-4">
        <span className="text-[20px] text-[#ffff00] font-display">
          {formatPrice(product.price)}
        </span>
        <span className="text-[16px] text-[#888888] font-display line-through">
          {formatPriceWithTax(product.price)}
        </span>
      </div>
      {isPc && (
        <div className="flex flex-col gap-4">
          <h2 className="text-[16px] text-left font-display uppercase">
            Преимущества:
          </h2>
          <div className="grid grid-cols-3 gap-4">
            {advantages.map((advantage, index) => (
              <div
                key={index}
                className="flex flex-col items-center justify-start gap-2 rounded-xl bg-[#161616] py-2 px-4"
              >
                {advantage.icon}
                <span className="text-[10px] text-center font-primary font-thin">
                  {advantage.title}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="flex flex-col gap-4">
        <h2 className="text-[16px] text-left font-display uppercase">
          Характеристики:
        </h2>
        <div className="w-full bg-[#111111] rounded-xl overflow-hidden text-[10px] font-primary">
          {allList.map(([key, value], index) => (
            <div key={index} className="flex w-full border-1 border-[#2f2f2f]">
              <div className="py-3 px-4 text-gray-400 flex-1 bg-[#161616]">
                {key}
              </div>
              <div className="py-3 px-4 text-white text-right flex-1 bg-[#222222]">
                {String(value)}
              </div>
            </div>
          ))}
        </div>
      </div>
      <CartButton product={product} type="large">
        В корзину
      </CartButton>
    </div>
  );
}
