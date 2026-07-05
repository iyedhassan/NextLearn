import axios from 'axios';

export const BASE_URL = 'http://localhost:8000';

const api = axios.create({
    baseURL: `${BASE_URL}/api`,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
    withCredentials: true,
});

export const getCsrfCookie = () => axios.get(`${BASE_URL}/sanctum/csrf-cookie`, { withCredentials: true });

// Add a request interceptor to include the bearer token
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    // Explicitly set the X-XSRF-TOKEN header from the cookie if present
    const xsrfToken = document.cookie
        .split('; ')
        .find(row => row.startsWith('XSRF-TOKEN='))
        ?.split('=')[1];

    if (xsrfToken) {
        config.headers['X-XSRF-TOKEN'] = decodeURIComponent(xsrfToken);
    }

    return config;
});

export default api;
