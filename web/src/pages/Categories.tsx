import React, { useState, useEffect } from 'react';
import { 
  Tag, Plus, Edit, Trash2, Eye, Search, Filter, 
  MoreVertical, TrendingUp, TrendingDown, DollarSign,
  ShoppingCart, Home, Car, Coffee, Heart, Gift, Book,
  Play, Plane, Building2, Wifi, Phone, Zap, Briefcase,
  GraduationCap, Activity
} from 'lucide-react';
import { API, authHeaders } from '../api';
import toast from 'react-hot-toast';

interface Category {
  id: string;
  name: string;
  type: 'INCOME' | 'EXPENSE';
  color: string;
  icon: string;
  description?: string;
  isActive: boolean;
  companyId: string;
  company: {
    id: string;
    name: string;
  };
  _count: {
    transactions: number;
  };
  createdAt: string;
  updatedAt: string;
}

interface CategoryFormData {
  name: string;
  type: 'INCOME' | 'EXPENSE';
  color: string;
  icon: string;
  description: string;
  companyId: string;
}

const colorOptions = [
  { name: 'Vermelho', value: '#ef4444' },
  { name: 'Laranja', value: '#f97316' },
  { name: 'Amarelo', value: '#eab308' },
  { name: 'Verde', value: '#22c55e' },
  { name: 'Azul', value: '#3b82f6' },
  { name: 'Roxo', value: '#8b5cf6' },
  { name: 'Rosa', value: '#ec4899' },
  { name: 'Cinza', value: '#6b7280' },
  { name: 'Dourado', value: '#fbbf24' },
  { name: 'Turquesa', value: '#06b6d4' }
];

const iconOptions = [
  { name: 'Tag', value: 'Tag' },
  { name: 'Dollar', value: 'DollarSign' },
  { name: 'Trending Up', value: 'TrendingUp' },
  { name: 'Trending Down', value: 'TrendingDown' },
  { name: 'Shopping Cart', value: 'ShoppingCart' },
  { name: 'Home', value: 'Home' },
  { name: 'Car', value: 'Car' },
  { name: 'Coffee', value: 'Coffee' },
  { name: 'Heart', value: 'Heart' },
  { name: 'Gift', value: 'Gift' },
  { name: 'Book', value: 'Book' },
  { name: 'Play', value: 'Play' },
  { name: 'Plane', value: 'Plane' },
  { name: 'Building', value: 'Building2' },
  { name: 'Wifi', value: 'Wifi' },
  { name: 'Phone', value: 'Phone' },
  { name: 'Zap', value: 'Zap' },
  { name: 'Briefcase', value: 'Briefcase' },
  { name: 'Graduation Cap', value: 'GraduationCap' },
  { name: 'Activity', value: 'Activity' }
];

