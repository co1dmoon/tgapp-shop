import { useEffect, useState } from 'react';
import Header from './components/Header';
import { SplashLoader } from './components';
import { useCategories, useTelegram } from './hooks';
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
  // Дёргаем категории сразу — это первый запрос, который точно нужен
  // на любом экране каталога. Если он ещё не успел — держим сплеш.
  const { isLoading: categoriesLoading } = useCategories();

  // Минимальная длительность сплеша, чтобы не моргал у тех, у кого всё
  // прилетело за 100мс. Делает ощущения «живыми».
  const [minTimePassed, setMinTimePassed] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setMinTimePassed(true), 600);
    return () => clearTimeout(t);
  }, []);

  const showSplash = !isInitialized || categoriesLoading || !minTimePassed;

  return (
    <AppProvider>
      <CartProvider>
        <SplashLoader loading={showSplash} />
        <div className="min-h-screen bg-[#111111] text-stone-100 pb-20 bg">
          <Header />
          <Main />
        </div>
      </CartProvider>
    </AppProvider>
  );
}

export default App;
