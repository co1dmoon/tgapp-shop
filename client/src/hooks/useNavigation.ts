import { useCallback, useState } from 'react';
import type { AppSection, SectionState } from '../types/navigation';
import { NAVIGATION } from '../utils/constants';

/**
 * Хук для управления навигацией по разделам приложения
 */
export function useNavigation() {
  // Храним текущий раздел в состоянии
  const [currentSection, setCurrentSection] = useState<AppSection>(NAVIGATION.DEFAULT_SECTION);

  // Состояние для каждого раздела
  const [sectionStates, setSectionStates] = useState<Record<AppSection, SectionState>>({
    catalog: { selectedCategoryId: null, selectedProductId: null },
    orders: { selectedOrderId: null },
    contact: { scrollPosition: 0 },
    info: { scrollPosition: 0 }
  });

  // Метод для навигации к разделу
  const navigateToSection = useCallback((section: AppSection) => {
    setCurrentSection(section);
  }, []);

  // Метод для обновления состояния текущего раздела
  const updateSectionState = useCallback((state: SectionState) => {
    setSectionStates(prevStates => ({
      ...prevStates,
      [currentSection]: {
        ...prevStates[currentSection],
        ...state
      }
    }));
  }, [currentSection]);

  // Метод получения текущего состояния раздела
  const getCurrentSectionState = useCallback(() => {
    return sectionStates[currentSection];
  }, [currentSection, sectionStates]);

  return {
    // Текущий раздел
    currentSection,
    // Методы навигации
    navigateToSection,
    // Методы управления состоянием раздела
    updateSectionState,
    getCurrentSectionState,
    // Доступ к состояниям разделов напрямую
    sectionStates,
    // Доступ к списку доступных разделов
    sections: NAVIGATION.SECTIONS
  };
} 