export function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    type: 'EXPENSE',
    color: '#3b82f6',
    icon: 'Tag',
    description: '',
    companyId: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [filterType, setFilterType] = useState<'ALL' | 'INCOME' | 'EXPENSE'>('ALL');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [categoriesResponse, companiesResponse] = await Promise.all([
        fetch(`${API}/categories`, { headers: authHeaders() }),
        fetch(`${API}/companies`, { headers: authHeaders() })
      ]);
      
      if (categoriesResponse.ok && companiesResponse.ok) {
        const categoriesData = await categoriesResponse.json();
        const companiesData = await companiesResponse.json();
        setCategories(categoriesData);
        setCompanies(companiesData);
        
        // Set default company if available
        if (companiesData.length > 0 && !formData.companyId) {
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
      const url = editingCategory 
        ? `${API}/categories/${editingCategory.id}`
        : `${API}/categories`;
      
      const method = editingCategory ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { ...authHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        toast.success(editingCategory ? 'Categoria atualizada com sucesso' : 'Categoria criada com sucesso');
        setShowModal(false);
        setEditingCategory(null);
        resetForm();
        loadData();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Erro ao salvar categoria');
      }
    } catch (error) {
      toast.error('Erro ao salvar categoria');
    }
  };

  const handleDelete = async (category: Category) => {
    if (!confirm(`Tem certeza que deseja excluir a categoria "${category.name}"?`)) {
      return;
    }

    try {
      const response = await fetch(`${API}/categories/${category.id}`, {
        method: 'DELETE',
        headers: authHeaders()
      });

      if (response.ok) {
        toast.success('Categoria excluída com sucesso');
        loadData();
      } else {
        toast.error('Erro ao excluir categoria');
      }
    } catch (error) {
      toast.error('Erro ao excluir categoria');
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      type: category.type,
      color: category.color,
      icon: category.icon,
      description: category.description || '',
      companyId: category.companyId
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'EXPENSE',
      color: '#3b82f6',
      icon: 'Tag',
      description: '',
      companyId: companies.length > 0 ? companies[0].id : ''
    });
  };

  const openModal = () => {
    setEditingCategory(null);
    resetForm();
    setShowModal(true);
  };

  const filteredCategories = categories.filter(category => {
    const matchesSearch = category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (category.description && category.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = filterType === 'ALL' || category.type === filterType;
    return matchesSearch && matchesType;
  });

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Tag': return <Tag size={20} />;
      case 'DollarSign': return <DollarSign size={20} />;
      case 'TrendingUp': return <TrendingUp size={20} />;
      case 'TrendingDown': return <TrendingDown size={20} />;
      case 'ShoppingCart': return <ShoppingCart size={20} />;
      case 'Home': return <Home size={20} />;
      case 'Car': return <Car size={20} />;
      case 'Coffee': return <Coffee size={20} />;
      case 'Heart': return <Heart size={20} />;
      case 'Gift': return <Gift size={20} />;
      case 'Book': return <Book size={20} />;
      case 'Play': return <Play size={20} />;
      case 'Plane': return <Plane size={20} />;
      case 'Building2': return <Building2 size={20} />;
      case 'Wifi': return <Wifi size={20} />;
      case 'Phone': return <Phone size={20} />;
      case 'Zap': return <Zap size={20} />;
      case 'Briefcase': return <Briefcase size={20} />;
      case 'GraduationCap': return <GraduationCap size={20} />;
      case 'Activity': return <Activity size={20} />;
      default: return <Tag size={20} />;
    }
  };

  const getTypeLabel = (type: string) => {
    return type === 'INCOME' ? 'Receita' : 'Despesa';
  };

  const getTypeColor = (type: string) => {
    return type === 'INCOME' ? 'text-green-400' : 'text-red-400';
  };

  const getTypeBgColor = (type: string) => {
    return type === 'INCOME' ? 'bg-green-600' : 'bg-red-600';
  };

  const incomeCategories = categories.filter(c => c.type === 'INCOME');
  const expenseCategories = categories.filter(c => c.type === 'EXPENSE');

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
              <Tag className="text-yellow-400" size={24} />
              <h1 className="text-2xl font-bold">Categorias</h1>
            </div>
            <button
              onClick={openModal}
              className="bg-yellow-500 hover:bg-yellow-600 text-black px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <Plus size={20} />
              <span>Nova Categoria</span>
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
                <p className="text-gray-400 text-sm">Total de Categorias</p>
                <p className="text-2xl font-bold text-yellow-400">{categories.length}</p>
              </div>
              <Tag className="text-yellow-400" size={24} />
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Categorias de Receita</p>
                <p className="text-2xl font-bold text-green-400">{incomeCategories.length}</p>
              </div>
              <TrendingUp className="text-green-400" size={24} />
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Categorias de Despesa</p>
                <p className="text-2xl font-bold text-red-400">{expenseCategories.length}</p>
              </div>
              <TrendingDown className="text-red-400" size={24} />
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
                placeholder="Buscar categorias..."
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
          </div>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCategories.map(category => (
            <div key={category.id} className="bg-gray-800 rounded-lg p-6 hover:bg-gray-750 transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-12 h-12 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: category.color }}
                  >
                    {getCategoryIcon(category.icon)}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{category.name}</h3>
                    <p className={`text-sm ${getTypeColor(category.type)}`}>
                      {getTypeLabel(category.type)}
                    </p>
                  </div>
                </div>
                <div className="relative">
                  <button className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
                    <MoreVertical size={16} />
                  </button>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                {category.description && (
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-400">Descrição:</span>
                    <span className="text-sm">{category.description}</span>
                  </div>
                )}
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-400">Empresa:</span>
                  <span className="text-sm">{category.company.name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-400">Transações:</span>
                  <span className="text-sm font-medium">{category._count.transactions}</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    category.isActive ? 'bg-green-600 text-white' : 'bg-gray-600 text-white'
                  }`}>
                    {category.isActive ? 'Ativa' : 'Inativa'}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setSelectedCategory(category)}
                    className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                    title="Ver detalhes"
                  >
                    <Eye size={16} />
                  </button>
                  <button
                    onClick={() => handleEdit(category)}
                    className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                    title="Editar"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(category)}
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

        {filteredCategories.length === 0 && (
          <div className="text-center py-12">
            <Tag className="text-gray-600 mx-auto mb-4" size={48} />
            <h3 className="text-lg font-medium text-gray-400 mb-2">
              {searchTerm || filterType !== 'ALL' ? 'Nenhuma categoria encontrada' : 'Nenhuma categoria cadastrada'}
            </h3>
            <p className="text-gray-500 mb-6">
              {searchTerm || filterType !== 'ALL' ? 'Tente ajustar os filtros de busca' : 'Comece criando sua primeira categoria'}
            </p>
            {!searchTerm && filterType === 'ALL' && (
              <button
                onClick={openModal}
                className="bg-yellow-500 hover:bg-yellow-600 text-black px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Criar Primeira Categoria
              </button>
            )}
          </div>
        )}
      </main>

      {/* Category Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">
                {editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
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
                  <label className="block text-sm font-medium mb-2">Nome da Categoria</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-yellow-500"
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
                  <label className="block text-sm font-medium mb-2">Cor</label>
                  <div className="grid grid-cols-5 gap-2">
                    {colorOptions.map(color => (
                      <button
                        key={color.value}
                        type="button"
                        onClick={() => setFormData({...formData, color: color.value})}
                        className={`w-8 h-8 rounded-lg border-2 transition-colors ${
                          formData.color === color.value ? 'border-white' : 'border-gray-600'
                        }`}
                        style={{ backgroundColor: color.value }}
                        title={color.name}
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Ícone</label>
                  <select
                    value={formData.icon}
                    onChange={(e) => setFormData({...formData, icon: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-yellow-500"
                    required
                  >
                    {iconOptions.map(icon => (
                      <option key={icon.value} value={icon.value}>
                        {icon.name}
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
                  {editingCategory ? 'Atualizar' : 'Criar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Category Details Modal */}
      {selectedCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Detalhes da Categoria</h2>
              <button
                onClick={() => setSelectedCategory(null)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <div 
                  className="w-16 h-16 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: selectedCategory.color }}
                >
                  {getCategoryIcon(selectedCategory.icon)}
                </div>
                <div>
                  <h3 className="text-xl font-semibold">{selectedCategory.name}</h3>
                  <p className={`text-lg ${getTypeColor(selectedCategory.type)}`}>
                    {getTypeLabel(selectedCategory.type)}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-gray-400">Empresa:</span>
                  <p className="font-medium">{selectedCategory.company.name}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-400">Status:</span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    selectedCategory.isActive ? 'bg-green-600 text-white' : 'bg-gray-600 text-white'
                  }`}>
                    {selectedCategory.isActive ? 'Ativa' : 'Inativa'}
                  </span>
                </div>
                <div>
                  <span className="text-sm text-gray-400">Transações:</span>
                  <p className="font-medium">{selectedCategory._count.transactions}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-400">Criada em:</span>
                  <p className="font-medium">{new Date(selectedCategory.createdAt).toLocaleDateString('pt-BR')}</p>
                </div>
                {selectedCategory.description && (
                  <div className="md:col-span-2">
                    <span className="text-sm text-gray-400">Descrição:</span>
                    <p className="font-medium">{selectedCategory.description}</p>
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
