import { useCallback, useEffect, useState } from 'react';
import type { AppSection, SectionState } from '../types/navigation';
import { NAVIGATION } from '../utils/constants';

// Ключ для хранения в localStorage
const STORAGE_KEY = 'tgapp-shop-current-section';

/**
 * Проверка доступности localStorage
 */
const isLocalStorageAvailable = (): boolean => {
  try {
    const testKey = '__storage_test__';
    localStorage.setItem(testKey, testKey);
    localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
};

/**
 * Хук для управления навигацией по разделам приложения с сохранением только текущей секции
 */
export function useNavigation() {
  // Проверяем доступность localStorage
  const storageAvailable = isLocalStorageAvailable();

  // Загружаем сохраненную текущую секцию при инициализации
  const loadInitialSection = (): AppSection => {
    // Пытаемся загрузить сохраненную секцию
    if (storageAvailable) {
      try {
        const savedSection = localStorage.getItem(STORAGE_KEY);
        if (savedSection) {
          return savedSection as AppSection;
        }
      } catch (error) {
        console.error('Ошибка при загрузке текущей секции:', error);
      }
    }
    
    // Секция по умолчанию, если нет сохраненной
    return NAVIGATION.DEFAULT_SECTION;
  };

  // Инициализируем состояние секций по умолчанию (без загрузки из хранилища)
  const getDefaultSectionStates = (): Record<AppSection, SectionState> => {
    return {
      catalog: { selectedCategory: null, selectedDeviceCategory: null, selectedProductId: null },
      cart: { scrollPosition: 0 },
      orders: { selectedOrderId: null },
      contact: { scrollPosition: 0 },
      info: { scrollPosition: 0 }
    };
  };

  // Храним текущий раздел в состоянии
  const [currentSection, setCurrentSection] = useState<AppSection>(loadInitialSection());

  // Состояние для каждого раздела (всегда создается заново при загрузке страницы)
  const [sectionStates, setSectionStates] = useState<Record<AppSection, SectionState>>(
    getDefaultSectionStates()
  );

  // Сохраняем только текущую секцию в localStorage при изменении
  useEffect(() => {
    if (storageAvailable) {
      try {
        localStorage.setItem(STORAGE_KEY, currentSection);
      } catch (error) {
        console.error('Ошибка при сохранении текущей секции:', error);
      }
    }
  }, [currentSection, storageAvailable]);

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