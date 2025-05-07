import { useProductsByCategory } from "../../hooks";
import { useAppContext } from "../../store/AppContext";
import DeviceProductCard from "./DeviceProductCard";
import ProductCardSkeleton from "./skeletons/ProductCardSkeleton";

export default function ProductCards() {
  const { selectedDeviceCategory, selectedCategory } = useAppContext();

  const category = (!selectedCategory) ? 'pc' : (!selectedDeviceCategory ? null : selectedDeviceCategory);

  const bestOffers = !selectedCategory || (selectedCategory === 'девайсы' && !selectedDeviceCategory);

  const { data: products, isLoading } = useProductsByCategory({ category, bestOffers });

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
    <div className="grid grid-cols-2 p-4 gap-4">
      {products?.map((product) => (
        <DeviceProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}