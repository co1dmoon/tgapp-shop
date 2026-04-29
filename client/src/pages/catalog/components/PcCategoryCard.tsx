import { FaArrowRightLong } from "react-icons/fa6";
import { SmartImage } from "../../../components";
import { useCategoryPrice } from "../../../hooks/useCategoryPrice";
import { useAppContext } from "../../../store/AppContext";
import type { Category } from "../../../types";
import { formatPrice } from "../../../utils/formatters";

type Props = {
  category: Category;
};

export default function PcCategoryCard({ category }: Props) {
  const { setSelectedPcCategory } = useAppContext();

  const { data: price, isLoading } = useCategoryPrice(category.id);
  return (
    <div key={category.id} className="flex gap-4 bg-[#161616] rounded-xl pr-2">
      <div className="bg-[#222222] rounded-xl h-[180px] w-auto max-w-[150px] overflow-hidden">
        <SmartImage
          src={category.image ?? `/images/categories/pc.png`}
          alt={category.name}
          className="w-full h-full object-cover object-center"
        />
      </div>
      <div className="flex flex-col gap-3">
        <div className="text-[16px] font-display uppercase mt-[20px]">
          {category.name}
        </div>
        <div className="text-[10px] font-primary text-white opacity-60">
          {category.description}
        </div>
        {!isLoading && (
          <div className="text-[12px] font-display text-[#ffff00]">
            от {formatPrice(price ?? 0)}
          </div>
        )}
        {isLoading && (
          <div className="h-[12px] w-[100px] bg-[#222222] rounded animate-pulse" />
        )}
        <button
          onClick={() => setSelectedPcCategory(category.id)}
          className="rounded-2xl bg-[#ffff00] text-[12px] font-display text-[#111111] py-2 px-4 flex items-center justify-between gap-2"
        >
          <span>Выбрать ПК</span>
          <FaArrowRightLong />
        </button>
      </div>
    </div>
  );
}
