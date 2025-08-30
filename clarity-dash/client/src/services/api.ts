import axios, { AxiosInstance, AxiosResponse } from 'axios';
import {
  User,
  Transaction,
  CreateTransactionData,
  FinancialSummary,
  SpendingByCategory,
  SavingsProjection,
  MonthlyTrends,
  ExpensePrediction,
  SpendingInsights,
  LoginData,
  RegisterData,
  AuthResponse,
  ApiResponse,
  PaginatedResponse,
  TransactionFilters,
  CSVMapping,
  CSVUploadResponse
} from '../types';

/**
 * API Service for ClarityDash
 * Handles all HTTP requests to the backend API
 */
class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
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
      (response: AxiosResponse) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Authentication Methods
  async register(data: RegisterData): Promise<ApiResponse<AuthResponse>> {
    const response = await this.api.post('/auth/register', data);
    return response.data;
  }

  async login(data: LoginData): Promise<ApiResponse<AuthResponse>> {
    const response = await this.api.post('/auth/login', data);
    return response.data;
  }

  async getProfile(): Promise<ApiResponse<{ user: User }>> {
    const response = await this.api.get('/auth/me');
    return response.data;
  }

  // Transaction Methods
  async createTransaction(data: CreateTransactionData): Promise<ApiResponse<{ transaction: Transaction }>> {
    const response = await this.api.post('/transactions', data);
    return response.data;
  }

  async getTransactions(filters: TransactionFilters = {}): Promise<ApiResponse<PaginatedResponse<Transaction>>> {
    const response = await this.api.get('/transactions', { params: filters });
    return response.data;
  }

  async deleteTransaction(id: string): Promise<ApiResponse> {
    const response = await this.api.delete(`/transactions/${id}`);
    return response.data;
  }

  async uploadCSV(file: File, mapping: CSVMapping): Promise<ApiResponse<CSVUploadResponse>> {
    const formData = new FormData();
    formData.append('csvFile', file);
    
    // Add mapping data
    Object.entries(mapping).forEach(([key, value]) => {
      if (value !== undefined) {
        formData.append(key, value.toString());
      }
    });

    const response = await this.api.post('/transactions/upload-csv', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async getCategories(): Promise<ApiResponse<{ categories: string[] }>> {
    const response = await this.api.get('/transactions/categories');
    return response.data;
  }

  // Analytics Methods
  async getFinancialSummary(startDate?: string, endDate?: string): Promise<ApiResponse<FinancialSummary>> {
    const params: any = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    
    const response = await this.api.get('/analytics/summary', { params });
    return response.data;
  }

  async getSpendingByCategory(
    type: 'income' | 'expense' = 'expense',
    startDate?: string,
    endDate?: string
  ): Promise<ApiResponse<SpendingByCategory>> {
    const params: any = { type };
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    
    const response = await this.api.get('/analytics/spending-by-category', { params });
    return response.data;
  }

  async getSavingsProjection(months: number = 6): Promise<ApiResponse<SavingsProjection>> {
    const response = await this.api.get('/analytics/savings-projection', { params: { months } });
    return response.data;
  }

  async getMonthlyTrends(months: number = 12): Promise<ApiResponse<MonthlyTrends>> {
    const response = await this.api.get('/analytics/monthly-trends', { params: { months } });
    return response.data;
  }

  // ML Prediction Methods
  async getExpensePrediction(months: number = 6): Promise<ApiResponse<ExpensePrediction>> {
    const response = await this.api.get('/ml/predict-expenses', { params: { months } });
    return response.data;
  }

  async getSpendingInsights(months: number = 3): Promise<ApiResponse<SpendingInsights>> {
    const response = await this.api.get('/ml/spending-insights', { params: { months } });
    return response.data;
  }

  // Utility Methods
  setAuthToken(token: string) {
    localStorage.setItem('token', token);
  }

  getAuthToken(): string | null {
    return localStorage.getItem('token');
  }

  removeAuthToken() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  isAuthenticated(): boolean {
    return !!this.getAuthToken();
  }
}

// Export singleton instance
export const apiService = new ApiService();
export default apiService;
