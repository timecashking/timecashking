import React, { useState, useEffect } from 'react';
import { Plus, ShoppingBag, Truck, DollarSign, Calendar } from 'lucide-react';
import { API, authHeaders } from '../api';
import toast from 'react-hot-toast';

interface PurchaseOrder {
  id: string;
  supplierName: string;
  supplierEmail?: string;
  supplierPhone?: string;
  status: 'DRAFT' | 'CONFIRMED' | 'CANCELLED' | 'DELIVERED';
  total: number;
  freight: number;
  notes?: string;
  orderDate: string;
  deliveryDate?: string;
  items: PurchaseOrderItem[];
}

interface PurchaseOrderItem {
  id: string;
  productId: string;
  product: {
    name: string;
    sku: string;
  };
  quantity: number;
  unitCost: number;
  totalCost: number;
}

export function Purchases() {
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const response = await fetch(`${API}/purchases`, {
        headers: authHeaders()
      });
      
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      } else {
        toast.error('Erro ao carregar pedidos de compra');
      }
    } catch (error) {
      toast.error('Erro de conexão');
    } finally {
      setLoading(false);
    }
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

  const totalCost = orders.reduce((sum, order) => sum + order.total, 0);
  const totalOrders = orders.length;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-yellow-400">Compras</h1>
            <p className="text-gray-400 mt-2">Gerencie seus pedidos de compra</p>
          </div>
          <button
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
                <p className="text-gray-400 text-sm">Total de Compras</p>
                <p className="text-2xl font-bold text-white">{totalOrders}</p>
              </div>
              <ShoppingBag className="text-blue-400" size={24} />
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Custo Total</p>
                <p className="text-2xl font-bold text-red-400">{formatCurrency(totalCost)}</p>
              </div>
              <DollarSign className="text-red-400" size={24} />
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Pedidos Pendentes</p>
                <p className="text-2xl font-bold text-yellow-400">
                  {orders.filter(o => o.status === 'DRAFT' || o.status === 'CONFIRMED').length}
                </p>
              </div>
              <Truck className="text-yellow-400" size={24} />
            </div>
          </div>
        </div>

        {/* Orders List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {orders.map(order => (
            <div key={order.id} className="bg-gray-800 rounded-lg p-6 hover:bg-gray-750 transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold">{order.supplierName}</h3>
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
                  <Truck size={16} className="text-gray-400" />
                  <span className="text-gray-400">{order.items.length} itens</span>
                </div>
              </div>

              <div className="border-t border-gray-700 pt-4 mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Subtotal</span>
                  <span className="text-sm font-semibold text-white">{formatCurrency(order.total - order.freight)}</span>
                </div>
                {order.freight > 0 && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-400">Frete</span>
                    <span className="text-blue-400">{formatCurrency(order.freight)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center border-t border-gray-700 pt-2">
                  <span className="text-sm text-gray-400">Total</span>
                  <span className="text-lg font-bold text-red-400">{formatCurrency(order.total)}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded text-sm transition-colors">
                  Ver Detalhes
                </button>
                <button className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded text-sm transition-colors">
                  Receber
                </button>
              </div>
            </div>
          ))}
        </div>

        {orders.length === 0 && (
          <div className="text-center py-12">
            <ShoppingBag className="text-gray-600 mx-auto mb-4" size={64} />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">Nenhum pedido encontrado</h3>
            <p className="text-gray-500 mb-6">Crie seu primeiro pedido de compra</p>
            <button className="bg-yellow-500 hover:bg-yellow-600 text-black px-6 py-3 rounded-lg font-semibold">
              Criar Pedido
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
