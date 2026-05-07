import { useProductsByCategory } from "../../../hooks";
import { useAppContext } from "../../../store/AppContext";
import ProductCard from "./ProductCard";
import ProductCardSkeleton from "./skeletons/ProductCardSkeleton";

export default function ProductCards() {
  const { selectedDeviceCategory, selectedCategory, selectedPcCategory } = useAppContext();

  // В корне «девайсы» (выбран таб, но конкретная подкатегория ещё нет) — ни «лучших
  // предложений», ни списка товаров не показываем. Показывается только сетка
  // подкатегорий из DeviceNavigation, размещённого выше.
  const isDevicesRoot = selectedCategory === "девайсы" && !selectedDeviceCategory;

  const category =
    !selectedCategory || selectedCategory === "игровые пк"
      ? (selectedPcCategory ?? 'pc')
      : (selectedDeviceCategory ?? null);

  const bestOffers =
    !selectedCategory ||
    (selectedCategory === 'игровые пк' && !selectedPcCategory);

  const { data: products, isLoading } = useProductsByCategory({
    category,
    bestOffers,
    enabled: !isDevicesRoot,
  });

  // Внутри конкретной категории — сортируем по последнему числу в имени:
  // PRIME 1 / PRIME 2 / PRIME 3 / PRIME 4, PHANTOM 1..4 и т.п. Если число
  // в имени не нашлось — таких выбрасываем в конец, дальше алфавит.
  // Для «лучших предложений» порядок определяет API (favoriteRank ASC),
  // не пересортировываем чтобы не сломать ранги.
  const trailingNumber = (name: string): number => {
    const m = String(name).match(/(\d+)(?!.*\d)/);
    return m ? parseInt(m[1], 10) : Number.MAX_SAFE_INTEGER;
  };

  const sortedProducts = bestOffers
    ? products
    : [...(products ?? [])].sort((a, b) => {
        const na = trailingNumber(a.name);
        const nb = trailingNumber(b.name);
        if (na !== nb) return na - nb;
        return a.name.localeCompare(b.name, 'ru');
      });

  if (isDevicesRoot) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 p-4 gap-4">
        {[...Array(4)].map((_, index) => (
          <ProductCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  const showBestOffersHeader =
    !selectedCategory || (selectedCategory === "игровые пк" && !selectedPcCategory);

  return (
    <div className="flex flex-col p-4">
      {showBestOffersHeader && (
        <p className="text-white text-[16px] font-display">
          наши лучшие предложения
        </p>
      )}
      <div className="grid grid-cols-2 py-4 gap-4">
        {sortedProducts?.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
