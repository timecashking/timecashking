import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Building2, Wallet, Package, ShoppingCart, ShoppingBag, 
  Calendar, FileText, BarChart3, Bell, Settings, User,
  ArrowLeft, Menu, X
} from 'lucide-react';
import { useState } from 'react';
import logo from '../assets/logo.png';

interface NavigationProps {
  user: any;
  onLogout: () => void;
}

export function Navigation({ user, onLogout }: NavigationProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigationItems = [
    { path: '/', label: 'Dashboard', icon: BarChart3 },
    { path: '/companies', label: 'Empresas', icon: Building2 },
    { path: '/accounts', label: 'Contas', icon: Wallet },
    { path: '/categories', label: 'Categorias', icon: FileText },
    { path: '/transactions', label: 'Transações', icon: FileText },
    { path: '/bills', label: 'Contas', icon: FileText },
    { path: '/credit-card-invoices', label: 'Faturas CC', icon: FileText },
    { path: '/products', label: 'Produtos', icon: Package },
    { path: '/inventory', label: 'Estoque', icon: Package },
    { path: '/sales', label: 'Vendas', icon: ShoppingCart },
    { path: '/purchases', label: 'Compras', icon: ShoppingBag },
    { path: '/schedule', label: 'Agenda', icon: Calendar },
    { path: '/summary', label: 'Resumo', icon: BarChart3 },
    { path: '/reports', label: 'Relatórios', icon: BarChart3 },
    { path: '/notifications', label: 'Notificações', icon: Bell },
  ];

  const isCurrentPage = (path: string) => location.pathname === path;
  const isAdmin = user?.companyUsers?.some((cu: any) => cu.role === 'ADMIN' || cu.role === 'OWNER');

  const handleBack = () => {
    if (location.pathname !== '/') {
      navigate(-1);
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <>
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img src={logo} alt="TimeCash King" className="w-10 h-10 object-contain" />
              <h1 className="text-2xl font-bold text-yellow-400">TimeCash King</h1>
              <span className="hidden md:block text-sm text-gray-400">O Rei do seu Tempo e do seu Dinheiro</span>
            </div>
            
            {user && (
              <div className="flex items-center space-x-4">
                <div className="hidden md:flex items-center space-x-2">
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt={user.name} className="w-8 h-8 rounded-full" />
                  ) : (
                    <User className="w-8 h-8 text-gray-400" />
                  )}
                  <span className="text-sm text-gray-300">
                    {user.name}
                  </span>
                </div>
                
                {/* Mobile menu button */}
                <button
                  onClick={toggleMobileMenu}
                  className="md:hidden p-2 text-gray-400 hover:text-white"
                >
                  {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
                
                <button
                  onClick={onLogout}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-gray-800 border-b border-gray-700">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-4">
            {/* Botão Voltar */}
            {location.pathname !== '/' && (
              <button
                onClick={handleBack}
                className="flex items-center space-x-2 text-yellow-400 hover:text-yellow-300 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="hidden sm:block">Voltar</span>
              </button>
            )}

            {/* Desktop Navigation */}
            <div className="hidden md:flex space-x-6 overflow-x-auto">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                      isCurrentPage(item.path)
                        ? 'text-yellow-400 bg-yellow-400/10'
                        : 'text-gray-300 hover:text-white hover:bg-gray-700'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
              
              {isAdmin && (
                <Link
                  to="/admin"
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                    isCurrentPage('/admin')
                      ? 'text-yellow-400 bg-yellow-400/10'
                      : 'text-gray-300 hover:text-white hover:bg-gray-700'
                  }`}
                >
                  <Settings className="w-4 h-4" />
                  <span>Admin</span>
                </Link>
              )}
            </div>

            {/* Mobile Navigation Toggle */}
            <div className="md:hidden">
              <button
                onClick={toggleMobileMenu}
                className="text-gray-400 hover:text-white"
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-gray-800 border-b border-gray-700">
          <div className="container mx-auto px-4 py-4">
            <div className="grid grid-cols-2 gap-2">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center space-x-2 p-3 rounded-lg transition-colors ${
                      isCurrentPage(item.path)
                        ? 'text-yellow-400 bg-yellow-400/10'
                        : 'text-gray-300 hover:text-white hover:bg-gray-700'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm">{item.label}</span>
                  </Link>
                );
              })}
              
              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center space-x-2 p-3 rounded-lg transition-colors ${
                    isCurrentPage('/admin')
                      ? 'text-yellow-400 bg-yellow-400/10'
                      : 'text-gray-300 hover:text-white hover:bg-gray-700'
                  }`}
                >
                  <Settings className="w-4 h-4" />
                  <span className="text-sm">Admin</span>
                </Link>
              )}
            </div>
            
            {/* User Info Mobile */}
            <div className="mt-4 pt-4 border-t border-gray-700">
              <div className="flex items-center space-x-3">
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user.name} className="w-10 h-10 rounded-full" />
                ) : (
                  <User className="w-10 h-10 text-gray-400" />
                )}
                <div>
                  <p className="text-white font-medium">{user.name}</p>
                  <p className="text-sm text-gray-400">{user.email}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
