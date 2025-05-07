import Header from './components/Header';
import { useTelegram } from './hooks';
import Catalog from './pages/catalog';
import { AppProvider, useAppContext } from './store/AppContext';
import type { AppSection } from './types';

// Компоненты для других страниц
const Orders = () => (
  <div className="p-4 bg-[#111111] text-white">
    <h1 className="text-2xl font-bold mb-4">Ваши заказы</h1>
    <p>История заказов</p>
  </div>
);

const Contact = () => (
  <div className="p-4 bg-[#111111] text-white">
    <h1 className="text-2xl font-bold mb-4">Связаться с нами</h1>
    <p>Контактная информация</p>
  </div>
);

const Info = () => (
  <div className="p-4 bg-[#111111] text-white">
    <h1 className="text-2xl font-bold mb-4">Информация</h1>
    <p>О компании и услугах</p>
  </div>
);

// Компоненты для разных разделов
const SectionComponents: Record<AppSection, React.FC> = {
  catalog: Catalog,
  orders: Orders,
  contact: Contact,
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
      <div className="min-h-screen bg-[#111111] bg text-stone-100 pb-20">
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
    </AppProvider>
  );
}

export default App;
