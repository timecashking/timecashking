'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import { 
  Home, 
  DollarSign, 
  Package, 
  ShoppingCart, 
  BarChart3, 
  Calendar, 
  Settings, 
  User,
  LogOut,
  Menu,
  X,
  Bell,
  Search
} from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface NavigationProps {
  user: User;
}

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Finanças', href: '/finances', icon: DollarSign },
  { name: 'Produtos', href: '/products', icon: Package },
  { name: 'Vendas', href: '/sales', icon: ShoppingCart },
  { name: 'Relatórios', href: '/reports', icon: BarChart3 },
  { name: 'Agenda', href: '/schedule', icon: Calendar },
  { name: 'Configurações', href: '/settings', icon: Settings },
];

export function Navigation({ user }: NavigationProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/');
  };

  return (
    <>
      {/* Header */}
      <header style={{
        backgroundColor: '#111827',
        borderBottom: '1px solid rgba(234, 179, 8, 0.2)',
        padding: '0 1.5rem',
        height: '4rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        backdropFilter: 'blur(10px)'
      }}>
        {/* Left side - Logo and Menu */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '2.5rem',
              height: '2.5rem',
              backgroundColor: 'transparent',
              border: '1px solid rgba(234, 179, 8, 0.3)',
              borderRadius: '0.5rem',
              color: '#EAB308',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(234, 179, 8, 0.1)';
              e.currentTarget.style.borderColor = '#EAB308';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.borderColor = 'rgba(234, 179, 8, 0.3)';
            }}
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '2.5rem',
              height: '2.5rem',
              borderRadius: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden'
            }}>
              <Image
                src="/logo.png"
                alt="TimeCash King"
                width={40}
                height={40}
                style={{ 
                  width: '2.5rem', 
                  height: '2.5rem', 
                  objectFit: 'contain' 
                }}
              />
            </div>
            <h1 style={{
              fontSize: '1.5rem',
              fontWeight: '700',
              background: 'linear-gradient(90deg, #FCD34D, #D97706)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              margin: 0
            }}>
              TimeCash King
            </h1>
          </div>
        </div>

        {/* Center - Navigation */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <button
                key={item.name}
                onClick={() => router.push(item.href)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 1rem',
                  backgroundColor: isActive ? 'rgba(234, 179, 8, 0.2)' : 'transparent',
                  border: isActive ? '1px solid rgba(234, 179, 8, 0.5)' : '1px solid transparent',
                  borderRadius: '0.5rem',
                  color: isActive ? '#FCD34D' : '#9CA3AF',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  textDecoration: 'none'
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'rgba(234, 179, 8, 0.1)';
                    e.currentTarget.style.color = '#EAB308';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = '#9CA3AF';
                  }
                }}
              >
                <item.icon size={16} />
                {item.name}
              </button>
            );
          })}
        </nav>

        {/* Right side - Search, Notifications, User */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {/* Search */}
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
              placeholder="Buscar..."
              style={{
                width: '12rem',
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

          {/* Notifications */}
          <button style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '2.5rem',
            height: '2.5rem',
            backgroundColor: 'transparent',
            border: '1px solid rgba(234, 179, 8, 0.2)',
            borderRadius: '0.5rem',
            color: '#9CA3AF',
            cursor: 'pointer',
            transition: 'all 0.2s',
            position: 'relative'
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
            <Bell size={18} />
            <div style={{
              position: 'absolute',
              top: '0.25rem',
              right: '0.25rem',
              width: '0.5rem',
              height: '0.5rem',
              backgroundColor: '#EF4444',
              borderRadius: '50%'
            }}></div>
          </button>

          {/* User Menu */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '2rem',
              height: '2rem',
              backgroundColor: '#EAB308',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#000000'
            }}>
              <User size={16} />
            </div>
            <div>
              <p style={{ 
                fontSize: '0.875rem', 
                fontWeight: '500', 
                color: '#F9FAFB', 
                margin: 0,
                lineHeight: 1.2
              }}>
                {user.name}
              </p>
              <p style={{ 
                fontSize: '0.75rem', 
                color: '#9CA3AF', 
                margin: 0,
                lineHeight: 1.2
              }}>
                {user.email}
              </p>
            </div>
            <button
              onClick={handleLogout}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '2.5rem',
                height: '2.5rem',
                backgroundColor: 'transparent',
                border: '1px solid rgba(234, 179, 8, 0.2)',
                borderRadius: '0.5rem',
                color: '#9CA3AF',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
                e.currentTarget.style.borderColor = '#EF4444';
                e.currentTarget.style.color = '#EF4444';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.borderColor = 'rgba(234, 179, 8, 0.2)';
                e.currentTarget.style.color = '#9CA3AF';
              }}
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 40
          }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        height: '100vh',
        width: '16rem',
        backgroundColor: '#111827',
        borderRight: '1px solid rgba(234, 179, 8, 0.2)',
        transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.3s ease-in-out',
        zIndex: 45,
        padding: '1rem',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{
            fontSize: '1.25rem',
            fontWeight: '700',
            background: 'linear-gradient(90deg, #FCD34D, #D97706)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            margin: 0,
            marginBottom: '1rem'
          }}>
            Menu
          </h2>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <button
                  key={item.name}
                  onClick={() => {
                    router.push(item.href);
                    setSidebarOpen(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.75rem 1rem',
                    backgroundColor: isActive ? 'rgba(234, 179, 8, 0.2)' : 'transparent',
                    border: isActive ? '1px solid rgba(234, 179, 8, 0.5)' : '1px solid transparent',
                    borderRadius: '0.5rem',
                    color: isActive ? '#FCD34D' : '#9CA3AF',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    textAlign: 'left',
                    width: '100%'
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = 'rgba(234, 179, 8, 0.1)';
                      e.currentTarget.style.color = '#EAB308';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = '#9CA3AF';
                    }
                  }}
                >
                  <item.icon size={18} />
                  {item.name}
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </>
  );
}
