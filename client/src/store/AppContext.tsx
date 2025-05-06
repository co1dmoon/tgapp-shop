import type { ReactNode } from 'react';
import { createContext, useCallback, useContext, useState } from 'react';
import { useNavigation } from '../hooks/useNavigation';
import type { AppSection, SectionState } from '../types/navigation';
import { NAVIGATION } from '../utils/constants';

type AppContextType = {
  // Навигация между разделами
  currentSection: AppSection;
  navigateToSection: (section: AppSection) => void;
  updateSectionState: (state: SectionState) => void;
  getCurrentSectionState: () => SectionState;
  sections: typeof NAVIGATION.SECTIONS;

  // Управление категориями и продуктами
  selectedCategory: 'игровые пк' | 'девайсы' | null;
  setSelectedCategory: (category: 'игровые пк' | 'девайсы' | null) => void;
  selectedDeviceCategory: number | null;
  setSelectedDeviceCategory: (id: number | null) => void;
  selectedProductId: number | null;
  setSelectedProductId: (id: number | null) => void;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode; }) {
  // Используем хук для навигации
  const navigation = useNavigation();

  // Устанавливаем состояния продуктов и категорий на основе текущего раздела
  const currentState = navigation.getCurrentSectionState();
  const [selectedCategory, setSelectedCategoryInternal] = useState<'игровые пк' | 'девайсы' | null>(
    currentState.selectedCategory !== undefined ? currentState.selectedCategory : null
  );
  const [selectedDeviceCategory, setSelectedDeviceCategoryInternal] = useState<number | null>(
    currentState.selectedDeviceCategory !== undefined ? currentState.selectedDeviceCategory : null
  );
  const [selectedProductId, setSelectedProductIdInternal] = useState<number | null>(
    currentState.selectedProductId !== undefined ? currentState.selectedProductId : null
  );

  // Обновляем состояние в навигации при изменении выбранной категории
  const setSelectedCategory = useCallback((category: 'игровые пк' | 'девайсы' | null) => {
    setSelectedCategoryInternal(category);
    navigation.updateSectionState({ selectedCategory: category });
  }, [navigation]);

  // Обновляем состояние в навигации при изменении выбранного продукта
  const setSelectedProductId = useCallback((id: number | null) => {
    setSelectedProductIdInternal(id);
    navigation.updateSectionState({ selectedProductId: id });
  }, [navigation]);

  const setSelectedDeviceCategory = useCallback((id: number | null) => {
    setSelectedDeviceCategoryInternal(id);
    navigation.updateSectionState({ selectedDeviceCategory: id });
  }, [navigation]);

  const value = {
    // Навигация
    currentSection: navigation.currentSection,
    navigateToSection: navigation.navigateToSection,
    updateSectionState: navigation.updateSectionState,
    getCurrentSectionState: navigation.getCurrentSectionState,
    sections: navigation.sections,

    // Управление категориями и продуктами
    selectedCategory,
    setSelectedCategory,
    selectedDeviceCategory,
    setSelectedDeviceCategory,
    selectedProductId,
    setSelectedProductId,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const context = useContext(AppContext);

  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }

  return context;
} 