import { useProductsByCategory } from "../../../hooks";
import { useAppContext } from "../../../store/AppContext";
import ProductCard from "./ProductCard";
import ProductCardSkeleton from "./skeletons/ProductCardSkeleton";

export default function ProductCards() {
  const { selectedDeviceCategory, selectedCategory, selectedPcCategory } = useAppContext();

  const category =
    !selectedCategory || selectedCategory === "игровые пк"
      ? (selectedPcCategory ?? 'pc')
      : (selectedDeviceCategory ?? null);


  const bestOffers =
    !selectedCategory ||
    (selectedCategory === "девайсы" && !selectedDeviceCategory) ||
    (selectedCategory === 'игровые пк' && !selectedPcCategory)
    ;

  const { data: products, isLoading } = useProductsByCategory({
    category,
    bestOffers,
  });

  const sortedProducts = products?.sort(
    (a, b) => (a.favoriteRank ?? 0) - (b.favoriteRank ?? 0)
  );

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 p-4 gap-4">
        {[...Array(4)].map((_, index) => (
          <ProductCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col p-4">
      {(!selectedCategory ||
        (selectedCategory === "девайсы" && !selectedDeviceCategory) ||
        (selectedCategory === "игровые пк" && !selectedPcCategory)) && (
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
