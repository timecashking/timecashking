import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock environment variables
vi.stubEnv('VITE_API_URL', 'http://localhost:3000');

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
global.localStorage = localStorageMock;

// Mock sessionStorage
const sessionStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
global.sessionStorage = sessionStorageMock;

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock window.scrollTo
Object.defineProperty(window, 'scrollTo', {
  writable: true,
  value: vi.fn(),
});

// Mock fetch
global.fetch = vi.fn();

// Mock axios
vi.mock('axios', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
    create: vi.fn(() => ({
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      patch: vi.fn(),
      delete: vi.fn(),
      interceptors: {
        request: { use: vi.fn() },
        response: { use: vi.fn() },
      },
    })),
  },
}));

// Mock react-query
vi.mock('react-query', () => ({
  useQuery: vi.fn(),
  useMutation: vi.fn(),
  useQueryClient: vi.fn(() => ({
    invalidateQueries: vi.fn(),
    setQueryData: vi.fn(),
  })),
}));

// Mock react-router-dom
vi.mock('react-router-dom', () => ({
  BrowserRouter: ({ children }: { children: React.ReactNode }) => children,
  Routes: ({ children }: { children: React.ReactNode }) => children,
  Route: ({ children }: { children: React.ReactNode }) => children,
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
    <a href={to}>{children}</a>
  ),
  useNavigate: () => vi.fn(),
  useLocation: () => ({ pathname: '/' }),
  useParams: () => ({}),
}));

// Mock react-hot-toast
vi.mock('react-hot-toast', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    loading: vi.fn(),
    dismiss: vi.fn(),
  },
  Toaster: () => null,
}));

// Mock date-fns
vi.mock('date-fns', () => ({
  format: vi.fn((date) => date.toISOString()),
  parseISO: vi.fn((date) => new Date(date)),
  isToday: vi.fn(() => false),
  isYesterday: vi.fn(() => false),
  isThisWeek: vi.fn(() => false),
  isThisMonth: vi.fn(() => false),
  isThisYear: vi.fn(() => false),
  startOfDay: vi.fn((date) => date),
  endOfDay: vi.fn((date) => date),
  startOfWeek: vi.fn((date) => date),
  endOfWeek: vi.fn((date) => date),
  startOfMonth: vi.fn((date) => date),
  endOfMonth: vi.fn((date) => date),
  startOfYear: vi.fn((date) => date),
  endOfYear: vi.fn((date) => date),
  addDays: vi.fn((date, days) => new Date(date.getTime() + days * 24 * 60 * 60 * 1000)),
  subDays: vi.fn((date, days) => new Date(date.getTime() - days * 24 * 60 * 60 * 1000)),
  addWeeks: vi.fn((date, weeks) => new Date(date.getTime() + weeks * 7 * 24 * 60 * 60 * 1000)),
  subWeeks: vi.fn((date, weeks) => new Date(date.getTime() - weeks * 7 * 24 * 60 * 60 * 1000)),
  addMonths: vi.fn((date, months) => {
    const newDate = new Date(date);
    newDate.setMonth(newDate.getMonth() + months);
    return newDate;
  }),
  subMonths: vi.fn((date, months) => {
    const newDate = new Date(date);
    newDate.setMonth(newDate.getMonth() - months);
    return newDate;
  }),
}));

// Mock recharts
vi.mock('recharts', () => ({
  LineChart: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Line: () => null,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  PieChart: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Pie: () => null,
  Cell: () => null,
  BarChart: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Bar: () => null,
}));

// Mock lucide-react
vi.mock('lucide-react', () => ({
  Home: () => <div data-testid="home-icon" />,
  TrendingUp: () => <div data-testid="trending-up-icon" />,
  TrendingDown: () => <div data-testid="trending-down-icon" />,
  DollarSign: () => <div data-testid="dollar-sign-icon" />,
  Calendar: () => <div data-testid="calendar-icon" />,
  Plus: () => <div data-testid="plus-icon" />,
  Edit: () => <div data-testid="edit-icon" />,
  Trash2: () => <div data-testid="trash-icon" />,
  Settings: () => <div data-testid="settings-icon" />,
  Bell: () => <div data-testid="bell-icon" />,
  User: () => <div data-testid="user-icon" />,
  LogOut: () => <div data-testid="log-out-icon" />,
  ChevronDown: () => <div data-testid="chevron-down-icon" />,
  ChevronUp: () => <div data-testid="chevron-up-icon" />,
  Search: () => <div data-testid="search-icon" />,
  Filter: () => <div data-testid="filter-icon" />,
  Download: () => <div data-testid="download-icon" />,
  Eye: () => <div data-testid="eye-icon" />,
  EyeOff: () => <div data-testid="eye-off-icon" />,
  Check: () => <div data-testid="check-icon" />,
  X: () => <div data-testid="x-icon" />,
  AlertCircle: () => <div data-testid="alert-circle-icon" />,
  Info: () => <div data-testid="info-icon" />,
  ExternalLink: () => <div data-testid="external-link-icon" />,
}));

// Global test utilities
global.testUtils = {
  createMockUser: () => ({
    id: 'test-user-id',
    googleId: 'test-google-id',
    email: 'test@gmail.com',
    name: 'Test User',
    avatarUrl: 'https://test.com/avatar.jpg',
    role: 'USER',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  }),

  createMockTransaction: () => ({
    id: 'test-transaction-id',
    userId: 'test-user-id',
    categoryId: 'test-category-id',
    type: 'EXPENSE',
    amount: 100.00,
    description: 'Test transaction',
    date: '2024-01-15T00:00:00.000Z',
    createdAt: '2024-01-15T00:00:00.000Z',
    updatedAt: '2024-01-15T00:00:00.000Z',
  }),

  createMockCategory: () => ({
    id: 'test-category-id',
    userId: 'test-user-id',
    name: 'Test Category',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  }),

  createMockSubscription: () => ({
    id: 'test-subscription-id',
    userId: 'test-user-id',
    stripeCustomerId: 'cus_test',
    stripeSubscriptionId: 'sub_test',
    planId: 'plan_test',
    planName: 'Premium',
    planPrice: 29.99,
    status: 'ACTIVE',
    currentPeriodStart: '2024-01-01T00:00:00.000Z',
    currentPeriodEnd: '2024-02-01T00:00:00.000Z',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  }),

  createMockNotification: () => ({
    id: 'test-notification-id',
    userId: 'test-user-id',
    type: 'EMAIL',
    category: 'REMINDER',
    title: 'Test Notification',
    message: 'This is a test notification',
    status: 'PENDING',
    createdAt: '2024-01-01T00:00:00.000Z',
  }),

  renderWithProviders: (ui: React.ReactElement) => {
    // Add any providers here (Router, QueryClient, etc.)
    return ui;
  },
};

// Clean up after each test
afterEach(() => {
  vi.clearAllMocks();
  localStorageMock.clear();
  sessionStorageMock.clear();
});
