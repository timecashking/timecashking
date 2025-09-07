'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Navigation } from './Navigation';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Handlers para os botões de ações rápidas
  const handleAdicionarEntradaSaida = () => {
    router.push('/finances');
  };

  const handleCadastrarProduto = () => {
    router.push('/products');
  };

  const handleAgendarReuniao = () => {
    router.push('/schedule');
  };

  const handleGerenciarCartoes = () => {
    router.push('/finances');
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      router.push('/');
      return;
    }

    try {
      setUser(JSON.parse(userData));
    } catch (error) {
      console.error('Erro ao carregar dados do usuário:', error);
      router.push('/');
    } finally {
      setLoading(false);
    }
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation user={user} />
      
      <main className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Bem-vindo, {user.name}! 👋
            </h1>
            <p className="text-muted-foreground">
              Gerencie suas finanças, estoque e agenda em um só lugar.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Saldo Total</p>
                  <p className="text-2xl font-bold text-foreground">R$ 0,00</p>
                </div>
                <div className="h-12 w-12 bg-primary/20 rounded-full flex items-center justify-center">
                  <span className="text-primary text-xl">💰</span>
                </div>
              </div>
            </div>

            <div className="card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Produtos</p>
                  <p className="text-2xl font-bold text-foreground">0</p>
                </div>
                <div className="h-12 w-12 bg-primary/20 rounded-full flex items-center justify-center">
                  <span className="text-primary text-xl">📦</span>
                </div>
              </div>
            </div>

            <div className="card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Vendas</p>
                  <p className="text-2xl font-bold text-foreground">0</p>
                </div>
                <div className="h-12 w-12 bg-primary/20 rounded-full flex items-center justify-center">
                  <span className="text-primary text-xl">📊</span>
                </div>
              </div>
            </div>

            <div className="card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Reuniões</p>
                  <p className="text-2xl font-bold text-foreground">0</p>
                </div>
                <div className="h-12 w-12 bg-primary/20 rounded-full flex items-center justify-center">
                  <span className="text-primary text-xl">📅</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                Ações Rápidas
              </h3>
              <div className="space-y-3">
                <button 
                  className="w-full btn-primary text-left"
                  onClick={handleAdicionarEntradaSaida}
                >
                  ➕ Adicionar Entrada/Saída
                </button>
                <button 
                  className="w-full btn-secondary text-left"
                  onClick={handleCadastrarProduto}
                >
                  📦 Cadastrar Produto
                </button>
                <button 
                  className="w-full btn-secondary text-left"
                  onClick={handleAgendarReuniao}
                >
                  📅 Agendar Reunião
                </button>
                <button 
                  className="w-full btn-secondary text-left"
                  onClick={handleGerenciarCartoes}
                >
                  💳 Gerenciar Cartões
                </button>
              </div>
            </div>

            <div className="card p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                Atividades Recentes
              </h3>
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  Nenhuma atividade recente
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
