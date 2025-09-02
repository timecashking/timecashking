import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Building2, Wallet, Package, ShoppingCart, ShoppingBag, 
  Calendar, FileText, BarChart3, Bell, Settings, User,
  TrendingUp, TrendingDown, DollarSign, AlertTriangle
} from 'lucide-react';
import { API, authHeaders } from '../api';
import toast from 'react-hot-toast';

interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  companyUsers?: Array<{
    role: string;
    company: {
      id: string;
      name: string;
    };
  }>;
}

interface Summary {
  monthlyIncome: number;
  monthlyExpense: number;
  totalBalance: number;
  pendingBills: number;
  lowStockProducts: number;
  todayEvents: any[];
  recentTransactions: any[];
}

export function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [userResponse, summaryResponse] = await Promise.all([
        fetch(`${API}/me`, { headers: authHeaders() }),
        fetch(`${API}/summary`, { headers: authHeaders() })
      ]);

      if (userResponse.ok && summaryResponse.ok) {
        const userData = await userResponse.json();
        const summaryData = await summaryResponse.json();
        setUser(userData);
        setSummary(summaryData);
      } else {
        // Not logged in
        setUser(null);
      }
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = () => {
    window.location.href = `${API}/auth/google`;
  };

  const logout = async () => {
    try {
      await fetch(`${API}/auth/logout`, { 
        method: 'POST', 
        headers: authHeaders(),
        credentials: 'include' 
      });
      setUser(null);
      setSummary(null);
      toast.success('Logout realizado com sucesso');
    } catch (error) {
      toast.error('Erro ao fazer logout');
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <div className="animate-pulse">
          <div className="h-16 bg-gray-800"></div>
          <div className="container mx-auto px-4 py-8">
            <div className="h-8 bg-gray-800 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="bg-gray-800 rounded-lg p-6 h-32"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-yellow-400">TimeCash King</h1>
              <span className="text-sm text-gray-400">O Rei do seu Tempo e do seu Dinheiro</span>
            </div>
            {user && (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt={user.name} className="w-8 h-8 rounded-full" />
                  ) : (
                    <User className="w-8 h-8 text-gray-400" />
                  )}
                  <span className="text-sm text-gray-300">
                    {user.name}
                  </span>
                </div>
                <button
                  onClick={logout}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {!user ? (
        /* Login Screen */
        <main className="container mx-auto px-4 py-16">
          <div className="max-w-md mx-auto text-center">
            <div className="bg-gray-800 rounded-lg p-8">
              <h2 className="text-3xl font-bold text-yellow-400 mb-4">Bem-vindo ao TimeCash King</h2>
              <p className="text-gray-400 mb-8">
                Gerencie suas finanças, estoque, vendas e agenda de forma inteligente e eficiente.
              </p>
              <button 
                onClick={login}
                className="bg-yellow-500 hover:bg-yellow-600 text-black px-8 py-3 rounded-lg font-semibold text-lg transition-colors"
              >
                Login com Google
              </button>
            </div>
          </div>
        </main>
      ) : (
        <>
          {/* Navigation */}
          <nav className="bg-gray-800 border-b border-gray-700">
            <div className="container mx-auto px-4">
              <div className="flex space-x-6 py-4 overflow-x-auto">
                <Link to="/" className="text-yellow-400 font-semibold">Dashboard</Link>
                <Link to="/companies" className="text-gray-300 hover:text-white transition-colors">Empresas</Link>
                <Link to="/accounts" className="text-gray-300 hover:text-white transition-colors">Contas</Link>
                <Link to="/categories" className="text-gray-300 hover:text-white transition-colors">Categorias</Link>
                <Link to="/transactions" className="text-gray-300 hover:text-white transition-colors">Transações</Link>
                <Link to="/bills" className="text-gray-300 hover:text-white transition-colors">Contas</Link>
                <Link to="/products" className="text-gray-300 hover:text-white transition-colors">Produtos</Link>
                <Link to="/inventory" className="text-gray-300 hover:text-white transition-colors">Estoque</Link>
                <Link to="/sales" className="text-gray-300 hover:text-white transition-colors">Vendas</Link>
                <Link to="/purchases" className="text-gray-300 hover:text-white transition-colors">Compras</Link>
                <Link to="/schedule" className="text-gray-300 hover:text-white transition-colors">Agenda</Link>
                <Link to="/summary" className="text-gray-300 hover:text-white transition-colors">Resumo</Link>
                <Link to="/reports" className="text-gray-300 hover:text-white transition-colors">Relatórios</Link>
                <Link to="/notifications" className="text-gray-300 hover:text-white transition-colors">Notificações</Link>
                {Boolean(user?.companyUsers?.some(cu => cu.role === 'ADMIN')) && (
                  <Link to="/admin" className="text-gray-300 hover:text-white transition-colors">Admin</Link>
                )}
              </div>
            </div>
          </nav>

          {/* Main Content */}
          <main className="container mx-auto px-4 py-8">
            {summary && (
              <>
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <div className="bg-gray-800 rounded-lg p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-sm">Receitas do Mês</p>
                        <p className="text-2xl font-bold text-green-400">{formatCurrency(summary.monthlyIncome)}</p>
                      </div>
                      <TrendingUp className="text-green-400" size={24} />
                    </div>
                  </div>

                  <div className="bg-gray-800 rounded-lg p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-sm">Despesas do Mês</p>
                        <p className="text-2xl font-bold text-red-400">{formatCurrency(summary.monthlyExpense)}</p>
                      </div>
                      <TrendingDown className="text-red-400" size={24} />
                    </div>
                  </div>

                  <div className="bg-gray-800 rounded-lg p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-sm">Saldo Total</p>
                        <p className={`text-2xl font-bold ${summary.totalBalance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {formatCurrency(summary.totalBalance)}
                        </p>
                      </div>
                      <DollarSign className="text-yellow-400" size={24} />
                    </div>
                  </div>

                  <div className="bg-gray-800 rounded-lg p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-sm">Contas Pendentes</p>
                        <p className="text-2xl font-bold text-yellow-400">{summary.pendingBills}</p>
                      </div>
                      <AlertTriangle className="text-yellow-400" size={24} />
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
                  <Link to="/companies" className="bg-gray-800 rounded-lg p-4 text-center hover:bg-gray-750 transition-colors">
                    <Building2 className="text-blue-400 mx-auto mb-2" size={24} />
                    <p className="text-sm font-medium">Empresas</p>
                  </Link>
                  <Link to="/accounts" className="bg-gray-800 rounded-lg p-4 text-center hover:bg-gray-750 transition-colors">
                    <Wallet className="text-green-400 mx-auto mb-2" size={24} />
                    <p className="text-sm font-medium">Contas</p>
                  </Link>
                  <Link to="/products" className="bg-gray-800 rounded-lg p-4 text-center hover:bg-gray-750 transition-colors">
                    <Package className="text-purple-400 mx-auto mb-2" size={24} />
                    <p className="text-sm font-medium">Produtos</p>
                  </Link>
                  <Link to="/sales" className="bg-gray-800 rounded-lg p-4 text-center hover:bg-gray-750 transition-colors">
                    <ShoppingCart className="text-green-400 mx-auto mb-2" size={24} />
                    <p className="text-sm font-medium">Vendas</p>
                  </Link>
                  <Link to="/purchases" className="bg-gray-800 rounded-lg p-4 text-center hover:bg-gray-750 transition-colors">
                    <ShoppingBag className="text-blue-400 mx-auto mb-2" size={24} />
                    <p className="text-sm font-medium">Compras</p>
                  </Link>
                  <Link to="/schedule" className="bg-gray-800 rounded-lg p-4 text-center hover:bg-gray-750 transition-colors">
                    <Calendar className="text-yellow-400 mx-auto mb-2" size={24} />
                    <p className="text-sm font-medium">Agenda</p>
                  </Link>
                </div>

                {/* Alerts */}
                {(summary.pendingBills > 0 || summary.lowStockProducts > 0) && (
                  <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4 mb-8">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="text-yellow-400" size={24} />
                      <div>
                        <h3 className="text-lg font-semibold text-yellow-400">Atenção</h3>
                        <p className="text-yellow-300">
                          {summary.pendingBills > 0 && `Você tem ${summary.pendingBills} conta(s) pendente(s). `}
                          {summary.lowStockProducts > 0 && `Você tem ${summary.lowStockProducts} produto(s) com estoque baixo.`}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Recent Transactions */}
                {summary.recentTransactions.length > 0 && (
                  <div className="bg-gray-800 rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-4">Transações Recentes</h3>
                    <div className="space-y-3">
                      {summary.recentTransactions.slice(0, 5).map((transaction: any) => (
                        <div key={transaction.id} className="flex items-center justify-between py-2 border-b border-gray-700 last:border-b-0">
                          <div>
                            <p className="font-medium">{transaction.description}</p>
                            <p className="text-sm text-gray-400">
                              {transaction.category?.name} • {new Date(transaction.date).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                          <span className={`font-semibold ${transaction.type === 'INCOME' ? 'text-green-400' : 'text-red-400'}`}>
                            {transaction.type === 'INCOME' ? '+' : '-'}{formatCurrency(transaction.amount)}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4">
                      <Link to="/transactions" className="text-yellow-400 hover:text-yellow-300 text-sm">
                        Ver todas as transações →
                      </Link>
                    </div>
                  </div>
                )}
              </>
            )}
          </main>
        </>
      )}
    </div>
  );
}
