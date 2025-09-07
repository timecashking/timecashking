// ========================================
// TIPOS COMPARTILHADOS DO SISTEMA
// ========================================

export enum Role {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  USER = 'USER',
}

export enum Status {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  PENDING = 'PENDING',
  BLOCKED = 'BLOCKED',
}

export enum CategoryType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE',
  TRANSFER = 'TRANSFER',
  PRODUCT = 'PRODUCT',
}

export enum AccountType {
  CHECKING = 'CHECKING',
  SAVINGS = 'SAVINGS',
  CREDIT_CARD = 'CREDIT_CARD',
  CASH = 'CASH',
  INVESTMENT = 'INVESTMENT',
}

export enum EntryType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE',
  TRANSFER = 'TRANSFER',
}

export enum EntryStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE',
  CANCELLED = 'CANCELLED',
}

export enum CardType {
  CREDIT = 'CREDIT',
  DEBIT = 'DEBIT',
  PREPAID = 'PREPAID',
}

export enum InvoiceStatus {
  OPEN = 'OPEN',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE',
  CLOSED = 'CLOSED',
}

export enum ProductStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  LOW_STOCK = 'LOW_STOCK',
  OUT_OF_STOCK = 'OUT_OF_STOCK',
}

export enum StockMoveType {
  IN = 'IN',
  OUT = 'OUT',
}

export enum SaleStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED',
}

export enum CustomerStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  BLOCKED = 'BLOCKED',
}

export enum NotificationType {
  REMINDER = 'REMINDER',
  ALERT = 'ALERT',
  INFO = 'INFO',
  WARNING = 'WARNING',
  SUCCESS = 'SUCCESS',
}

// ========================================
// INTERFACES DE USUÁRIO
// ========================================

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  role: Role;
  status: Status;
  createdAt: Date;
  updatedAt: Date;
}

export interface Company {
  id: string;
  name: string;
  cnpj?: string;
  address?: string;
  phone?: string;
  email?: string;
  logoUrl?: string;
  status: Status;
  createdAt: Date;
  updatedAt: Date;
}

// ========================================
// INTERFACES FINANCEIRAS
// ========================================

export interface Category {
  id: string;
  name: string;
  description?: string;
  type: CategoryType;
  color?: string;
  icon?: string;
  companyId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  balance: number;
  bankName?: string;
  bankCode?: string;
  agency?: string;
  accountNumber?: string;
  userId: string;
  companyId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Entry {
  id: string;
  description: string;
  amount: number;
  type: EntryType;
  date: Date;
  dueDate?: Date;
  status: EntryStatus;
  reminderDays?: number;
  recurring: boolean;
  recurringPattern?: string;
  userId: string;
  categoryId: string;
  accountId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Card {
  id: string;
  name: string;
  type: CardType;
  limit?: number;
  closeDay: number;
  dueDay: number;
  accountId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Invoice {
  id: string;
  cardId: string;
  month: number;
  year: number;
  totalAmount: number;
  paidAmount: number;
  dueDate: Date;
  payDate?: Date;
  status: InvoiceStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface CardCharge {
  id: string;
  cardId: string;
  invoiceId?: string;
  description: string;
  amount: number;
  chargeDate: Date;
  installments?: number;
  currentInstallment?: number;
  createdAt: Date;
  updatedAt: Date;
}

// ========================================
// INTERFACES DE CLIENTES
// ========================================

export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  document?: string; // CPF/CNPJ
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  notes?: string;
  status: CustomerStatus;
  companyId: string;
  createdAt: Date;
  updatedAt: Date;
}

// ========================================
// INTERFACES DE PRODUTOS E VENDAS
// ========================================

export interface Product {
  id: string;
  sku: string;
  name: string;
  description?: string;
  cost: number;
  salePrice: number;
  stock: number;
  minStock: number;
  status: ProductStatus;
  userId: string;
  categoryId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface StockMove {
  id: string;
  productId: string;
  quantity: number;
  type: StockMoveType;
  reason?: string;
  moveDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Sale {
  id: string;
  saleDate: Date;
  totalAmount: number;
  totalCost: number;
  totalProfit: number;
  status: SaleStatus;
  userId: string;
  customerId?: string;
  customer?: Customer;
  createdAt: Date;
  updatedAt: Date;
}

export interface SaleItem {
  id: string;
  saleId: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  cost: number;
  createdAt: Date;
  updatedAt: Date;
}

// ========================================
// INTERFACES DE AGENDA
// ========================================

export interface Meeting {
  id: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  location?: string;
  googleEventId?: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  read: boolean;
  type: NotificationType;
  entityId?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ========================================
// INTERFACES DE AUTENTICAÇÃO
// ========================================

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface JwtPayload {
  userId: string;
  email: string;
  role: Role;
}

// ========================================
// INTERFACES DE API RESPONSE
// ========================================

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

// ========================================
// INTERFACES DE FILTROS
// ========================================

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
  startDate?: string;
  endDate?: string;
  status?: EntryStatus;
}

export interface ProductFilters extends BaseFilters {
  categoryId?: string;
  status?: ProductStatus;
  minStock?: number;
  maxStock?: number;
}

export interface SaleFilters extends BaseFilters {
  status?: SaleStatus;
  startDate?: string;
  endDate?: string;
  userId?: string;
}

export interface MeetingFilters extends BaseFilters {
  startDate?: string;
  endDate?: string;
  location?: string;
}

export interface CustomerFilters extends BaseFilters {
  status?: CustomerStatus;
  city?: string;
  state?: string;
}
