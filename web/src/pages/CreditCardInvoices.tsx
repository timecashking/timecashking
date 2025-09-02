import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Calendar, 
  DollarSign, 
  FileText, 
  Eye, 
  Lock, 
  CheckCircle, 
  XCircle,
  Plus,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react';
import { API, authHeaders } from '../api';
import toast from 'react-hot-toast';

interface CreditCardInvoice {
  id: string;
  billingMonth: number;
  billingYear: number;
  dueDate: string;
  totalAmount: number;
  totalTransactions: number;
  status: 'OPEN' | 'CLOSED' | 'PAID' | 'CANCELLED';
  account: {
    id: string;
    name: string;
  };
  createdAt: string;
  closedAt?: string;
  paidAt?: string;
}

interface InvoiceSummary {
  currentMonth: {
    total: number;
    open: number;
    closed: number;
    paid: number;
    totalAmount: number;
  };
  overdue: {
    count: number;
    totalAmount: number;
  };
  upcoming: {
    count: number;
    totalAmount: number;
  };
}

export function CreditCardInvoices() {
  const [invoices, setInvoices] = useState<CreditCardInvoice[]>([]);
  const [summary, setSummary] = useState<InvoiceSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState<CreditCardInvoice | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    accountId: '',
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1
  });

  // Form states
  const [paymentData, setPaymentData] = useState({
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'PIX',
    paymentAmount: 0,
    notes: ''
  });
  const [cancelReason, setCancelReason] = useState('');

  useEffect(() => {
    loadData();
  }, [filters]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [invoicesResponse, summaryResponse] = await Promise.all([
        fetch(`${API}/credit-card-invoices?${new URLSearchParams(filters as any)}`, { 
          headers: authHeaders() 
        }),
        fetch(`${API}/credit-card-invoices/summary`, { 
          headers: authHeaders() 
        })
      ]);

      if (invoicesResponse.ok && summaryResponse.ok) {
        const invoicesData = await invoicesResponse.json();
        const summaryData = await summaryResponse.json();
        
        setInvoices(invoicesData.invoices || []);
        setSummary(summaryData.summary);
      }
    } catch (error) {
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseInvoice = async (invoiceId: string) => {
    try {
      const response = await fetch(`${API}/credit-card-invoices/${invoiceId}/close`, {
        method: 'POST',
        headers: authHeaders()
      });

      if (response.ok) {
        toast.success('Fatura fechada com sucesso!');
        loadData();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Erro ao fechar fatura');
      }
    } catch (error) {
      toast.error('Erro ao fechar fatura');
    }
  };

  const handleMarkAsPaid = async () => {
    if (!selectedInvoice) return;

    try {
      const response = await fetch(`${API}/credit-card-invoices/${selectedInvoice.id}/pay`, {
        method: 'POST',
        headers: { ...authHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentData)
      });

      if (response.ok) {
        toast.success('Fatura marcada como paga!');
        setShowPaymentModal(false);
        setSelectedInvoice(null);
        loadData();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Erro ao marcar fatura como paga');
      }
    } catch (error) {
      toast.error('Erro ao marcar fatura como paga');
    }
  };

  const handleCancelInvoice = async () => {
    if (!selectedInvoice) return;

    try {
      const response = await fetch(`${API}/credit-card-invoices/${selectedInvoice.id}/cancel`, {
        method: 'POST',
        headers: { ...authHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: cancelReason })
      });

      if (response.ok) {
        toast.success('Fatura cancelada com sucesso!');
        setShowCancelModal(false);
        setSelectedInvoice(null);
        setCancelReason('');
        loadData();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Erro ao cancelar fatura');
      }
    } catch (error) {
      toast.error('Erro ao cancelar fatura');
    }
  };

  const generateMonthlyInvoices = async () => {
    try {
      const response = await fetch(`${API}/credit-card-invoices/generate-monthly`, {
        method: 'POST',
        headers: { ...authHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({
          month: filters.month,
          year: filters.year
        })
      });

      if (response.ok) {
        toast.success('Faturas geradas com sucesso!');
        loadData();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Erro ao gerar faturas');
      }
    } catch (error) {
      toast.error('Erro ao gerar faturas');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN': return 'text-blue-400';
      case 'CLOSED': return 'text-yellow-400';
      case 'PAID': return 'text-green-400';
      case 'CANCELLED': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'OPEN': return <Eye className="w-4 h-4" />;
      case 'CLOSED': return <Lock className="w-4 h-4" />;
      case 'PAID': return <CheckCircle className="w-4 h-4" />;
      case 'CANCELLED': return <XCircle className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-800 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-800 rounded"></div>
            ))}
          </div>
          <div className="h-96 bg-gray-800 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-yellow-400">Faturas de Cartão de Crédito</h1>
            <p className="text-gray-400 mt-2">Gerencie suas faturas mensais de cartão de crédito</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={generateMonthlyInvoices}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Gerar Faturas</span>
            </button>
            <button
              onClick={() => window.print()}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Exportar</span>
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Mês Atual</p>
                  <p className="text-2xl font-bold text-blue-400">{summary.currentMonth.total}</p>
                  <p className="text-sm text-gray-400">
                    {summary.currentMonth.open} abertas, {summary.currentMonth.closed} fechadas, {summary.currentMonth.paid} pagas
                  </p>
                </div>
                <CreditCard className="text-blue-400" size={32} />
              </div>
              <p className="text-lg font-semibold text-white mt-2">
                {formatCurrency(summary.currentMonth.totalAmount)}
              </p>
            </div>

            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Vencidas</p>
                  <p className="text-2xl font-bold text-red-400">{summary.overdue.count}</p>
                </div>
                <Calendar className="text-red-400" size={32} />
              </div>
              <p className="text-lg font-semibold text-white mt-2">
                {formatCurrency(summary.overdue.totalAmount)}
              </p>
            </div>

            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">A Vencer (7 dias)</p>
                  <p className="text-2xl font-bold text-yellow-400">{summary.upcoming.count}</p>
                </div>
                <DollarSign className="text-yellow-400" size={32} />
              </div>
              <p className="text-lg font-semibold text-white mt-2">
                {formatCurrency(summary.upcoming.totalAmount)}
              </p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <div className="flex items-center space-x-4">
            <Filter className="text-yellow-400" size={20} />
            <span className="text-white font-medium">Filtros:</span>
            
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
            >
              <option value="">Todos os status</option>
              <option value="OPEN">Aberta</option>
              <option value="CLOSED">Fechada</option>
              <option value="PAID">Paga</option>
              <option value="CANCELLED">Cancelada</option>
            </select>

            <select
              value={filters.month}
              onChange={(e) => setFilters({ ...filters, month: parseInt(e.target.value) })}
              className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
            >
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {new Date(2024, i).toLocaleDateString('pt-BR', { month: 'long' })}
                </option>
              ))}
            </select>

            <select
              value={filters.year}
              onChange={(e) => setFilters({ ...filters, year: parseInt(e.target.value) })}
              className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
            >
              {Array.from({ length: 5 }, (_, i) => {
                const year = new Date().getFullYear() - 2 + i;
                return (
                  <option key={year} value={year}>{year}</option>
                );
              })}
            </select>
          </div>
        </div>

        {/* Invoices Table */}
        <div className="bg-gray-800 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Cartão
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Período
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Vencimento
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Valor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Transações
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {invoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <CreditCard className="w-5 h-5 text-blue-400 mr-2" />
                        <span className="font-medium">{invoice.account.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                      {invoice.billingMonth}/{invoice.billingYear}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                      {formatDate(invoice.dueDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-semibold text-lg">
                        {formatCurrency(invoice.totalAmount)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                      {invoice.totalTransactions}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className={`mr-2 ${getStatusColor(invoice.status)}`}>
                          {getStatusIcon(invoice.status)}
                        </span>
                        <span className={`text-sm font-medium ${getStatusColor(invoice.status)}`}>
                          {invoice.status === 'OPEN' && 'Aberta'}
                          {invoice.status === 'CLOSED' && 'Fechada'}
                          {invoice.status === 'PAID' && 'Paga'}
                          {invoice.status === 'CANCELLED' && 'Cancelada'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        {invoice.status === 'OPEN' && (
                          <>
                            <button
                              onClick={() => handleCloseInvoice(invoice.id)}
                              className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded text-xs transition-colors"
                            >
                              Fechar
                            </button>
                            <button
                              onClick={() => {
                                setSelectedInvoice(invoice);
                                setPaymentData({ ...paymentData, paymentAmount: invoice.totalAmount });
                                setShowPaymentModal(true);
                              }}
                              className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs transition-colors"
                            >
                              Pagar
                            </button>
                          </>
                        )}
                        {invoice.status === 'CLOSED' && (
                          <button
                            onClick={() => {
                              setSelectedInvoice(invoice);
                              setPaymentData({ ...paymentData, paymentAmount: invoice.totalAmount });
                              setShowPaymentModal(true);
                            }}
                            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs transition-colors"
                          >
                            Pagar
                          </button>
                        )}
                        {invoice.status === 'OPEN' && (
                          <button
                            onClick={() => {
                              setSelectedInvoice(invoice);
                              setShowCancelModal(true);
                            }}
                            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs transition-colors"
                          >
                            Cancelar
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {invoices.length === 0 && (
          <div className="text-center py-12">
            <CreditCard className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">Nenhuma fatura encontrada</p>
            <p className="text-gray-500">Use os filtros acima ou gere faturas mensais</p>
          </div>
        )}
      </div>

      {/* Payment Modal */}
      {showPaymentModal && selectedInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-white mb-4">Marcar Fatura como Paga</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Data do Pagamento
                </label>
                <input
                  type="date"
                  value={paymentData.paymentDate}
                  onChange={(e) => setPaymentData({ ...paymentData, paymentDate: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Método de Pagamento
                </label>
                <select
                  value={paymentData.paymentMethod}
                  onChange={(e) => setPaymentData({ ...paymentData, paymentMethod: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                >
                  <option value="PIX">PIX</option>
                  <option value="BANK_TRANSFER">Transferência</option>
                  <option value="CASH">Dinheiro</option>
                  <option value="DEBIT_CARD">Débito</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Valor Pago
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={paymentData.paymentAmount}
                  onChange={(e) => setPaymentData({ ...paymentData, paymentAmount: parseFloat(e.target.value) })}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Observações
                </label>
                <textarea
                  value={paymentData.notes}
                  onChange={(e) => setPaymentData({ ...paymentData, notes: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                  rows={3}
                />
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleMarkAsPaid}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition-colors"
              >
                Confirmar Pagamento
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Modal */}
      {showCancelModal && selectedInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-white mb-4">Cancelar Fatura</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Motivo do Cancelamento
              </label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                rows={3}
                placeholder="Digite o motivo do cancelamento..."
              />
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleCancelInvoice}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition-colors"
              >
                Confirmar Cancelamento
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
