import { useAppContext } from "../store/AppContext";
import DeviceNavigation from "./components/DeviceNavigation";
import Navigation from "./components/navigation";
import ProductCards from "./components/ProductCards";

export default function Catalog() {
  const { selectedCategory } = useAppContext();
  return (
    <div id="catalog">
      <Navigation />
      {selectedCategory === 'девайсы' && <DeviceNavigation />}
      <ProductCards />
    </div>
  );
}