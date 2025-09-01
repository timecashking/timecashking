export interface User {
  id: string;
  googleId: string;
  email: string;
  name: string;
  avatarUrl?: string;
  role: 'USER' | 'ADMIN' | 'MANAGER';
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  userId: string;
  createdAt: string;
}

export interface Transaction {
  id: string;
  userId: string;
  categoryId?: string;
  category?: Category;
  type: 'INCOME' | 'EXPENSE';
  amount: number;
  description?: string;
  date: string;
  createdAt: string;
}

export interface Subscription {
  id: string;
  userId: string;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  planId: string;
  planName: string;
  planPrice: number;
  status: 'ACTIVE' | 'CANCELED' | 'PAST_DUE' | 'UNPAID' | 'TRIAL';
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
  trialEnd?: string;
  canceledAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  userId: string;
  subscriptionId?: string;
  subscription?: Subscription;
  stripePaymentId?: string;
  stripeInvoiceId?: string;
  amount: number;
  currency: string;
  status: 'PENDING' | 'SUCCEEDED' | 'FAILED' | 'REFUNDED';
  description?: string;
  paidAt?: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'EMAIL' | 'PUSH' | 'BOTH';
  category: 'REMINDER' | 'ALERT' | 'REPORT' | 'PAYMENT' | 'SYSTEM';
  title: string;
  message: string;
  status: 'PENDING' | 'SENT' | 'FAILED' | 'READ';
  metadata?: any;
  sentAt?: string;
  readAt?: string;
  createdAt: string;
}

export interface NotificationPreference {
  id: string;
  userId: string;
  emailEnabled: boolean;
  pushEnabled: boolean;
  reminderEnabled: boolean;
  alertEnabled: boolean;
  reportEnabled: boolean;
  paymentEnabled: boolean;
  systemEnabled: boolean;
  reminderFrequency: string;
  reportFrequency: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export interface AppState {
  auth: AuthState;
  transactions: Transaction[];
  categories: Category[];
  notifications: Notification[];
  preferences: NotificationPreference | null;
  isLoading: boolean;
  error: string | null;
}
