import axios from 'axios';

export const api = axios.create({
    baseURL: 'http://localhost:8080/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(config => {
    const userId = localStorage.getItem('userId');
    if (userId) {
        config.headers['X-User-Id'] = userId;
    }
    return config;
});

api.interceptors.response.use(
    response => response,
    error => {
        if (error.response?.status === 403) {
            console.error("Session expired or unauthorized. Redirecting to login...");
            localStorage.clear();
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;
