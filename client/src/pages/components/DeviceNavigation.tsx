import clsx from "clsx";
import { MdArrowOutward } from "react-icons/md";
import { useCategories } from "../../hooks";
import { useAppContext } from "../../store/AppContext";
import DeviceNavigationSkeleton from "./skeletons/DeviceNavigationSkeleton";

export default function Navigation() {
  const { selectedDeviceCategory, setSelectedDeviceCategory } = useAppContext();

  const { data: categories, isLoading } = useCategories();

  const categoriesName = ['full hd', '2k', '4k'];

  const deviceCategories = categories?.filter((category) => categoriesName.every((name) => name !== category.name.toLowerCase()));

  if (isLoading) {
    return <DeviceNavigationSkeleton />;
  }

  return (
    <div className={clsx("grid grid-cols-2 p-4 gap-2", { 'grid-cols-4': selectedDeviceCategory })}>
      {deviceCategories?.map((category) => (
        <button
          onClick={() => setSelectedDeviceCategory(category.id)}
          key={category.id}
          className={clsx(
            "rounded-xl text-[12px] py-2 text-white uppercase font-display text-nowrap",
            { ['bg-[#222222]']: selectedDeviceCategory === category.id },
            { ['bg-[#161616]']: selectedDeviceCategory !== category.id }
          )}
        >
          <div className={clsx(
            "flex items-center",
            { ['justify-center pl-0 pr-0']: selectedDeviceCategory },
            { ['justify-between pl-2 pr-1']: !selectedDeviceCategory }
          )}>
            <h2 className={clsx("overflow-hidden", { 'text-[6px]': selectedDeviceCategory })}>{category.name}</h2>
            {!selectedDeviceCategory && <MdArrowOutward className="text-[#ffff00] scale-150 translate-y-[-5px]" size={16} />}
          </div>
          {!selectedDeviceCategory && <img
            src={`/images/device-categories/${category.name.toLowerCase().replace(/ /g, '-')}.png`}
            alt={category.name}
            className="h-[90px] w-auto object-contain mx-auto my-2"
          />}
        </button>
      ))}
    </div>
  );
}