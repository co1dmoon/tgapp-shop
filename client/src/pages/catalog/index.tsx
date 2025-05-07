import { useAppContext } from "../../store/AppContext";
import DeviceNavigation from "./components/DeviceNavigation";
import Navigation from "./components/navigation";
import ProductCards from "./components/ProductCards";
import ProductDetails from "./components/productDetails";

export default function Catalog() {
  const { selectedCategory, selectedProductId } = useAppContext();

  if (selectedProductId) {
    return <ProductDetails />;
  }

  return (
    <div id="catalog">
      <Navigation />
      {selectedCategory === "девайсы" && <DeviceNavigation />}
      <ProductCards />
    </div>
  );
}
