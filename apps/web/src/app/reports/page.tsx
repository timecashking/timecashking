'use client';

import { useState } from 'react';
import { 
  BarChart3, 
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Package,
  Users,
  Calendar,
  Download,
  Filter,
  Eye
} from 'lucide-react';

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [showExportModal, setShowExportModal] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('30');

  const salesData = [
    { month: 'Jan', sales: 12500, orders: 45 },
    { month: 'Fev', sales: 15200, orders: 52 },
    { month: 'Mar', sales: 18900, orders: 68 },
    { month: 'Abr', sales: 22100, orders: 78 },
    { month: 'Mai', sales: 19800, orders: 71 },
    { month: 'Jun', sales: 25600, orders: 89 },
  ];

  const topProducts = [
    { name: 'Produto A', sales: 45, revenue: 13455.00, growth: 12.5 },
    { name: 'Produto B', sales: 38, revenue: 3416.20, growth: 8.3 },
    { name: 'Produto C', sales: 32, revenue: 5116.80, growth: -2.1 },
    { name: 'Produto D', sales: 28, revenue: 16797.20, growth: 15.7 },
    { name: 'Produto E', sales: 25, revenue: 1247.50, growth: 5.2 },
  ];

  const customerStats = [
    { name: 'Novos Clientes', value: 23, change: 15.2, trend: 'up' },
    { name: 'Clientes Ativos', value: 156, change: 8.7, trend: 'up' },
    { name: 'Taxa de Retenção', value: 78.5, change: -2.3, trend: 'down' },
    { name: 'Ticket Médio', value: 189.50, change: 12.1, trend: 'up' },
  ];

  const totalRevenue = salesData.reduce((sum, data) => sum + data.sales, 0);
  const totalOrders = salesData.reduce((sum, data) => sum + data.orders, 0);
  const avgOrderValue = totalRevenue / totalOrders;

  return (
    <div style={{ padding: '1.5rem', backgroundColor: '#000000', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        marginBottom: '2rem' 
      }}>
        <div>
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: '700',
            background: 'linear-gradient(90deg, #FCD34D, #D97706)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            margin: 0,
            marginBottom: '0.5rem'
          }}>
            Relatórios
          </h1>
          <p style={{ color: '#9CA3AF', fontSize: '1rem', margin: 0 }}>
            Análises e insights do seu negócio
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            style={{
              padding: '0.75rem 1rem',
              backgroundColor: '#1F2937',
              border: '1px solid rgba(234, 179, 8, 0.3)',
              borderRadius: '0.5rem',
              color: '#F9FAFB',
              fontSize: '0.875rem',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="7">Últimos 7 dias</option>
            <option value="30">Últimos 30 dias</option>
            <option value="90">Últimos 90 dias</option>
            <option value="365">Último ano</option>
          </select>
          <button style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1rem',
            backgroundColor: 'transparent',
            border: '1px solid rgba(234, 179, 8, 0.3)',
            borderRadius: '0.5rem',
            color: '#9CA3AF',
            cursor: 'pointer',
            transition: 'all 0.2s',
            fontSize: '0.875rem',
            fontWeight: '500'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(234, 179, 8, 0.1)';
            e.currentTarget.style.borderColor = '#EAB308';
            e.currentTarget.style.color = '#EAB308';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.borderColor = 'rgba(234, 179, 8, 0.3)';
            e.currentTarget.style.color = '#9CA3AF';
          }}
          >
            <Filter size={16} />
            Filtros
          </button>
          <button 
            onClick={() => setShowExportModal(true)}
            style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1rem',
            backgroundColor: '#EAB308',
            border: 'none',
            borderRadius: '0.5rem',
            color: '#000000',
            cursor: 'pointer',
            transition: 'all 0.2s',
            fontSize: '0.875rem',
            fontWeight: '600',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#D97706';
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.boxShadow = '0 6px 8px -1px rgba(0, 0, 0, 0.15)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#EAB308';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
          }}
          >
            <Download size={16} />
            Exportar
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        backgroundColor: '#1F2937',
        padding: '0.25rem',
        borderRadius: '0.75rem',
        marginBottom: '2rem',
        border: '1px solid rgba(234, 179, 8, 0.2)'
      }}>
        {[
          { id: 'overview', name: 'Visão Geral' },
          { id: 'sales', name: 'Vendas' },
          { id: 'products', name: 'Produtos' },
          { id: 'customers', name: 'Clientes' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              flex: 1,
              padding: '0.75rem 1rem',
              borderRadius: '0.5rem',
              border: 'none',
              backgroundColor: activeTab === tab.id ? '#EAB308' : 'transparent',
              color: activeTab === tab.id ? '#000000' : '#9CA3AF',
              cursor: 'pointer',
              transition: 'all 0.2s',
              fontSize: '0.875rem',
              fontWeight: '500'
            }}
            onMouseEnter={(e) => {
              if (activeTab !== tab.id) {
                e.currentTarget.style.backgroundColor = 'rgba(234, 179, 8, 0.1)';
                e.currentTarget.style.color = '#EAB308';
              }
            }}
            onMouseLeave={(e) => {
              if (activeTab !== tab.id) {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '#9CA3AF';
              }
            }}
          >
            {tab.name}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Key Metrics */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
            <div style={{
              backgroundColor: '#111827',
              border: '1px solid rgba(234, 179, 8, 0.2)',
              borderRadius: '0.75rem',
              padding: '1.5rem',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ fontSize: '0.875rem', color: '#9CA3AF', margin: '0 0 0.5rem 0' }}>
                    Receita Total
                  </p>
                  <p style={{ fontSize: '1.5rem', fontWeight: '700', color: '#10B981', margin: 0 }}>
                    R$ {totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <DollarSign size={32} color="#10B981" />
              </div>
            </div>
            
            <div style={{
              backgroundColor: '#111827',
              border: '1px solid rgba(234, 179, 8, 0.2)',
              borderRadius: '0.75rem',
              padding: '1.5rem',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ fontSize: '0.875rem', color: '#9CA3AF', margin: '0 0 0.5rem 0' }}>
                    Total de Pedidos
                  </p>
                  <p style={{ fontSize: '1.5rem', fontWeight: '700', color: '#3B82F6', margin: 0 }}>
                    {totalOrders}
                  </p>
                </div>
                <ShoppingCart size={32} color="#3B82F6" />
              </div>
            </div>
            
            <div style={{
              backgroundColor: '#111827',
              border: '1px solid rgba(234, 179, 8, 0.2)',
              borderRadius: '0.75rem',
              padding: '1.5rem',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ fontSize: '0.875rem', color: '#9CA3AF', margin: '0 0 0.5rem 0' }}>
                    Ticket Médio
                  </p>
                  <p style={{ fontSize: '1.5rem', fontWeight: '700', color: '#EAB308', margin: 0 }}>
                    R$ {avgOrderValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <BarChart3 size={32} color="#EAB308" />
              </div>
            </div>
            
            <div style={{
              backgroundColor: '#111827',
              border: '1px solid rgba(234, 179, 8, 0.2)',
              borderRadius: '0.75rem',
              padding: '1.5rem',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ fontSize: '0.875rem', color: '#9CA3AF', margin: '0 0 0.5rem 0' }}>
                    Produtos Vendidos
                  </p>
                  <p style={{ fontSize: '1.5rem', fontWeight: '700', color: '#8B5CF6', margin: 0 }}>
                    {topProducts.reduce((sum, p) => sum + p.sales, 0)}
                  </p>
                </div>
                <Package size={32} color="#8B5CF6" />
              </div>
            </div>
          </div>

          {/* Charts Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
            {/* Sales Chart */}
            <div style={{
              backgroundColor: '#111827',
              border: '1px solid rgba(234, 179, 8, 0.2)',
              borderRadius: '0.75rem',
              padding: '1.5rem',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}>
              <h2 style={{ 
                fontSize: '1.25rem', 
                fontWeight: '600', 
                color: '#F9FAFB', 
                margin: '0 0 1rem 0' 
              }}>
                Vendas por Mês
              </h2>
              <div style={{ height: '300px', display: 'flex', alignItems: 'end', gap: '1rem', padding: '1rem 0' }}>
                {salesData.map((data, index) => (
                  <div key={index} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                    <div style={{
                      width: '100%',
                      height: `${(data.sales / 30000) * 200}px`,
                      backgroundColor: '#EAB308',
                      borderRadius: '0.25rem 0.25rem 0 0',
                      marginBottom: '0.5rem',
                      minHeight: '20px'
                    }}></div>
                    <span style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>{data.month}</span>
                    <span style={{ fontSize: '0.75rem', color: '#EAB308', fontWeight: '500' }}>
                      R$ {(data.sales / 1000).toFixed(0)}k
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Products */}
            <div style={{
              backgroundColor: '#111827',
              border: '1px solid rgba(234, 179, 8, 0.2)',
              borderRadius: '0.75rem',
              padding: '1.5rem',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}>
              <h2 style={{ 
                fontSize: '1.25rem', 
                fontWeight: '600', 
                color: '#F9FAFB', 
                margin: '0 0 1rem 0' 
              }}>
                Top Produtos
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {topProducts.slice(0, 5).map((product, index) => (
                  <div key={index} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem',
                    backgroundColor: '#1F2937',
                    borderRadius: '0.5rem',
                    border: '1px solid rgba(234, 179, 8, 0.1)'
                  }}>
                    <div>
                      <p style={{ fontWeight: '500', color: '#F9FAFB', margin: '0 0 0.25rem 0', fontSize: '0.875rem' }}>
                        {product.name}
                      </p>
                      <p style={{ fontSize: '0.75rem', color: '#9CA3AF', margin: 0 }}>
                        {product.sales} vendas
                      </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ 
                        fontWeight: '600', 
                        color: '#EAB308',
                        margin: '0 0 0.25rem 0',
                        fontSize: '0.875rem'
                      }}>
                        R$ {product.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        {product.growth > 0 ? (
                          <TrendingUp size={12} color="#10B981" />
                        ) : (
                          <TrendingDown size={12} color="#EF4444" />
                        )}
                        <span style={{ 
                          fontSize: '0.75rem', 
                          color: product.growth > 0 ? '#10B981' : '#EF4444'
                        }}>
                          {product.growth > 0 ? '+' : ''}{product.growth}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'sales' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Sales Performance */}
          <div style={{
            backgroundColor: '#111827',
            border: '1px solid rgba(234, 179, 8, 0.2)',
            borderRadius: '0.75rem',
            padding: '1.5rem',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}>
            <h2 style={{ 
              fontSize: '1.25rem', 
              fontWeight: '600', 
              color: '#F9FAFB', 
              margin: '0 0 1rem 0' 
            }}>
              Performance de Vendas
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
              {[
                { label: 'Vendas Hoje', value: 'R$ 2.340,00', change: 15.3, trend: 'up' },
                { label: 'Vendas Esta Semana', value: 'R$ 12.580,00', change: 8.7, trend: 'up' },
                { label: 'Vendas Este Mês', value: 'R$ 45.230,00', change: 12.5, trend: 'up' },
              ].map((metric, index) => (
                <div key={index} style={{
                  padding: '1rem',
                  backgroundColor: '#1F2937',
                  borderRadius: '0.5rem',
                  border: '1px solid rgba(234, 179, 8, 0.1)'
                }}>
                  <p style={{ fontSize: '0.875rem', color: '#9CA3AF', margin: '0 0 0.5rem 0' }}>
                    {metric.label}
                  </p>
                  <p style={{ fontSize: '1.25rem', fontWeight: '700', color: '#F9FAFB', margin: '0 0 0.5rem 0' }}>
                    {metric.value}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    {metric.trend === 'up' ? (
                      <TrendingUp size={14} color="#10B981" />
                    ) : (
                      <TrendingDown size={14} color="#EF4444" />
                    )}
                    <span style={{ 
                      fontSize: '0.75rem', 
                      color: metric.trend === 'up' ? '#10B981' : '#EF4444'
                    }}>
                      {metric.trend === 'up' ? '+' : ''}{metric.change}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sales Table */}
          <div style={{
            backgroundColor: '#111827',
            border: '1px solid rgba(234, 179, 8, 0.2)',
            borderRadius: '0.75rem',
            padding: '1.5rem',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}>
            <h2 style={{ 
              fontSize: '1.25rem', 
              fontWeight: '600', 
              color: '#F9FAFB', 
              margin: '0 0 1rem 0' 
            }}>
              Vendas por Período
            </h2>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(234, 179, 8, 0.2)' }}>
                    <th style={{ textAlign: 'left', padding: '0.75rem 1rem', color: '#9CA3AF', fontWeight: '500' }}>
                      Período
                    </th>
                    <th style={{ textAlign: 'right', padding: '0.75rem 1rem', color: '#9CA3AF', fontWeight: '500' }}>
                      Vendas
                    </th>
                    <th style={{ textAlign: 'right', padding: '0.75rem 1rem', color: '#9CA3AF', fontWeight: '500' }}>
                      Pedidos
                    </th>
                    <th style={{ textAlign: 'right', padding: '0.75rem 1rem', color: '#9CA3AF', fontWeight: '500' }}>
                      Ticket Médio
                    </th>
                    <th style={{ textAlign: 'center', padding: '0.75rem 1rem', color: '#9CA3AF', fontWeight: '500' }}>
                      Crescimento
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {salesData.map((data, index) => (
                    <tr key={index} style={{ borderBottom: '1px solid rgba(234, 179, 8, 0.1)' }}>
                      <td style={{ padding: '0.75rem 1rem', color: '#F9FAFB', fontWeight: '500' }}>
                        {data.month} 2024
                      </td>
                      <td style={{ 
                        padding: '0.75rem 1rem', 
                        textAlign: 'right', 
                        fontWeight: '600',
                        color: '#10B981'
                      }}>
                        R$ {data.sales.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td style={{ 
                        padding: '0.75rem 1rem', 
                        textAlign: 'right', 
                        fontWeight: '600',
                        color: '#F9FAFB'
                      }}>
                        {data.orders}
                      </td>
                      <td style={{ 
                        padding: '0.75rem 1rem', 
                        textAlign: 'right', 
                        fontWeight: '600',
                        color: '#EAB308'
                      }}>
                        R$ {(data.sales / data.orders).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}>
                          <TrendingUp size={14} color="#10B981" />
                          <span style={{ fontSize: '0.875rem', color: '#10B981', fontWeight: '500' }}>
                            +{Math.floor(Math.random() * 20 + 5)}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'products' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Product Performance */}
          <div style={{
            backgroundColor: '#111827',
            border: '1px solid rgba(234, 179, 8, 0.2)',
            borderRadius: '0.75rem',
            padding: '1.5rem',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}>
            <h2 style={{ 
              fontSize: '1.25rem', 
              fontWeight: '600', 
              color: '#F9FAFB', 
              margin: '0 0 1rem 0' 
            }}>
              Performance dos Produtos
            </h2>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(234, 179, 8, 0.2)' }}>
                    <th style={{ textAlign: 'left', padding: '0.75rem 1rem', color: '#9CA3AF', fontWeight: '500' }}>
                      Produto
                    </th>
                    <th style={{ textAlign: 'right', padding: '0.75rem 1rem', color: '#9CA3AF', fontWeight: '500' }}>
                      Vendas
                    </th>
                    <th style={{ textAlign: 'right', padding: '0.75rem 1rem', color: '#9CA3AF', fontWeight: '500' }}>
                      Receita
                    </th>
                    <th style={{ textAlign: 'center', padding: '0.75rem 1rem', color: '#9CA3AF', fontWeight: '500' }}>
                      Crescimento
                    </th>
                    <th style={{ textAlign: 'center', padding: '0.75rem 1rem', color: '#9CA3AF', fontWeight: '500' }}>
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {topProducts.map((product, index) => (
                    <tr key={index} style={{ borderBottom: '1px solid rgba(234, 179, 8, 0.1)' }}>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <Package size={16} color="#9CA3AF" />
                          <span style={{ color: '#F9FAFB', fontWeight: '500' }}>{product.name}</span>
                        </div>
                      </td>
                      <td style={{ 
                        padding: '0.75rem 1rem', 
                        textAlign: 'right', 
                        fontWeight: '600',
                        color: '#3B82F6'
                      }}>
                        {product.sales}
                      </td>
                      <td style={{ 
                        padding: '0.75rem 1rem', 
                        textAlign: 'right', 
                        fontWeight: '600',
                        color: '#10B981'
                      }}>
                        R$ {product.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}>
                          {product.growth > 0 ? (
                            <TrendingUp size={14} color="#10B981" />
                          ) : (
                            <TrendingDown size={14} color="#EF4444" />
                          )}
                          <span style={{ 
                            fontSize: '0.875rem', 
                            color: product.growth > 0 ? '#10B981' : '#EF4444',
                            fontWeight: '500'
                          }}>
                            {product.growth > 0 ? '+' : ''}{product.growth}%
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                        <button style={{
                          padding: '0.25rem',
                          backgroundColor: 'transparent',
                          border: 'none',
                          color: '#9CA3AF',
                          cursor: 'pointer',
                          borderRadius: '0.25rem',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.1)';
                          e.currentTarget.style.color = '#3B82F6';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.color = '#9CA3AF';
                        }}
                        >
                          <Eye size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'customers' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Customer Metrics */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
            {customerStats.map((stat, index) => (
              <div key={index} style={{
                backgroundColor: '#111827',
                border: '1px solid rgba(234, 179, 8, 0.2)',
                borderRadius: '0.75rem',
                padding: '1.5rem',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <p style={{ fontSize: '0.875rem', color: '#9CA3AF', margin: '0 0 0.5rem 0' }}>
                      {stat.name}
                    </p>
                    <p style={{ fontSize: '1.5rem', fontWeight: '700', color: '#F9FAFB', margin: 0 }}>
                      {typeof stat.value === 'number' && stat.value < 100 ? stat.value : 
                       typeof stat.value === 'number' ? `R$ ${stat.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 
                       stat.value}
                    </p>
                  </div>
                  <Users size={32} color="#3B82F6" />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.5rem' }}>
                  {stat.trend === 'up' ? (
                    <TrendingUp size={14} color="#10B981" />
                  ) : (
                    <TrendingDown size={14} color="#EF4444" />
                  )}
                  <span style={{ 
                    fontSize: '0.75rem', 
                    color: stat.trend === 'up' ? '#10B981' : '#EF4444'
                  }}>
                    {stat.trend === 'up' ? '+' : ''}{stat.change}%
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Customer Insights */}
          <div style={{
            backgroundColor: '#111827',
            border: '1px solid rgba(234, 179, 8, 0.2)',
            borderRadius: '0.75rem',
            padding: '1.5rem',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}>
            <h2 style={{ 
              fontSize: '1.25rem', 
              fontWeight: '600', 
              color: '#F9FAFB', 
              margin: '0 0 1rem 0' 
            }}>
              Insights dos Clientes
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
              <div style={{
                padding: '1rem',
                backgroundColor: '#1F2937',
                borderRadius: '0.5rem',
                border: '1px solid rgba(234, 179, 8, 0.1)'
              }}>
                <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#F9FAFB', margin: '0 0 0.5rem 0' }}>
                  Clientes Mais Valiosos
                </h3>
                <p style={{ fontSize: '0.875rem', color: '#9CA3AF', margin: 0 }}>
                  Os top 20% dos clientes geram 80% da receita total
                </p>
              </div>
              <div style={{
                padding: '1rem',
                backgroundColor: '#1F2937',
                borderRadius: '0.5rem',
                border: '1px solid rgba(234, 179, 8, 0.1)'
              }}>
                <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#F9FAFB', margin: '0 0 0.5rem 0' }}>
                  Padrão de Compra
                </h3>
                <p style={{ fontSize: '0.875rem', color: '#9CA3AF', margin: 0 }}>
                  Maioria das compras acontece entre 14h-18h
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Exportar */}
      {showExportModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 50
        }}>
          <div style={{
            backgroundColor: '#111827',
            borderRadius: '0.75rem',
            padding: '2rem',
            width: '90%',
            maxWidth: '400px',
            border: '1px solid rgba(234, 179, 8, 0.2)'
          }}>
            <h3 style={{
              fontSize: '1.5rem',
              fontWeight: '700',
              color: '#F9FAFB',
              marginBottom: '1.5rem',
              margin: 0
            }}>
              Exportar Relatório
            </h3>
            
            <div style={{ marginBottom: '2rem' }}>
              <button
                onClick={() => {
                  alert('Relatório exportado como PDF!');
                  setShowExportModal(false);
                }}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  backgroundColor: '#EAB308',
                  border: 'none',
                  borderRadius: '0.5rem',
                  color: '#000000',
                  cursor: 'pointer',
                  marginBottom: '0.5rem',
                  fontSize: '0.875rem',
                  fontWeight: '600'
                }}
              >
                📄 Exportar como PDF
              </button>
              
              <button
                onClick={() => {
                  alert('Relatório exportado como Excel!');
                  setShowExportModal(false);
                }}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  backgroundColor: 'transparent',
                  border: '1px solid rgba(234, 179, 8, 0.3)',
                  borderRadius: '0.5rem',
                  color: '#EAB308',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '500'
                }}
              >
                📊 Exportar como Excel
              </button>
            </div>
            
            <button
              onClick={() => setShowExportModal(false)}
              style={{
                width: '100%',
                padding: '0.75rem',
                backgroundColor: 'transparent',
                border: '1px solid rgba(107, 114, 128, 0.3)',
                borderRadius: '0.5rem',
                color: '#9CA3AF',
                cursor: 'pointer',
                fontSize: '0.875rem'
              }}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}