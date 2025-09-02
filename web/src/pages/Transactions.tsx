import React, { useState, useEffect } from 'react';
import { 
  DollarSign, Plus, Edit, Trash2, Eye, Search, Filter, 
  MoreVertical, TrendingUp, TrendingDown, Calendar, Tag
} from 'lucide-react';
import { API, authHeaders } from '../api';
import toast from 'react-hot-toast';

interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: 'INCOME' | 'EXPENSE';
  date: string;
  categoryId: string;
  category: {
    id: string;
    name: string;
    color: string;
    icon: string;
  };
  accountId: string;
  account: {
    id: string;
    name: string;
    type: string;
  };
  companyId: string;
  company: {
    id: string;
    name: string;
  };
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface TransactionFormData {
  description: string;
  amount: string;
  type: 'INCOME' | 'EXPENSE';
  date: string;
  categoryId: string;
  accountId: string;
  companyId: string;
  notes: string;
}

export function Transactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [formData, setFormData] = useState<TransactionFormData>({
    description: '',
    amount: '',
    type: 'EXPENSE',
    date: new Date().toISOString().split('T')[0],
    categoryId: '',
    accountId: '',
    companyId: '',
    notes: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [filterType, setFilterType] = useState<'ALL' | 'INCOME' | 'EXPENSE'>('ALL');
  const [filterDate, setFilterDate] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [transactionsResponse, categoriesResponse, accountsResponse, companiesResponse] = await Promise.all([
        fetch(`${API}/transactions`, { headers: authHeaders() }),
        fetch(`${API}/categories`, { headers: authHeaders() }),
        fetch(`${API}/accounts`, { headers: authHeaders() }),
        fetch(`${API}/companies`, { headers: authHeaders() })
      ]);
      
      if (transactionsResponse.ok && categoriesResponse.ok && accountsResponse.ok && companiesResponse.ok) {
        const transactionsData = await transactionsResponse.json();
        const categoriesData = await categoriesResponse.json();
        const accountsData = await accountsResponse.json();
        const companiesData = await companiesResponse.json();
        
        setTransactions(transactionsData);
        setCategories(categoriesData);
        setAccounts(accountsData);
        setCompanies(companiesData);
        
        // Set default values if available
        if (companiesData.length > 0 && !formData.companyId) {
          setFormData(prev => ({ ...prev, companyId: companiesData[0].id }));
        }
        if (categoriesData.length > 0 && !formData.categoryId) {
          setFormData(prev => ({ ...prev, categoryId: categoriesData[0].id }));
        }
        if (accountsData.length > 0 && !formData.accountId) {
          setFormData(prev => ({ ...prev, accountId: accountsData[0].id }));
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
      const url = editingTransaction 
        ? `${API}/transactions/${editingTransaction.id}`
        : `${API}/transactions`;
      
      const method = editingTransaction ? 'PUT' : 'POST';
      
      const submitData = {
        ...formData,
        amount: parseFloat(formData.amount.replace(/[^\d.-]/g, ''))
      };
      
      const response = await fetch(url, {
        method,
        headers: { ...authHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData)
      });

      if (response.ok) {
        toast.success(editingTransaction ? 'Transação atualizada com sucesso' : 'Transação criada com sucesso');
        setShowModal(false);
        setEditingTransaction(null);
        resetForm();
        loadData();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Erro ao salvar transação');
      }
    } catch (error) {
      toast.error('Erro ao salvar transação');
    }
  };

  const handleDelete = async (transaction: Transaction) => {
    if (!confirm(`Tem certeza que deseja excluir a transação "${transaction.description}"?`)) {
      return;
    }

    try {
      const response = await fetch(`${API}/transactions/${transaction.id}`, {
        method: 'DELETE',
        headers: authHeaders()
      });

      if (response.ok) {
        toast.success('Transação excluída com sucesso');
        loadData();
      } else {
        toast.error('Erro ao excluir transação');
      }
    } catch (error) {
      toast.error('Erro ao excluir transação');
    }
  };

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setFormData({
      description: transaction.description,
      amount: transaction.amount.toString(),
      type: transaction.type,
      date: transaction.date.split('T')[0],
      categoryId: transaction.categoryId,
      accountId: transaction.accountId,
      companyId: transaction.companyId,
      notes: transaction.notes || ''
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      description: '',
      amount: '',
      type: 'EXPENSE',
      date: new Date().toISOString().split('T')[0],
      categoryId: categories.length > 0 ? categories[0].id : '',
      accountId: accounts.length > 0 ? accounts[0].id : '',
      companyId: companies.length > 0 ? companies[0].id : '',
      notes: ''
    });
  };

  const openModal = () => {
    setEditingTransaction(null);
    resetForm();
    setShowModal(true);
  };

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.account.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'ALL' || transaction.type === filterType;
    const matchesDate = !filterDate || transaction.date.includes(filterDate);
    return matchesSearch && matchesType && matchesDate;
  });

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Tag': return <Tag size={16} />;
      case 'DollarSign': return <DollarSign size={16} />;
      case 'TrendingUp': return <TrendingUp size={16} />;
      case 'TrendingDown': return <TrendingDown size={16} />;
      default: return <Tag size={16} />;
    }
  };

  const getTypeLabel = (type: string) => {
    return type === 'INCOME' ? 'Receita' : 'Despesa';
  };

  const getTypeColor = (type: string) => {
    return type === 'INCOME' ? 'text-green-400' : 'text-red-400';
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR');
  };

  const totalIncome = transactions.filter(t => t.type === 'INCOME').reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'EXPENSE').reduce((sum, t) => sum + t.amount, 0);
  const balance = totalIncome - totalExpense;

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
              <DollarSign className="text-yellow-400" size={24} />
              <h1 className="text-2xl font-bold">Transações</h1>
            </div>
            <button
              onClick={openModal}
              className="bg-yellow-500 hover:bg-yellow-600 text-black px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <Plus size={20} />
              <span>Nova Transação</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Receitas</p>
                <p className="text-2xl font-bold text-green-400">{formatCurrency(totalIncome)}</p>
              </div>
              <TrendingUp className="text-green-400" size={24} />
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Despesas</p>
                <p className="text-2xl font-bold text-red-400">{formatCurrency(totalExpense)}</p>
              </div>
              <TrendingDown className="text-red-400" size={24} />
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Saldo</p>
                <p className={`text-2xl font-bold ${balance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {formatCurrency(balance)}
                </p>
              </div>
              <DollarSign className="text-yellow-400" size={24} />
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
                placeholder="Buscar transações..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-500"
              />
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-yellow-500"
            >
              <option value="ALL">Todos os tipos</option>
              <option value="INCOME">Receitas</option>
              <option value="EXPENSE">Despesas</option>
            </select>
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-yellow-500"
            />
          </div>
        </div>

        {/* Transactions List */}
        <div className="space-y-4">
          {filteredTransactions.map(transaction => (
            <div key={transaction.id} className="bg-gray-800 rounded-lg p-6 hover:bg-gray-750 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-4">
                  <div 
                    className="w-12 h-12 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: transaction.category.color }}
                  >
                    {getCategoryIcon(transaction.category.icon)}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{transaction.description}</h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-400">
                      <span>{transaction.category.name}</span>
                      <span>•</span>
                      <span>{transaction.account.name}</span>
                      <span>•</span>
                      <span>{formatDate(transaction.date)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className={`text-xl font-bold ${getTypeColor(transaction.type)}`}>
                      {transaction.type === 'INCOME' ? '+' : '-'}{formatCurrency(transaction.amount)}
                    </p>
                    <p className={`text-sm ${getTypeColor(transaction.type)}`}>
                      {getTypeLabel(transaction.type)}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setSelectedTransaction(transaction)}
                      className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                      title="Ver detalhes"
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      onClick={() => handleEdit(transaction)}
                      className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                      title="Editar"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(transaction)}
                      className="p-2 hover:bg-red-600 rounded-lg transition-colors"
                      title="Excluir"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
              {transaction.notes && (
                <div className="mt-4 pt-4 border-t border-gray-700">
                  <p className="text-sm text-gray-400">{transaction.notes}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {filteredTransactions.length === 0 && (
          <div className="text-center py-12">
            <DollarSign className="text-gray-600 mx-auto mb-4" size={48} />
            <h3 className="text-lg font-medium text-gray-400 mb-2">
              {searchTerm || filterType !== 'ALL' || filterDate ? 'Nenhuma transação encontrada' : 'Nenhuma transação cadastrada'}
            </h3>
            <p className="text-gray-500 mb-6">
              {searchTerm || filterType !== 'ALL' || filterDate ? 'Tente ajustar os filtros de busca' : 'Comece criando sua primeira transação'}
            </p>
            {!searchTerm && filterType === 'ALL' && !filterDate && (
              <button
                onClick={openModal}
                className="bg-yellow-500 hover:bg-yellow-600 text-black px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Criar Primeira Transação
              </button>
            )}
          </div>
        )}
      </main>

      {/* Transaction Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">
                {editingTransaction ? 'Editar Transação' : 'Nova Transação'}
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
                  <label className="block text-sm font-medium mb-2">Descrição</label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-yellow-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Valor</label>
                  <input
                    type="text"
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-yellow-500"
                    placeholder="0,00"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Tipo</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value as any})}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-yellow-500"
                    required
                  >
                    <option value="EXPENSE">Despesa</option>
                    <option value="INCOME">Receita</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Data</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-yellow-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Categoria</label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData({...formData, categoryId: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-yellow-500"
                    required
                  >
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Conta</label>
                  <select
                    value={formData.accountId}
                    onChange={(e) => setFormData({...formData, accountId: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-yellow-500"
                    required
                  >
                    {accounts.map(account => (
                      <option key={account.id} value={account.id}>
                        {account.name}
                      </option>
                    ))}
                  </select>
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
                  <label className="block text-sm font-medium mb-2">Observações (opcional)</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
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
                  {editingTransaction ? 'Atualizar' : 'Criar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Transaction Details Modal */}
      {selectedTransaction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Detalhes da Transação</h2>
              <button
                onClick={() => setSelectedTransaction(null)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <div 
                  className="w-16 h-16 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: selectedTransaction.category.color }}
                >
                  {getCategoryIcon(selectedTransaction.category.icon)}
                </div>
                <div>
                  <h3 className="text-xl font-semibold">{selectedTransaction.description}</h3>
                  <p className={`text-lg ${getTypeColor(selectedTransaction.type)}`}>
                    {getTypeLabel(selectedTransaction.type)}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-gray-400">Valor:</span>
                  <p className={`text-xl font-bold ${getTypeColor(selectedTransaction.type)}`}>
                    {selectedTransaction.type === 'INCOME' ? '+' : '-'}{formatCurrency(selectedTransaction.amount)}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-gray-400">Data:</span>
                  <p className="font-medium">{formatDate(selectedTransaction.date)}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-400">Categoria:</span>
                  <p className="font-medium">{selectedTransaction.category.name}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-400">Conta:</span>
                  <p className="font-medium">{selectedTransaction.account.name}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-400">Empresa:</span>
                  <p className="font-medium">{selectedTransaction.company.name}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-400">Criada em:</span>
                  <p className="font-medium">{formatDate(selectedTransaction.createdAt)}</p>
                </div>
                {selectedTransaction.notes && (
                  <div className="md:col-span-2">
                    <span className="text-sm text-gray-400">Observações:</span>
                    <p className="font-medium">{selectedTransaction.notes}</p>
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
