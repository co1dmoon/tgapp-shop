import WebApp from '@twa-dev/sdk';
import { useCallback, useEffect, useState } from 'react';
import type { AppSection, SectionState } from '../types/navigation';
import { NAVIGATION } from '../utils/constants';

// Ключ для хранения в localStorage
const STORAGE_KEY = 'tgapp-shop-navigation';

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
 * Хук для управления навигацией по разделам приложения с сохранением состояния
 */
export function useNavigation() {
  // Проверяем доступность localStorage и WebApp
  const storageAvailable = isLocalStorageAvailable();
  const webAppAvailable = typeof WebApp !== 'undefined' && WebApp.initData && WebApp.initData.length > 0;

  // Загружаем сохраненное состояние при инициализации
  const loadInitialState = (): {
    currentSection: AppSection;
    sectionStates: Record<AppSection, SectionState>;
  } => {
    // Пытаемся загрузить сохраненное состояние
    if (storageAvailable) {
      try {
        const savedNavigation = localStorage.getItem(STORAGE_KEY);
        if (savedNavigation) {
          return JSON.parse(savedNavigation);
        }
      } catch (error) {
        console.error('Ошибка при загрузке состояния навигации:', error);
      }
    }
    
    // Состояние по умолчанию, если нет сохраненного
    return {
      currentSection: NAVIGATION.DEFAULT_SECTION,
      sectionStates: {
        catalog: { selectedCategory: null, selectedDeviceCategory: null, selectedProductId: null },
        orders: { selectedOrderId: null },
        contact: { scrollPosition: 0 },
        info: { scrollPosition: 0 }
      }
    };
  };

  const initialState = loadInitialState();
  
  // Храним текущий раздел в состоянии
  const [currentSection, setCurrentSection] = useState<AppSection>(initialState.currentSection);

  // Состояние для каждого раздела
  const [sectionStates, setSectionStates] = useState<Record<AppSection, SectionState>>(
    initialState.sectionStates
  );

  // Загружаем данные из Telegram CloudStorage при инициализации
  useEffect(() => {
    if (webAppAvailable && WebApp.CloudStorage) {
      // Синхронизируем важные состояния из облака Telegram (например, корзину или заказы)
      const keysToSync = ['orders'];
      
      // Для каждого ключа проверяем наличие в облачном хранилище
      keysToSync.forEach(key => {
        WebApp.CloudStorage.getItem(`${STORAGE_KEY}-${key}`, (error, value) => {
          if (!error && value) {
            try {
              const cloudData = JSON.parse(value);
              
              // Обновляем только этот конкретный ключ в общем состоянии
              setSectionStates(prevState => ({
                ...prevState,
                [key]: cloudData
              }));
              
              console.log(`Загружены данные из CloudStorage для ${key}`);
            } catch (parseError) {
              console.error(`Ошибка при разборе данных из CloudStorage для ${key}:`, parseError);
            }
          }
        });
      });
    }
  }, [webAppAvailable]);

  // Сохраняем состояние в localStorage при изменении
  useEffect(() => {
    if (storageAvailable) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ 
          currentSection, 
          sectionStates 
        }));
      } catch (error) {
        console.error('Ошибка при сохранении состояния навигации:', error);
      }
    }
  }, [currentSection, sectionStates, storageAvailable]);

  // Если доступен WebApp SDK и включено CloudStorage, используем его для синхронизации через облако
  useEffect(() => {
    if (webAppAvailable && WebApp.CloudStorage) {
      try {
        // Синхронизируем важные состояния в облаке Telegram (например, корзину или заказы)
        const keysToSync = ['orders'];
        
        // Синхронизируем только нужные ключи из sectionStates
        keysToSync.forEach(key => {
          if (sectionStates[key as AppSection]) {
            WebApp.CloudStorage.setItem(
              `${STORAGE_KEY}-${key}`, 
              JSON.stringify(sectionStates[key as AppSection])
            );
          }
        });
      } catch (error) {
        console.error('Ошибка при синхронизации с CloudStorage:', error);
      }
    }
  }, [sectionStates, webAppAvailable]);

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