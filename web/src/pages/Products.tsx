import React, { useState, useEffect } from 'react';
import { Plus, Package, AlertTriangle, TrendingUp, DollarSign, Hash } from 'lucide-react';
import { API, authHeaders } from '../api';
import toast from 'react-hot-toast';

interface Product {
  id: string;
  sku: string;
  name: string;
  description?: string;
  cost: number;
  salePrice: number;
  stock: number;
  minStock: number;
  category?: string;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
}

export function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    description: '',
    cost: '',
    salePrice: '',
    stock: '',
    minStock: '',
    category: ''
  });

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const response = await fetch(`${API}/products`, {
        headers: authHeaders()
      });
      
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      } else {
        toast.error('Erro ao carregar produtos');
      }
    } catch (error) {
      toast.error('Erro de conexão');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch(`${API}/products`, {
        method: 'POST',
        headers: {
          ...authHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          cost: parseFloat(formData.cost.replace(',', '.')),
          salePrice: parseFloat(formData.salePrice.replace(',', '.')),
          stock: parseInt(formData.stock),
          minStock: parseInt(formData.minStock)
        })
      });

      if (response.ok) {
        toast.success('Produto criado com sucesso!');
        setFormData({
          sku: '', name: '', description: '', cost: '', salePrice: '', stock: '', minStock: '', category: ''
        });
        setShowForm(false);
        loadProducts();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Erro ao criar produto');
      }
    } catch (error) {
      toast.error('Erro de conexão');
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getStockStatus = (stock: number, minStock: number) => {
    if (stock === 0) return { status: 'out', color: 'text-red-400', bg: 'bg-red-600' };
    if (stock <= minStock) return { status: 'low', color: 'text-yellow-400', bg: 'bg-yellow-600' };
    return { status: 'ok', color: 'text-green-400', bg: 'bg-green-600' };
  };

  const calculateMargin = (salePrice: number, cost: number) => {
    if (cost === 0) return 0;
    return ((salePrice - cost) / cost) * 100;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-700 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="bg-gray-800 rounded-lg p-6 h-64"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const totalValue = products.reduce((sum, product) => sum + (product.cost * product.stock), 0);
  const lowStockProducts = products.filter(p => p.stock <= p.minStock).length;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-yellow-400">Produtos</h1>
            <p className="text-gray-400 mt-2">Gerencie seu catálogo de produtos</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="bg-yellow-500 hover:bg-yellow-600 text-black px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-colors"
          >
            <Plus size={20} />
            Novo Produto
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total de Produtos</p>
                <p className="text-2xl font-bold text-white">{products.length}</p>
              </div>
              <Package className="text-blue-400" size={24} />
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Valor em Estoque</p>
                <p className="text-2xl font-bold text-green-400">{formatCurrency(totalValue)}</p>
              </div>
              <DollarSign className="text-green-400" size={24} />
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Estoque Baixo</p>
                <p className="text-2xl font-bold text-yellow-400">{lowStockProducts}</p>
              </div>
              <AlertTriangle className="text-yellow-400" size={24} />
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Produtos Ativos</p>
                <p className="text-2xl font-bold text-purple-400">
                  {products.filter(p => p.status === 'ACTIVE').length}
                </p>
              </div>
              <TrendingUp className="text-purple-400" size={24} />
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map(product => {
            const stockStatus = getStockStatus(product.stock, product.minStock);
            const margin = calculateMargin(product.salePrice, product.cost);
            
            return (
              <div key={product.id} className="bg-gray-800 rounded-lg p-6 hover:bg-gray-750 transition-colors">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Package className="text-blue-400" size={20} />
                      <h3 className="text-lg font-semibold">{product.name}</h3>
                    </div>
                    <p className="text-sm text-gray-400 mb-2">SKU: {product.sku}</p>
                    {product.category && (
                      <span className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded">
                        {product.category}
                      </span>
                    )}
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${stockStatus.bg}`}>
                    {stockStatus.status === 'out' ? 'Sem Estoque' : 
                     stockStatus.status === 'low' ? 'Estoque Baixo' : 'OK'}
                  </span>
                </div>

                {product.description && (
                  <p className="text-gray-400 text-sm mb-4 line-clamp-2">{product.description}</p>
                )}

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-gray-500">Custo</p>
                    <p className="text-sm font-semibold text-red-400">{formatCurrency(product.cost)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Preço de Venda</p>
                    <p className="text-sm font-semibold text-green-400">{formatCurrency(product.salePrice)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Estoque</p>
                    <p className={`text-sm font-semibold ${stockStatus.color}`}>{product.stock}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Margem</p>
                    <p className="text-sm font-semibold text-blue-400">{margin.toFixed(1)}%</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded text-sm transition-colors">
                    Editar
                  </button>
                  <button className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded text-sm transition-colors">
                    Vender
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {products.length === 0 && (
          <div className="text-center py-12">
            <Package className="text-gray-600 mx-auto mb-4" size={64} />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">Nenhum produto encontrado</h3>
            <p className="text-gray-500 mb-6">Crie seu primeiro produto para começar</p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-yellow-500 hover:bg-yellow-600 text-black px-6 py-3 rounded-lg font-semibold"
            >
              Criar Produto
            </button>
          </div>
        )}
      </div>

      {/* Create Product Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">Novo Produto</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">SKU</label>
                <input
                  type="text"
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-yellow-500"
                  placeholder="Ex: PULSEIRA-001"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Nome</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-yellow-500"
                  placeholder="Ex: Pulseira de Couro"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Descrição (opcional)</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-yellow-500"
                  placeholder="Descrição do produto"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Categoria (opcional)</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-yellow-500"
                  placeholder="Ex: Acessórios"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Custo</label>
                  <input
                    type="text"
                    value={formData.cost}
                    onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-yellow-500"
                    placeholder="0,00"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Preço de Venda</label>
                  <input
                    type="text"
                    value={formData.salePrice}
                    onChange={(e) => setFormData({ ...formData, salePrice: e.target.value })}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-yellow-500"
                    placeholder="0,00"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Estoque Inicial</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-yellow-500"
                    placeholder="0"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Estoque Mínimo</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.minStock}
                    onChange={(e) => setFormData({ ...formData, minStock: e.target.value })}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-yellow-500"
                    placeholder="0"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-black py-2 rounded-lg font-semibold transition-colors"
                >
                  Criar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
