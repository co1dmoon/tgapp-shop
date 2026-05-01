import clsx from "clsx";
import { MdArrowOutward } from "react-icons/md";
import { SmartImage } from "../../../components";
import { useCategories } from "../../../hooks";
import { useAppContext } from "../../../store/AppContext";
import DeviceNavigationSkeleton from "./skeletons/DeviceNavigationSkeleton";

export default function DeviceNavigation() {
  const { selectedDeviceCategory, setSelectedDeviceCategory } = useAppContext();

  const { data: categories, isLoading } = useCategories();

  const categoriesName = ["full hd", "full hd+", "2k", "4k"];

  const deviceCategories = categories?.filter((category) =>
    categoriesName.every((name) => name !== category.name.toLowerCase())
  );

  if (isLoading) {
    return <DeviceNavigationSkeleton />;
  }

  return (
    <div
      className={clsx("grid grid-cols-2 p-4 gap-2", {
        "grid-cols-3": selectedDeviceCategory,
      })}
    >
      {deviceCategories?.map((category) => (
        <button
          onClick={() => setSelectedDeviceCategory(category.id)}
          key={category.id}
          className={clsx(
            "rounded-xl text-[12px] py-2 text-white uppercase font-display text-nowrap flex flex-col justify-start",
            { ["bg-[#222222]"]: selectedDeviceCategory === category.id },
            { ["bg-[#161616]"]: selectedDeviceCategory !== category.id }
          )}
        >
          <div
            className={clsx(
              "flex items-center pl-2 pr-1 relative w-full",
              selectedDeviceCategory
                ? "justify-center"
                : "justify-between"
            )}
          >
            <h2
              className={clsx(
                "overflow-hidden",
                selectedDeviceCategory ? "text-[9px] mx-auto" : ""
              )}
            >
              {category.name}
            </h2>
            {!selectedDeviceCategory && (
              <MdArrowOutward
                className="text-[#ffff00] scale-150 translate-y-[-5px]"
                size={15}
              />
            )}
          </div>
          {!selectedDeviceCategory && (
            <SmartImage
              src={category.image ?? `/images/device-categories/${category.name
                .toLowerCase()
                .replace(/ /g, "-")}.png`}
              alt={category.name}
              className="aspect-square w-full object-contain mt-2 rounded-lg"
            />
          )}
        </button>
      ))}
    </div>
  );
}
