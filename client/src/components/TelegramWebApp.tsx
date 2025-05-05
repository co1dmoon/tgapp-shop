import WebApp from "@twa-dev/sdk";
import type { FC, ReactNode } from "react";
import { useEffect } from "react";

interface TelegramWebAppProps {
  children: ReactNode;
  onClose?: () => void;
}

const TelegramWebApp: FC<TelegramWebAppProps> = ({ children, onClose }) => {
  useEffect(() => {
    // Инициализация WebApp
    WebApp.ready();

    // Настройка кнопки "Назад"
    const backButtonHandler = () => {
      if (onClose) {
        onClose();
      } else {
        WebApp.BackButton.hide();
      }
    };

    WebApp.BackButton.onClick(backButtonHandler);

    // Настройка внешнего вида
    WebApp.setHeaderColor("#FFFFFF");
    WebApp.setBackgroundColor("#F8F9FA");

    // Очистка при размонтировании
    return () => {
      WebApp.BackButton.offClick(backButtonHandler);
    };
  }, [onClose]);

  return <>{children}</>;
};

export default TelegramWebApp;

// Хелперы для Telegram WebApp
export const openTelegramLink = (url: string) => {
  WebApp.openLink(url);
};

export const closeTelegramWebApp = () => {
  WebApp.close();
};

export const showTelegramAlert = (message: string) => {
  WebApp.showAlert(message);
};

interface PopupButton {
  type: "default" | "destructive";
  text: string;
  id?: string;
}

export const showTelegramPopup = (
  message: string,
  buttons: PopupButton[] = [{ type: "default", text: "ОК" }]
) => {
  WebApp.showPopup({ message, buttons });
};

export const sendTelegramData = (data: Record<string, unknown>) => {
  WebApp.sendData(JSON.stringify(data));
};

// Получение стилей из темы Telegram
export const getTelegramThemeParams = () => {
  return WebApp.themeParams;
};
