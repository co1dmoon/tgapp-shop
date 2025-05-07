import { useProductsByCategory } from "../../../hooks";
import { useAppContext } from "../../../store/AppContext";
import ProductCard from "./ProductCard";
import ProductCardSkeleton from "./skeletons/ProductCardSkeleton";

export default function ProductCards() {
  const { selectedDeviceCategory, selectedCategory } = useAppContext();

  const category = !selectedCategory
    ? "pc"
    : !selectedDeviceCategory
    ? null
    : selectedDeviceCategory;

  const bestOffers =
    !selectedCategory ||
    (selectedCategory === "девайсы" && !selectedDeviceCategory);

  const { data: products, isLoading } = useProductsByCategory({
    category,
    bestOffers,
  });

  console.log(products);

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
        (selectedCategory === "девайсы" && !selectedDeviceCategory)) && (
        <p className="text-white text-[16px] font-display">
          наши лучшие предложения
        </p>
      )}
      <div className="grid grid-cols-2 py-4 gap-4">
        {products?.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
