import { useCategories } from '../hooks';
import { useAppContext } from '../store/AppContext';

export default function CategoriesList() {
  const { data: categories, isLoading, error } = useCategories();
  const { selectedCategoryId, setSelectedCategoryId } = useAppContext();

  if (isLoading) {
    return <div className="py-4">Загрузка категорий...</div>;
  }

  if (error) {
    return <div className="py-4 text-red-500">Ошибка при загрузке категорий</div>;
  }

  if (!categories || categories.length === 0) {
    return <div className="py-4">Категории не найдены</div>;
  }

  return (
    <div className="mb-6">
      <h2 className="text-xl mb-4 font-medium">Категории</h2>
      <div className="flex flex-wrap gap-2">
        <button
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${selectedCategoryId === null
            ? 'bg-blue-600 text-white'
            : 'bg-stone-800 hover:bg-stone-700 text-stone-200'
            }`}
          onClick={() => setSelectedCategoryId(null)}
        >
          Все товары
        </button>

        {categories.map((category) => (
          <button
            key={category.id}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${selectedCategoryId === category.id
              ? 'bg-blue-600 text-white'
              : 'bg-stone-800 hover:bg-stone-700 text-stone-200'
              }`}
            onClick={() => setSelectedCategoryId(category.id)}
          >
            {category.name}
          </button>
        ))}
      </div>
    </div>
  );
} 