import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useAuth } from '@/hooks/useAuth';

// Mock the API service
vi.mock('@/services/api', () => ({
  apiService: {
    loginWithGoogle: vi.fn(),
    logout: vi.fn(),
    getCurrentUser: vi.fn(),
  },
}));

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
global.localStorage = localStorageMock;

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useAuth());

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.isLoading).toBe(false);
    expect(typeof result.current.loginWithGoogle).toBe('function');
    expect(typeof result.current.logout).toBe('function');
  });

  it('should load user from localStorage on mount', async () => {
    const mockUser = testUtils.createMockUser();
    const mockToken = 'test-token';

    localStorageMock.getItem
      .mockReturnValueOnce(mockToken) // auth_token
      .mockReturnValueOnce(JSON.stringify(mockUser)); // user_data

    const { result } = renderHook(() => useAuth());

    // Wait for the effect to run
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.isAuthenticated).toBe(true);
  });

  it('should handle login with Google successfully', async () => {
    const mockUser = testUtils.createMockUser();
    const mockToken = 'test-token';

    const { apiService } = await import('@/services/api');
    vi.mocked(apiService.loginWithGoogle).mockResolvedValue({
      user: mockUser,
      token: mockToken,
    });

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.loginWithGoogle();
    });

    expect(apiService.loginWithGoogle).toHaveBeenCalled();
    expect(localStorageMock.setItem).toHaveBeenCalledWith('auth_token', mockToken);
    expect(localStorageMock.setItem).toHaveBeenCalledWith('user_data', JSON.stringify(mockUser));
    expect(result.current.user).toEqual(mockUser);
    expect(result.current.isAuthenticated).toBe(true);
  });

  it('should handle login error', async () => {
    const { apiService } = await import('@/services/api');
    vi.mocked(apiService.loginWithGoogle).mockRejectedValue(new Error('Login failed'));

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      try {
        await result.current.loginWithGoogle();
      } catch (error) {
        // Expected error
      }
    });

    expect(apiService.loginWithGoogle).toHaveBeenCalled();
    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('should handle logout successfully', async () => {
    const { apiService } = await import('@/services/api');
    vi.mocked(apiService.logout).mockResolvedValue(undefined);

    const { result } = renderHook(() => useAuth());

    // Set initial state
    act(() => {
      result.current.user = testUtils.createMockUser();
      result.current.isAuthenticated = true;
    });

    await act(async () => {
      await result.current.logout();
    });

    expect(apiService.logout).toHaveBeenCalled();
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('auth_token');
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('user_data');
    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('should handle logout error gracefully', async () => {
    const { apiService } = await import('@/services/api');
    vi.mocked(apiService.logout).mockRejectedValue(new Error('Logout failed'));

    const { result } = renderHook(() => useAuth());

    // Set initial state
    act(() => {
      result.current.user = testUtils.createMockUser();
      result.current.isAuthenticated = true;
    });

    await act(async () => {
      try {
        await result.current.logout();
      } catch (error) {
        // Expected error
      }
    });

    expect(apiService.logout).toHaveBeenCalled();
    // Should still clear local state even if API call fails
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('auth_token');
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('user_data');
    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('should handle invalid token in localStorage', async () => {
    localStorageMock.getItem
      .mockReturnValueOnce('invalid-token') // auth_token
      .mockReturnValueOnce('invalid-json'); // user_data

    const { apiService } = await import('@/services/api');
    vi.mocked(apiService.getCurrentUser).mockRejectedValue(new Error('Invalid token'));

    const { result } = renderHook(() => useAuth());

    // Wait for the effect to run
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('auth_token');
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('user_data');
  });

  it('should handle network errors during user fetch', async () => {
    localStorageMock.getItem
      .mockReturnValueOnce('valid-token') // auth_token
      .mockReturnValueOnce(JSON.stringify(testUtils.createMockUser())); // user_data

    const { apiService } = await import('@/services/api');
    vi.mocked(apiService.getCurrentUser).mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useAuth());

    // Wait for the effect to run
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('auth_token');
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('user_data');
  });

  it('should set loading state during login', async () => {
    const { apiService } = await import('@/services/api');
    vi.mocked(apiService.loginWithGoogle).mockImplementation(
      () => new Promise(resolve => setTimeout(resolve, 100))
    );

    const { result } = renderHook(() => useAuth());

    act(() => {
      result.current.loginWithGoogle();
    });

    expect(result.current.isLoading).toBe(true);

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 150));
    });

    expect(result.current.isLoading).toBe(false);
  });

  it('should set loading state during logout', async () => {
    const { apiService } = await import('@/services/api');
    vi.mocked(apiService.logout).mockImplementation(
      () => new Promise(resolve => setTimeout(resolve, 100))
    );

    const { result } = renderHook(() => useAuth());

    act(() => {
      result.current.logout();
    });

    expect(result.current.isLoading).toBe(true);

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 150));
    });

    expect(result.current.isLoading).toBe(false);
  });

  it('should handle concurrent login attempts', async () => {
    const { apiService } = await import('@/services/api');
    vi.mocked(apiService.loginWithGoogle).mockImplementation(
      () => new Promise(resolve => setTimeout(resolve, 100))
    );

    const { result } = renderHook(() => useAuth());

    // Start first login
    act(() => {
      result.current.loginWithGoogle();
    });

    expect(result.current.isLoading).toBe(true);

    // Try to start second login while first is still loading
    act(() => {
      result.current.loginWithGoogle();
    });

    // Should still be loading from first attempt
    expect(result.current.isLoading).toBe(true);

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 150));
    });

    expect(result.current.isLoading).toBe(false);
  });

  it('should persist authentication state across re-renders', () => {
    const mockUser = testUtils.createMockUser();
    const mockToken = 'test-token';

    localStorageMock.getItem
      .mockReturnValueOnce(mockToken)
      .mockReturnValueOnce(JSON.stringify(mockUser));

    const { result, rerender } = renderHook(() => useAuth());

    // Force re-render
    rerender();

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.isAuthenticated).toBe(true);
  });
});
