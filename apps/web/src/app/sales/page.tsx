'use client';

import { useState, useEffect } from 'react';
import { 
  ShoppingCart, 
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  User,
  Package,
  RefreshCw
} from 'lucide-react';

// Interfaces TypeScript
interface Product {
  id: string | number;
  name: string;
  price: number;
  stock: number;
  category?: string;
}

interface SaleItem {
  id: string | number;
  name: string;
  price: number;
  quantity: number;
  category?: string;
}

interface Sale {
  id: number;
  customer: string;
  customerId?: string;
  customerEmail?: string;
  customerPhone?: string;
  products: string[];
  total: number;
  date: string;
  status: 'completed' | 'pending' | 'cancelled';
  paymentMethod: string;
  items: number;
  notes?: string;
}

interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface NewSaleForm {
  customer: string;
  customerId: string;
  customerEmail: string;
  customerPhone: string;
  selectedProducts: SaleItem[];
  total: number;
  date: string;
  status: 'completed' | 'pending' | 'cancelled';
  paymentMethod: string;
  notes: string;
}

export default function SalesPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [showAddSale, setShowAddSale] = useState(false);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Estado inicial das vendas
  const [sales, setSales] = useState<Sale[]>([
    { 
      id: 1, 
      customer: 'João Silva', 
      products: ['Produto A', 'Produto B'], 
      total: 389.80, 
      date: '15/01/2024',
      status: 'completed',
      paymentMethod: 'Cartão',
      items: 2
    },
    { 
      id: 2, 
      customer: 'Maria Santos', 
      products: ['Produto C'], 
      total: 159.90, 
      date: '14/01/2024',
      status: 'pending',
      paymentMethod: 'PIX',
      items: 1
    },
    { 
      id: 3, 
      customer: 'Pedro Costa', 
      products: ['Produto D', 'Produto E', 'Produto A'], 
      total: 949.70, 
      date: '13/01/2024',
      status: 'completed',
      paymentMethod: 'Dinheiro',
      items: 3
    },
    { 
      id: 4, 
      customer: 'Ana Oliveira', 
      products: ['Produto B'], 
      total: 89.90, 
      date: '12/01/2024',
      status: 'cancelled',
      paymentMethod: 'Cartão',
      items: 1
    },
    { 
      id: 5, 
      customer: 'Carlos Lima', 
      products: ['Produto C', 'Produto D'], 
      total: 759.80, 
      date: '11/01/2024',
      status: 'completed',
      paymentMethod: 'PIX',
      items: 2
    },
  ]);

  // Estado para o formulário de nova venda
  const [newSale, setNewSale] = useState<NewSaleForm>({
    customer: '',
    customerId: '',
    customerEmail: '',
    customerPhone: '',
    selectedProducts: [],
    total: 0,
    date: new Date().toISOString().split('T')[0],
    status: 'completed',
    paymentMethod: 'PIX',
    notes: ''
  });

  // Estado para produtos disponíveis (carregados do localStorage)
  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);
  
  // Estado para clientes registrados
  const [registeredCustomers, setRegisteredCustomers] = useState<Customer[]>([]);
  
  // Estado para controle de dropdowns
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const [showNewCustomerForm, setShowNewCustomerForm] = useState(false);

  // Carregar vendas do localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('timecash-sales');
      if (saved) {
        try {
          const parsedSales = JSON.parse(saved);
          
          // Carregar clientes registrados para filtrar vendas
          const customersSaved = localStorage.getItem('timecash-customers');
          if (customersSaved) {
            const registeredCustomers = JSON.parse(customersSaved);
            const registeredCustomerNames = registeredCustomers.map((c: Customer) => c.name.toLowerCase());
            
            // Filtrar apenas vendas com clientes registrados
            const filteredSales = parsedSales.filter((sale: Sale) => 
              !sale.customer || registeredCustomerNames.includes(sale.customer.toLowerCase())
            );
            
            setSales(filteredSales);
            
            // Se houve filtragem, salvar as vendas filtradas
            if (filteredSales.length !== parsedSales.length) {
              localStorage.setItem('timecash-sales', JSON.stringify(filteredSales));
            }
          } else {
            setSales(parsedSales);
          }
        } catch (error) {
          console.error('Erro ao carregar vendas do localStorage:', error);
        }
      }
    }
  }, []);

  // Carregar produtos do localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('timecash-products');
      if (saved) {
        try {
          const parsedProducts = JSON.parse(saved);
          setAvailableProducts(parsedProducts);
        } catch (error) {
          console.error('Erro ao carregar produtos do localStorage:', error);
        }
      }
    }
  }, []);


  // Carregar clientes registrados do localStorage
  useEffect(() => {
    const loadCustomers = () => {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('timecash-customers');
        if (saved) {
          try {
            const parsedCustomers = JSON.parse(saved);
            setRegisteredCustomers(parsedCustomers);
            
            // Limpar vendas antigas que referenciam clientes não registrados
            const registeredCustomerNames = parsedCustomers.map((c: Customer) => c.name.toLowerCase());
            const updatedSales = sales.filter(sale => 
              !sale.customer || registeredCustomerNames.includes(sale.customer.toLowerCase())
            );
            
            if (updatedSales.length !== sales.length) {
              setSales(updatedSales);
              localStorage.setItem('timecash-sales', JSON.stringify(updatedSales));
            }
          } catch (error) {
            console.error('Erro ao carregar clientes do localStorage:', error);
          }
        }
      }
    };

    // Carregar clientes inicialmente
    loadCustomers();

    // Listener para mudanças no localStorage
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'timecash-customers') {
        loadCustomers();
      }
    };

    // Adicionar listener
    window.addEventListener('storage', handleStorageChange);

    // Verificar mudanças a cada 2 segundos (para mudanças na mesma aba)
    const interval = setInterval(loadCustomers, 2000);

    // Cleanup
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [sales]);

  // Calcular total automaticamente quando produtos selecionados mudarem
  useEffect(() => {
    const total = newSale.selectedProducts.reduce((sum, product) => {
      return sum + (product.price * product.quantity);
    }, 0);
    setNewSale(prev => ({ ...prev, total }));
  }, [newSale.selectedProducts]);

  // Salvar vendas no localStorage sempre que mudarem
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('timecash-sales', JSON.stringify(sales));
    }
  }, [sales]);

  // Função para adicionar produto à venda
  const addProductToSale = (product: Product) => {
    const existingProduct = newSale.selectedProducts.find(p => p.id === product.id);
    if (existingProduct) {
      // Se o produto já existe, aumenta a quantidade
      setNewSale(prev => ({
        ...prev,
        selectedProducts: prev.selectedProducts.map(p =>
          p.id === product.id ? { ...p, quantity: p.quantity + 1 } : p
        )
      }));
    } else {
      // Se é um produto novo, adiciona com quantidade 1
      const newSaleItem: SaleItem = {
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        category: product.category
      };
      setNewSale(prev => ({
        ...prev,
        selectedProducts: [...prev.selectedProducts, newSaleItem]
      }));
    }
  };

  // Função para remover produto da venda
  const removeProductFromSale = (productId: string | number) => {
    setNewSale(prev => ({
      ...prev,
      selectedProducts: prev.selectedProducts.filter(p => p.id !== productId)
    }));
  };

  // Função para alterar quantidade de um produto
  const updateProductQuantity = (productId: string | number, quantity: number) => {
    if (quantity <= 0) {
      removeProductFromSale(productId);
      return;
    }
    setNewSale(prev => ({
      ...prev,
      selectedProducts: prev.selectedProducts.map(p =>
        p.id === productId ? { ...p, quantity } : p
      )
    }));
  };

  // Função para adicionar nova venda
  const handleAddSale = () => {
    if (!newSale.customer || newSale.selectedProducts.length === 0) {
      alert('Por favor, preencha o nome do cliente e selecione pelo menos um produto!');
      return;
    }

    const newId = Math.max(...sales.map(s => s.id)) + 1;
    const formattedDate = new Date(newSale.date).toLocaleDateString('pt-BR');
    
    const sale: Sale = {
      id: newId,
      customer: newSale.customer,
      customerId: newSale.customerId,
      customerEmail: newSale.customerEmail,
      customerPhone: newSale.customerPhone,
      products: newSale.selectedProducts.map(p => p.name),
      total: newSale.total,
      date: formattedDate,
      status: newSale.status,
      paymentMethod: newSale.paymentMethod,
      items: newSale.selectedProducts.reduce((sum, p) => sum + p.quantity, 0),
      notes: newSale.notes
    };

    setSales([...sales, sale]);
    setNewSale({
      customer: '',
      customerId: '',
      customerEmail: '',
      customerPhone: '',
      selectedProducts: [],
      total: 0,
      date: new Date().toISOString().split('T')[0],
      status: 'completed',
      paymentMethod: 'PIX',
      notes: ''
    });
    setShowAddSale(false);
    alert('Venda adicionada com sucesso!');
  };

  // Função para selecionar cliente registrado
  const selectCustomer = (customer: Customer) => {
    setNewSale(prev => ({
      ...prev,
      customer: customer.name,
      customerId: customer.id,
      customerEmail: customer.email || '',
      customerPhone: customer.phone || ''
    }));
    setShowCustomerDropdown(false);
  };

  // Função para recarregar clientes
  const refreshCustomers = () => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('timecash-customers');
      if (saved) {
        try {
          const parsedCustomers = JSON.parse(saved);
          setRegisteredCustomers(parsedCustomers);
          
          // Limpar vendas antigas que referenciam clientes não registrados
          const registeredCustomerNames = parsedCustomers.map((c: Customer) => c.name.toLowerCase());
          const updatedSales = sales.filter(sale => 
            !sale.customer || registeredCustomerNames.includes(sale.customer.toLowerCase())
          );
          
          if (updatedSales.length !== sales.length) {
            setSales(updatedSales);
            localStorage.setItem('timecash-sales', JSON.stringify(updatedSales));
            alert(`Foram removidas ${sales.length - updatedSales.length} vendas com clientes não registrados.`);
          }
        } catch (error) {
          console.error('Erro ao carregar clientes do localStorage:', error);
        }
      }
    }
  };

  // Função para limpar dados antigos
  const clearOldData = () => {
    if (confirm('Tem certeza que deseja limpar todas as vendas antigas? Isso removerá vendas com clientes não registrados.')) {
      const saved = localStorage.getItem('timecash-customers');
      if (saved) {
        try {
          const registeredCustomers = JSON.parse(saved);
          const registeredCustomerNames = registeredCustomers.map((c: Customer) => c.name.toLowerCase());
          
          // Manter apenas vendas com clientes registrados
          const filteredSales = sales.filter(sale => 
            !sale.customer || registeredCustomerNames.includes(sale.customer.toLowerCase())
          );
          
          setSales(filteredSales);
          localStorage.setItem('timecash-sales', JSON.stringify(filteredSales));
          
          alert(`Dados limpos! Foram removidas ${sales.length - filteredSales.length} vendas com clientes não registrados.`);
        } catch (error) {
          console.error('Erro ao limpar dados:', error);
        }
      }
    }
  };

  // Função para adicionar novo cliente rapidamente
  const addQuickCustomer = () => {
    if (!newSale.customer.trim()) {
      alert('Por favor, digite o nome do cliente!');
      return;
    }

    const newCustomer: Customer = {
      id: Date.now().toString(),
      name: newSale.customer,
      email: newSale.customerEmail,
      phone: newSale.customerPhone,
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Salvar no localStorage
    const existingCustomers = JSON.parse(localStorage.getItem('timecash-customers') || '[]');
    const updatedCustomers = [...existingCustomers, newCustomer];
    localStorage.setItem('timecash-customers', JSON.stringify(updatedCustomers));
    
    setRegisteredCustomers(updatedCustomers);
    setNewSale(prev => ({
      ...prev,
      customerId: newCustomer.id
    }));
    
    setShowNewCustomerForm(false);
    alert('Cliente adicionado com sucesso!');
  };

  // Função para cancelar e limpar formulário
  const handleCancel = () => {
    setNewSale({
      customer: '',
      customerId: '',
      customerEmail: '',
      customerPhone: '',
      selectedProducts: [],
      total: 0,
      date: new Date().toISOString().split('T')[0],
      status: 'completed',
      paymentMethod: 'PIX',
      notes: ''
    });
    setShowAddSale(false);
    setShowNewCustomerForm(false);
  };

  const totalSales = sales.filter(s => s.status === 'completed').reduce((sum, s) => sum + s.total, 0);
  const pendingSales = sales.filter(s => s.status === 'pending').length;
  const completedSales = sales.filter(s => s.status === 'completed').length;
  const cancelledSales = sales.filter(s => s.status === 'cancelled').length;

  const filteredSales = sales.filter(sale =>
    sale.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sale.products.some(p => p.toLowerCase().includes(searchTerm.toLowerCase()))
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
            Vendas
          </h1>
          <p style={{ color: '#9CA3AF', fontSize: '1rem', margin: 0 }}>
            Gerencie suas vendas e pedidos
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
            Relatórios
          </button>
          <button 
            onClick={clearOldData}
            style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1rem',
            backgroundColor: '#EF4444',
            border: 'none',
            borderRadius: '0.5rem',
            color: '#FFFFFF',
            cursor: 'pointer',
            transition: 'all 0.2s',
            fontSize: '0.875rem',
            fontWeight: '600',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#DC2626';
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.boxShadow = '0 6px 8px -1px rgba(0, 0, 0, 0.15)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#EF4444';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
          }}
          >
            <Trash2 size={16} />
            Limpar Dados Antigos
          </button>
          <button 
            onClick={() => setShowAddSale(true)}
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
            Nova Venda
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
                      Total de Vendas
                    </p>
                    <p style={{ fontSize: '1.5rem', fontWeight: '700', color: '#10B981', margin: 0 }}>
                      R$ {totalSales.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
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
                      Vendas Concluídas
                    </p>
                    <p style={{ fontSize: '1.5rem', fontWeight: '700', color: '#3B82F6', margin: 0 }}>
                      {completedSales}
                    </p>
                  </div>
                  <TrendingUp size={32} color="#3B82F6" />
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
                      Pendentes
                    </p>
                    <p style={{ fontSize: '1.5rem', fontWeight: '700', color: '#F59E0B', margin: 0 }}>
                      {pendingSales}
                    </p>
                  </div>
                  <Calendar size={32} color="#F59E0B" />
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
                      Canceladas
                    </p>
                    <p style={{ fontSize: '1.5rem', fontWeight: '700', color: '#EF4444', margin: 0 }}>
                      {cancelledSales}
                    </p>
                  </div>
                  <TrendingDown size={32} color="#EF4444" />
                </div>
              </div>
            </div>

            {/* Recent Sales */}
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
                Vendas Recentes
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {sales.slice(0, 5).map((sale) => (
                  <div key={sale.id} style={{
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
                        backgroundColor: sale.status === 'completed' ? 'rgba(16, 185, 129, 0.2)' : 
                                        sale.status === 'pending' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <ShoppingCart size={16} color={
                          sale.status === 'completed' ? '#10B981' : 
                          sale.status === 'pending' ? '#F59E0B' : '#EF4444'
                        } />
                      </div>
                      <div>
                        <p style={{ fontWeight: '500', color: '#F9FAFB', margin: '0 0 0.25rem 0' }}>
                          {sale.customer}
                        </p>
                        <p style={{ fontSize: '0.875rem', color: '#9CA3AF', margin: 0 }}>
                          {sale.items} item(s) • {sale.paymentMethod}
                        </p>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ 
                        fontWeight: '600', 
                        color: '#F9FAFB',
                        margin: '0 0 0.25rem 0'
                      }}>
                        R$ {sale.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                      <p style={{ 
                        fontSize: '0.875rem', 
                        color: sale.status === 'completed' ? '#10B981' : 
                               sale.status === 'pending' ? '#F59E0B' : '#EF4444',
                        margin: 0 
                      }}>
                        {sale.status === 'completed' ? 'Concluída' : 
                         sale.status === 'pending' ? 'Pendente' : 'Cancelada'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Payment Methods */}
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
              Métodos de Pagamento
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {[
                { name: 'PIX', count: 2, total: 919.70, color: '#10B981' },
                { name: 'Cartão', count: 2, total: 479.70, color: '#3B82F6' },
                { name: 'Dinheiro', count: 1, total: 949.70, color: '#F59E0B' },
              ].map((method, index) => (
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
                      backgroundColor: method.color
                    }}></div>
                    <div>
                      <p style={{ fontWeight: '500', color: '#F9FAFB', margin: '0 0 0.25rem 0' }}>
                        {method.name}
                      </p>
                      <p style={{ fontSize: '0.75rem', color: '#9CA3AF', margin: 0 }}>
                        {method.count} vendas
                      </p>
                    </div>
                  </div>
                  <span style={{ 
                    fontSize: '0.875rem', 
                    fontWeight: '600',
                    color: '#EAB308'
                  }}>
                    R$ {method.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'sales' && (
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
              Todas as Vendas
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
                  placeholder="Buscar vendas..."
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
                  onFocus={(e) => e.currentTarget.style.borderColor = '#EAB308'}
                  onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(234, 179, 8, 0.2)'}
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
                    Cliente
                  </th>
                  <th style={{ textAlign: 'left', padding: '0.75rem 1rem', color: '#9CA3AF', fontWeight: '500' }}>
                    Produtos
                  </th>
                  <th style={{ textAlign: 'left', padding: '0.75rem 1rem', color: '#9CA3AF', fontWeight: '500' }}>
                    Data
                  </th>
                  <th style={{ textAlign: 'right', padding: '0.75rem 1rem', color: '#9CA3AF', fontWeight: '500' }}>
                    Total
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
                {filteredSales.map((sale) => (
                  <tr key={sale.id} style={{ borderBottom: '1px solid rgba(234, 179, 8, 0.1)' }}>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <User size={16} color="#9CA3AF" />
                        <span style={{ color: '#F9FAFB' }}>{sale.customer}</span>
                      </div>
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Package size={16} color="#9CA3AF" />
                        <span style={{ color: '#9CA3AF' }}>{sale.items} item(s)</span>
                      </div>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', color: '#9CA3AF' }}>
                      {sale.date}
                    </td>
                    <td style={{ 
                      padding: '0.75rem 1rem', 
                      textAlign: 'right', 
                      fontWeight: '600',
                      color: '#F9FAFB'
                    }}>
                      R$ {sale.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                      <span style={{
                        padding: '0.25rem 0.5rem',
                        borderRadius: '0.25rem',
                        fontSize: '0.75rem',
                        fontWeight: '500',
                        backgroundColor: sale.status === 'completed' ? 'rgba(16, 185, 129, 0.2)' : 
                                       sale.status === 'pending' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                        color: sale.status === 'completed' ? '#10B981' : 
                               sale.status === 'pending' ? '#F59E0B' : '#EF4444'
                      }}>
                        {sale.status === 'completed' ? 'Concluída' : 
                         sale.status === 'pending' ? 'Pendente' : 'Cancelada'}
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

      {activeTab === 'customers' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {[
            { name: 'João Silva', email: 'joao@email.com', totalPurchases: 3, totalValue: 1339.50 },
            { name: 'Maria Santos', email: 'maria@email.com', totalPurchases: 1, totalValue: 159.90 },
            { name: 'Pedro Costa', email: 'pedro@email.com', totalPurchases: 1, totalValue: 949.70 },
            { name: 'Ana Oliveira', email: 'ana@email.com', totalPurchases: 1, totalValue: 89.90 },
            { name: 'Carlos Lima', email: 'carlos@email.com', totalPurchases: 1, totalValue: 759.80 },
          ].map((customer, index) => (
            <div key={index} style={{
              backgroundColor: '#111827',
              border: '1px solid rgba(234, 179, 8, 0.2)',
              borderRadius: '0.75rem',
              padding: '1.5rem',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <h3 style={{ fontWeight: '600', color: '#F9FAFB', margin: 0 }}>
                  {customer.name}
                </h3>
                <div style={{
                  width: '2rem',
                  height: '2rem',
                  borderRadius: '50%',
                  backgroundColor: '#EAB308',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#000000',
                  fontWeight: '600',
                  fontSize: '0.875rem'
                }}>
                  {customer.name.split(' ').map(n => n[0]).join('')}
                </div>
              </div>
              <p style={{ fontSize: '0.875rem', color: '#9CA3AF', margin: '0 0 1rem 0' }}>
                {customer.email}
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div>
                  <p style={{ fontSize: '0.75rem', color: '#9CA3AF', margin: '0 0 0.25rem 0' }}>
                    Compras
                  </p>
                  <p style={{ fontSize: '1.25rem', fontWeight: '700', color: '#3B82F6', margin: 0 }}>
                    {customer.totalPurchases}
                  </p>
                </div>
                <div>
                  <p style={{ fontSize: '0.75rem', color: '#9CA3AF', margin: '0 0 0.25rem 0' }}>
                    Total Gasto
                  </p>
                  <p style={{ fontSize: '1.25rem', fontWeight: '700', color: '#EAB308', margin: 0 }}>
                    R$ {customer.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
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
                  Ver Histórico
                </button>
                <button style={{
                  flex: 1,
                  padding: '0.5rem',
                  backgroundColor: 'transparent',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  borderRadius: '0.375rem',
                  color: '#9CA3AF',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  fontSize: '0.75rem',
                  fontWeight: '500'
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
                  Contatar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Nova Venda */}
      {showAddSale && (
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
              Nova Venda
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
              {/* Cliente */}
              <div>
                <label style={{ display: 'block', color: '#9CA3AF', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                  Cliente *
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    value={newSale.customer}
                    onChange={(e) => setNewSale({...newSale, customer: e.target.value})}
                    placeholder="Digite ou selecione um cliente"
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
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#EAB308';
                      setShowCustomerDropdown(true);
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(234, 179, 8, 0.2)';
                      // Delay para permitir clique no dropdown
                      setTimeout(() => setShowCustomerDropdown(false), 200);
                    }}
                  />
                  
                  {/* Dropdown de Clientes */}
                  {showCustomerDropdown && (
                    <div style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      right: 0,
                      backgroundColor: '#1F2937',
                      border: '1px solid rgba(234, 179, 8, 0.3)',
                      borderRadius: '0.5rem',
                      marginTop: '0.25rem',
                      maxHeight: '200px',
                      overflowY: 'auto',
                      zIndex: 10,
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}>
                      {/* Cabeçalho do Dropdown */}
                      <div style={{
                        padding: '0.5rem 0.75rem',
                        borderBottom: '1px solid rgba(234, 179, 8, 0.1)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        backgroundColor: 'rgba(234, 179, 8, 0.05)'
                      }}>
                        <span style={{ 
                          color: '#EAB308', 
                          fontSize: '0.75rem', 
                          fontWeight: '500' 
                        }}>
                          Clientes ({registeredCustomers.length})
                        </span>
                        <button
                          onClick={refreshCustomers}
                          style={{
                            padding: '0.25rem',
                            backgroundColor: 'transparent',
                            border: 'none',
                            color: '#EAB308',
                            cursor: 'pointer',
                            borderRadius: '0.25rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                          title="Atualizar lista de clientes"
                        >
                          <RefreshCw size={14} />
                        </button>
                      </div>
                      
                      {/* Clientes Registrados */}
                      {registeredCustomers.length === 0 ? (
                        <div style={{
                          padding: '0.75rem',
                          color: '#9CA3AF',
                          fontSize: '0.875rem',
                          textAlign: 'center'
                        }}>
                          Nenhum cliente registrado. Vá para a página de Clientes para adicionar.
                        </div>
                      ) : (
                        registeredCustomers
                          .filter(customer => 
                            customer.name.toLowerCase().includes(newSale.customer.toLowerCase())
                          )
                          .map((customer) => (
                            <div
                              key={customer.id}
                              onClick={() => selectCustomer(customer)}
                              style={{
                                padding: '0.75rem',
                                cursor: 'pointer',
                                borderBottom: '1px solid rgba(234, 179, 8, 0.1)',
                                color: '#F9FAFB',
                                fontSize: '0.875rem'
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(234, 179, 8, 0.1)'}
                              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                            >
                              <div>
                                <div style={{ fontWeight: '500' }}>{customer.name}</div>
                                {customer.email && (
                                  <div style={{ color: '#9CA3AF', fontSize: '0.75rem' }}>
                                    {customer.email}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))
                      )}
                      
                      
                      {/* Opção para adicionar novo cliente */}
                      {newSale.customer && !registeredCustomers.some(rc => 
                        rc.name.toLowerCase() === newSale.customer.toLowerCase()
                      ) && (
                        <div
                          onClick={() => setShowNewCustomerForm(true)}
                          style={{
                            padding: '0.75rem',
                            cursor: 'pointer',
                            borderBottom: '1px solid rgba(234, 179, 8, 0.1)',
                            color: '#EAB308',
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            backgroundColor: 'rgba(234, 179, 8, 0.1)'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(234, 179, 8, 0.2)'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(234, 179, 8, 0.1)'}
                        >
                          + Adicionar "{newSale.customer}" como novo cliente
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Email e Telefone do Cliente */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', color: '#9CA3AF', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                    Email
                  </label>
                  <input
                    type="email"
                    value={newSale.customerEmail}
                    onChange={(e) => setNewSale({...newSale, customerEmail: e.target.value})}
                    placeholder="email@exemplo.com"
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
                    onFocus={(e) => e.currentTarget.style.borderColor = '#EAB308'}
                    onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(234, 179, 8, 0.2)'}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', color: '#9CA3AF', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                    Telefone
                  </label>
                  <input
                    type="tel"
                    value={newSale.customerPhone}
                    onChange={(e) => setNewSale({...newSale, customerPhone: e.target.value})}
                    placeholder="(11) 99999-9999"
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
                    onFocus={(e) => e.currentTarget.style.borderColor = '#EAB308'}
                    onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(234, 179, 8, 0.2)'}
                  />
                </div>
              </div>

              {/* Seleção de Produtos */}
              <div>
                <label style={{ display: 'block', color: '#9CA3AF', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                  Adicionar Produto *
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    placeholder="Digite o nome do produto para buscar"
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
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#EAB308';
                      setShowProductDropdown(true);
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(234, 179, 8, 0.2)';
                      setTimeout(() => setShowProductDropdown(false), 200);
                    }}
                  />
                  
                  {/* Dropdown de Produtos */}
                  {showProductDropdown && availableProducts.length > 0 && (
                    <div style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      right: 0,
                      backgroundColor: '#1F2937',
                      border: '1px solid rgba(234, 179, 8, 0.3)',
                      borderRadius: '0.5rem',
                      marginTop: '0.25rem',
                      maxHeight: '200px',
                      overflowY: 'auto',
                      zIndex: 10,
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}>
                      {availableProducts.map((product) => (
                        <div
                          key={product.id}
                          onClick={() => {
                            addProductToSale(product);
                            setShowProductDropdown(false);
                          }}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '0.75rem',
                            cursor: 'pointer',
                            borderBottom: '1px solid rgba(234, 179, 8, 0.1)',
                            color: '#F9FAFB',
                            fontSize: '0.875rem'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(234, 179, 8, 0.1)'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                          <div>
                            <span style={{ fontWeight: '500' }}>{product.name}</span>
                            <span style={{ color: '#9CA3AF', fontSize: '0.75rem', marginLeft: '0.5rem' }}>
                              (Estoque: {product.stock})
                            </span>
                          </div>
                          <span style={{ color: '#EAB308', fontWeight: '600' }}>
                            R$ {product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <p style={{ color: '#6B7280', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                  Clique no campo e selecione um produto da lista
                </p>
              </div>

              {/* Produtos Selecionados */}
              {newSale.selectedProducts.length > 0 && (
                <div>
                  <label style={{ display: 'block', color: '#9CA3AF', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                    Produtos Selecionados
                  </label>
                  <div style={{ 
                    border: '1px solid rgba(234, 179, 8, 0.2)', 
                    borderRadius: '0.5rem',
                    backgroundColor: '#1F2937',
                    padding: '0.5rem'
                  }}>
                    {newSale.selectedProducts.map((product) => (
                      <div key={product.id} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '0.5rem',
                        borderBottom: '1px solid rgba(234, 179, 8, 0.1)'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ color: '#F9FAFB' }}>{product.name}</span>
                          <button
                            onClick={() => updateProductQuantity(product.id, product.quantity - 1)}
                            style={{
                              width: '24px',
                              height: '24px',
                              borderRadius: '50%',
                              border: '1px solid #EF4444',
                              backgroundColor: 'transparent',
                              color: '#EF4444',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.75rem'
                            }}
                          >
                            -
                          </button>
                          <span style={{ color: '#EAB308', fontWeight: '600', minWidth: '20px', textAlign: 'center' }}>
                            {product.quantity}
                          </span>
                          <button
                            onClick={() => updateProductQuantity(product.id, product.quantity + 1)}
                            style={{
                              width: '24px',
                              height: '24px',
                              borderRadius: '50%',
                              border: '1px solid #10B981',
                              backgroundColor: 'transparent',
                              color: '#10B981',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.75rem'
                            }}
                          >
                            +
                          </button>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ color: '#EAB308', fontWeight: '600' }}>
                            R$ {(product.price * product.quantity).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </span>
                          <button
                            onClick={() => removeProductFromSale(product.id)}
                            style={{
                              width: '24px',
                              height: '24px',
                              borderRadius: '50%',
                              border: '1px solid #EF4444',
                              backgroundColor: 'transparent',
                              color: '#EF4444',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.75rem'
                            }}
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Total */}
              {newSale.selectedProducts.length > 0 && (
                <div style={{
                  padding: '1rem',
                  backgroundColor: 'rgba(234, 179, 8, 0.1)',
                  borderRadius: '0.5rem',
                  border: '1px solid rgba(234, 179, 8, 0.3)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#F9FAFB', fontWeight: '600', fontSize: '1.1rem' }}>
                      Total da Venda:
                    </span>
                    <span style={{ color: '#EAB308', fontWeight: '700', fontSize: '1.2rem' }}>
                      R$ {newSale.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              )}
              
              {/* Data e Forma de Pagamento */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', color: '#9CA3AF', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                    Data
                  </label>
                  <input
                    type="date"
                    value={newSale.date}
                    onChange={(e) => setNewSale({...newSale, date: e.target.value})}
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
                    onFocus={(e) => e.currentTarget.style.borderColor = '#EAB308'}
                    onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(234, 179, 8, 0.2)'}
                  />
                </div>
                
                <div>
                  <label style={{ display: 'block', color: '#9CA3AF', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                    Forma de Pagamento
                  </label>
                  <select
                    value={newSale.paymentMethod}
                    onChange={(e) => setNewSale({...newSale, paymentMethod: e.target.value})}
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
                    onFocus={(e) => e.currentTarget.style.borderColor = '#EAB308'}
                    onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(234, 179, 8, 0.2)'}
                  >
                    <option value="PIX">💳 PIX</option>
                    <option value="Cartão de Crédito">💳 Cartão de Crédito</option>
                    <option value="Cartão de Débito">💳 Cartão de Débito</option>
                    <option value="Dinheiro">💰 Dinheiro</option>
                    <option value="Boleto">📄 Boleto</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Campo de Observações */}
            <div>
              <label style={{ display: 'block', color: '#9CA3AF', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                Observações
              </label>
              <textarea
                value={newSale.notes}
                onChange={(e) => setNewSale({...newSale, notes: e.target.value})}
                placeholder="Observações sobre a venda..."
                rows={3}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  backgroundColor: '#1F2937',
                  border: '1px solid rgba(234, 179, 8, 0.2)',
                  borderRadius: '0.5rem',
                  color: '#F9FAFB',
                  fontSize: '0.875rem',
                  outline: 'none',
                  resize: 'vertical'
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = '#EAB308'}
                onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(234, 179, 8, 0.2)'}
              />
            </div>
            
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button
                onClick={handleCancel}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: 'transparent',
                  border: '1px solid rgba(107, 114, 128, 0.3)',
                  borderRadius: '0.5rem',
                  color: '#9CA3AF',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  fontSize: '0.875rem',
                  fontWeight: '600'
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
                onClick={handleAddSale}
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
                Adicionar Venda
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}