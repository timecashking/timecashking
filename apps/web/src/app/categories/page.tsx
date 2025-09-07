'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Tag, Filter } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  description?: string;
  type: 'INCOME' | 'EXPENSE' | 'TRANSFER' | 'PRODUCT';
  color?: string;
  icon?: string;
  createdAt: string;
  updatedAt: string;
}

interface CategoryStats {
  total: number;
  income: number;
  expense: number;
  transfer: number;
  product: number;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [stats, setStats] = useState<CategoryStats>({ total: 0, income: 0, expense: 0, transfer: 0, product: 0 });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'INCOME' as 'INCOME' | 'EXPENSE' | 'TRANSFER' | 'PRODUCT',
    color: '#10B981',
    icon: ''
  });

  // Mock data para demonstração
  useEffect(() => {
    const mockCategories: Category[] = [
      {
        id: '1',
        name: 'Vendas',
        description: 'Receitas de vendas de produtos',
        type: 'INCOME',
        color: '#10B981',
        icon: '💰',
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z'
      },
      {
        id: '2',
        name: 'Serviços',
        description: 'Receitas de serviços prestados',
        type: 'INCOME',
        color: '#3B82F6',
        icon: '🔧',
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z'
      },
      {
        id: '3',
        name: 'Compras',
        description: 'Compras de materiais e produtos',
        type: 'EXPENSE',
        color: '#EF4444',
        icon: '🛒',
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z'
      },
      {
        id: '4',
        name: 'Despesas Fixas',
        description: 'Aluguel, energia, água, etc.',
        type: 'EXPENSE',
        color: '#F59E0B',
        icon: '🏠',
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z'
      },
      {
        id: '5',
        name: 'Transferências',
        description: 'Transferências entre contas',
        type: 'TRANSFER',
        color: '#8B5CF6',
        icon: '🔄',
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z'
      },
      {
        id: '6',
        name: 'Eletrônicos',
        description: 'Categoria para produtos eletrônicos',
        type: 'PRODUCT',
        color: '#06B6D4',
        icon: '📱',
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z'
      }
    ];

    setCategories(mockCategories);
    setStats({
      total: mockCategories.length,
      income: mockCategories.filter(c => c.type === 'INCOME').length,
      expense: mockCategories.filter(c => c.type === 'EXPENSE').length,
      transfer: mockCategories.filter(c => c.type === 'TRANSFER').length,
      product: mockCategories.filter(c => c.type === 'PRODUCT').length
    });
    setLoading(false);
  }, []);

  const filteredCategories = categories.filter(category => {
    const matchesSearch = category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         category.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = typeFilter === 'all' || category.type === typeFilter;
    
    return matchesSearch && matchesType;
  });

  const handleAddCategory = () => {
    // Aqui seria a chamada para a API
    const newCategory: Category = {
      id: Date.now().toString(),
      ...formData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    setCategories([...categories, newCategory]);
    setStats(prev => ({ ...prev, total: prev.total + 1, [formData.type.toLowerCase()]: prev[formData.type.toLowerCase() as keyof CategoryStats] + 1 }));
    setShowAddModal(false);
    resetForm();
  };

  const handleEditCategory = () => {
    if (!selectedCategory) return;
    
    // Aqui seria a chamada para a API
    const updatedCategories = categories.map(category =>
      category.id === selectedCategory.id
        ? { ...category, ...formData, updatedAt: new Date().toISOString() }
        : category
    );
    
    setCategories(updatedCategories);
    setShowEditModal(false);
    setSelectedCategory(null);
    resetForm();
  };

  const handleDeleteCategory = (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta categoria?')) {
      const category = categories.find(c => c.id === id);
      if (category) {
        setCategories(categories.filter(category => category.id !== id));
        setStats(prev => ({ 
          ...prev, 
          total: prev.total - 1, 
          [category.type.toLowerCase()]: prev[category.type.toLowerCase() as keyof CategoryStats] - 1 
        }));
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      type: 'INCOME',
      color: '#10B981',
      icon: ''
    });
  };

  const openEditModal = (category: Category) => {
    setSelectedCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      type: category.type,
      color: category.color || '#10B981',
      icon: category.icon || ''
    });
    setShowEditModal(true);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'INCOME': return { color: '#10B981', backgroundColor: 'rgba(16, 185, 129, 0.2)' };
      case 'EXPENSE': return { color: '#EF4444', backgroundColor: 'rgba(239, 68, 68, 0.2)' };
      case 'TRANSFER': return { color: '#8B5CF6', backgroundColor: 'rgba(139, 92, 246, 0.2)' };
      case 'PRODUCT': return { color: '#3B82F6', backgroundColor: 'rgba(59, 130, 246, 0.2)' };
      default: return { color: '#9CA3AF', backgroundColor: 'rgba(156, 163, 175, 0.2)' };
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'INCOME': return 'Receita';
      case 'EXPENSE': return 'Despesa';
      case 'TRANSFER': return 'Transferência';
      case 'PRODUCT': return 'Produto';
      default: return type;
    }
  };

  const colorOptions = [
    '#10B981', '#3B82F6', '#EF4444', '#F59E0B', '#8B5CF6', '#06B6D4',
    '#84CC16', '#F97316', '#EC4899', '#6366F1', '#14B8A6', '#F43F5E'
  ];

  const iconOptions = [
    '💰', '🔧', '🛒', '🏠', '🔄', '📱', '💻', '🎯', '⭐', '🚀',
    '💡', '🎨', '📊', '🔍', '⚡', '🎪', '🏆', '🌟', '💎', '🎭'
  ];

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
          <p style={{ color: '#9CA3AF' }}>Carregando categorias...</p>
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
            Categorias
          </h1>
          <p style={{ color: '#9CA3AF', margin: '0.5rem 0 0 0' }}>
            Organize suas receitas, despesas e produtos por categorias
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
          Nova Categoria
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
                {stats.total} Categorias
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
                {stats.income}
              </span>
            </div>
            <div>
              <p style={{ color: '#9CA3AF', margin: 0, fontSize: '0.875rem' }}>Receitas</p>
              <p style={{ color: '#FFFFFF', margin: 0, fontSize: '1.5rem', fontWeight: 'bold' }}>
                {stats.income} Categorias
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
                {stats.expense}
              </span>
            </div>
            <div>
              <p style={{ color: '#9CA3AF', margin: 0, fontSize: '0.875rem' }}>Despesas</p>
              <p style={{ color: '#FFFFFF', margin: 0, fontSize: '1.5rem', fontWeight: 'bold' }}>
                {stats.expense} Categorias
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
              backgroundColor: '#8B5CF6',
              borderRadius: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <span style={{ color: '#FFFFFF', fontSize: '1.25rem', fontWeight: 'bold' }}>
                {stats.transfer}
              </span>
            </div>
            <div>
              <p style={{ color: '#9CA3AF', margin: 0, fontSize: '0.875rem' }}>Transferências</p>
              <p style={{ color: '#FFFFFF', margin: 0, fontSize: '1.5rem', fontWeight: 'bold' }}>
                {stats.transfer} Categorias
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
              backgroundColor: '#06B6D4',
              borderRadius: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <span style={{ color: '#FFFFFF', fontSize: '1.25rem', fontWeight: 'bold' }}>
                {stats.product}
              </span>
            </div>
            <div>
              <p style={{ color: '#9CA3AF', margin: 0, fontSize: '0.875rem' }}>Produtos</p>
              <p style={{ color: '#FFFFFF', margin: 0, fontSize: '1.5rem', fontWeight: 'bold' }}>
                {stats.product} Categorias
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
            placeholder="Buscar categorias..."
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
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
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
          <option value="all">Todos os tipos</option>
          <option value="INCOME">Receita</option>
          <option value="EXPENSE">Despesa</option>
          <option value="TRANSFER">Transferência</option>
          <option value="PRODUCT">Produto</option>
        </select>
      </div>

      {/* Categories Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '1.5rem'
      }}>
        {filteredCategories.map((category) => (
          <div
            key={category.id}
            style={{
              backgroundColor: '#1F2937',
              borderRadius: '0.75rem',
              padding: '1.5rem',
              border: '1px solid #374151',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#4B5563';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#374151';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{
                  width: '3rem',
                  height: '3rem',
                  backgroundColor: category.color,
                  borderRadius: '0.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.25rem'
                }}>
                  {category.icon}
                </div>
                <div>
                  <h3 style={{ 
                    color: '#FFFFFF', 
                    margin: 0, 
                    fontSize: '1.125rem', 
                    fontWeight: '600' 
                  }}>
                    {category.name}
                  </h3>
                  <span style={{
                    padding: '0.25rem 0.5rem',
                    borderRadius: '9999px',
                    fontSize: '0.75rem',
                    fontWeight: '500',
                    ...getTypeColor(category.type)
                  }}>
                    {getTypeText(category.type)}
                  </span>
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => openEditModal(category)}
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
                  onClick={() => handleDeleteCategory(category.id)}
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
            </div>

            {category.description && (
              <p style={{ 
                color: '#9CA3AF', 
                margin: 0, 
                fontSize: '0.875rem', 
                lineHeight: '1.5' 
              }}>
                {category.description}
              </p>
            )}

            <div style={{
              marginTop: '1rem',
              paddingTop: '1rem',
              borderTop: '1px solid #374151',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '0.75rem',
              color: '#6B7280'
            }}>
              <span>Criada em {new Date(category.createdAt).toLocaleDateString('pt-BR')}</span>
              <span>Atualizada em {new Date(category.updatedAt).toLocaleDateString('pt-BR')}</span>
            </div>
          </div>
        ))}
      </div>

      {filteredCategories.length === 0 && (
        <div style={{
          padding: '3rem',
          textAlign: 'center',
          color: '#9CA3AF'
        }}>
          <Tag size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
          <p>Nenhuma categoria encontrada</p>
        </div>
      )}

      {/* Add Category Modal */}
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
              Nova Categoria
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
                  placeholder="Nome da categoria"
                />
              </div>

              <div>
                <label style={{ color: '#FFFFFF', fontSize: '0.875rem', fontWeight: '500', display: 'block', marginBottom: '0.5rem' }}>
                  Descrição
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
                  placeholder="Descrição da categoria..."
                />
              </div>

              <div>
                <label style={{ color: '#FFFFFF', fontSize: '0.875rem', fontWeight: '500', display: 'block', marginBottom: '0.5rem' }}>
                  Tipo *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as 'INCOME' | 'EXPENSE' | 'TRANSFER' | 'PRODUCT' })}
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
                  <option value="INCOME">Receita</option>
                  <option value="EXPENSE">Despesa</option>
                  <option value="TRANSFER">Transferência</option>
                  <option value="PRODUCT">Produto</option>
                </select>
              </div>

              <div>
                <label style={{ color: '#FFFFFF', fontSize: '0.875rem', fontWeight: '500', display: 'block', marginBottom: '0.5rem' }}>
                  Cor
                </label>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {colorOptions.map((color) => (
                    <button
                      key={color}
                      onClick={() => setFormData({ ...formData, color })}
                      style={{
                        width: '2rem',
                        height: '2rem',
                        backgroundColor: color,
                        border: formData.color === color ? '2px solid #FFFFFF' : '2px solid transparent',
                        borderRadius: '0.375rem',
                        cursor: 'pointer'
                      }}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label style={{ color: '#FFFFFF', fontSize: '0.875rem', fontWeight: '500', display: 'block', marginBottom: '0.5rem' }}>
                  Ícone
                </label>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {iconOptions.map((icon) => (
                    <button
                      key={icon}
                      onClick={() => setFormData({ ...formData, icon })}
                      style={{
                        width: '2.5rem',
                        height: '2.5rem',
                        backgroundColor: formData.icon === icon ? '#374151' : '#111827',
                        border: '1px solid #374151',
                        borderRadius: '0.375rem',
                        cursor: 'pointer',
                        fontSize: '1.25rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
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
                onClick={handleAddCategory}
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
                Criar Categoria
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Category Modal */}
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
              Editar Categoria
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
                  placeholder="Nome da categoria"
                />
              </div>

              <div>
                <label style={{ color: '#FFFFFF', fontSize: '0.875rem', fontWeight: '500', display: 'block', marginBottom: '0.5rem' }}>
                  Descrição
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
                  placeholder="Descrição da categoria..."
                />
              </div>

              <div>
                <label style={{ color: '#FFFFFF', fontSize: '0.875rem', fontWeight: '500', display: 'block', marginBottom: '0.5rem' }}>
                  Tipo *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as 'INCOME' | 'EXPENSE' | 'TRANSFER' | 'PRODUCT' })}
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
                  <option value="INCOME">Receita</option>
                  <option value="EXPENSE">Despesa</option>
                  <option value="TRANSFER">Transferência</option>
                  <option value="PRODUCT">Produto</option>
                </select>
              </div>

              <div>
                <label style={{ color: '#FFFFFF', fontSize: '0.875rem', fontWeight: '500', display: 'block', marginBottom: '0.5rem' }}>
                  Cor
                </label>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {colorOptions.map((color) => (
                    <button
                      key={color}
                      onClick={() => setFormData({ ...formData, color })}
                      style={{
                        width: '2rem',
                        height: '2rem',
                        backgroundColor: color,
                        border: formData.color === color ? '2px solid #FFFFFF' : '2px solid transparent',
                        borderRadius: '0.375rem',
                        cursor: 'pointer'
                      }}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label style={{ color: '#FFFFFF', fontSize: '0.875rem', fontWeight: '500', display: 'block', marginBottom: '0.5rem' }}>
                  Ícone
                </label>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {iconOptions.map((icon) => (
                    <button
                      key={icon}
                      onClick={() => setFormData({ ...formData, icon })}
                      style={{
                        width: '2.5rem',
                        height: '2.5rem',
                        backgroundColor: formData.icon === icon ? '#374151' : '#111827',
                        border: '1px solid #374151',
                        borderRadius: '0.375rem',
                        cursor: 'pointer',
                        fontSize: '1.25rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
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
                  setSelectedCategory(null);
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
                onClick={handleEditCategory}
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
