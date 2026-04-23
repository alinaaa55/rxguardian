import api from './api';
import { storage } from './storage';

export const authService = {
  async register(name: string, email: string, password: string) {
    const response = await api.post('/api/v1/auth/register', {
      name,
      email,
      password,
    });
    
    if (response.data.access_token) {
      await storage.saveToken(response.data.access_token);
      await storage.saveUserInfo(response.data.user);
    }
    
    return response.data;
  },

  async login(email: string, password: string) {
    const response = await api.post('/api/v1/auth/login', {
      email,
      password,
    });
    
    if (response.data.access_token) {
      await storage.saveToken(response.data.access_token);
      await storage.saveUserInfo(response.data.user);
    }
    
    return response.data;
  },

  async logout() {
    await storage.clearAll();
  }
};
