import React, { useState, useEffect } from 'react';
import { 
  Wallet, Plus, Edit, Trash2, Eye, Search, Filter, 
  MoreVertical, CreditCard, Building2, PiggyBank, TrendingUp
} from 'lucide-react';
import { API, authHeaders } from '../api';
import toast from 'react-hot-toast';

interface Account {
  id: string;
  name: string;
  type: 'CHECKING' | 'SAVINGS' | 'CREDIT' | 'INVESTMENT' | 'CASH';
  balance: number;
  currency: string;
  institution: string;
  accountNumber: string;
  description?: string;
  isActive: boolean;
  companyId: string;
  company: {
    id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface AccountFormData {
  name: string;
  type: 'CHECKING' | 'SAVINGS' | 'CREDIT' | 'INVESTMENT' | 'CASH';
  balance: string;
  currency: string;
  institution: string;
  accountNumber: string;
  description: string;
  companyId: string;
}

export function Accounts() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [formData, setFormData] = useState<AccountFormData>({
    name: '',
    type: 'CHECKING',
    balance: '',
    currency: 'BRL',
    institution: '',
    accountNumber: '',
    description: '',
    companyId: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [accountsResponse, companiesResponse] = await Promise.all([
        fetch(`${API}/accounts`, { headers: authHeaders() }),
        fetch(`${API}/companies`, { headers: authHeaders() })
      ]);
      
      if (accountsResponse.ok && companiesResponse.ok) {
        const accountsData = await accountsResponse.json();
        const companiesData = await companiesResponse.json();
        setAccounts(accountsData);
        setCompanies(companiesData);
        
        // Set default company if available
        if (companiesData?.length > 0 && !formData.companyId) {
          setFormData(prev => ({ ...prev, companyId: companiesData[0].id }));
        }
      } else {
        toast.error('Erro ao carregar dados');
      }
    } catch (error) {
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editingAccount 
        ? `${API}/accounts/${editingAccount.id}`
        : `${API}/accounts`;
      
      const method = editingAccount ? 'PUT' : 'POST';
      
      const submitData = {
        ...formData,
        balance: parseFloat(formData.balance.replace(/[^\d.-]/g, ''))
      };
      
      const response = await fetch(url, {
        method,
        headers: { ...authHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData)
      });

      if (response.ok) {
        toast.success(editingAccount ? 'Conta atualizada com sucesso' : 'Conta criada com sucesso');
        setShowModal(false);
        setEditingAccount(null);
        resetForm();
        loadData();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Erro ao salvar conta');
      }
    } catch (error) {
      toast.error('Erro ao salvar conta');
    }
  };

  const handleDelete = async (account: Account) => {
    if (!confirm(`Tem certeza que deseja excluir a conta "${account.name}"?`)) {
      return;
    }

    try {
      const response = await fetch(`${API}/accounts/${account.id}`, {
        method: 'DELETE',
        headers: authHeaders()
      });

      if (response.ok) {
        toast.success('Conta excluída com sucesso');
        loadData();
      } else {
        toast.error('Erro ao excluir conta');
      }
    } catch (error) {
      toast.error('Erro ao excluir conta');
    }
  };

  const handleEdit = (account: Account) => {
    setEditingAccount(account);
    setFormData({
      name: account.name,
      type: account.type,
      balance: account.balance.toString(),
      currency: account.currency,
      institution: account.institution,
      accountNumber: account.accountNumber,
      description: account.description || '',
      companyId: account.companyId
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'CHECKING',
      balance: '',
      currency: 'BRL',
      institution: '',
      accountNumber: '',
      description: '',
      companyId: companies.length > 0 ? companies[0].id : ''
    });
  };

  const openModal = () => {
    setEditingAccount(null);
    resetForm();
    setShowModal(true);
  };

  const filteredAccounts = accounts.filter(account =>
    account.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    account.institution.toLowerCase().includes(searchTerm.toLowerCase()) ||
    account.accountNumber.includes(searchTerm)
  );

  const getAccountIcon = (type: string) => {
    switch (type) {
      case 'CHECKING': return <Building2 size={24} />;
      case 'SAVINGS': return <PiggyBank size={24} />;
      case 'CREDIT': return <CreditCard size={24} />;
      case 'INVESTMENT': return <TrendingUp size={24} />;
      case 'CASH': return <Wallet size={24} />;
      default: return <Wallet size={24} />;
    }
  };

  const getAccountTypeLabel = (type: string) => {
    switch (type) {
      case 'CHECKING': return 'Conta Corrente';
      case 'SAVINGS': return 'Conta Poupança';
      case 'CREDIT': return 'Cartão de Crédito';
      case 'INVESTMENT': return 'Investimento';
      case 'CASH': return 'Dinheiro';
      default: return type;
    }
  };

  const getAccountTypeColor = (type: string) => {
    switch (type) {
      case 'CHECKING': return 'text-blue-400';
      case 'SAVINGS': return 'text-green-400';
      case 'CREDIT': return 'text-purple-400';
      case 'INVESTMENT': return 'text-yellow-400';
      case 'CASH': return 'text-gray-400';
      default: return 'text-gray-400';
    }
  };

  const formatCurrency = (value: number, currency: string = 'BRL') => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currency
    }).format(value);
  };

  const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <div className="animate-pulse">
          <div className="h-16 bg-gray-800"></div>
          <div className="container mx-auto px-4 py-8">
            <div className="h-8 bg-gray-800 rounded w-1/4 mb-6"></div>
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-gray-800 rounded-lg p-6 h-24"></div>
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
              <Wallet className="text-yellow-400" size={24} />
              <h1 className="text-2xl font-bold">Contas</h1>
            </div>
            <button
              onClick={openModal}
              className="bg-yellow-500 hover:bg-yellow-600 text-black px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <Plus size={20} />
              <span>Nova Conta</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Summary Card */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold mb-2">Saldo Total</h2>
              <p className={`text-3xl font-bold ${totalBalance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {formatCurrency(totalBalance)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-400">Total de contas</p>
              <p className="text-2xl font-bold text-yellow-400">{accounts?.length || 0}</p>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-6">
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Buscar contas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-500"
              />
            </div>
            <button className="bg-gray-800 border border-gray-700 px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-gray-750 transition-colors">
              <Filter size={20} />
              <span>Filtros</span>
            </button>
          </div>
        </div>

        {/* Accounts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAccounts.map(account => (
            <div key={account.id} className="bg-gray-800 rounded-lg p-6 hover:bg-gray-750 transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center ${getAccountTypeColor(account.type)}`}>
                    {getAccountIcon(account.type)}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{account.name}</h3>
                    <p className="text-sm text-gray-400">{getAccountTypeLabel(account.type)}</p>
                  </div>
                </div>
                <div className="relative">
                  <button className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
                    <MoreVertical size={16} />
                  </button>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Saldo:</span>
                  <span className={`font-semibold ${account.balance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {formatCurrency(account.balance, account.currency)}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-400">Instituição:</span>
                  <span className="text-sm">{account.institution}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-400">Empresa:</span>
                  <span className="text-sm">{account.company.name}</span>
                </div>
                {account.description && (
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-400">Descrição:</span>
                    <span className="text-sm">{account.description}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    account.isActive ? 'bg-green-600 text-white' : 'bg-gray-600 text-white'
                  }`}>
                    {account.isActive ? 'Ativa' : 'Inativa'}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setSelectedAccount(account)}
                    className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                    title="Ver detalhes"
                  >
                    <Eye size={16} />
                  </button>
                  <button
                    onClick={() => handleEdit(account)}
                    className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                    title="Editar"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(account)}
                    className="p-2 hover:bg-red-600 rounded-lg transition-colors"
                    title="Excluir"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredAccounts?.length === 0 && (
          <div className="text-center py-12">
            <Wallet className="text-gray-600 mx-auto mb-4" size={48} />
            <h3 className="text-lg font-medium text-gray-400 mb-2">
              {searchTerm ? 'Nenhuma conta encontrada' : 'Nenhuma conta cadastrada'}
            </h3>
            <p className="text-gray-500 mb-6">
              {searchTerm ? 'Tente ajustar os termos de busca' : 'Comece criando sua primeira conta'}
            </p>
            {!searchTerm && (
              <button
                onClick={openModal}
                className="bg-yellow-500 hover:bg-yellow-600 text-black px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Criar Primeira Conta
              </button>
            )}
          </div>
        )}
      </main>

      {/* Account Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">
                {editingAccount ? 'Editar Conta' : 'Nova Conta'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Nome da Conta</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-yellow-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Tipo de Conta</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value as any})}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-yellow-500"
                    required
                  >
                    <option value="CHECKING">Conta Corrente</option>
                    <option value="SAVINGS">Conta Poupança</option>
                    <option value="CREDIT">Cartão de Crédito</option>
                    <option value="INVESTMENT">Investimento</option>
                    <option value="CASH">Dinheiro</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Saldo Inicial</label>
                  <input
                    type="text"
                    value={formData.balance}
                    onChange={(e) => setFormData({...formData, balance: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-yellow-500"
                    placeholder="0,00"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Moeda</label>
                  <select
                    value={formData.currency}
                    onChange={(e) => setFormData({...formData, currency: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-yellow-500"
                    required
                  >
                    <option value="BRL">Real (BRL)</option>
                    <option value="USD">Dólar (USD)</option>
                    <option value="EUR">Euro (EUR)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Instituição</label>
                  <input
                    type="text"
                    value={formData.institution}
                    onChange={(e) => setFormData({...formData, institution: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-yellow-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Número da Conta</label>
                  <input
                    type="text"
                    value={formData.accountNumber}
                    onChange={(e) => setFormData({...formData, accountNumber: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-yellow-500"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">Empresa</label>
                  <select
                    value={formData.companyId}
                    onChange={(e) => setFormData({...formData, companyId: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-yellow-500"
                    required
                  >
                    {companies.map(company => (
                      <option key={company.id} value={company.id}>
                        {company.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">Descrição (opcional)</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-yellow-500"
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-yellow-500 hover:bg-yellow-600 text-black px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  {editingAccount ? 'Atualizar' : 'Criar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Account Details Modal */}
      {selectedAccount && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Detalhes da Conta</h2>
              <button
                onClick={() => setSelectedAccount(null)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className={`w-16 h-16 bg-gray-700 rounded-lg flex items-center justify-center ${getAccountTypeColor(selectedAccount.type)}`}>
                  {getAccountIcon(selectedAccount.type)}
                </div>
                <div>
                  <h3 className="text-xl font-semibold">{selectedAccount.name}</h3>
                  <p className="text-gray-400">{getAccountTypeLabel(selectedAccount.type)}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-gray-400">Saldo:</span>
                  <p className={`text-xl font-bold ${selectedAccount.balance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {formatCurrency(selectedAccount.balance, selectedAccount.currency)}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-gray-400">Instituição:</span>
                  <p className="font-medium">{selectedAccount.institution}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-400">Número da Conta:</span>
                  <p className="font-medium">{selectedAccount.accountNumber}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-400">Empresa:</span>
                  <p className="font-medium">{selectedAccount.company.name}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-400">Status:</span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    selectedAccount.isActive ? 'bg-green-600 text-white' : 'bg-gray-600 text-white'
                  }`}>
                    {selectedAccount.isActive ? 'Ativa' : 'Inativa'}
                  </span>
                </div>
                <div>
                  <span className="text-sm text-gray-400">Criada em:</span>
                  <p className="font-medium">{new Date(selectedAccount.createdAt).toLocaleDateString('pt-BR')}</p>
                </div>
                {selectedAccount.description && (
                  <div className="md:col-span-2">
                    <span className="text-sm text-gray-400">Descrição:</span>
                    <p className="font-medium">{selectedAccount.description}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
