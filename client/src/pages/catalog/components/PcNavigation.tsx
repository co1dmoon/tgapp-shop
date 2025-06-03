import clsx from "clsx";
import { FaArrowRightLong } from "react-icons/fa6";
import { useCategories } from "../../../hooks";
import { useAppContext } from "../../../store/AppContext";
import { formatPrice } from "../../../utils/formatters";
import DeviceNavigationSkeleton from "./skeletons/DeviceNavigationSkeleton";

export default function PcNavigation() {
  const { selectedPcCategory, setSelectedPcCategory } = useAppContext();

  const { data: categories, isLoading } = useCategories();

  const categoriesName = ["full hd", "2k", "4k"];

  const pcCategories = categories?.filter((category) =>
    categoriesName.includes(category.name.toLowerCase())
  ).sort((a, b) => {
    const order = ['full hd', '2k', '4k'];
    return order.indexOf(a.name.toLowerCase()) - order.indexOf(b.name.toLowerCase());
  });

  if (isLoading) {
    return <DeviceNavigationSkeleton />;
  }

  if (selectedPcCategory) {
    return <div className="grid grid-cols-4 p-4 gap-2">
      {pcCategories?.map((category) => (
        <button
          onClick={() => setSelectedPcCategory(category.id)}
          key={category.id}
          className={
            clsx(
              "rounded-xl text-[12px] py-2 text-white uppercase font-display text-nowrap flex flex-col justify-center ",
              {
                "bg-[#222222]": selectedPcCategory === category.id, "bg-[#161616]": selectedPcCategory !== category.id

              }
            )
          }
        >
          <div className="mx-auto">{category.name}</div>
        </button>
      ))}
    </div>;
  }

  return (
    <div className="flex flex-col gap-3 mx-4">
      {pcCategories?.map((category) => (
        <div key={category.id} className="flex gap-4 bg-[#161616] rounded-xl pr-2">
          <div className="bg-[#222222] rounded-xl h-[180px] w-[180px] flex justify-center items-center">
            <img src={category.image ?? `/images/categories/pc.png`} alt={category.name} className="h-[145px] w-auto object-contain" />
          </div>
          <div className="flex flex-col gap-3">
            <div className="text-[16px] font-display uppercase mt-[20px]">
              {category.name}
            </div>
            <div className="text-[10px] font-primary text-white opacity-60">
              {category.description}
            </div>
            <div className="text-[12px] font-display text-[#ffff00]">
              от {formatPrice(category.price ?? 0)}
            </div>
            <button onClick={() => setSelectedPcCategory(category.id)} className="rounded-2xl bg-[#ffff00] text-[12px] font-display text-[#111111] py-2 px-4 flex items-center justify-between gap-2">
              <span>Выбрать ПК</span>
              <FaArrowRightLong />
            </button>
          </div>
        </div>
      )

      )}
    </div>
  );
}
