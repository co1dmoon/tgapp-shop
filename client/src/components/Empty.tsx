import { useAppContext } from "../store/AppContext";

export default function Empty({ children }: { children?: React.ReactNode }) {
  const { navigateToSection } = useAppContext();
  return (
    <div className="mx-auto w-[250px] flex flex-col items-center mt-8">
      <img src="/images/orders/empty.png" className="w-[250px]" alt="empty" />
      <div className="flex flex-col items-center gap-2 mt-4">
        <p className="text-[16px] font-primary">Тут пока ничего нет</p>
        <p className="text-[12px] text-[#888888] font-primary">{children}</p>
      </div>
      <button
        onClick={() => navigateToSection("catalog")}
        className="bg-[#ffff00] text-black py-2 w-[180px] rounded-full mt-8 flex items-center justify-center"
      >
        <p className="text-[16px] font-display">Каталог</p>
      </button>
    </div>
  );
}
