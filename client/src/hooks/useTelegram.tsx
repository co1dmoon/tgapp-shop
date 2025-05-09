import WebApp from '@twa-dev/sdk';
import { useEffect, useState } from 'react';

/**
 * Хук для работы с Telegram WebApp API
 */
export function useTelegram() {
  const [user, setUser] = useState<{
    id: string;
    username?: string;
    firstName?: string;
    lastName?: string;
  } | null>(null);

  const [isInitialized, setIsInitialized] = useState(false);
  const [webAppReady, setWebAppReady] = useState(false);

  useEffect(() => {
    // Инициализация WebApp при монтировании компонента
    const initWebApp = () => {
      try {
        // Убеждаемся, что WebApp API существует
        if (!WebApp) {
          throw new Error("Telegram WebApp is not available");
        }

        // Отключаем swipe back жест и настраиваем заголовок;
        WebApp.disableClosingConfirmation();
        WebApp.setHeaderColor("#161616"); // Темный цвет заголовка
        WebApp.setBackgroundColor("#161616"); // Темный цвет фона
        WebApp.expand(); // Расширяем приложение на весь экран
        WebApp.ready(); // Говорим Telegram что приложение готово
        setWebAppReady(true);

        // Получаем информацию о пользователе
        if (WebApp.initDataUnsafe?.user) {
          const telegramUser = WebApp.initDataUnsafe.user;
          setUser({
            id: telegramUser.id.toString(),
            username: telegramUser.username,
            firstName: telegramUser.first_name,
            lastName: telegramUser.last_name,
          });
        }

        setIsInitialized(true);
      } catch (error) {
        console.error('Error initializing Telegram WebApp:', error);

        // Фейковый пользователь для локальной разработки
        if (import.meta.env.VITE_NODE_ENV === "development") {
          console.log("Running in development mode with mock user");
          setUser({
            id: "123456789",
            username: "test_user",
            firstName: "Test",
            lastName: "User",
          });
          setIsInitialized(true);
          setWebAppReady(true);
        }
      }
    };

    initWebApp();
  }, []);

  // Методы для работы с WebApp
  const showAlert = (message: string) => {
    if (webAppReady) {
      WebApp.showAlert(message);
    } else {
      alert(message);
    }
  };

  const showConfirm = (message: string, callback: (confirmed: boolean) => void) => {
    if (webAppReady) {
      WebApp.showConfirm(message, callback);
    } else {
      const confirmed = window.confirm(message);
      callback(confirmed);
    }
  };

  const closeWebApp = () => {
    if (webAppReady) {
      WebApp.close();
    }
  };

  // Метод для отправки данных в бот
  const sendData = (data: Record<string, unknown>) => {
    if (webAppReady) {
      WebApp.sendData(JSON.stringify(data));
    } else {
      console.log('Mock sending data to Telegram:', data);
    }
  };

  // Метод для управления кнопкой Main Button
  const mainButton = {
    setText: (text: string) => {
      if (webAppReady) WebApp.MainButton.setText(text);
    },
    show: () => {
      if (webAppReady) WebApp.MainButton.show();
    },
    hide: () => {
      if (webAppReady) WebApp.MainButton.hide();
    },
    onClick: (callback: () => void) => {
      if (webAppReady) {
        WebApp.MainButton.onClick(callback);
        return () => WebApp.MainButton.offClick(callback);
      }
      return () => { };
    },
  };

  return {
    user,
    isInitialized,
    webAppReady,
    showAlert,
    showConfirm,
    closeWebApp,
    sendData,
    mainButton,
  };
} 