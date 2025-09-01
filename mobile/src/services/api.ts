import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { User, Transaction, Category, Notification, NotificationPreference, Subscription, Payment } from '../types';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://timecashking-api.onrender.com';

class ApiService {
  private api = axios.create({
    baseURL: API_URL,
    timeout: 10000,
  });

  constructor() {
    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      async (config) => {
        const token = await SecureStore.getItemAsync('auth_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor to handle errors
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          // Token expired or invalid
          await SecureStore.deleteItemAsync('auth_token');
          await SecureStore.deleteItemAsync('user_data');
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints
  async loginWithGoogle(credential: string): Promise<{ user: User; token: string }> {
    const response = await this.api.post('/auth/google', { credential });
    const { user, token } = response.data;
    
    // Store auth data
    await SecureStore.setItemAsync('auth_token', token);
    await SecureStore.setItemAsync('user_data', JSON.stringify(user));
    
    return { user, token };
  }

  async logout(): Promise<void> {
    await SecureStore.deleteItemAsync('auth_token');
    await SecureStore.deleteItemAsync('user_data');
  }

  async getCurrentUser(): Promise<User> {
    const response = await this.api.get('/auth/me');
    return response.data;
  }

  // Transaction endpoints
  async getTransactions(page = 1, pageSize = 20): Promise<{
    transactions: Transaction[];
    pagination: { page: number; pageSize: number; total: number; totalPages: number };
  }> {
    const response = await this.api.get(`/transactions?page=${page}&pageSize=${pageSize}`);
    return response.data;
  }

  async createTransaction(data: {
    type: 'INCOME' | 'EXPENSE';
    amount: number;
    description?: string;
    categoryId?: string;
    date?: string;
  }): Promise<Transaction> {
    const response = await this.api.post('/transactions', data);
    return response.data;
  }

  async updateTransaction(id: string, data: Partial<Transaction>): Promise<Transaction> {
    const response = await this.api.patch(`/transactions/${id}`, data);
    return response.data;
  }

  async deleteTransaction(id: string): Promise<void> {
    await this.api.delete(`/transactions/${id}`);
  }

  // Category endpoints
  async getCategories(): Promise<Category[]> {
    const response = await this.api.get('/categories');
    return response.data;
  }

  async createCategory(name: string): Promise<Category> {
    const response = await this.api.post('/categories', { name });
    return response.data;
  }

  async updateCategory(id: string, name: string): Promise<Category> {
    const response = await this.api.patch(`/categories/${id}`, { name });
    return response.data;
  }

  async deleteCategory(id: string): Promise<void> {
    await this.api.delete(`/categories/${id}`);
  }

  // Summary endpoints
  async getSummary(period: 'week' | 'month' | 'year' = 'month'): Promise<{
    totalIncome: number;
    totalExpense: number;
    balance: number;
    transactions: Transaction[];
  }> {
    const response = await this.api.get(`/summary?period=${period}`);
    return response.data;
  }

  // Subscription endpoints
  async getSubscriptionPlans(): Promise<any[]> {
    const response = await this.api.get('/subscription/plans');
    return response.data;
  }

  async getCurrentSubscription(): Promise<Subscription | null> {
    const response = await this.api.get('/subscription/current');
    return response.data;
  }

  async createCheckoutSession(planId: string): Promise<{ url: string }> {
    const response = await this.api.post('/subscription/create-checkout', { planId });
    return response.data;
  }

  async cancelSubscription(): Promise<void> {
    await this.api.post('/subscription/cancel');
  }

  async getPayments(): Promise<Payment[]> {
    const response = await this.api.get('/subscription/payments');
    return response.data;
  }

  // Notification endpoints
  async getNotifications(page = 1, pageSize = 20): Promise<{
    notifications: Notification[];
    pagination: { page: number; pageSize: number; total: number; totalPages: number };
  }> {
    const response = await this.api.get(`/notifications?page=${page}&pageSize=${pageSize}`);
    return response.data;
  }

  async getUnreadCount(): Promise<{ unreadCount: number }> {
    const response = await this.api.get('/notifications/unread');
    return response.data;
  }

  async markNotificationAsRead(id: string): Promise<void> {
    await this.api.patch(`/notifications/${id}/read`);
  }

  async markAllNotificationsAsRead(): Promise<void> {
    await this.api.patch('/notifications/read-all');
  }

  async deleteNotification(id: string): Promise<void> {
    await this.api.delete(`/notifications/${id}`);
  }

  async getNotificationPreferences(): Promise<NotificationPreference> {
    const response = await this.api.get('/notifications/preferences');
    return response.data;
  }

  async updateNotificationPreferences(preferences: Partial<NotificationPreference>): Promise<NotificationPreference> {
    const response = await this.api.patch('/notifications/preferences', preferences);
    return response.data;
  }

  async sendTestNotification(type: 'EMAIL' | 'PUSH' | 'BOTH'): Promise<void> {
    await this.api.post('/notifications/test', { type, category: 'SYSTEM' });
  }

  // External APIs
  async getCurrencyRates(): Promise<any> {
    const response = await this.api.get('/api/currency/rates');
    return response.data;
  }

  async getCryptoRates(): Promise<any> {
    const response = await this.api.get('/api/crypto/rates');
    return response.data;
  }

  async getStockPrice(symbol: string): Promise<any> {
    const response = await this.api.get(`/api/stock/${symbol}`);
    return response.data;
  }

  async getWeatherData(city: string): Promise<any> {
    const response = await this.api.get(`/api/weather/${encodeURIComponent(city)}`);
    return response.data;
  }

  // Health check
  async healthCheck(): Promise<{ status: string; timestamp: string; uptime: number }> {
    const response = await this.api.get('/api/health');
    return response.data;
  }
}

export const apiService = new ApiService();
