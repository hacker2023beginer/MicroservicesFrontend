import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8080', // Адрес твоего Gateway
});

// Добавляем токен ко всем запросам
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Глобальная обработка ошибок
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response) {
            if (error.response.status === 401) {
                // Если токен протух - разлогиниваем
                localStorage.removeItem('token');
                localStorage.removeItem('userId');
                window.location.href = '/login';
            }
            // Здесь можно добавить Toast/Alert из Bootstrap для вывода ошибок
            console.error('API Error:', error.response.data);
            alert(`Ошибка: ${error.response.data.message || 'Что-то пошло не так'}`);
        } else {
            alert('Ошибка соединения с сервером');
        }
        return Promise.reject(error);
    }
);

export default api;