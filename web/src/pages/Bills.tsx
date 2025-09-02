import React, { useState, useEffect } from 'react';
import { Plus, FileText, Calendar, DollarSign, AlertTriangle, CheckCircle } from 'lucide-react';
import { API, authHeaders } from '../api';
import toast from 'react-hot-toast';

interface Bill {
  id: string;
  accountId: string;
  account: {
    name: string;
    type: string;
  };
  type: 'PAYABLE' | 'RECEIVABLE';
  status: 'PENDING' | 'PAID' | 'OVERDUE';
  amount: number;
  description: string;
  dueDate: string;
  paidAt?: string;
  createdAt: string;
}

export function Bills() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBills();
  }, []);

  const loadBills = async () => {
    try {
      const response = await fetch(`${API}/bills`, {
        headers: authHeaders()
      });
      
      if (response.ok) {
        const data = await response.json();
        setBills(data);
      } else {
        toast.error('Erro ao carregar contas');
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
      case 'PAID': return 'bg-green-600';
      case 'OVERDUE': return 'bg-red-600';
      default: return 'bg-yellow-600';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PENDING': return 'Pendente';
      case 'PAID': return 'Pago';
      case 'OVERDUE': return 'Vencido';
      default: return status;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'PAYABLE': return 'A Pagar';
      case 'RECEIVABLE': return 'A Receber';
      default: return type;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'PAYABLE': return 'text-red-400';
      case 'RECEIVABLE': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date();
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

  const totalPayable = bills
    .filter(bill => bill.type === 'PAYABLE' && bill.status === 'PENDING')
    .reduce((sum, bill) => sum + bill.amount, 0);

  const totalReceivable = bills
    .filter(bill => bill.type === 'RECEIVABLE' && bill.status === 'PENDING')
    .reduce((sum, bill) => sum + bill.amount, 0);

  const overdueBills = bills.filter(bill => isOverdue(bill.dueDate) && bill.status === 'PENDING');

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-yellow-400">Contas</h1>
            <p className="text-gray-400 mt-2">Gerencie suas contas a pagar e receber</p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total a Pagar</p>
                <p className="text-2xl font-bold text-red-400">{formatCurrency(totalPayable)}</p>
              </div>
              <FileText className="text-red-400" size={24} />
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total a Receber</p>
                <p className="text-2xl font-bold text-green-400">{formatCurrency(totalReceivable)}</p>
              </div>
              <DollarSign className="text-green-400" size={24} />
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Vencidas</p>
                <p className="text-2xl font-bold text-yellow-400">{overdueBills.length}</p>
              </div>
              <AlertTriangle className="text-yellow-400" size={24} />
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Pagas</p>
                <p className="text-2xl font-bold text-blue-400">
                  {bills.filter(b => b.status === 'PAID').length}
                </p>
              </div>
              <CheckCircle className="text-blue-400" size={24} />
            </div>
          </div>
        </div>

        {/* Overdue Bills Alert */}
        {overdueBills.length > 0 && (
          <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 mb-8">
            <div className="flex items-center gap-3">
              <AlertTriangle className="text-red-400" size={24} />
              <div>
                <h3 className="text-lg font-semibold text-red-400">Contas Vencidas</h3>
                <p className="text-red-300">
                  Você tem {overdueBills.length} conta(s) vencida(s) totalizando {formatCurrency(
                    overdueBills.reduce((sum, bill) => sum + bill.amount, 0)
                  )}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Bills List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bills.map(bill => {
            const isOverdueBill = isOverdue(bill.dueDate) && bill.status === 'PENDING';
            
            return (
              <div key={bill.id} className={`bg-gray-800 rounded-lg p-6 hover:bg-gray-750 transition-colors ${
                isOverdueBill ? 'border border-red-500/30' : ''
              }`}>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">{bill.description}</h3>
                    <p className="text-sm text-gray-400">{bill.account.name}</p>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(bill.status)}`}>
                      {getStatusLabel(bill.status)}
                    </span>
                    <div className={`text-sm font-semibold ${getTypeColor(bill.type)}`}>
                      {getTypeLabel(bill.type)}
                    </div>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <DollarSign size={16} className="text-gray-400" />
                    <span className="text-lg font-bold">{formatCurrency(bill.amount)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar size={16} className="text-gray-400" />
                    <span className={`text-sm ${isOverdueBill ? 'text-red-400' : 'text-gray-400'}`}>
                      Vencimento: {new Date(bill.dueDate).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  {bill.paidAt && (
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle size={16} className="text-green-400" />
                      <span className="text-green-400">
                        Pago em: {new Date(bill.paidAt).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded text-sm transition-colors">
                    Editar
                  </button>
                  {bill.status === 'PENDING' && (
                    <button className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded text-sm transition-colors">
                      Marcar Pago
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {bills.length === 0 && (
          <div className="text-center py-12">
            <FileText className="text-gray-600 mx-auto mb-4" size={64} />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">Nenhuma conta encontrada</h3>
            <p className="text-gray-500">As contas a pagar/receber aparecerão aqui quando você criar transações com vencimento</p>
          </div>
        )}
      </div>
    </div>
  );
}
