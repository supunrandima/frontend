import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to automatically attach authorization tokens based on endpoint prefixes
apiClient.interceptors.request.use(
  (config) => {
    let token = null;

    if (config.url.startsWith('/admin')) {
      token = localStorage.getItem('adminToken') || sessionStorage.getItem('adminToken');
    } else if (
      config.url.startsWith('/staff') || 
      config.url.startsWith('/order/kitchen') || 
      (config.url.startsWith('/order/') && config.url.endsWith('/status'))
    ) {
      token = localStorage.getItem('staffToken') || sessionStorage.getItem('staffToken');
    } else {
      token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;
