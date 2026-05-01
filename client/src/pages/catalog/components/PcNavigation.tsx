import clsx from "clsx";
import { useCategories } from "../../../hooks";
import { useAppContext } from "../../../store/AppContext";
import PcCategoryCard from "./PcCategoryCard";
import DeviceNavigationSkeleton from "./skeletons/DeviceNavigationSkeleton";

export default function PcNavigation() {
  const { selectedPcCategory, setSelectedPcCategory } = useAppContext();

  const { data: categories, isLoading } = useCategories();

  const categoriesName = ["full hd", "full hd+", "2k", "4k"];

  const pcCategories = categories
    ?.filter((category) => categoriesName.includes(category.name.toLowerCase()))
    .sort((a, b) => {
      const order = ["full hd", "full hd+", "2k", "4k"];
      return (
        order.indexOf(a.name.toLowerCase()) -
        order.indexOf(b.name.toLowerCase())
      );
    });

  if (isLoading) {
    return <DeviceNavigationSkeleton />;
  }

  if (selectedPcCategory) {
    return (
      <div className="grid grid-cols-4 p-4 gap-2">
        {pcCategories?.map((category) => (
          <button
            onClick={() => setSelectedPcCategory(category.id)}
            key={category.id}
            className={clsx(
              "rounded-xl text-[12px] py-2 text-white uppercase font-display text-nowrap flex flex-col justify-center ",
              {
                "bg-[#222222]": selectedPcCategory === category.id,
                "bg-[#161616]": selectedPcCategory !== category.id,
              }
            )}
          >
            <div className="mx-auto">{category.name}</div>
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 mx-4">
      {pcCategories?.map((category) => (
        <PcCategoryCard category={category} key={category.name} />
      ))}
    </div>
  );
}
