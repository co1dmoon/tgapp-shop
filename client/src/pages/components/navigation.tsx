import clsx from "clsx";
import { MdArrowOutward } from "react-icons/md";
import { useAppContext } from "../../store/AppContext";

export default function Navigation() {
  const { selectedCategory, setSelectedCategory } = useAppContext();

  const categories = [
    { id: 'игровые пк', name: 'Игровые ПК', img: '/images/categories/игровые-пк.png' },
    { id: 'девайсы', name: 'Девайсы', img: '/images/categories/девайсы.png' },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 p-4">

      {categories?.map((category) => (
        <button
          onClick={() => setSelectedCategory(category.id as 'игровые пк' | 'девайсы')}
          key={category.id}
          className={clsx(
            "rounded-xl text-[12px] py-2 text-white uppercase font-display text-nowrap",
            { ['bg-[#222222]']: selectedCategory === category.id },
            { ['bg-[#161616]']: selectedCategory !== category.id }
          )}
        >
          <div className={clsx(
            "flex items-center pl-2 pr-1",
            { ['justify-center']: selectedCategory },
            { ['justify-between']: !selectedCategory }
          )}>
            <h2 className="text-ellipsis overflow-hidden">{category.name}</h2>
            {!selectedCategory && <MdArrowOutward className="text-[#ffff00] scale-150 translate-y-[-5px]" size={16} />}
          </div>
          {!selectedCategory && <img
            src={`/images/categories/${category.name.toLowerCase().replace(/ /g, '-')}.png`}
            alt={category.name}
            className="h-[90px] w-auto object-contain mx-auto my-2"
          />}
        </button>
      ))}
    </div>
  );
};