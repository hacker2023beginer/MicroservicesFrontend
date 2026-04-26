import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8080',
});

// Перехватчик ЗАПРОСОВ (добавляет токен ко всем запросам)
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Перехватчик ОТВЕТОВ (ловит 403 ошибки и делает refresh)
api.interceptors.response.use(
    (response) => {
        return response; // Если запрос успешен, просто возвращаем ответ
    },
    async (error) => {
        const originalRequest = error.config;

        // Если прилетела ошибка 401 или 403, и мы еще не пытались повторить этот запрос (_retry)
        if (error.response && (error.response.status === 401 || error.response.status === 403) && !originalRequest._retry) {
            originalRequest._retry = true; // Ставим флаг, чтобы не зациклиться

            try {
                const refreshToken = localStorage.getItem('refreshToken');
                
                if (!refreshToken) {
                    // Если рефреш-токена нет, просто выкидываем на логин
                    localStorage.clear();
                    window.location.href = '/login';
                    return Promise.reject(error);
                }

                // ⚠️ ВАЖНО: Делаем запрос на обновление токена.
                // Используем обычный axios (не api), чтобы не сработали перехватчики!
                const response = await axios.post('http://localhost:8080/auth/refresh', {
                    refreshToken: refreshToken
                });

                // Достаем новые токены из ответа (подставь свои ключи DTO, если они отличаются)
                const newAccessToken = response.data.accessToken;
                const newRefreshToken = response.data.refreshToken;

                // Сохраняем новые токены в память браузера
                localStorage.setItem('token', newAccessToken);
                if (newRefreshToken) {
                    localStorage.setItem('refreshToken', newRefreshToken);
                }

                // Обновляем заголовок Authorization в упавшем запросе
                originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
                
                // Повторяем оригинальный запрос с новым токеном!
                return api(originalRequest);

            } catch (refreshError) {
                // Если Refresh Token тоже протух или не подошел - выкидываем из системы
                console.error('Ошибка обновления токена. Требуется повторная авторизация.', refreshError);
                localStorage.clear();
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default api;