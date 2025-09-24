import WebApp from '@twa-dev/sdk';
import { useEffect, useState } from 'react';
/**
 * Хук для работы с Telegram WebApp API
 */
export function useTelegram() {
  const [user, setUser] = useState<typeof WebApp.initDataUnsafe.user | null>(null);

  const [isInitialized, setIsInitialized] = useState(false);
  const [webAppReady, setWebAppReady] = useState(false);

  // Ожидаем появления window.Telegram.WebApp (актуально для Android)
  const waitForTG = async (timeout = 3000): Promise<boolean> => {
    const start = Date.now();
    while (Date.now() - start < timeout) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((window as any)?.Telegram?.WebApp) return true;
      await new Promise((r) => setTimeout(r, 50));
    }
    return false;
  };

  useEffect(() => {
    let cancelled = false;
    // Лениво инициализируем WebApp после появления API
    (async () => {
      try {
        const ok = await waitForTG(3000);
        if (!ok || cancelled) return;

        WebApp.ready();
        WebApp.expand();
        WebApp.setHeaderColor("#161616");
        WebApp.setBackgroundColor("#161616");
        WebApp.disableClosingConfirmation();
        setWebAppReady(true);

        if (WebApp.initDataUnsafe?.user) {
          setUser(WebApp.initDataUnsafe.user);
        }
      } catch (error) {
        console.error('Error initializing Telegram WebApp:', error);
      } finally {
        if (!cancelled) setIsInitialized(true);
      }
    })();

    return () => {
      cancelled = true;
    };
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