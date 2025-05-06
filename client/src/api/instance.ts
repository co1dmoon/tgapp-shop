import axios from 'axios';
import { API_URL } from '../utils/constants';

// Создаем инстанс axios с базовыми настройками
const API = axios.create({
  baseURL: API_URL,
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