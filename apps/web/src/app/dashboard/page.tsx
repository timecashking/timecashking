'use client';

import { useRouter } from 'next/navigation';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Package, 
  ShoppingCart,
  Calendar,
  AlertCircle,
  Plus,
  Eye
} from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();

  // Funções para os botões de ações rápidas
  const handleNovaReceita = () => {
    alert('Redirecionando para Nova Receita...');
    router.push('/finances');
  };

  const handleNovaDespesa = () => {
    alert('Redirecionando para Nova Despesa...');
    router.push('/finances');
  };

  const handleAdicionarProduto = () => {
    alert('Redirecionando para Adicionar Produto...');
    router.push('/products');
  };

  const handleNovaVenda = () => {
    alert('Redirecionando para Nova Venda...');
    router.push('/sales');
  };
  const stats = [
    {
      name: 'Receitas do Mês',
      value: 'R$ 45.230,00',
      change: '+12.5%',
      changeType: 'positive' as const,
      icon: TrendingUp,
      color: '#10B981'
    },
    {
      name: 'Despesas do Mês',
      value: 'R$ 23.180,00',
      change: '+8.2%',
      changeType: 'negative' as const,
      icon: TrendingDown,
      color: '#EF4444'
    },
    {
      name: 'Produtos em Estoque',
      value: '1.247',
      change: '+3.1%',
      changeType: 'positive' as const,
      icon: Package,
      color: '#3B82F6'
    },
    {
      name: 'Vendas Hoje',
      value: 'R$ 2.340,00',
      change: '+15.3%',
      changeType: 'positive' as const,
      icon: ShoppingCart,
      color: '#EAB308'
    },
  ];

  const recentActivities = [
    { id: 1, type: 'sale', description: 'Venda realizada - R$ 450,00', time: '2 min atrás', icon: '🛒' },
    { id: 2, type: 'purchase', description: 'Compra registrada - R$ 1.200,00', time: '15 min atrás', icon: '📦' },
    { id: 3, type: 'alert', description: 'Estoque baixo - Produto XYZ', time: '1 hora atrás', icon: '⚠️' },
    { id: 4, type: 'meeting', description: 'Reunião agendada - 14:00', time: '2 horas atrás', icon: '📅' },
  ];

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#000000', 
      padding: '2rem',
      fontFamily: 'Inter, system-ui, sans-serif'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
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
              fontWeight: 'bold',
              background: 'linear-gradient(90deg, #FCD34D, #D97706)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              margin: 0
            }}>
              Dashboard
            </h1>
            <p style={{ 
              color: '#9CA3AF', 
              fontSize: '1rem',
              margin: '0.5rem 0 0 0'
            }}>
              Visão geral do seu negócio
            </p>
          </div>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem',
            color: '#9CA3AF',
            fontSize: '0.875rem'
          }}>
            <Calendar style={{ width: '1rem', height: '1rem' }} />
            <span>{new Date().toLocaleDateString('pt-BR')}</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: '1.5rem',
          marginBottom: '2rem'
        }}>
          {stats.map((stat, index) => (
            <div key={index} style={{
              backgroundColor: '#111827',
              border: '1px solid rgba(234, 179, 8, 0.2)',
              borderRadius: '0.75rem',
              padding: '1.5rem',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              transition: 'all 0.2s'
            }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                marginBottom: '1rem'
              }}>
                <div>
                  <p style={{ 
                    fontSize: '0.875rem', 
                    fontWeight: '500', 
                    color: '#9CA3AF',
                    margin: 0
                  }}>
                    {stat.name}
                  </p>
                  <p style={{ 
                    fontSize: '1.875rem', 
                    fontWeight: 'bold', 
                    color: '#FEF3C7',
                    margin: '0.5rem 0 0 0'
                  }}>
                    {stat.value}
                  </p>
                </div>
                <div style={{
                  width: '3rem',
                  height: '3rem',
                  borderRadius: '0.5rem',
                  backgroundColor: `${stat.color}20`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <stat.icon style={{ 
                    width: '1.5rem', 
                    height: '1.5rem', 
                    color: stat.color 
                  }} />
                </div>
              </div>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center',
                gap: '0.25rem'
              }}>
                {stat.changeType === 'positive' ? (
                  <TrendingUp style={{ 
                    width: '1rem', 
                    height: '1rem', 
                    color: '#10B981' 
                  }} />
                ) : (
                  <TrendingDown style={{ 
                    width: '1rem', 
                    height: '1rem', 
                    color: '#EF4444' 
                  }} />
                )}
                <span style={{
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: stat.changeType === 'positive' ? '#10B981' : '#EF4444'
                }}>
                  {stat.change}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Content Grid */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '2fr 1fr', 
          gap: '1.5rem'
        }}>
          {/* Recent Activities */}
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
              color: '#FEF3C7',
              margin: '0 0 1.5rem 0'
            }}>
              Atividades Recentes
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {recentActivities.map((activity) => (
                <div key={activity.id} style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.75rem',
                  padding: '0.75rem',
                  backgroundColor: 'rgba(31, 41, 55, 0.5)',
                  borderRadius: '0.5rem',
                  border: '1px solid rgba(234, 179, 8, 0.1)'
                }}>
                  <div style={{
                    width: '2.5rem',
                    height: '2.5rem',
                    borderRadius: '0.5rem',
                    backgroundColor: activity.type === 'sale' ? 'rgba(16, 185, 129, 0.2)' :
                                   activity.type === 'purchase' ? 'rgba(59, 130, 246, 0.2)' :
                                   activity.type === 'alert' ? 'rgba(239, 68, 68, 0.2)' :
                                   'rgba(234, 179, 8, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.25rem'
                  }}>
                    {activity.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ 
                      fontSize: '0.875rem', 
                      fontWeight: '500', 
                      color: '#FEF3C7',
                      margin: 0
                    }}>
                      {activity.description}
                    </p>
                    <p style={{ 
                      fontSize: '0.75rem', 
                      color: '#9CA3AF',
                      margin: '0.25rem 0 0 0'
                    }}>
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
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
              color: '#FEF3C7',
              margin: '0 0 1.5rem 0'
            }}>
              Ações Rápidas
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button 
                onClick={handleNovaReceita}
                style={{
                  width: '100%',
                  backgroundColor: '#EAB308',
                  color: '#000000',
                  padding: '0.75rem 1rem',
                  borderRadius: '0.5rem',
                  fontWeight: '600',
                  fontSize: '0.875rem',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#D97706';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#EAB308';
                }}
              >
                <DollarSign style={{ width: '1rem', height: '1rem' }} />
                Nova Receita
              </button>
              <button 
                onClick={handleNovaDespesa}
                style={{
                  width: '100%',
                  backgroundColor: 'rgba(31, 41, 55, 0.8)',
                  color: '#FEF3C7',
                  padding: '0.75rem 1rem',
                  borderRadius: '0.5rem',
                  fontWeight: '600',
                  fontSize: '0.875rem',
                  border: '1px solid rgba(234, 179, 8, 0.3)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(234, 179, 8, 0.1)';
                  e.currentTarget.style.borderColor = '#EAB308';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(31, 41, 55, 0.8)';
                  e.currentTarget.style.borderColor = 'rgba(234, 179, 8, 0.3)';
                }}
              >
                <TrendingDown style={{ width: '1rem', height: '1rem' }} />
                Nova Despesa
              </button>
              <button 
                onClick={handleAdicionarProduto}
                style={{
                  width: '100%',
                  backgroundColor: 'rgba(31, 41, 55, 0.8)',
                  color: '#FEF3C7',
                  padding: '0.75rem 1rem',
                  borderRadius: '0.5rem',
                  fontWeight: '600',
                  fontSize: '0.875rem',
                  border: '1px solid rgba(234, 179, 8, 0.3)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(234, 179, 8, 0.1)';
                  e.currentTarget.style.borderColor = '#EAB308';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(31, 41, 55, 0.8)';
                  e.currentTarget.style.borderColor = 'rgba(234, 179, 8, 0.3)';
                }}
              >
                <Package style={{ width: '1rem', height: '1rem' }} />
                Adicionar Produto
              </button>
              <button 
                onClick={handleNovaVenda}
                style={{
                  width: '100%',
                  backgroundColor: 'rgba(31, 41, 55, 0.8)',
                  color: '#FEF3C7',
                  padding: '0.75rem 1rem',
                  borderRadius: '0.5rem',
                  fontWeight: '600',
                  fontSize: '0.875rem',
                  border: '1px solid rgba(234, 179, 8, 0.3)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(234, 179, 8, 0.1)';
                  e.currentTarget.style.borderColor = '#EAB308';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(31, 41, 55, 0.8)';
                  e.currentTarget.style.borderColor = 'rgba(234, 179, 8, 0.3)';
                }}
              >
                <ShoppingCart style={{ width: '1rem', height: '1rem' }} />
                Nova Venda
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}