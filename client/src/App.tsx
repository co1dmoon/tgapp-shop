import Header from './components/Header';
import { useTelegram } from './hooks';
import Cart from "./pages/cart";
import Catalog from './pages/catalog';
import Contacts from "./pages/contacts";
import Orders from "./pages/orders";
import { AppProvider, useAppContext } from "./store/AppContext";
import { CartProvider } from "./store/CartContext";
import type { AppSection } from "./types";

const Info = () => (
  <div>
    <img src="/images/info.png" alt="info" className='w-full h-full' />
  </div>
);

const SectionComponents: Record<AppSection, React.FC> = {
  catalog: Catalog,
  cart: Cart,
  orders: Orders,
  contact: Contacts,
  info: Info,
};

function Main() {
  // Используем контекст приложения для получения текущей секции
  const { currentSection } = useAppContext();

  // Получаем компонент для текущей секции
  const SectionComponent = SectionComponents[currentSection];

  return <SectionComponent />;
}

function App() {
  const { isInitialized } = useTelegram();

  return (
    <AppProvider>
      <CartProvider>
        <div className="min-h-screen bg-[#111111] text-stone-100 pb-20 bg">
          {isInitialized ? (
            <>
              <Header />
              <Main />
            </>
          ) : (
            <div className="flex justify-center items-center h-screen">
              <p className="text-lg text-white">Загрузка...</p>
            </div>
          )}
        </div>
      </CartProvider>
    </AppProvider>
  );
}

export default App;
