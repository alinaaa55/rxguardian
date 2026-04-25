import axios from 'axios';
import * as storage from './storage';

const API_URL = 'https://coletta-snouted-rigoberto.ngrok-free.dev';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  async (config) => {
    const token = await storage.storage.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear token and maybe redirect
      // You might want to use a state management or event bus here to trigger logout
      // For now we just reject the error
    }
    return Promise.reject(error);
  }
);

export default api;
