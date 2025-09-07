// Enums
export enum Role {
  ADMIN = 'ADMIN',
  USER = 'USER',
}

export enum Status {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  PENDING = 'PENDING',
  DELETED = 'DELETED',
}

export enum CategoryType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE',
  PRODUCT = 'PRODUCT',
}

export enum AccountType {
  CHECKING = 'CHECKING',
  SAVINGS = 'SAVINGS',
  CREDIT = 'CREDIT',
  INVESTMENT = 'INVESTMENT',
}

export enum EntryType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE',
}

export enum CardType {
  CREDIT = 'CREDIT',
  DEBIT = 'DEBIT',
}

export enum InvoiceStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE',
  CANCELLED = 'CANCELLED',
}

export enum ProductStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  DISCONTINUED = 'DISCONTINUED',
}

export enum StockMoveType {
  IN = 'IN',
  OUT = 'OUT',
  ADJUSTMENT = 'ADJUSTMENT',
  RETURN = 'RETURN',
}

export enum SaleStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED',
}

export enum NotificationType {
  EMAIL = 'EMAIL',
  SMS = 'SMS',
  PUSH = 'PUSH',
  IN_APP = 'IN_APP',
}

// Interfaces
export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  status: Status;
  companyId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Company {
  id: string;
  name: string;
  cnpj: string;
  address: string;
  phone: string;
  email: string;
  status: Status;
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  id: string;
  name: string;
  type: CategoryType;
  color: string;
  icon?: string;
  status: Status;
  createdAt: Date;
  updatedAt: Date;
}

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  balance: number;
  currency: string;
  status: Status;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Entry {
  id: string;
  description: string;
  amount: number;
  type: EntryType;
  date: Date;
  categoryId: string;
  accountId: string;
  userId: string;
  status: Status;
  createdAt: Date;
  updatedAt: Date;
}

export interface Card {
  id: string;
  name: string;
  type: CardType;
  limit: number;
  dueDay: number;
  status: Status;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Invoice {
  id: string;
  cardId: string;
  month: number;
  year: number;
  totalAmount: number;
  status: InvoiceStatus;
  dueDate: Date;
  paidDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CardCharge {
  id: string;
  invoiceId: string;
  description: string;
  amount: number;
  date: Date;
  categoryId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  cost: number;
  stock: number;
  minStock: number;
  categoryId: string;
  userId: string;
  status: ProductStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface StockMove {
  id: string;
  productId: string;
  type: StockMoveType;
  quantity: number;
  previousStock: number;
  newStock: number;
  reason?: string;
  userId: string;
  createdAt: Date;
}

export interface Sale {
  id: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  totalAmount: number;
  discount: number;
  finalAmount: number;
  status: SaleStatus;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SaleItem {
  id: string;
  saleId: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  createdAt: Date;
}

export interface Meeting {
  id: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  location?: string;
  googleEventId?: string;
  userId: string;
  status: Status;
  createdAt: Date;
  updatedAt: Date;
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
}

// DTOs
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  companyName: string;
  companyCnpj: string;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  user: User;
}

export interface JwtPayload {
  sub: string;
  email: string;
  role: Role;
}

// API Responses
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface BaseFilters {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface EntryFilters extends BaseFilters {
  type?: EntryType;
  categoryId?: string;
  accountId?: string;
  startDate?: Date;
  endDate?: Date;
}

export interface ProductFilters extends BaseFilters {
  categoryId?: string;
  status?: ProductStatus;
  minPrice?: number;
  maxPrice?: number;
  lowStock?: boolean;
}

export interface SaleFilters extends BaseFilters {
  status?: SaleStatus;
  startDate?: Date;
  endDate?: Date;
  minAmount?: number;
  maxAmount?: number;
}

export interface MeetingFilters extends BaseFilters {
  status?: Status;
  startDate?: Date;
  endDate?: Date;
}

