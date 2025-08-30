// User Types
export interface User {
  _id: string;
  email: string;
  firstName: string;
  createdAt: string;
  updatedAt: string;
}

// Transaction Types
export interface Transaction {
  _id: string;
  user: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date: string;
  createdAt: string;
  updatedAt: string;
  formattedAmount?: number;
}

export interface CreateTransactionData {
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date?: string;
}

// Analytics Types
export interface FinancialSummary {
  totalIncome: number;
  totalExpenses: number;
  netSavings: number;
  transactionCount: number;
  period: {
    startDate: string | null;
    endDate: string | null;
  };
}

export interface CategorySpending {
  category: string;
  total: number;
  count: number;
  percentage: string;
}

export interface SpendingByCategory {
  categories: CategorySpending[];
  totalAmount: number;
  type: string;
}

export interface SavingsProjection {
  historical: Array<{
    date: string;
    income: number;
    expenses: number;
    savings: number;
  }>;
  projection: number | null;
  analysisPeriod: {
    startDate: string;
    endDate: string;
    months: number;
  };
}

export interface MonthlyTrends {
  trends: Array<{
    date: string;
    income: number;
    expenses: number;
    savings: number;
    transactionCount: number;
  }>;
  analysisPeriod: {
    startDate: string;
    endDate: string;
    months: number;
  };
}

// ML Prediction Types
export interface ExpensePrediction {
  prediction: number;
  confidence: number;
  trend: {
    direction: 'increasing' | 'decreasing' | 'stable';
    strength: number;
  };
  comparison: {
    recentAverage: number;
    difference: number;
  };
  analysis: {
    monthsAnalyzed: number;
    dataPoints: Array<{
      month: string;
      expenses: number;
      transactions: number;
    }>;
  };
}

export interface SpendingInsight {
  type: 'top_category' | 'trend' | 'frequency' | 'recommendation';
  title: string;
  message: string;
  value: number;
  percentage?: number;
  direction?: 'up' | 'down';
  category?: string;
  currentAverage?: number;
}

export interface SpendingInsights {
  insights: SpendingInsight[];
  summary: {
    totalCategories: number;
    totalSpending: number;
    averageMonthlySpending: number;
    analysisPeriod: string;
  };
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: any[];
}

export interface PaginatedResponse<T> {
  transactions: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

// Authentication Types
export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// CSV Upload Types
export interface CSVMapping {
  dateColumn: string;
  descriptionColumn: string;
  amountColumn: string;
  typeColumn?: string;
  categoryColumn?: string;
  defaultType?: 'income' | 'expense';
  defaultCategory?: string;
}

export interface CSVUploadResponse {
  imported: number;
  errors: string[];
  totalErrors: number;
}

// Filter Types
export interface TransactionFilters {
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
  type?: 'income' | 'expense';
  category?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Chart Data Types
export interface ChartDataPoint {
  name: string;
  value: number;
  fill?: string;
}

export interface LineChartData {
  date: string;
  income: number;
  expenses: number;
  savings: number;
  projection?: number;
}
