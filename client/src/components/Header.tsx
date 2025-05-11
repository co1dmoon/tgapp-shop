import { BsFillChatLeftTextFill, BsFillGridFill } from "react-icons/bs";
import { FaClipboardList } from "react-icons/fa";
import { IoIosInformationCircle } from "react-icons/io";
import { MdShoppingCart } from "react-icons/md";
import { useAppContext } from "../store/AppContext";
import type { AppSection } from "../types";

export default function Header() {
  const { currentSection, navigateToSection } = useAppContext();

  // Конфигурация кнопок навигации с иконками
  const navButtons = [
    {
      id: "catalog" as AppSection,
      title: "Каталог",
      icon: <BsFillGridFill size={24} />,
    },
    {
      id: "orders" as AppSection,
      title: "Заказы",
      icon: <FaClipboardList size={24} />,
    },
    {
      id: "contact" as AppSection,
      title: "Связь",
      icon: <BsFillChatLeftTextFill size={24} />,
    },
    {
      id: "info" as AppSection,
      title: "Инфо",
      icon: <IoIosInformationCircle size={24} />,
    },
    {
      id: "cart" as AppSection,
      title: "Корзина",
      icon: <MdShoppingCart size={24} />,
    },
  ];

  return (
    <div className="py-4">
      <div className="grid grid-cols-5 gap-3 px-4">
        {navButtons.map((button) => (
          <button
            key={button.id}
            className={`flex flex-col items-center text-[#ffff00] justify-center p-2 py-4 rounded-xl transition-colors ${
              currentSection === button.id ? "bg-[#161616]" : ""
            }`}
            onClick={() => navigateToSection(button.id)}
          >
            <div className="mb-2">{button.icon}</div>
            <div className="font-primary font-thin text-[12px] text-white">
              {button.title}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}