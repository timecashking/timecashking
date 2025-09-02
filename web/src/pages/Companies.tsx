import React, { useState, useEffect } from 'react';
import { 
  Building2, Plus, Edit, Trash2, Users, Eye, 
  Search, Filter, MoreVertical, UserPlus, Settings
} from 'lucide-react';
import { API, authHeaders } from '../api';
import toast from 'react-hot-toast';

interface Company {
  id: string;
  name: string;
  cnpj: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  createdAt: string;
  updatedAt: string;
  companyUsers: Array<{
    id: string;
    role: string;
    user: {
      id: string;
      name: string;
      email: string;
      avatarUrl?: string;
    };
  }>;
}

interface CompanyFormData {
  name: string;
  cnpj: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
}

export function Companies() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [formData, setFormData] = useState<CompanyFormData>({
    name: '',
    cnpj: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    try {
      const response = await fetch(`${API}/companies`, { headers: authHeaders() });
      if (response.ok) {
        const data = await response.json();
        setCompanies(data);
      } else {
        toast.error('Erro ao carregar empresas');
      }
    } catch (error) {
      toast.error('Erro ao carregar empresas');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editingCompany 
        ? `${API}/companies/${editingCompany.id}`
        : `${API}/companies`;
      
      const method = editingCompany ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { ...authHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        toast.success(editingCompany ? 'Empresa atualizada com sucesso' : 'Empresa criada com sucesso');
        setShowModal(false);
        setEditingCompany(null);
        resetForm();
        loadCompanies();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Erro ao salvar empresa');
      }
    } catch (error) {
      toast.error('Erro ao salvar empresa');
    }
  };

  const handleDelete = async (company: Company) => {
    if (!confirm(`Tem certeza que deseja excluir a empresa "${company.name}"?`)) {
      return;
    }

    try {
      const response = await fetch(`${API}/companies/${company.id}`, {
        method: 'DELETE',
        headers: authHeaders()
      });

      if (response.ok) {
        toast.success('Empresa excluída com sucesso');
        loadCompanies();
      } else {
        toast.error('Erro ao excluir empresa');
      }
    } catch (error) {
      toast.error('Erro ao excluir empresa');
    }
  };

  const handleEdit = (company: Company) => {
    setEditingCompany(company);
    setFormData({
      name: company.name,
      cnpj: company.cnpj,
      email: company.email,
      phone: company.phone,
      address: company.address,
      city: company.city,
      state: company.state,
      zipCode: company.zipCode
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      cnpj: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      zipCode: ''
    });
  };

  const openModal = () => {
    setEditingCompany(null);
    resetForm();
    setShowModal(true);
  };

  const filteredCompanies = companies.filter(company =>
    company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.cnpj.includes(searchTerm) ||
    company.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCNPJ = (cnpj: string) => {
    return cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
  };

  const formatPhone = (phone: string) => {
    return phone.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <div className="animate-pulse">
          <div className="h-16 bg-gray-800"></div>
          <div className="container mx-auto px-4 py-8">
            <div className="h-8 bg-gray-800 rounded w-1/4 mb-6"></div>
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-gray-800 rounded-lg p-6 h-24"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Building2 className="text-yellow-400" size={24} />
              <h1 className="text-2xl font-bold">Empresas</h1>
            </div>
            <button
              onClick={openModal}
              className="bg-yellow-500 hover:bg-yellow-600 text-black px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <Plus size={20} />
              <span>Nova Empresa</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Search and Filters */}
        <div className="mb-6">
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Buscar empresas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-500"
              />
            </div>
            <button className="bg-gray-800 border border-gray-700 px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-gray-750 transition-colors">
              <Filter size={20} />
              <span>Filtros</span>
            </button>
          </div>
        </div>

        {/* Companies Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCompanies.map(company => (
            <div key={company.id} className="bg-gray-800 rounded-lg p-6 hover:bg-gray-750 transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center">
                    <Building2 className="text-black" size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{company.name}</h3>
                    <p className="text-sm text-gray-400">{formatCNPJ(company.cnpj)}</p>
                  </div>
                </div>
                <div className="relative">
                  <button className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
                    <MoreVertical size={16} />
                  </button>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-400">Email:</span>
                  <span className="text-sm">{company.email}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-400">Telefone:</span>
                  <span className="text-sm">{formatPhone(company.phone)}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-400">Localização:</span>
                  <span className="text-sm">{company.city}, {company.state}</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Users size={16} className="text-gray-400" />
                  <span className="text-sm text-gray-400">
                    {company.companyUsers.length} usuário(s)
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setSelectedCompany(company)}
                    className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                    title="Ver detalhes"
                  >
                    <Eye size={16} />
                  </button>
                  <button
                    onClick={() => handleEdit(company)}
                    className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                    title="Editar"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(company)}
                    className="p-2 hover:bg-red-600 rounded-lg transition-colors"
                    title="Excluir"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredCompanies.length === 0 && (
          <div className="text-center py-12">
            <Building2 className="text-gray-600 mx-auto mb-4" size={48} />
            <h3 className="text-lg font-medium text-gray-400 mb-2">
              {searchTerm ? 'Nenhuma empresa encontrada' : 'Nenhuma empresa cadastrada'}
            </h3>
            <p className="text-gray-500 mb-6">
              {searchTerm ? 'Tente ajustar os termos de busca' : 'Comece criando sua primeira empresa'}
            </p>
            {!searchTerm && (
              <button
                onClick={openModal}
                className="bg-yellow-500 hover:bg-yellow-600 text-black px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Criar Primeira Empresa
              </button>
            )}
          </div>
        )}
      </main>

      {/* Company Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">
                {editingCompany ? 'Editar Empresa' : 'Nova Empresa'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Nome da Empresa</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-yellow-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">CNPJ</label>
                  <input
                    type="text"
                    value={formData.cnpj}
                    onChange={(e) => setFormData({...formData, cnpj: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-yellow-500"
                    placeholder="00.000.000/0000-00"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-yellow-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Telefone</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-yellow-500"
                    placeholder="(11) 99999-9999"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">Endereço</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-yellow-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Cidade</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({...formData, city: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-yellow-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Estado</label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => setFormData({...formData, state: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-yellow-500"
                    placeholder="SP"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">CEP</label>
                  <input
                    type="text"
                    value={formData.zipCode}
                    onChange={(e) => setFormData({...formData, zipCode: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-yellow-500"
                    placeholder="00000-000"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-yellow-500 hover:bg-yellow-600 text-black px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  {editingCompany ? 'Atualizar' : 'Criar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Company Details Modal */}
      {selectedCompany && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Detalhes da Empresa</h2>
              <button
                onClick={() => setSelectedCompany(null)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Informações Gerais</h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm text-gray-400">Nome:</span>
                    <p className="font-medium">{selectedCompany.name}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-400">CNPJ:</span>
                    <p className="font-medium">{formatCNPJ(selectedCompany.cnpj)}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-400">Email:</span>
                    <p className="font-medium">{selectedCompany.email}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-400">Telefone:</span>
                    <p className="font-medium">{formatPhone(selectedCompany.phone)}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-400">Endereço:</span>
                    <p className="font-medium">{selectedCompany.address}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-400">Cidade/Estado:</span>
                    <p className="font-medium">{selectedCompany.city}, {selectedCompany.state}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-400">CEP:</span>
                    <p className="font-medium">{selectedCompany.zipCode}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Usuários da Empresa</h3>
                <div className="space-y-3">
                  {selectedCompany.companyUsers.map(user => (
                    <div key={user.id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                          <span className="text-black text-sm font-medium">
                            {user.user.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">{user.user.name}</p>
                          <p className="text-sm text-gray-400">{user.user.email}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        user.role === 'ADMIN' ? 'bg-red-600 text-white' :
                        user.role === 'MANAGER' ? 'bg-yellow-600 text-black' :
                        'bg-gray-600 text-white'
                      }`}>
                        {user.role}
                      </span>
                    </div>
                  ))}
                </div>
                <button className="mt-4 bg-yellow-500 hover:bg-yellow-600 text-black px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors">
                  <UserPlus size={16} />
                  <span>Adicionar Usuário</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
