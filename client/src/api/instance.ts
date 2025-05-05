import axios from 'axios';

// Создаем инстанс axios с базовыми настройками
const API = axios.create({
  baseURL: 'https://68fc-185-233-203-224.ngrok-free.app',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Перехватчик запросов - можно добавить токены, логи и т.д.
API.interceptors.request.use(
  (config) => {
    // Тут можно добавить логику для аутентификации
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Перехватчик ответов - для стандартной обработки ошибок
API.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    // Обработка ошибок сервера
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error.response?.data || error);
  }
);

export default API; 