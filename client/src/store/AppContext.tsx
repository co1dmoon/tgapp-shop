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
  selectedCategoryId: number | null;
  setSelectedCategoryId: (id: number | null) => void;
  selectedProductId: number | null;
  setSelectedProductId: (id: number | null) => void;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode; }) {
  // Используем хук для навигации
  const navigation = useNavigation();

  // Устанавливаем состояния продуктов и категорий на основе текущего раздела
  const currentState = navigation.getCurrentSectionState();
  const [selectedCategoryId, setSelectedCategoryIdInternal] = useState<number | null>(
    currentState.selectedCategoryId !== undefined ? currentState.selectedCategoryId : null
  );
  const [selectedProductId, setSelectedProductIdInternal] = useState<number | null>(
    currentState.selectedProductId !== undefined ? currentState.selectedProductId : null
  );

  // Обновляем состояние в навигации при изменении выбранной категории
  const setSelectedCategoryId = useCallback((id: number | null) => {
    setSelectedCategoryIdInternal(id);
    navigation.updateSectionState({ selectedCategoryId: id });
  }, [navigation]);

  // Обновляем состояние в навигации при изменении выбранного продукта
  const setSelectedProductId = useCallback((id: number | null) => {
    setSelectedProductIdInternal(id);
    navigation.updateSectionState({ selectedProductId: id });
  }, [navigation]);

  const value = {
    // Навигация
    currentSection: navigation.currentSection,
    navigateToSection: navigation.navigateToSection,
    updateSectionState: navigation.updateSectionState,
    getCurrentSectionState: navigation.getCurrentSectionState,
    sections: navigation.sections,

    // Управление категориями и продуктами
    selectedCategoryId,
    setSelectedCategoryId,
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