import React, { createContext, useContext, useReducer, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import * as AuthSession from 'expo-auth-session';
import { User, AuthState } from '../types';
import { apiService } from '../services/api';

interface AuthContextType {
  state: AuthState;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_TOKEN'; payload: string | null }
  | { type: 'SET_AUTHENTICATED'; payload: boolean }
  | { type: 'LOGOUT' };

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_USER':
      return { ...state, user: action.payload, isAuthenticated: !!action.payload };
    case 'SET_TOKEN':
      return { ...state, token: action.payload };
    case 'SET_AUTHENTICATED':
      return { ...state, isAuthenticated: action.payload };
    case 'LOGOUT':
      return {
        user: null,
        token: null,
        isLoading: false,
        isAuthenticated: false,
      };
    default:
      return state;
  }
};

const initialState: AuthState = {
  user: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  const checkAuth = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const token = await SecureStore.getItemAsync('auth_token');
      const userData = await SecureStore.getItemAsync('user_data');
      
      if (token && userData) {
        const user = JSON.parse(userData);
        dispatch({ type: 'SET_USER', payload: user });
        dispatch({ type: 'SET_TOKEN', payload: token });
        
        // Verify token is still valid
        try {
          await apiService.getCurrentUser();
        } catch (error) {
          // Token is invalid, clear stored data
          await logout();
        }
      }
    } catch (error) {
      console.error('Auth check error:', error);
      await logout();
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const loginWithGoogle = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      // Configure Google OAuth
      const redirectUri = AuthSession.makeRedirectUri({
        scheme: 'timecashking',
        path: 'auth',
      });

      const discovery = {
        authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
        tokenEndpoint: 'https://oauth2.googleapis.com/token',
        revocationEndpoint: 'https://oauth2.googleapis.com/revoke',
      };

      const request = new AuthSession.AuthRequest({
        clientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || '',
        scopes: ['openid', 'profile', 'email'],
        redirectUri,
        responseType: AuthSession.ResponseType.Code,
        extraParams: {
          access_type: 'offline',
        },
      });

      const result = await request.promptAsync(discovery);

      if (result.type === 'success' && result.params.code) {
        // Exchange code for token and user info
        const { user, token } = await apiService.loginWithGoogle(result.params.code);
        
        dispatch({ type: 'SET_USER', payload: user });
        dispatch({ type: 'SET_TOKEN', payload: token });
        dispatch({ type: 'SET_AUTHENTICATED', payload: true });
      }
    } catch (error) {
      console.error('Google login error:', error);
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const logout = async () => {
    try {
      await apiService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      dispatch({ type: 'LOGOUT' });
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const value: AuthContextType = {
    state,
    loginWithGoogle,
    logout,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
