import clsx from "clsx";
import { MdArrowOutward } from "react-icons/md";
import { useCategories } from "../../../hooks";
import { useAppContext } from "../../../store/AppContext";
import DeviceNavigationSkeleton from "./skeletons/DeviceNavigationSkeleton";

export default function Navigation() {
  const { selectedDeviceCategory, setSelectedDeviceCategory } = useAppContext();

  const { data: categories, isLoading } = useCategories();

  const categoriesName = ["full hd", "2k", "4k"];

  const deviceCategories = categories?.filter((category) =>
    categoriesName.every((name) => name !== category.name.toLowerCase())
  );

  if (isLoading) {
    return <DeviceNavigationSkeleton />;
  }

  return (
    <div
      className={clsx("grid grid-cols-2 p-4 gap-2", {
        "grid-cols-4": selectedDeviceCategory,
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
              "flex items-center",
              selectedDeviceCategory
                ? "text-center w-full"
                : "justify-between pl-2 pr-1"
            )}
          >
            <h2
              className={clsx(
                "overflow-hidden",
                selectedDeviceCategory ? "text-[6px] mx-auto" : ""
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
            <img
              src={`/images/device-categories/${category.name
                .toLowerCase()
                .replace(/ /g, "-")}.png`}
              alt={category.name}
              className="h-[80%] w-[90%] object-contain mx-auto my-2"
            />
          )}
        </button>
      ))}
    </div>
  );
}
