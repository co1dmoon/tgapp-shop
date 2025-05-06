import Header from "./components/Header";
import { useTelegram } from './hooks';
import { AppProvider, useAppContext } from './store/AppContext';
import type { AppSection } from './types';

// Плейсхолдеры для разных секций (будут заменены на компоненты позже)
const SectionRenderers: Record<AppSection, () => React.ReactNode> = {
  catalog: () => (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">Каталог товаров</h1>
      <p className="text-stone-300">Здесь будет каталог</p>
    </div>
  ),
  orders: () => (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">Ваши заказы</h1>
      <p className="text-stone-300">История заказов</p>
    </div>
  ),
  contact: () => (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">Связаться с нами</h1>
      <p className="text-stone-300">Контактная информация</p>
    </div>
  ),
  info: () => (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">Информация</h1>
      <p className="text-stone-300">О компании и услугах</p>
    </div>
  )
};

function Main() {
  // Используем контекст приложения для получения текущей секции
  const { currentSection } = useAppContext();

  // Отображаем соответствующий компонент для текущей секции
  const SectionComponent = SectionRenderers[currentSection];

  return <SectionComponent />;
}

function App() {
  const { isInitialized } = useTelegram();

  return (
    <AppProvider>
      <div className="min-h-screen bg-[#111111] text-stone-100">
        <Header />
        <main className="container mx-auto px-4 py-6">
          {isInitialized ? (
            <Main />
          ) : (
              <div className="flex justify-center items-center h-64">
                <p className="text-lg">Загрузка...</p>
              </div>
          )}
        </main>
      </div>
    </AppProvider>
  );
}

export default App;
