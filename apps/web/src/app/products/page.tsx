'use client';

import { useState, useEffect } from 'react';
import {
  Package, 
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  BarChart3
} from 'lucide-react';

export default function ProductsPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showEditProduct, setShowEditProduct] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  
  // Estado inicial dos produtos
  const [products, setProducts] = useState([
    { 
      id: 1, 
      name: 'Produto A', 
      sku: 'PROD-001', 
      category: 'Eletrônicos', 
      price: 299.90, 
      stock: 45, 
      minStock: 10,
      status: 'active'
    },
    { 
      id: 2, 
      name: 'Produto B', 
      sku: 'PROD-002', 
      category: 'Roupas', 
      price: 89.90, 
      stock: 8, 
      minStock: 15,
      status: 'low-stock'
    },
    { 
      id: 3, 
      name: 'Produto C', 
      sku: 'PROD-003', 
      category: 'Casa', 
      price: 159.90, 
      stock: 0, 
      minStock: 5,
      status: 'out-of-stock'
    },
    { 
      id: 4, 
      name: 'Produto D', 
      sku: 'PROD-004', 
      category: 'Eletrônicos', 
      price: 599.90, 
      stock: 23, 
      minStock: 10,
      status: 'active'
    },
    { 
      id: 5, 
      name: 'Produto E', 
      sku: 'PROD-005', 
      category: 'Roupas', 
      price: 49.90, 
      stock: 67, 
      minStock: 15,
      status: 'active'
    }
  ]);

  // Carregar produtos do localStorage após a hidratação
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('timecash-products');
      console.log('Produtos - Carregando do localStorage:', saved); // Adicionado para debug
      if (saved) {
        try {
          const parsedProducts = JSON.parse(saved);
          console.log('Produtos - Parseados do localStorage:', parsedProducts); // Adicionado para debug
          setProducts(parsedProducts);
        } catch (error) {
          console.error('Erro ao carregar produtos do localStorage:', error);
        }
      } else {
        console.log('Produtos - Nenhum produto encontrado no localStorage.'); // Adicionado para debug
      }
    }
  }, []);

  // Estados para o formulário
  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    stock: '',
    category: ''
  });

  // Salvar produtos no localStorage sempre que mudarem
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('timecash-products', JSON.stringify(products));
    }
  }, [products]);

  // Função para adicionar novo produto
  const handleAddProduct = () => {
    if (!newProduct.name || !newProduct.price || !newProduct.stock || !newProduct.category) {
      alert('Por favor, preencha todos os campos!');
      return;
    }

    const newId = Math.max(...products.map(p => p.id)) + 1;
    const newSku = `PROD-${String(newId).padStart(3, '0')}`;
    const price = parseFloat(newProduct.price);
    const stock = parseInt(newProduct.stock);
    const minStock = Math.ceil(stock * 0.2); // 20% do estoque como mínimo
    
    let status = 'active';
    if (stock === 0) status = 'out-of-stock';
    else if (stock <= minStock) status = 'low-stock';

    const product = {
      id: newId,
      name: newProduct.name,
      sku: newSku,
      category: newProduct.category,
      price: price,
      stock: stock,
      minStock: minStock,
      status: status
    };

    const updatedProducts = [...products, product];
    setProducts(updatedProducts);
    
    // Salvar no localStorage
    localStorage.setItem('timecash-products', JSON.stringify(updatedProducts));
    console.log('Produtos - Adicionado e salvo no localStorage:', updatedProducts); // Adicionado para debug
    
    setNewProduct({ name: '', price: '', stock: '', category: '' });
    setShowAddProduct(false);
    alert('Produto adicionado com sucesso!');
  };

  // Função para editar produto
  const handleEditProduct = (product) => {
    setSelectedProduct(product);
    setNewProduct({
      name: product.name,
      price: product.price.toString(),
      stock: product.stock.toString(),
      category: product.category
    });
    setShowEditProduct(true);
  };

  // Função para salvar edição
  const handleSaveEdit = () => {
    if (!newProduct.name || !newProduct.price || !newProduct.stock || !newProduct.category) {
      alert('Por favor, preencha todos os campos!');
      return;
    }

    const price = parseFloat(newProduct.price);
    const stock = parseInt(newProduct.stock);
    const minStock = Math.ceil(stock * 0.2);
    
    let status = 'active';
    if (stock === 0) status = 'out-of-stock';
    else if (stock <= minStock) status = 'low-stock';

    const updatedProducts = products.map(p => 
      p.id === selectedProduct.id 
        ? {
            ...p,
            name: newProduct.name,
            price: price,
            stock: stock,
            minStock: minStock,
            category: newProduct.category,
            status: status
          }
        : p
    );

    setProducts(updatedProducts);
    
    // Salvar no localStorage
    localStorage.setItem('timecash-products', JSON.stringify(updatedProducts));
    console.log('Produtos - Editado e salvo no localStorage:', updatedProducts); // Adicionado para debug
    
    setNewProduct({ name: '', price: '', stock: '', category: '' });
    setShowEditProduct(false);
    setSelectedProduct(null);
    alert('Produto editado com sucesso!');
  };

  // Função para excluir produto
  const handleDeleteProduct = (product) => {
    if (confirm(`Tem certeza que deseja excluir "${product.name}"?`)) {
      const updatedProducts = products.filter(p => p.id !== product.id);
      setProducts(updatedProducts);
      
      // Salvar no localStorage
      localStorage.setItem('timecash-products', JSON.stringify(updatedProducts));
      console.log('Produtos - Deletado e salvo no localStorage:', updatedProducts); // Adicionado para debug
      
      alert('Produto excluído com sucesso!');
    }
  };

  const categories = [
    { name: 'Eletrônicos', count: 2, totalValue: 6598.30 },
    { name: 'Roupas', count: 2, totalValue: 1966.70 },
    { name: 'Casa', count: 1, totalValue: 2398.50 },
  ];

  const totalProducts = products.length;
  const totalValue = products.reduce((sum, product) => sum + (product.price * product.stock), 0);
  const lowStockProducts = products.filter(p => p.stock <= p.minStock).length;
  const outOfStockProducts = products.filter(p => p.stock === 0).length;

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            Produtos
          </h1>
          <p style={{ color: '#9CA3AF', fontSize: '1rem', margin: 0 }}>
            Gerencie seu catálogo e estoque
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
            <BarChart3 size={16} />
            Relatórios
          </button>
          <button 
            onClick={() => setShowAddProduct(true)}
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
            Novo Produto
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
          { id: 'products', name: 'Produtos' },
          { id: 'categories', name: 'Categorias' },
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
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
          {/* Left Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Summary Cards */}
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
                      Total de Produtos
                    </p>
                    <p style={{ fontSize: '1.5rem', fontWeight: '700', color: '#3B82F6', margin: 0 }}>
                      {totalProducts}
                    </p>
                  </div>
                  <Package size={32} color="#3B82F6" />
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
                      Valor do Estoque
                    </p>
                    <p style={{ fontSize: '1.5rem', fontWeight: '700', color: '#10B981', margin: 0 }}>
                      R$ {totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <TrendingUp size={32} color="#10B981" />
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
                      Estoque Baixo
                    </p>
                    <p style={{ fontSize: '1.5rem', fontWeight: '700', color: '#F59E0B', margin: 0 }}>
                      {lowStockProducts}
                    </p>
                  </div>
                  <AlertTriangle size={32} color="#F59E0B" />
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
                      Sem Estoque
                    </p>
                    <p style={{ fontSize: '1.5rem', fontWeight: '700', color: '#EF4444', margin: 0 }}>
                      {outOfStockProducts}
                    </p>
                  </div>
                  <TrendingDown size={32} color="#EF4444" />
                </div>
              </div>
            </div>

            {/* Products List */}
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
                Produtos Recentes
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {products.slice(-5).reverse().map((product) => (
                  <div key={product.id} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '1rem',
                    backgroundColor: '#1F2937',
                    borderRadius: '0.5rem',
                    border: '1px solid rgba(234, 179, 8, 0.1)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{
                        padding: '0.5rem',
                        borderRadius: '0.5rem',
                        backgroundColor: product.status === 'active' ? 'rgba(16, 185, 129, 0.2)' : 
                                        product.status === 'low-stock' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <Package size={16} color={
                          product.status === 'active' ? '#10B981' : 
                          product.status === 'low-stock' ? '#F59E0B' : '#EF4444'
                        } />
                      </div>
                      <div>
                        <p style={{ fontWeight: '500', color: '#F9FAFB', margin: '0 0 0.25rem 0' }}>
                          {product.name}
                        </p>
                        <p style={{ fontSize: '0.875rem', color: '#9CA3AF', margin: 0 }}>
                          {product.sku} • {product.category}
                        </p>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ 
                        fontWeight: '600', 
                        color: '#F9FAFB',
                        margin: '0 0 0.25rem 0'
                      }}>
                        R$ {product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                      <p style={{ 
                        fontSize: '0.875rem', 
                        color: product.stock <= product.minStock ? '#EF4444' : '#9CA3AF',
                        margin: 0 
                      }}>
                        Estoque: {product.stock}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Categories */}
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
              Categorias
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {categories.map((category, index) => (
                <div key={index} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.75rem',
                  backgroundColor: '#1F2937',
                  borderRadius: '0.5rem',
                  border: '1px solid rgba(234, 179, 8, 0.1)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                      width: '0.75rem',
                      height: '0.75rem',
                      borderRadius: '50%',
                      backgroundColor: '#EAB308'
                    }}></div>
                    <div>
                      <p style={{ fontWeight: '500', color: '#F9FAFB', margin: '0 0 0.25rem 0' }}>
                        {category.name}
                      </p>
                      <p style={{ fontSize: '0.75rem', color: '#9CA3AF', margin: 0 }}>
                        {category.count} produtos
                      </p>
                    </div>
                  </div>
                  <span style={{ 
                    fontSize: '0.875rem', 
                    fontWeight: '600',
                    color: '#EAB308'
                  }}>
                    R$ {category.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'products' && (
        <div style={{
          backgroundColor: '#111827',
          border: '1px solid rgba(234, 179, 8, 0.2)',
          borderRadius: '0.75rem',
          padding: '1.5rem',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between', 
            marginBottom: '1.5rem' 
          }}>
            <h2 style={{ 
              fontSize: '1.25rem', 
              fontWeight: '600', 
              color: '#F9FAFB', 
              margin: 0 
            }}>
              Todos os Produtos
            </h2>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <div style={{ position: 'relative' }}>
                <Search 
                  size={18} 
                  style={{ 
                    position: 'absolute', 
                    left: '0.75rem', 
                    top: '50%', 
                    transform: 'translateY(-50%)', 
                    color: '#6B7280' 
                  }} 
                />
                <input
                  type="text"
                  placeholder="Buscar produtos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    width: '16rem',
                    height: '2.5rem',
                    backgroundColor: '#1F2937',
                    border: '1px solid rgba(234, 179, 8, 0.2)',
                    borderRadius: '0.5rem',
                    padding: '0 0.75rem 0 2.5rem',
                    color: '#F9FAFB',
                    fontSize: '0.875rem',
                    outline: 'none',
                    transition: 'all 0.2s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#EAB308'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(234, 179, 8, 0.2)'}
                />
              </div>
              <button style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 1rem',
                backgroundColor: 'transparent',
                border: '1px solid rgba(234, 179, 8, 0.3)',
                borderRadius: '0.5rem',
                color: '#9CA3AF',
                cursor: 'pointer',
                transition: 'all 0.2s',
                fontSize: '0.875rem'
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
            </div>
          </div>
          
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(234, 179, 8, 0.2)' }}>
                  <th style={{ textAlign: 'left', padding: '0.75rem 1rem', color: '#9CA3AF', fontWeight: '500' }}>
                    Produto
                  </th>
                  <th style={{ textAlign: 'left', padding: '0.75rem 1rem', color: '#9CA3AF', fontWeight: '500' }}>
                    Categoria
                  </th>
                  <th style={{ textAlign: 'right', padding: '0.75rem 1rem', color: '#9CA3AF', fontWeight: '500' }}>
                    Preço
                  </th>
                  <th style={{ textAlign: 'center', padding: '0.75rem 1rem', color: '#9CA3AF', fontWeight: '500' }}>
                    Estoque
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
                {filteredProducts.map((product) => (
                  <tr key={product.id} style={{ borderBottom: '1px solid rgba(234, 179, 8, 0.1)' }}>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <div>
                        <p style={{ fontWeight: '500', color: '#F9FAFB', margin: '0 0 0.25rem 0' }}>
                          {product.name}
                        </p>
                        <p style={{ fontSize: '0.875rem', color: '#9CA3AF', margin: 0 }}>
                          {product.sku}
                        </p>
                      </div>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', color: '#9CA3AF' }}>
                      {product.category}
                    </td>
                    <td style={{ 
                      padding: '0.75rem 1rem', 
                      textAlign: 'right', 
                      fontWeight: '600',
                      color: '#F9FAFB'
                    }}>
                      R$ {product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                      <span style={{
                        padding: '0.25rem 0.5rem',
                        borderRadius: '0.25rem',
                        fontSize: '0.75rem',
                        fontWeight: '500',
                        backgroundColor: product.stock === 0 ? 'rgba(239, 68, 68, 0.2)' : 
                                       product.stock <= product.minStock ? 'rgba(245, 158, 11, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                        color: product.stock === 0 ? '#EF4444' : 
                               product.stock <= product.minStock ? '#F59E0B' : '#10B981'
                      }}>
                        {product.stock}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                      <span style={{
                        padding: '0.25rem 0.5rem',
                        borderRadius: '0.25rem',
                        fontSize: '0.75rem',
                        fontWeight: '500',
                        backgroundColor: product.status === 'active' ? 'rgba(16, 185, 129, 0.2)' : 
                                       product.status === 'low-stock' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                        color: product.status === 'active' ? '#10B981' : 
                               product.status === 'low-stock' ? '#F59E0B' : '#EF4444'
                      }}>
                        {product.status === 'active' ? 'Ativo' : 
                         product.status === 'low-stock' ? 'Estoque Baixo' : 'Sem Estoque'}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                        <button 
                          onClick={() => {
                            setSelectedProduct(product);
                            alert(`Visualizando produto: ${product.name}`);
                          }}
                          style={{
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
                        <button 
                          onClick={() => handleEditProduct(product)}
                          style={{
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
                        <button 
                          onClick={() => handleDeleteProduct(product)}
                          style={{
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

      {activeTab === 'categories' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {categories.map((category, index) => (
            <div key={index} style={{
              backgroundColor: '#111827',
              border: '1px solid rgba(234, 179, 8, 0.2)',
              borderRadius: '0.75rem',
              padding: '1.5rem',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <h3 style={{ fontWeight: '600', color: '#F9FAFB', margin: 0 }}>
                  {category.name}
                </h3>
                <div style={{
                  width: '1rem',
                  height: '1rem',
                  borderRadius: '50%',
                  backgroundColor: '#EAB308'
                }}></div>
              </div>
              <p style={{ 
                fontSize: '1.5rem', 
                fontWeight: '700',
                color: '#EAB308',
                margin: '0 0 0.5rem 0'
              }}>
                {category.count} produtos
              </p>
              <p style={{ fontSize: '0.875rem', color: '#9CA3AF', margin: '0 0 1rem 0' }}>
                Valor total: R$ {category.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button style={{
                  flex: 1,
                  padding: '0.5rem',
                  backgroundColor: 'transparent',
                  border: '1px solid rgba(234, 179, 8, 0.3)',
                  borderRadius: '0.375rem',
                  color: '#9CA3AF',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  fontSize: '0.75rem',
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
                  Editar
                </button>
                <button style={{
                  flex: 1,
                  padding: '0.5rem',
                  backgroundColor: 'transparent',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: '0.375rem',
                  color: '#9CA3AF',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  fontSize: '0.75rem',
                  fontWeight: '500'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
                  e.currentTarget.style.borderColor = '#EF4444';
                  e.currentTarget.style.color = '#EF4444';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.3)';
                  e.currentTarget.style.color = '#9CA3AF';
                }}
                >
                  Excluir
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Novo Produto */}
      {showAddProduct && (
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
              Adicionar Novo Produto
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
              <div>
                <label style={{ display: 'block', color: '#9CA3AF', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                  Nome do Produto
                </label>
                <input
                  type="text"
                  placeholder="Ex: Produto Incrível"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    backgroundColor: '#1F2937',
                    border: '1px solid rgba(234, 179, 8, 0.2)',
                    borderRadius: '0.5rem',
                    color: '#F9FAFB',
                    fontSize: '0.875rem',
                    outline: 'none'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#EAB308'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(234, 179, 8, 0.2)'}
                />
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', color: '#9CA3AF', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                    Preço (R$)
                  </label>
                  <input
                    type="number"
                    placeholder="0,00"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      backgroundColor: '#1F2937',
                      border: '1px solid rgba(234, 179, 8, 0.2)',
                      borderRadius: '0.5rem',
                      color: '#F9FAFB',
                      fontSize: '0.875rem',
                      outline: 'none'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#EAB308'}
                    onBlur={(e) => e.target.style.borderColor = 'rgba(234, 179, 8, 0.2)'}
                  />
                </div>
                
                <div>
                  <label style={{ display: 'block', color: '#9CA3AF', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                    Estoque
                  </label>
                  <input
                    type="number"
                    placeholder="0"
                    value={newProduct.stock}
                    onChange={(e) => setNewProduct({...newProduct, stock: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      backgroundColor: '#1F2937',
                      border: '1px solid rgba(234, 179, 8, 0.2)',
                      borderRadius: '0.5rem',
                      color: '#F9FAFB',
                      fontSize: '0.875rem',
                      outline: 'none'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#EAB308'}
                    onBlur={(e) => e.target.style.borderColor = 'rgba(234, 179, 8, 0.2)'}
                  />
                </div>
              </div>
              
              <div>
                <label style={{ display: 'block', color: '#9CA3AF', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                  Categoria
                </label>
                <select
                  value={newProduct.category}
                  onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    backgroundColor: '#1F2937',
                    border: '1px solid rgba(234, 179, 8, 0.2)',
                    borderRadius: '0.5rem',
                    color: '#F9FAFB',
                    fontSize: '0.875rem',
                    outline: 'none'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#EAB308'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(234, 179, 8, 0.2)'}
                >
                  <option value="">Selecione uma categoria</option>
                  <option value="Eletrônicos">Eletrônicos</option>
                  <option value="Roupas">Roupas</option>
                  <option value="Casa">Casa</option>
                  <option value="Esportes">Esportes</option>
                </select>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setShowAddProduct(false);
                  setNewProduct({ name: '', price: '', stock: '', category: '' });
                }}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: 'transparent',
                  border: '1px solid rgba(107, 114, 128, 0.3)',
                  borderRadius: '0.5rem',
                  color: '#9CA3AF',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  fontSize: '0.875rem',
                  fontWeight: '500'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(107, 114, 128, 0.1)';
                  e.currentTarget.style.borderColor = '#6B7280';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.borderColor = 'rgba(107, 114, 128, 0.3)';
                }}
              >
                Cancelar
              </button>
              
              <button
                onClick={handleAddProduct}
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
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#D97706';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#EAB308';
                }}
              >
                Adicionar Produto
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Editar Produto */}
      {showEditProduct && (
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
            borderRadius: '1rem',
            padding: '2rem',
            width: '90%',
            maxWidth: '500px',
            border: '1px solid rgba(234, 179, 8, 0.3)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between', 
              marginBottom: '1.5rem' 
            }}>
              <h2 style={{ 
                color: '#F9FAFB', 
                fontSize: '1.5rem', 
                fontWeight: '600', 
                margin: 0 
              }}>
                Editar Produto
              </h2>
              <button
                onClick={() => {
                  setShowEditProduct(false);
                  setNewProduct({ name: '', price: '', stock: '', category: '' });
                  setSelectedProduct(null);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#9CA3AF',
                  cursor: 'pointer',
                  fontSize: '1.5rem',
                  padding: '0.25rem'
                }}
              >
                ×
              </button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
              <div>
                <label style={{ display: 'block', color: '#9CA3AF', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                  Nome do Produto
                </label>
                <input
                  type="text"
                  placeholder="Ex: Produto Incrível"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    backgroundColor: '#1F2937',
                    border: '1px solid rgba(234, 179, 8, 0.2)',
                    borderRadius: '0.5rem',
                    color: '#F9FAFB',
                    fontSize: '0.875rem',
                    outline: 'none'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#EAB308'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(234, 179, 8, 0.2)'}
                />
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', color: '#9CA3AF', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                    Preço (R$)
                  </label>
                  <input
                    type="number"
                    placeholder="0,00"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      backgroundColor: '#1F2937',
                      border: '1px solid rgba(234, 179, 8, 0.2)',
                      borderRadius: '0.5rem',
                      color: '#F9FAFB',
                      fontSize: '0.875rem',
                      outline: 'none'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#EAB308'}
                    onBlur={(e) => e.target.style.borderColor = 'rgba(234, 179, 8, 0.2)'}
                  />
                </div>
                
                <div>
                  <label style={{ display: 'block', color: '#9CA3AF', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                    Estoque
                  </label>
                  <input
                    type="number"
                    placeholder="0"
                    value={newProduct.stock}
                    onChange={(e) => setNewProduct({...newProduct, stock: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      backgroundColor: '#1F2937',
                      border: '1px solid rgba(234, 179, 8, 0.2)',
                      borderRadius: '0.5rem',
                      color: '#F9FAFB',
                      fontSize: '0.875rem',
                      outline: 'none'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#EAB308'}
                    onBlur={(e) => e.target.style.borderColor = 'rgba(234, 179, 8, 0.2)'}
                  />
                </div>
              </div>
              
              <div>
                <label style={{ display: 'block', color: '#9CA3AF', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                  Categoria
                </label>
                <select
                  value={newProduct.category}
                  onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    backgroundColor: '#1F2937',
                    border: '1px solid rgba(234, 179, 8, 0.2)',
                    borderRadius: '0.5rem',
                    color: '#F9FAFB',
                    fontSize: '0.875rem',
                    outline: 'none'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#EAB308'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(234, 179, 8, 0.2)'}
                >
                  <option value="">Selecione uma categoria</option>
                  <option value="Eletrônicos">Eletrônicos</option>
                  <option value="Roupas">Roupas</option>
                  <option value="Casa">Casa</option>
                  <option value="Esportes">Esportes</option>
                </select>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setShowEditProduct(false);
                  setNewProduct({ name: '', price: '', stock: '', category: '' });
                  setSelectedProduct(null);
                }}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: 'transparent',
                  border: '1px solid rgba(107, 114, 128, 0.3)',
                  borderRadius: '0.5rem',
                  color: '#9CA3AF',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  fontSize: '0.875rem',
                  fontWeight: '500'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(107, 114, 128, 0.1)';
                  e.currentTarget.style.borderColor = '#6B7280';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.borderColor = 'rgba(107, 114, 128, 0.3)';
                }}
              >
                Cancelar
              </button>
              
              <button
                onClick={handleSaveEdit}
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
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#D97706';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#EAB308';
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
