import React, { useState, useEffect } from 'react';
import { Plus, ShoppingCart, User, DollarSign, Calendar, Package } from 'lucide-react';
import { API, authHeaders } from '../api';
import toast from 'react-hot-toast';

interface SalesOrder {
  id: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  status: 'DRAFT' | 'CONFIRMED' | 'CANCELLED' | 'DELIVERED';
  total: number;
  discount: number;
  paymentMethod: 'CASH' | 'PIX' | 'CREDIT_CARD' | 'DEBIT_CARD' | 'BANK_TRANSFER';
  notes?: string;
  orderDate: string;
  deliveryDate?: string;
  items: SalesOrderItem[];
}

interface SalesOrderItem {
  id: string;
  productId: string;
  product: {
    name: string;
    sku: string;
  };
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export function Sales() {
  const [orders, setOrders] = useState<SalesOrder[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    paymentMethod: 'CASH' as 'CASH' | 'PIX' | 'CREDIT_CARD' | 'DEBIT_CARD' | 'BANK_TRANSFER',
    notes: '',
    items: [] as Array<{
      productId: string;
      quantity: number;
      unitPrice: number;
    }>
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [ordersResponse, productsResponse] = await Promise.all([
        fetch(`${API}/sales`, { headers: authHeaders() }),
        fetch(`${API}/products`, { headers: authHeaders() })
      ]);

      if (ordersResponse.ok && productsResponse.ok) {
        const ordersData = await ordersResponse.json();
        const productsData = await productsResponse.json();
        setOrders(ordersData);
        setProducts(productsData);
      } else {
        toast.error('Erro ao carregar dados');
      }
    } catch (error) {
      toast.error('Erro de conexão');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.items.length === 0) {
      toast.error('Adicione pelo menos um item');
      return;
    }

    try {
      const response = await fetch(`${API}/sales`, {
        method: 'POST',
        headers: {
          ...authHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        toast.success('Pedido de venda criado com sucesso!');
        setFormData({
          customerName: '', customerEmail: '', customerPhone: '', paymentMethod: 'CASH', notes: '', items: []
        });
        setShowForm(false);
        loadData();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Erro ao criar pedido');
      }
    } catch (error) {
      toast.error('Erro de conexão');
    }
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { productId: '', quantity: 1, unitPrice: 0 }]
    });
  };

  const removeItem = (index: number) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index)
    });
  };

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    // Update unit price when product changes
    if (field === 'productId') {
      const product = products.find(p => p.id === value);
      if (product) {
        newItems[index].unitPrice = product.salePrice;
      }
    }
    
    setFormData({ ...formData, items: newItems });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return 'bg-green-600';
      case 'CANCELLED': return 'bg-red-600';
      case 'DELIVERED': return 'bg-blue-600';
      default: return 'bg-gray-600';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'DRAFT': return 'Rascunho';
      case 'CONFIRMED': return 'Confirmado';
      case 'CANCELLED': return 'Cancelado';
      case 'DELIVERED': return 'Entregue';
      default: return status;
    }
  };

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case 'CASH': return 'Dinheiro';
      case 'PIX': return 'PIX';
      case 'CREDIT_CARD': return 'Cartão de Crédito';
      case 'DEBIT_CARD': return 'Cartão de Débito';
      case 'BANK_TRANSFER': return 'Transferência';
      default: return method;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-700 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-gray-800 rounded-lg p-6 h-48"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
  const totalOrders = orders.length;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-yellow-400">Vendas</h1>
            <p className="text-gray-400 mt-2">Gerencie seus pedidos de venda</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="bg-yellow-500 hover:bg-yellow-600 text-black px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-colors"
          >
            <Plus size={20} />
            Novo Pedido
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total de Vendas</p>
                <p className="text-2xl font-bold text-white">{totalOrders}</p>
              </div>
              <ShoppingCart className="text-blue-400" size={24} />
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Receita Total</p>
                <p className="text-2xl font-bold text-green-400">{formatCurrency(totalRevenue)}</p>
              </div>
              <DollarSign className="text-green-400" size={24} />
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Ticket Médio</p>
                <p className="text-2xl font-bold text-purple-400">
                  {totalOrders > 0 ? formatCurrency(totalRevenue / totalOrders) : formatCurrency(0)}
                </p>
              </div>
              <Package className="text-purple-400" size={24} />
            </div>
          </div>
        </div>

        {/* Orders List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {orders.map(order => (
            <div key={order.id} className="bg-gray-800 rounded-lg p-6 hover:bg-gray-750 transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold">{order.customerName}</h3>
                  <p className="text-sm text-gray-400">#{order.id.slice(-8)}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(order.status)}`}>
                  {getStatusLabel(order.status)}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar size={16} className="text-gray-400" />
                  <span className="text-gray-400">
                    {new Date(order.orderDate).toLocaleDateString('pt-BR')}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <DollarSign size={16} className="text-gray-400" />
                  <span className="text-gray-400">{getPaymentMethodLabel(order.paymentMethod)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Package size={16} className="text-gray-400" />
                  <span className="text-gray-400">{order.items.length} itens</span>
                </div>
              </div>

              <div className="border-t border-gray-700 pt-4 mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Total</span>
                  <span className="text-lg font-bold text-green-400">{formatCurrency(order.total)}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-400">Desconto</span>
                    <span className="text-red-400">-{formatCurrency(order.discount)}</span>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded text-sm transition-colors">
                  Ver Detalhes
                </button>
                <button className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded text-sm transition-colors">
                  Confirmar
                </button>
              </div>
            </div>
          ))}
        </div>

        {orders.length === 0 && (
          <div className="text-center py-12">
            <ShoppingCart className="text-gray-600 mx-auto mb-4" size={64} />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">Nenhum pedido encontrado</h3>
            <p className="text-gray-500 mb-6">Crie seu primeiro pedido de venda</p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-yellow-500 hover:bg-yellow-600 text-black px-6 py-3 rounded-lg font-semibold"
            >
              Criar Pedido
            </button>
          </div>
        )}
      </div>

      {/* Create Order Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">Novo Pedido de Venda</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Customer Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Nome do Cliente</label>
                  <input
                    type="text"
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-yellow-500"
                    placeholder="Nome do cliente"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Email (opcional)</label>
                  <input
                    type="email"
                    value={formData.customerEmail}
                    onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-yellow-500"
                    placeholder="email@exemplo.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Telefone (opcional)</label>
                  <input
                    type="tel"
                    value={formData.customerPhone}
                    onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-yellow-500"
                    placeholder="(11) 99999-9999"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Forma de Pagamento</label>
                  <select
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value as any })}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-yellow-500"
                  >
                    <option value="CASH">Dinheiro</option>
                    <option value="PIX">PIX</option>
                    <option value="CREDIT_CARD">Cartão de Crédito</option>
                    <option value="DEBIT_CARD">Cartão de Débito</option>
                    <option value="BANK_TRANSFER">Transferência</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Observações (opcional)</label>
                  <input
                    type="text"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-yellow-500"
                    placeholder="Observações do pedido"
                  />
                </div>
              </div>

              {/* Items */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <label className="block text-sm font-medium">Itens do Pedido</label>
                  <button
                    type="button"
                    onClick={addItem}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition-colors"
                  >
                    + Adicionar Item
                  </button>
                </div>

                {formData.items.map((item, index) => (
                  <div key={index} className="grid grid-cols-12 gap-2 mb-2">
                    <div className="col-span-5">
                      <select
                        value={item.productId}
                        onChange={(e) => updateItem(index, 'productId', e.target.value)}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-yellow-500 text-sm"
                        required
                      >
                        <option value="">Selecione um produto</option>
                        {products.map(product => (
                          <option key={product.id} value={product.id}>
                            {product.name} - {formatCurrency(product.salePrice)}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-span-2">
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value))}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-yellow-500 text-sm"
                        placeholder="Qtd"
                        required
                      />
                    </div>
                    <div className="col-span-2">
                      <input
                        type="text"
                        value={formatCurrency(item.unitPrice)}
                        readOnly
                        className="w-full bg-gray-600 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm"
                      />
                    </div>
                    <div className="col-span-2">
                      <input
                        type="text"
                        value={formatCurrency(item.quantity * item.unitPrice)}
                        readOnly
                        className="w-full bg-gray-600 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm"
                      />
                    </div>
                    <div className="col-span-1">
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="w-full bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded text-sm transition-colors"
                      >
                        X
                      </button>
                    </div>
                  </div>
                ))}
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
                  Criar Pedido
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
