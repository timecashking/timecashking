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

export function Finances() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Handlers para os botões
  const handleAdicionarEntradaSaida = () => {
    // Implementar modal ou redirecionamento para adicionar entrada/saída
    alert('Funcionalidade de adicionar entrada/saída será implementada');
  };

  const handleVerRelatorios = () => {
    router.push('/reports');
  };

  const handleNovaCategoria = () => {
    // Implementar modal para nova categoria
    alert('Funcionalidade de nova categoria será implementada');
  };

  const handleNovaConta = () => {
    // Implementar modal para nova conta
    alert('Funcionalidade de nova conta será implementada');
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
              Finanças 💰
            </h1>
            <p className="text-muted-foreground">
              Gerencie suas entradas, saídas e categorias financeiras.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="card p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">
                  Resumo Financeiro
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="text-center p-4 bg-green-500/20 rounded-lg">
                    <p className="text-sm text-muted-foreground">Receitas</p>
                    <p className="text-2xl font-bold text-green-400">R$ 0,00</p>
                  </div>
                  <div className="text-center p-4 bg-red-500/20 rounded-lg">
                    <p className="text-sm text-muted-foreground">Despesas</p>
                    <p className="text-2xl font-bold text-red-400">R$ 0,00</p>
                  </div>
                  <div className="text-center p-4 bg-primary/20 rounded-lg">
                    <p className="text-sm text-muted-foreground">Saldo</p>
                    <p className="text-2xl font-bold text-primary">R$ 0,00</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <button 
                    className="w-full btn-primary"
                    onClick={handleAdicionarEntradaSaida}
                  >
                    ➕ Adicionar Entrada/Saída
                  </button>
                  <button 
                    className="w-full btn-secondary"
                    onClick={handleVerRelatorios}
                  >
                    📊 Ver Relatórios
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="card p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">
                  Categorias
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 bg-muted rounded">
                    <span>Alimentação</span>
                    <span className="text-sm text-muted-foreground">R$ 0,00</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-muted rounded">
                    <span>Transporte</span>
                    <span className="text-sm text-muted-foreground">R$ 0,00</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-muted rounded">
                    <span>Lazer</span>
                    <span className="text-sm text-muted-foreground">R$ 0,00</span>
                  </div>
                </div>
                <button 
                  className="w-full btn-secondary mt-4"
                  onClick={handleNovaCategoria}
                >
                  ➕ Nova Categoria
                </button>
              </div>

              <div className="card p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">
                  Contas
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 bg-muted rounded">
                    <span>Banco Principal</span>
                    <span className="text-sm text-muted-foreground">R$ 0,00</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-muted rounded">
                    <span>Poupança</span>
                    <span className="text-sm text-muted-foreground">R$ 0,00</span>
                  </div>
                </div>
                <button 
                  className="w-full btn-secondary mt-4"
                  onClick={handleNovaConta}
                >
                  ➕ Nova Conta
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
