'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Eye, Filter } from 'lucide-react';

interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  document?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  notes?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'BLOCKED';
  createdAt: string;
  updatedAt: string;
}

interface CustomerStats {
  total: number;
  active: number;
  inactive: number;
  blocked: number;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [stats, setStats] = useState<CustomerStats>({ total: 0, active: 0, inactive: 0, blocked: 0 });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    document: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    notes: '',
    status: 'ACTIVE' as 'ACTIVE' | 'INACTIVE' | 'BLOCKED'
  });

  // Carregar clientes do localStorage
  useEffect(() => {
    const loadCustomers = () => {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('timecash-customers');
        if (saved) {
          try {
            const parsedCustomers = JSON.parse(saved);
            setCustomers(parsedCustomers);
            setStats({
              total: parsedCustomers.length,
              active: parsedCustomers.filter((c: Customer) => c.status === 'ACTIVE').length,
              inactive: parsedCustomers.filter((c: Customer) => c.status === 'INACTIVE').length,
              blocked: parsedCustomers.filter((c: Customer) => c.status === 'BLOCKED').length
            });
          } catch (error) {
            console.error('Erro ao carregar clientes:', error);
            // Se houver erro, usar dados mock
            const mockCustomers: Customer[] = [
              {
                id: '1',
                name: 'João Silva',
                email: 'joao@email.com',
                phone: '(11) 99999-9999',
                document: '123.456.789-00',
                address: 'Rua das Flores, 123',
                city: 'São Paulo',
                state: 'SP',
                zipCode: '01234-567',
                status: 'ACTIVE',
                createdAt: '2024-01-15T10:00:00Z',
                updatedAt: '2024-01-15T10:00:00Z'
              },
              {
                id: '2',
                name: 'Maria Santos',
                email: 'maria@email.com',
                phone: '(11) 88888-8888',
                document: '987.654.321-00',
                address: 'Av. Paulista, 456',
                city: 'São Paulo',
                state: 'SP',
                zipCode: '01310-100',
                status: 'ACTIVE',
                createdAt: '2024-01-16T14:30:00Z',
                updatedAt: '2024-01-16T14:30:00Z'
              }
            ];
            setCustomers(mockCustomers);
            setStats({
              total: mockCustomers.length,
              active: mockCustomers.filter(c => c.status === 'ACTIVE').length,
              inactive: mockCustomers.filter(c => c.status === 'INACTIVE').length,
              blocked: mockCustomers.filter(c => c.status === 'BLOCKED').length
            });
            // Salvar os dados mock no localStorage
            localStorage.setItem('timecash-customers', JSON.stringify(mockCustomers));
          }
        } else {
          // Se não houver dados salvos, usar dados mock
          const mockCustomers: Customer[] = [
            {
              id: '1',
              name: 'João Silva',
              email: 'joao@email.com',
              phone: '(11) 99999-9999',
              document: '123.456.789-00',
              address: 'Rua das Flores, 123',
              city: 'São Paulo',
              state: 'SP',
              zipCode: '01234-567',
              status: 'ACTIVE',
              createdAt: '2024-01-15T10:00:00Z',
              updatedAt: '2024-01-15T10:00:00Z'
            },
            {
              id: '2',
              name: 'Maria Santos',
              email: 'maria@email.com',
              phone: '(11) 88888-8888',
              document: '987.654.321-00',
              address: 'Av. Paulista, 456',
              city: 'São Paulo',
              state: 'SP',
              zipCode: '01310-100',
              status: 'ACTIVE',
              createdAt: '2024-01-16T14:30:00Z',
              updatedAt: '2024-01-16T14:30:00Z'
            }
          ];
          setCustomers(mockCustomers);
          setStats({
            total: mockCustomers.length,
            active: mockCustomers.filter(c => c.status === 'ACTIVE').length,
            inactive: mockCustomers.filter(c => c.status === 'INACTIVE').length,
            blocked: mockCustomers.filter(c => c.status === 'BLOCKED').length
          });
          // Salvar os dados mock no localStorage
          localStorage.setItem('timecash-customers', JSON.stringify(mockCustomers));
        }
        setLoading(false);
      }
    };

    loadCustomers();
  }, []);

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.phone?.includes(searchTerm) ||
                         customer.document?.includes(searchTerm);
    
    const matchesStatus = statusFilter === 'all' || customer.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleAddCustomer = () => {
    const newCustomer: Customer = {
      id: Date.now().toString(),
      ...formData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const updatedCustomers = [...customers, newCustomer];
    setCustomers(updatedCustomers);
    setStats(prev => ({ ...prev, total: prev.total + 1, active: prev.active + 1 }));
    
    // Salvar no localStorage
    localStorage.setItem('timecash-customers', JSON.stringify(updatedCustomers));
    
    setShowAddModal(false);
    resetForm();
  };

  const handleEditCustomer = () => {
    if (!selectedCustomer) return;
    
    const updatedCustomers = customers.map(customer =>
      customer.id === selectedCustomer.id
        ? { ...customer, ...formData, updatedAt: new Date().toISOString() }
        : customer
    );
    
    setCustomers(updatedCustomers);
    
    // Salvar no localStorage
    localStorage.setItem('timecash-customers', JSON.stringify(updatedCustomers));
    
    setShowEditModal(false);
    setSelectedCustomer(null);
    resetForm();
  };

  const handleDeleteCustomer = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este cliente?')) {
      const updatedCustomers = customers.filter(customer => customer.id !== id);
      setCustomers(updatedCustomers);
      setStats(prev => ({ ...prev, total: prev.total - 1 }));
      
      // Salvar no localStorage
      localStorage.setItem('timecash-customers', JSON.stringify(updatedCustomers));
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      document: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      notes: '',
      status: 'ACTIVE'
    });
  };

  const openEditModal = (customer: Customer) => {
    setSelectedCustomer(customer);
    setFormData({
      name: customer.name,
      email: customer.email || '',
      phone: customer.phone || '',
      document: customer.document || '',
      address: customer.address || '',
      city: customer.city || '',
      state: customer.state || '',
      zipCode: customer.zipCode || '',
      notes: customer.notes || '',
      status: customer.status
    });
    setShowEditModal(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return { color: '#10B981', backgroundColor: 'rgba(16, 185, 129, 0.2)' };
      case 'INACTIVE': return { color: '#F59E0B', backgroundColor: 'rgba(245, 158, 11, 0.2)' };
      case 'BLOCKED': return { color: '#EF4444', backgroundColor: 'rgba(239, 68, 68, 0.2)' };
      default: return { color: '#9CA3AF', backgroundColor: 'rgba(156, 163, 175, 0.2)' };
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'Ativo';
      case 'INACTIVE': return 'Inativo';
      case 'BLOCKED': return 'Bloqueado';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        backgroundColor: '#000000', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '4rem',
            height: '4rem',
            border: '4px solid #EAB308',
            borderTop: '4px solid transparent',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }}></div>
          <p style={{ color: '#9CA3AF' }}>Carregando clientes...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '1.5rem', backgroundColor: '#000000', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem'
      }}>
        <div>
          <h1 style={{ 
            fontSize: '2rem', 
            fontWeight: 'bold', 
            color: '#FFFFFF', 
            margin: 0 
          }}>
            Clientes
          </h1>
          <p style={{ color: '#9CA3AF', margin: '0.5rem 0 0 0' }}>
            Gerencie seus clientes e informações de contato
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          style={{
            backgroundColor: '#EAB308',
            color: '#000000',
            padding: '0.75rem 1.5rem',
            borderRadius: '0.5rem',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            cursor: 'pointer',
            fontWeight: '600'
          }}
        >
          <Plus size={20} />
          Adicionar Cliente
        </button>
      </div>

      {/* Stats Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <div style={{
          backgroundColor: '#1F2937',
          padding: '1.5rem',
          borderRadius: '0.75rem',
          border: '1px solid #374151'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '3rem',
              height: '3rem',
              backgroundColor: '#3B82F6',
              borderRadius: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <span style={{ color: '#FFFFFF', fontSize: '1.25rem', fontWeight: 'bold' }}>
                {stats.total}
              </span>
            </div>
            <div>
              <p style={{ color: '#9CA3AF', margin: 0, fontSize: '0.875rem' }}>Total</p>
              <p style={{ color: '#FFFFFF', margin: 0, fontSize: '1.5rem', fontWeight: 'bold' }}>
                {stats.total} Clientes
              </p>
            </div>
          </div>
        </div>

        <div style={{
          backgroundColor: '#1F2937',
          padding: '1.5rem',
          borderRadius: '0.75rem',
          border: '1px solid #374151'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '3rem',
              height: '3rem',
              backgroundColor: '#10B981',
              borderRadius: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <span style={{ color: '#FFFFFF', fontSize: '1.25rem', fontWeight: 'bold' }}>
                {stats.active}
              </span>
            </div>
            <div>
              <p style={{ color: '#9CA3AF', margin: 0, fontSize: '0.875rem' }}>Ativos</p>
              <p style={{ color: '#FFFFFF', margin: 0, fontSize: '1.5rem', fontWeight: 'bold' }}>
                {stats.active} Clientes
              </p>
            </div>
          </div>
        </div>

        <div style={{
          backgroundColor: '#1F2937',
          padding: '1.5rem',
          borderRadius: '0.75rem',
          border: '1px solid #374151'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '3rem',
              height: '3rem',
              backgroundColor: '#F59E0B',
              borderRadius: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <span style={{ color: '#FFFFFF', fontSize: '1.25rem', fontWeight: 'bold' }}>
                {stats.inactive}
              </span>
            </div>
            <div>
              <p style={{ color: '#9CA3AF', margin: 0, fontSize: '0.875rem' }}>Inativos</p>
              <p style={{ color: '#FFFFFF', margin: 0, fontSize: '1.5rem', fontWeight: 'bold' }}>
                {stats.inactive} Clientes
              </p>
            </div>
          </div>
        </div>

        <div style={{
          backgroundColor: '#1F2937',
          padding: '1.5rem',
          borderRadius: '0.75rem',
          border: '1px solid #374151'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '3rem',
              height: '3rem',
              backgroundColor: '#EF4444',
              borderRadius: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <span style={{ color: '#FFFFFF', fontSize: '1.25rem', fontWeight: 'bold' }}>
                {stats.blocked}
              </span>
            </div>
            <div>
              <p style={{ color: '#9CA3AF', margin: 0, fontSize: '0.875rem' }}>Bloqueados</p>
              <p style={{ color: '#FFFFFF', margin: 0, fontSize: '1.5rem', fontWeight: 'bold' }}>
                {stats.blocked} Clientes
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div style={{
        display: 'flex',
        gap: '1rem',
        marginBottom: '2rem',
        flexWrap: 'wrap'
      }}>
        <div style={{ position: 'relative', flex: '1', minWidth: '300px' }}>
          <Search 
            size={20} 
            style={{ 
              position: 'absolute', 
              left: '0.75rem', 
              top: '50%', 
              transform: 'translateY(-50%)', 
              color: '#9CA3AF' 
            }} 
          />
          <input
            type="text"
            placeholder="Buscar clientes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem 0.75rem 0.75rem 2.75rem',
              backgroundColor: '#1F2937',
              border: '1px solid #374151',
              borderRadius: '0.5rem',
              color: '#FFFFFF',
              fontSize: '0.875rem'
            }}
          />
        </div>
        
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{
            padding: '0.75rem',
            backgroundColor: '#1F2937',
            border: '1px solid #374151',
            borderRadius: '0.5rem',
            color: '#FFFFFF',
            fontSize: '0.875rem',
            minWidth: '150px'
          }}
        >
          <option value="all">Todos os status</option>
          <option value="ACTIVE">Ativo</option>
          <option value="INACTIVE">Inativo</option>
          <option value="BLOCKED">Bloqueado</option>
        </select>
      </div>

      {/* Customers Table */}
      <div style={{
        backgroundColor: '#1F2937',
        borderRadius: '0.75rem',
        border: '1px solid #374151',
        overflow: 'hidden'
      }}>
        <div style={{
          padding: '1rem 1.5rem',
          borderBottom: '1px solid #374151',
          backgroundColor: '#111827'
        }}>
          <h3 style={{ color: '#FFFFFF', margin: 0, fontSize: '1.125rem', fontWeight: '600' }}>
            Lista de Clientes ({filteredCustomers.length})
          </h3>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#111827' }}>
                <th style={{ 
                  padding: '1rem', 
                  textAlign: 'left', 
                  color: '#9CA3AF', 
                  fontSize: '0.875rem', 
                  fontWeight: '500',
                  borderBottom: '1px solid #374151'
                }}>
                  Cliente
                </th>
                <th style={{ 
                  padding: '1rem', 
                  textAlign: 'left', 
                  color: '#9CA3AF', 
                  fontSize: '0.875rem', 
                  fontWeight: '500',
                  borderBottom: '1px solid #374151'
                }}>
                  Contato
                </th>
                <th style={{ 
                  padding: '1rem', 
                  textAlign: 'left', 
                  color: '#9CA3AF', 
                  fontSize: '0.875rem', 
                  fontWeight: '500',
                  borderBottom: '1px solid #374151'
                }}>
                  Localização
                </th>
                <th style={{ 
                  padding: '1rem', 
                  textAlign: 'left', 
                  color: '#9CA3AF', 
                  fontSize: '0.875rem', 
                  fontWeight: '500',
                  borderBottom: '1px solid #374151'
                }}>
                  Status
                </th>
                <th style={{ 
                  padding: '1rem', 
                  textAlign: 'center', 
                  color: '#9CA3AF', 
                  fontSize: '0.875rem', 
                  fontWeight: '500',
                  borderBottom: '1px solid #374151'
                }}>
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map((customer) => (
                <tr key={customer.id} style={{ borderBottom: '1px solid #374151' }}>
                  <td style={{ padding: '1rem' }}>
                    <div>
                      <p style={{ color: '#FFFFFF', margin: 0, fontWeight: '600' }}>
                        {customer.name}
                      </p>
                      {customer.document && (
                        <p style={{ color: '#9CA3AF', margin: '0.25rem 0 0 0', fontSize: '0.875rem' }}>
                          {customer.document}
                        </p>
                      )}
                    </div>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div>
                      {customer.email && (
                        <p style={{ color: '#FFFFFF', margin: 0, fontSize: '0.875rem' }}>
                          {customer.email}
                        </p>
                      )}
                      {customer.phone && (
                        <p style={{ color: '#9CA3AF', margin: '0.25rem 0 0 0', fontSize: '0.875rem' }}>
                          {customer.phone}
                        </p>
                      )}
                    </div>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div>
                      {customer.city && customer.state && (
                        <p style={{ color: '#FFFFFF', margin: 0, fontSize: '0.875rem' }}>
                          {customer.city}, {customer.state}
                        </p>
                      )}
                      {customer.zipCode && (
                        <p style={{ color: '#9CA3AF', margin: '0.25rem 0 0 0', fontSize: '0.875rem' }}>
                          {customer.zipCode}
                        </p>
                      )}
                    </div>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{
                      padding: '0.25rem 0.75rem',
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      fontWeight: '500',
                      ...getStatusColor(customer.status)
                    }}>
                      {getStatusText(customer.status)}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                      <button
                        onClick={() => openEditModal(customer)}
                        style={{
                          padding: '0.5rem',
                          backgroundColor: '#374151',
                          border: 'none',
                          borderRadius: '0.375rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                        title="Editar"
                      >
                        <Edit size={16} style={{ color: '#9CA3AF' }} />
                      </button>
                      <button
                        onClick={() => handleDeleteCustomer(customer.id)}
                        style={{
                          padding: '0.5rem',
                          backgroundColor: '#374151',
                          border: 'none',
                          borderRadius: '0.375rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                        title="Excluir"
                      >
                        <Trash2 size={16} style={{ color: '#EF4444' }} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredCustomers.length === 0 && (
          <div style={{
            padding: '3rem',
            textAlign: 'center',
            color: '#9CA3AF'
          }}>
            <p>Nenhum cliente encontrado</p>
          </div>
        )}
      </div>

      {/* Add Customer Modal */}
      {showAddModal && (
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
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: '#1F2937',
            borderRadius: '0.75rem',
            padding: '2rem',
            width: '90%',
            maxWidth: '600px',
            maxHeight: '90vh',
            overflowY: 'auto',
            border: '1px solid #374151'
          }}>
            <h2 style={{ color: '#FFFFFF', margin: '0 0 1.5rem 0', fontSize: '1.5rem', fontWeight: 'bold' }}>
              Adicionar Cliente
            </h2>

            <div style={{ display: 'grid', gap: '1rem' }}>
              <div>
                <label style={{ color: '#FFFFFF', fontSize: '0.875rem', fontWeight: '500', display: 'block', marginBottom: '0.5rem' }}>
                  Nome *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    backgroundColor: '#111827',
                    border: '1px solid #374151',
                    borderRadius: '0.5rem',
                    color: '#FFFFFF',
                    fontSize: '0.875rem'
                  }}
                  placeholder="Nome completo do cliente"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ color: '#FFFFFF', fontSize: '0.875rem', fontWeight: '500', display: 'block', marginBottom: '0.5rem' }}>
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      backgroundColor: '#111827',
                      border: '1px solid #374151',
                      borderRadius: '0.5rem',
                      color: '#FFFFFF',
                      fontSize: '0.875rem'
                    }}
                    placeholder="email@exemplo.com"
                  />
                </div>
                <div>
                  <label style={{ color: '#FFFFFF', fontSize: '0.875rem', fontWeight: '500', display: 'block', marginBottom: '0.5rem' }}>
                    Telefone
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      backgroundColor: '#111827',
                      border: '1px solid #374151',
                      borderRadius: '0.5rem',
                      color: '#FFFFFF',
                      fontSize: '0.875rem'
                    }}
                    placeholder="(11) 99999-9999"
                  />
                </div>
              </div>

              <div>
                <label style={{ color: '#FFFFFF', fontSize: '0.875rem', fontWeight: '500', display: 'block', marginBottom: '0.5rem' }}>
                  CPF/CNPJ
                </label>
                <input
                  type="text"
                  value={formData.document}
                  onChange={(e) => setFormData({ ...formData, document: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    backgroundColor: '#111827',
                    border: '1px solid #374151',
                    borderRadius: '0.5rem',
                    color: '#FFFFFF',
                    fontSize: '0.875rem'
                  }}
                  placeholder="123.456.789-00"
                />
              </div>

              <div>
                <label style={{ color: '#FFFFFF', fontSize: '0.875rem', fontWeight: '500', display: 'block', marginBottom: '0.5rem' }}>
                  Endereço
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    backgroundColor: '#111827',
                    border: '1px solid #374151',
                    borderRadius: '0.5rem',
                    color: '#FFFFFF',
                    fontSize: '0.875rem'
                  }}
                  placeholder="Rua, número, bairro"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ color: '#FFFFFF', fontSize: '0.875rem', fontWeight: '500', display: 'block', marginBottom: '0.5rem' }}>
                    Cidade
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      backgroundColor: '#111827',
                      border: '1px solid #374151',
                      borderRadius: '0.5rem',
                      color: '#FFFFFF',
                      fontSize: '0.875rem'
                    }}
                    placeholder="São Paulo"
                  />
                </div>
                <div>
                  <label style={{ color: '#FFFFFF', fontSize: '0.875rem', fontWeight: '500', display: 'block', marginBottom: '0.5rem' }}>
                    Estado
                  </label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      backgroundColor: '#111827',
                      border: '1px solid #374151',
                      borderRadius: '0.5rem',
                      color: '#FFFFFF',
                      fontSize: '0.875rem'
                    }}
                    placeholder="SP"
                  />
                </div>
                <div>
                  <label style={{ color: '#FFFFFF', fontSize: '0.875rem', fontWeight: '500', display: 'block', marginBottom: '0.5rem' }}>
                    CEP
                  </label>
                  <input
                    type="text"
                    value={formData.zipCode}
                    onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      backgroundColor: '#111827',
                      border: '1px solid #374151',
                      borderRadius: '0.5rem',
                      color: '#FFFFFF',
                      fontSize: '0.875rem'
                    }}
                    placeholder="01234-567"
                  />
                </div>
              </div>

              <div>
                <label style={{ color: '#FFFFFF', fontSize: '0.875rem', fontWeight: '500', display: 'block', marginBottom: '0.5rem' }}>
                  Observações
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    backgroundColor: '#111827',
                    border: '1px solid #374151',
                    borderRadius: '0.5rem',
                    color: '#FFFFFF',
                    fontSize: '0.875rem',
                    resize: 'vertical'
                  }}
                  placeholder="Observações sobre o cliente..."
                />
              </div>

              <div>
                <label style={{ color: '#FFFFFF', fontSize: '0.875rem', fontWeight: '500', display: 'block', marginBottom: '0.5rem' }}>
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as 'ACTIVE' | 'INACTIVE' | 'BLOCKED' })}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    backgroundColor: '#111827',
                    border: '1px solid #374151',
                    borderRadius: '0.5rem',
                    color: '#FFFFFF',
                    fontSize: '0.875rem'
                  }}
                >
                  <option value="ACTIVE">Ativo</option>
                  <option value="INACTIVE">Inativo</option>
                  <option value="BLOCKED">Bloqueado</option>
                </select>
              </div>
            </div>

            <div style={{
              display: 'flex',
              gap: '1rem',
              justifyContent: 'flex-end',
              marginTop: '2rem'
            }}>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  resetForm();
                }}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#374151',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '500'
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleAddCustomer}
                disabled={!formData.name}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: formData.name ? '#EAB308' : '#374151',
                  color: formData.name ? '#000000' : '#9CA3AF',
                  border: 'none',
                  borderRadius: '0.5rem',
                  cursor: formData.name ? 'pointer' : 'not-allowed',
                  fontSize: '0.875rem',
                  fontWeight: '500'
                }}
              >
                Adicionar Cliente
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Customer Modal */}
      {showEditModal && (
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
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: '#1F2937',
            borderRadius: '0.75rem',
            padding: '2rem',
            width: '90%',
            maxWidth: '600px',
            maxHeight: '90vh',
            overflowY: 'auto',
            border: '1px solid #374151'
          }}>
            <h2 style={{ color: '#FFFFFF', margin: '0 0 1.5rem 0', fontSize: '1.5rem', fontWeight: 'bold' }}>
              Editar Cliente
            </h2>

            <div style={{ display: 'grid', gap: '1rem' }}>
              <div>
                <label style={{ color: '#FFFFFF', fontSize: '0.875rem', fontWeight: '500', display: 'block', marginBottom: '0.5rem' }}>
                  Nome *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    backgroundColor: '#111827',
                    border: '1px solid #374151',
                    borderRadius: '0.5rem',
                    color: '#FFFFFF',
                    fontSize: '0.875rem'
                  }}
                  placeholder="Nome completo do cliente"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ color: '#FFFFFF', fontSize: '0.875rem', fontWeight: '500', display: 'block', marginBottom: '0.5rem' }}>
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      backgroundColor: '#111827',
                      border: '1px solid #374151',
                      borderRadius: '0.5rem',
                      color: '#FFFFFF',
                      fontSize: '0.875rem'
                    }}
                    placeholder="email@exemplo.com"
                  />
                </div>
                <div>
                  <label style={{ color: '#FFFFFF', fontSize: '0.875rem', fontWeight: '500', display: 'block', marginBottom: '0.5rem' }}>
                    Telefone
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      backgroundColor: '#111827',
                      border: '1px solid #374151',
                      borderRadius: '0.5rem',
                      color: '#FFFFFF',
                      fontSize: '0.875rem'
                    }}
                    placeholder="(11) 99999-9999"
                  />
                </div>
              </div>

              <div>
                <label style={{ color: '#FFFFFF', fontSize: '0.875rem', fontWeight: '500', display: 'block', marginBottom: '0.5rem' }}>
                  CPF/CNPJ
                </label>
                <input
                  type="text"
                  value={formData.document}
                  onChange={(e) => setFormData({ ...formData, document: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    backgroundColor: '#111827',
                    border: '1px solid #374151',
                    borderRadius: '0.5rem',
                    color: '#FFFFFF',
                    fontSize: '0.875rem'
                  }}
                  placeholder="123.456.789-00"
                />
              </div>

              <div>
                <label style={{ color: '#FFFFFF', fontSize: '0.875rem', fontWeight: '500', display: 'block', marginBottom: '0.5rem' }}>
                  Endereço
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    backgroundColor: '#111827',
                    border: '1px solid #374151',
                    borderRadius: '0.5rem',
                    color: '#FFFFFF',
                    fontSize: '0.875rem'
                  }}
                  placeholder="Rua, número, bairro"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ color: '#FFFFFF', fontSize: '0.875rem', fontWeight: '500', display: 'block', marginBottom: '0.5rem' }}>
                    Cidade
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      backgroundColor: '#111827',
                      border: '1px solid #374151',
                      borderRadius: '0.5rem',
                      color: '#FFFFFF',
                      fontSize: '0.875rem'
                    }}
                    placeholder="São Paulo"
                  />
                </div>
                <div>
                  <label style={{ color: '#FFFFFF', fontSize: '0.875rem', fontWeight: '500', display: 'block', marginBottom: '0.5rem' }}>
                    Estado
                  </label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      backgroundColor: '#111827',
                      border: '1px solid #374151',
                      borderRadius: '0.5rem',
                      color: '#FFFFFF',
                      fontSize: '0.875rem'
                    }}
                    placeholder="SP"
                  />
                </div>
                <div>
                  <label style={{ color: '#FFFFFF', fontSize: '0.875rem', fontWeight: '500', display: 'block', marginBottom: '0.5rem' }}>
                    CEP
                  </label>
                  <input
                    type="text"
                    value={formData.zipCode}
                    onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      backgroundColor: '#111827',
                      border: '1px solid #374151',
                      borderRadius: '0.5rem',
                      color: '#FFFFFF',
                      fontSize: '0.875rem'
                    }}
                    placeholder="01234-567"
                  />
                </div>
              </div>

              <div>
                <label style={{ color: '#FFFFFF', fontSize: '0.875rem', fontWeight: '500', display: 'block', marginBottom: '0.5rem' }}>
                  Observações
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    backgroundColor: '#111827',
                    border: '1px solid #374151',
                    borderRadius: '0.5rem',
                    color: '#FFFFFF',
                    fontSize: '0.875rem',
                    resize: 'vertical'
                  }}
                  placeholder="Observações sobre o cliente..."
                />
              </div>

              <div>
                <label style={{ color: '#FFFFFF', fontSize: '0.875rem', fontWeight: '500', display: 'block', marginBottom: '0.5rem' }}>
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as 'ACTIVE' | 'INACTIVE' | 'BLOCKED' })}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    backgroundColor: '#111827',
                    border: '1px solid #374151',
                    borderRadius: '0.5rem',
                    color: '#FFFFFF',
                    fontSize: '0.875rem'
                  }}
                >
                  <option value="ACTIVE">Ativo</option>
                  <option value="INACTIVE">Inativo</option>
                  <option value="BLOCKED">Bloqueado</option>
                </select>
              </div>
            </div>

            <div style={{
              display: 'flex',
              gap: '1rem',
              justifyContent: 'flex-end',
              marginTop: '2rem'
            }}>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedCustomer(null);
                  resetForm();
                }}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#374151',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '500'
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleEditCustomer}
                disabled={!formData.name}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: formData.name ? '#EAB308' : '#374151',
                  color: formData.name ? '#000000' : '#9CA3AF',
                  border: 'none',
                  borderRadius: '0.5rem',
                  cursor: formData.name ? 'pointer' : 'not-allowed',
                  fontSize: '0.875rem',
                  fontWeight: '500'
                }}
              >
                Salvar Alterações
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
