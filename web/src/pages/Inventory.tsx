import React, { useState, useEffect } from 'react';
import { Package, TrendingUp, TrendingDown, AlertTriangle, DollarSign } from 'lucide-react';
import { API, authHeaders } from '../api';
import toast from 'react-hot-toast';

interface StockMovement {
  id: string;
  productId: string;
  product: {
    name: string;
    sku: string;
  };
  type: 'ENTRY' | 'EXIT';
  reason: 'PURCHASE' | 'SALE' | 'RETURN' | 'DONATION' | 'LOSS' | 'ADJUSTMENT';
  quantity: number;
  unitCost: number;
  totalCost: number;
  description?: string;
  date: string;
}

export function Inventory() {
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMovements();
  }, []);

  const loadMovements = async () => {
    try {
      const response = await fetch(`${API}/inventory/movements`, {
        headers: authHeaders()
      });
      
      if (response.ok) {
        const data = await response.json();
        setMovements(data);
      } else {
        toast.error('Erro ao carregar movimentações');
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

  const getMovementIcon = (type: string) => {
    return type === 'ENTRY' ? 
      <TrendingUp className="text-green-400" size={16} /> : 
      <TrendingDown className="text-red-400" size={16} />;
  };

  const getReasonLabel = (reason: string) => {
    switch (reason) {
      case 'PURCHASE': return 'Compra';
      case 'SALE': return 'Venda';
      case 'RETURN': return 'Devolução';
      case 'DONATION': return 'Doação';
      case 'LOSS': return 'Perda';
      case 'ADJUSTMENT': return 'Ajuste';
      default: return reason;
    }
  };

  const getReasonColor = (reason: string) => {
    switch (reason) {
      case 'PURCHASE': return 'bg-blue-600';
      case 'SALE': return 'bg-green-600';
      case 'RETURN': return 'bg-yellow-600';
      case 'DONATION': return 'bg-purple-600';
      case 'LOSS': return 'bg-red-600';
      case 'ADJUSTMENT': return 'bg-gray-600';
      default: return 'bg-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-700 rounded w-1/4 mb-6"></div>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="bg-gray-800 rounded-lg p-6 h-24"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-yellow-400">Inventário</h1>
          <p className="text-gray-400 mt-2">Movimentações de estoque</p>
        </div>

        {/* Movements List */}
        <div className="space-y-4">
          {movements.map(movement => (
            <div key={movement.id} className="bg-gray-800 rounded-lg p-6 hover:bg-gray-750 transition-colors">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  {getMovementIcon(movement.type)}
                  <div>
                    <h3 className="text-lg font-semibold">{movement.product.name}</h3>
                    <p className="text-sm text-gray-400">SKU: {movement.product.sku}</p>
                  </div>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${getReasonColor(movement.reason)}`}>
                  {getReasonLabel(movement.reason)}
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <p className="text-xs text-gray-500">Quantidade</p>
                  <p className={`text-sm font-semibold ${movement.type === 'ENTRY' ? 'text-green-400' : 'text-red-400'}`}>
                    {movement.type === 'ENTRY' ? '+' : '-'}{movement.quantity}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Custo Unitário</p>
                  <p className="text-sm font-semibold text-blue-400">{formatCurrency(movement.unitCost)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Custo Total</p>
                  <p className="text-sm font-semibold text-yellow-400">{formatCurrency(movement.totalCost)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Data</p>
                  <p className="text-sm text-gray-400">
                    {new Date(movement.date).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>

              {movement.description && (
                <p className="text-sm text-gray-400">{movement.description}</p>
              )}
            </div>
          ))}
        </div>

        {movements.length === 0 && (
          <div className="text-center py-12">
            <Package className="text-gray-600 mx-auto mb-4" size={64} />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">Nenhuma movimentação encontrada</h3>
            <p className="text-gray-500">As movimentações aparecerão aqui quando você fizer vendas ou compras</p>
          </div>
        )}
      </div>
    </div>
  );
}
