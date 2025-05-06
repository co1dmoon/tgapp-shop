import { MdArrowOutward } from "react-icons/md";
import { useCategories } from "../../hooks";
import { useAppContext } from "../../store/AppContext";

export default function Navigation() {
  const { selectedCategoryId, setSelectedCategoryId } = useAppContext();
  const { data: categories } = useCategories();

  return (
    <div className="grid grid-cols-2 gap-4 p-4">

      {categories?.map((category) => (
        <button onClick={() => setSelectedCategoryId(category.id)} key={category.id} className={`${selectedCategoryId === category.id ? 'bg-[#222222]' : 'bg-[#161616]'} rounded-lg text-[12px] py-2 text-white uppercase font-display text-nowrap`}>
          <div className="flex items-center justify-between pl-2 pr-1 mb-2">
            <h2 className="text-ellipsis overflow-hidden">{category.name}</h2>
            <MdArrowOutward className="text-[#ffff00] scale-150 translate-y-[-5px]" size={16} />
          </div>
          <img src={`/images/categories/${category.name.toLowerCase().replace(/ /g, '-')}.png`} alt={category.name} className="h-[90px] w-auto object-contain mx-auto" />
        </button>
      ))}
    </div>
  );
};