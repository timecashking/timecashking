'use client';

import { useState, useEffect } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // Verificar se há token e usuário no localStorage
    const storedToken = localStorage.getItem('timecash-token');
    const storedUser = localStorage.getItem('timecash-user');

    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Erro ao carregar dados do usuário:', error);
        // Limpar dados inválidos
        localStorage.removeItem('timecash-token');
        localStorage.removeItem('timecash-user');
      }
    }
    setLoading(false);
  }, []);

  const login = (userData: User, userToken: string) => {
    setUser(userData);
    setToken(userToken);
    localStorage.setItem('timecash-token', userToken);
    localStorage.setItem('timecash-user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('timecash-token');
    localStorage.removeItem('timecash-user');
  };

  const isAuthenticated = !!user && !!token;

  return {
    user,
    token,
    loading,
    isAuthenticated,
    login,
    logout,
  };
}
