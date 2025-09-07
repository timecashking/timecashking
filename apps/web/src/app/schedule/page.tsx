'use client';

import { useState } from 'react';
import { 
  Calendar, 
  Plus,
  Clock,
  User,
  MapPin,
  Phone,
  Mail,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';

export default function SchedulePage() {
  const [activeTab, setActiveTab] = useState('calendar');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showAddAppointment, setShowAddAppointment] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  const appointments = [
    {
      id: 1,
      title: 'Reunião com Cliente A',
      client: 'João Silva',
      date: '2024-01-15',
      time: '14:00',
      duration: 60,
      type: 'meeting',
      status: 'confirmed',
      location: 'Escritório',
      notes: 'Discussão sobre novo projeto',
      phone: '+55 11 99999-9999',
      email: 'joao@email.com'
    },
    {
      id: 2,
      title: 'Apresentação de Vendas',
      client: 'Maria Santos',
      date: '2024-01-15',
      time: '16:00',
      duration: 90,
      type: 'presentation',
      status: 'pending',
      location: 'Sala de Reuniões',
      notes: 'Apresentar proposta comercial',
      phone: '+55 11 88888-8888',
      email: 'maria@email.com'
    },
    {
      id: 3,
      title: 'Follow-up Cliente B',
      client: 'Pedro Costa',
      date: '2024-01-16',
      time: '10:00',
      duration: 30,
      type: 'call',
      status: 'confirmed',
      location: 'Online',
      notes: 'Acompanhar andamento do projeto',
      phone: '+55 11 77777-7777',
      email: 'pedro@email.com'
    },
    {
      id: 4,
      title: 'Entrega de Produto',
      client: 'Ana Oliveira',
      date: '2024-01-16',
      time: '15:30',
      duration: 45,
      type: 'delivery',
      status: 'completed',
      location: 'Endereço do Cliente',
      notes: 'Entrega e instalação',
      phone: '+55 11 66666-6666',
      email: 'ana@email.com'
    },
    {
      id: 5,
      title: 'Reunião de Equipe',
      client: 'Equipe Interna',
      date: '2024-01-17',
      time: '09:00',
      duration: 120,
      type: 'meeting',
      status: 'confirmed',
      location: 'Sala de Conferências',
      notes: 'Planejamento semanal',
      phone: '',
      email: ''
    }
  ];

  const todayAppointments = appointments.filter(apt => apt.date === '2024-01-15');
  const upcomingAppointments = appointments.filter(apt => apt.date > '2024-01-15').slice(0, 5);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return '#10B981';
      case 'pending': return '#F59E0B';
      case 'completed': return '#3B82F6';
      case 'cancelled': return '#EF4444';
      default: return '#9CA3AF';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed': return 'Confirmado';
      case 'pending': return 'Pendente';
      case 'completed': return 'Concluído';
      case 'cancelled': return 'Cancelado';
      default: return 'Desconhecido';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'meeting': return '🤝';
      case 'presentation': return '📊';
      case 'call': return '📞';
      case 'delivery': return '🚚';
      default: return '📅';
    }
  };

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
            Agenda
          </h1>
          <p style={{ color: '#9CA3AF', fontSize: '1rem', margin: 0 }}>
            Gerencie seus compromissos e reuniões
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
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
            <Calendar size={16} />
            Exportar
          </button>
          <button 
            onClick={() => setShowAddAppointment(true)}
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
            <Plus size={16} />
            Novo Compromisso
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
          { id: 'calendar', name: 'Calendário' },
          { id: 'today', name: 'Hoje' },
          { id: 'upcoming', name: 'Próximos' },
          { id: 'all', name: 'Todos' },
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
      {activeTab === 'calendar' && (
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
          {/* Calendar View */}
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
              Calendário - Janeiro 2024
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.5rem', marginBottom: '1rem' }}>
              {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
                <div key={day} style={{
                  padding: '0.75rem',
                  textAlign: 'center',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: '#9CA3AF',
                  backgroundColor: '#1F2937',
                  borderRadius: '0.5rem'
                }}>
                  {day}
                </div>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.5rem' }}>
              {Array.from({ length: 31 }, (_, i) => i + 1).map(day => {
                const hasAppointment = appointments.some(apt => apt.date === `2024-01-${day.toString().padStart(2, '0')}`);
                const isToday = day === 15;
                return (
                  <div key={day} style={{
                    padding: '0.75rem',
                    textAlign: 'center',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: isToday ? '#000000' : '#F9FAFB',
                    backgroundColor: isToday ? '#EAB308' : hasAppointment ? 'rgba(234, 179, 8, 0.2)' : '#1F2937',
                    borderRadius: '0.5rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    border: hasAppointment ? '1px solid rgba(234, 179, 8, 0.5)' : '1px solid transparent'
                  }}
                  onMouseEnter={(e) => {
                    if (!isToday) {
                      e.currentTarget.style.backgroundColor = hasAppointment ? 'rgba(234, 179, 8, 0.3)' : '#374151';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isToday) {
                      e.currentTarget.style.backgroundColor = hasAppointment ? 'rgba(234, 179, 8, 0.2)' : '#1F2937';
                    }
                  }}
                  >
                    {day}
                    {hasAppointment && (
                      <div style={{
                        width: '0.25rem',
                        height: '0.25rem',
                        backgroundColor: '#EAB308',
                        borderRadius: '50%',
                        margin: '0.25rem auto 0'
                      }}></div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Today's Appointments */}
          <div style={{
            backgroundColor: '#111827',
            border: '1px solid rgba(234, 179, 8, 0.2)',
            borderRadius: '0.75rem',
            padding: '1.5rem',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            height: 'fit-content'
          }}>
            <h2 style={{ 
              fontSize: '1.25rem', 
              fontWeight: '600', 
              color: '#F9FAFB', 
              margin: '0 0 1rem 0' 
            }}>
              Compromissos de Hoje
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {todayAppointments.map((appointment) => (
                <div key={appointment.id} style={{
                  padding: '1rem',
                  backgroundColor: '#1F2937',
                  borderRadius: '0.5rem',
                  border: '1px solid rgba(234, 179, 8, 0.1)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '1.25rem' }}>{getTypeIcon(appointment.type)}</span>
                      <span style={{ fontWeight: '500', color: '#F9FAFB', fontSize: '0.875rem' }}>
                        {appointment.title}
                      </span>
                    </div>
                    <span style={{
                      padding: '0.25rem 0.5rem',
                      borderRadius: '0.25rem',
                      fontSize: '0.75rem',
                      fontWeight: '500',
                      backgroundColor: `${getStatusColor(appointment.status)}20`,
                      color: getStatusColor(appointment.status)
                    }}>
                      {getStatusText(appointment.status)}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <Clock size={12} color="#9CA3AF" />
                    <span style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>
                      {appointment.time} ({appointment.duration}min)
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <User size={12} color="#9CA3AF" />
                    <span style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>
                      {appointment.client}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'today' && (
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
            margin: '0 0 1.5rem 0' 
          }}>
            Compromissos de Hoje - 15/01/2024
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {todayAppointments.map((appointment) => (
              <div key={appointment.id} style={{
                padding: '1.5rem',
                backgroundColor: '#1F2937',
                borderRadius: '0.75rem',
                border: '1px solid rgba(234, 179, 8, 0.1)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontSize: '1.5rem' }}>{getTypeIcon(appointment.type)}</span>
                    <div>
                      <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#F9FAFB', margin: '0 0 0.25rem 0' }}>
                        {appointment.title}
                      </h3>
                      <p style={{ fontSize: '0.875rem', color: '#9CA3AF', margin: 0 }}>
                        {appointment.client}
                      </p>
                    </div>
                  </div>
                  <span style={{
                    padding: '0.5rem 0.75rem',
                    borderRadius: '0.375rem',
                    fontSize: '0.75rem',
                    fontWeight: '500',
                    backgroundColor: `${getStatusColor(appointment.status)}20`,
                    color: getStatusColor(appointment.status)
                  }}>
                    {getStatusText(appointment.status)}
                  </span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Clock size={16} color="#9CA3AF" />
                    <span style={{ fontSize: '0.875rem', color: '#9CA3AF' }}>
                      {appointment.time} - {appointment.duration} minutos
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <MapPin size={16} color="#9CA3AF" />
                    <span style={{ fontSize: '0.875rem', color: '#9CA3AF' }}>
                      {appointment.location}
                    </span>
                  </div>
                  {appointment.phone && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Phone size={16} color="#9CA3AF" />
                      <span style={{ fontSize: '0.875rem', color: '#9CA3AF' }}>
                        {appointment.phone}
                      </span>
                    </div>
                  )}
                  {appointment.email && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Mail size={16} color="#9CA3AF" />
                      <span style={{ fontSize: '0.875rem', color: '#9CA3AF' }}>
                        {appointment.email}
                      </span>
                    </div>
                  )}
                </div>
                {appointment.notes && (
                  <div style={{
                    padding: '0.75rem',
                    backgroundColor: '#374151',
                    borderRadius: '0.5rem',
                    marginBottom: '1rem'
                  }}>
                    <p style={{ fontSize: '0.875rem', color: '#D1D5DB', margin: 0 }}>
                      <strong>Observações:</strong> {appointment.notes}
                    </p>
                  </div>
                )}
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: 'transparent',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    borderRadius: '0.375rem',
                    color: '#9CA3AF',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    fontSize: '0.75rem',
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.1)';
                    e.currentTarget.style.borderColor = '#3B82F6';
                    e.currentTarget.style.color = '#3B82F6';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.3)';
                    e.currentTarget.style.color = '#9CA3AF';
                  }}
                  >
                    <Eye size={14} />
                    Ver Detalhes
                  </button>
                  <button style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: 'transparent',
                    border: '1px solid rgba(234, 179, 8, 0.3)',
                    borderRadius: '0.375rem',
                    color: '#9CA3AF',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    fontSize: '0.75rem',
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
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
                    <Edit size={14} />
                    Editar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'upcoming' && (
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
            margin: '0 0 1.5rem 0' 
          }}>
            Próximos Compromissos
          </h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(234, 179, 8, 0.2)' }}>
                  <th style={{ textAlign: 'left', padding: '0.75rem 1rem', color: '#9CA3AF', fontWeight: '500' }}>
                    Compromisso
                  </th>
                  <th style={{ textAlign: 'left', padding: '0.75rem 1rem', color: '#9CA3AF', fontWeight: '500' }}>
                    Cliente
                  </th>
                  <th style={{ textAlign: 'left', padding: '0.75rem 1rem', color: '#9CA3AF', fontWeight: '500' }}>
                    Data/Hora
                  </th>
                  <th style={{ textAlign: 'left', padding: '0.75rem 1rem', color: '#9CA3AF', fontWeight: '500' }}>
                    Local
                  </th>
                  <th style={{ textAlign: 'center', padding: '0.75rem 1rem', color: '#9CA3AF', fontWeight: '500' }}>
                    Status
                  </th>
                  <th style={{ textAlign: 'center', padding: '0.75rem 1rem', color: '#9CA3AF', fontWeight: '500' }}>
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody>
                {upcomingAppointments.map((appointment) => (
                  <tr key={appointment.id} style={{ borderBottom: '1px solid rgba(234, 179, 8, 0.1)' }}>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '1.25rem' }}>{getTypeIcon(appointment.type)}</span>
                        <span style={{ color: '#F9FAFB', fontWeight: '500' }}>{appointment.title}</span>
                      </div>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', color: '#9CA3AF' }}>
                      {appointment.client}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', color: '#9CA3AF' }}>
                      {appointment.date} às {appointment.time}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', color: '#9CA3AF' }}>
                      {appointment.location}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                      <span style={{
                        padding: '0.25rem 0.5rem',
                        borderRadius: '0.25rem',
                        fontSize: '0.75rem',
                        fontWeight: '500',
                        backgroundColor: `${getStatusColor(appointment.status)}20`,
                        color: getStatusColor(appointment.status)
                      }}>
                        {getStatusText(appointment.status)}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
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
                          e.currentTarget.style.backgroundColor = 'rgba(234, 179, 8, 0.1)';
                          e.currentTarget.style.color = '#EAB308';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.color = '#9CA3AF';
                        }}
                        >
                          <Edit size={16} />
                        </button>
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
                          e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
                          e.currentTarget.style.color = '#EF4444';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.color = '#9CA3AF';
                        }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'all' && (
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
            margin: '0 0 1.5rem 0' 
          }}>
            Todos os Compromissos
          </h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(234, 179, 8, 0.2)' }}>
                  <th style={{ textAlign: 'left', padding: '0.75rem 1rem', color: '#9CA3AF', fontWeight: '500' }}>
                    Compromisso
                  </th>
                  <th style={{ textAlign: 'left', padding: '0.75rem 1rem', color: '#9CA3AF', fontWeight: '500' }}>
                    Cliente
                  </th>
                  <th style={{ textAlign: 'left', padding: '0.75rem 1rem', color: '#9CA3AF', fontWeight: '500' }}>
                    Data/Hora
                  </th>
                  <th style={{ textAlign: 'left', padding: '0.75rem 1rem', color: '#9CA3AF', fontWeight: '500' }}>
                    Local
                  </th>
                  <th style={{ textAlign: 'center', padding: '0.75rem 1rem', color: '#9CA3AF', fontWeight: '500' }}>
                    Status
                  </th>
                  <th style={{ textAlign: 'center', padding: '0.75rem 1rem', color: '#9CA3AF', fontWeight: '500' }}>
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((appointment) => (
                  <tr key={appointment.id} style={{ borderBottom: '1px solid rgba(234, 179, 8, 0.1)' }}>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '1.25rem' }}>{getTypeIcon(appointment.type)}</span>
                        <span style={{ color: '#F9FAFB', fontWeight: '500' }}>{appointment.title}</span>
                      </div>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', color: '#9CA3AF' }}>
                      {appointment.client}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', color: '#9CA3AF' }}>
                      {appointment.date} às {appointment.time}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', color: '#9CA3AF' }}>
                      {appointment.location}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                      <span style={{
                        padding: '0.25rem 0.5rem',
                        borderRadius: '0.25rem',
                        fontSize: '0.75rem',
                        fontWeight: '500',
                        backgroundColor: `${getStatusColor(appointment.status)}20`,
                        color: getStatusColor(appointment.status)
                      }}>
                        {getStatusText(appointment.status)}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
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
                          e.currentTarget.style.backgroundColor = 'rgba(234, 179, 8, 0.1)';
                          e.currentTarget.style.color = '#EAB308';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.color = '#9CA3AF';
                        }}
                        >
                          <Edit size={16} />
                        </button>
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
                          e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
                          e.currentTarget.style.color = '#EF4444';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.color = '#9CA3AF';
                        }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Novo Compromisso */}
      {showAddAppointment && (
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
            maxWidth: '500px',
            border: '1px solid rgba(234, 179, 8, 0.2)'
          }}>
            <h3 style={{
              fontSize: '1.5rem',
              fontWeight: '700',
              color: '#F9FAFB',
              marginBottom: '1.5rem',
              margin: 0
            }}>
              Novo Compromisso
            </h3>
            
            <p style={{ color: '#9CA3AF', marginBottom: '2rem' }}>
              Funcionalidade de novo compromisso será implementada.
            </p>
            
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowAddAppointment(false)}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#EAB308',
                  border: 'none',
                  borderRadius: '0.5rem',
                  color: '#000000',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  fontSize: '0.875rem',
                  fontWeight: '600'
                }}
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
