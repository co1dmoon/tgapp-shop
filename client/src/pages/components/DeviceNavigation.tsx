import clsx from "clsx";
import { MdArrowOutward } from "react-icons/md";
import { useCategories } from "../../hooks";
import { useAppContext } from "../../store/AppContext";

export default function Navigation() {
  const { selectedDeviceCategory, setSelectedDeviceCategory } = useAppContext();

  const { data: categories } = useCategories();

  const categoriesName = ['full hd', '2k', '4k'];

  const deviceCategories = categories?.filter((category) => categoriesName.every((name) => name !== category.name));


  return (
    <div className={clsx("grid grid-cols-2", { 'grid-cols-4': selectedDeviceCategory })}>

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
            "flex items-center pl-2 pr-1",
            { ['justify-center']: selectedDeviceCategory },
            { ['justify-between']: !selectedDeviceCategory }
          )}>
            <h2 className={clsx("text-ellipsis overflow-hidden", { 'text-[8px]': selectedDeviceCategory })}>{category.name}</h2>
            {!selectedDeviceCategory && <MdArrowOutward className="text-[#ffff00] scale-150 translate-y-[-5px]" size={16} />}
          </div>
          {!selectedDeviceCategory && <img
            src={`/images/categories/${category.name.toLowerCase().replace(/ /g, '-')}.png`}
            alt={category.name}
            className="h-[90px] w-auto object-contain mx-auto my-2"
          />}
        </button>
      ))}
    </div>
  );
};