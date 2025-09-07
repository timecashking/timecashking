'use client';

import { useState } from 'react';
import { 
  Settings, 
  User,
  Bell,
  Shield,
  Palette,
  Database,
  Globe,
  Save,
  Eye,
  EyeOff,
  Key,
  Mail,
  Phone,
  MapPin,
  Building,
  CreditCard,
  Smartphone
} from 'lucide-react';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    sms: true,
    marketing: false
  });

  const handleNotificationChange = (key: string) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key as keyof typeof prev]
    }));
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
            Configurações
          </h1>
          <p style={{ color: '#9CA3AF', fontSize: '1rem', margin: 0 }}>
            Gerencie suas preferências e configurações
          </p>
        </div>
        <button 
          onClick={() => setShowSaveModal(true)}
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
          <Save size={16} />
          Salvar Alterações
        </button>
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
          { id: 'profile', name: 'Perfil', icon: User },
          { id: 'security', name: 'Segurança', icon: Shield },
          { id: 'notifications', name: 'Notificações', icon: Bell },
          { id: 'appearance', name: 'Aparência', icon: Palette },
          { id: 'billing', name: 'Cobrança', icon: CreditCard },
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
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem'
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
            <tab.icon size={16} />
            {tab.name}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'profile' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          {/* Personal Information */}
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
              margin: '0 0 1.5rem 0',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <User size={20} />
              Informações Pessoais
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem', color: '#F9FAFB' }}>
                  Nome Completo
                </label>
                <input
                  type="text"
                  defaultValue="Adriano King"
                  style={{
                    width: '100%',
                    height: '2.5rem',
                    backgroundColor: '#1F2937',
                    border: '1px solid rgba(234, 179, 8, 0.2)',
                    borderRadius: '0.5rem',
                    padding: '0 0.75rem',
                    color: '#F9FAFB',
                    fontSize: '0.875rem',
                    outline: 'none',
                    transition: 'all 0.2s',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#EAB308'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(234, 179, 8, 0.2)'}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem', color: '#F9FAFB' }}>
                  Email
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail 
                    size={16} 
                    style={{ 
                      position: 'absolute', 
                      left: '0.75rem', 
                      top: '50%', 
                      transform: 'translateY(-50%)', 
                      color: '#6B7280' 
                    }} 
                  />
                  <input
                    type="email"
                    defaultValue="adrianokinng@gmail.com"
                    style={{
                      width: '100%',
                      height: '2.5rem',
                      backgroundColor: '#1F2937',
                      border: '1px solid rgba(234, 179, 8, 0.2)',
                      borderRadius: '0.5rem',
                      padding: '0 0.75rem 0 2.5rem',
                      color: '#F9FAFB',
                      fontSize: '0.875rem',
                      outline: 'none',
                      transition: 'all 0.2s',
                      boxSizing: 'border-box'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#EAB308'}
                    onBlur={(e) => e.target.style.borderColor = 'rgba(234, 179, 8, 0.2)'}
                  />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem', color: '#F9FAFB' }}>
                  Telefone
                </label>
                <div style={{ position: 'relative' }}>
                  <Phone 
                    size={16} 
                    style={{ 
                      position: 'absolute', 
                      left: '0.75rem', 
                      top: '50%', 
                      transform: 'translateY(-50%)', 
                      color: '#6B7280' 
                    }} 
                  />
                  <input
                    type="tel"
                    defaultValue="+55 (11) 99999-9999"
                    style={{
                      width: '100%',
                      height: '2.5rem',
                      backgroundColor: '#1F2937',
                      border: '1px solid rgba(234, 179, 8, 0.2)',
                      borderRadius: '0.5rem',
                      padding: '0 0.75rem 0 2.5rem',
                      color: '#F9FAFB',
                      fontSize: '0.875rem',
                      outline: 'none',
                      transition: 'all 0.2s',
                      boxSizing: 'border-box'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#EAB308'}
                    onBlur={(e) => e.target.style.borderColor = 'rgba(234, 179, 8, 0.2)'}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Company Information */}
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
              margin: '0 0 1.5rem 0',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <Building size={20} />
              Informações da Empresa
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem', color: '#F9FAFB' }}>
                  Nome da Empresa
                </label>
                <input
                  type="text"
                  defaultValue="TimeCash King"
                  style={{
                    width: '100%',
                    height: '2.5rem',
                    backgroundColor: '#1F2937',
                    border: '1px solid rgba(234, 179, 8, 0.2)',
                    borderRadius: '0.5rem',
                    padding: '0 0.75rem',
                    color: '#F9FAFB',
                    fontSize: '0.875rem',
                    outline: 'none',
                    transition: 'all 0.2s',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#EAB308'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(234, 179, 8, 0.2)'}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem', color: '#F9FAFB' }}>
                  CNPJ
                </label>
                <input
                  type="text"
                  defaultValue="12.345.678/0001-90"
                  style={{
                    width: '100%',
                    height: '2.5rem',
                    backgroundColor: '#1F2937',
                    border: '1px solid rgba(234, 179, 8, 0.2)',
                    borderRadius: '0.5rem',
                    padding: '0 0.75rem',
                    color: '#F9FAFB',
                    fontSize: '0.875rem',
                    outline: 'none',
                    transition: 'all 0.2s',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#EAB308'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(234, 179, 8, 0.2)'}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem', color: '#F9FAFB' }}>
                  Endereço
                </label>
                <div style={{ position: 'relative' }}>
                  <MapPin 
                    size={16} 
                    style={{ 
                      position: 'absolute', 
                      left: '0.75rem', 
                      top: '0.75rem', 
                      color: '#6B7280' 
                    }} 
                  />
                  <textarea
                    defaultValue="Rua das Flores, 123 - Centro, São Paulo - SP, 01234-567"
                    rows={3}
                    style={{
                      width: '100%',
                      backgroundColor: '#1F2937',
                      border: '1px solid rgba(234, 179, 8, 0.2)',
                      borderRadius: '0.5rem',
                      padding: '0.75rem 0.75rem 0.75rem 2.5rem',
                      color: '#F9FAFB',
                      fontSize: '0.875rem',
                      outline: 'none',
                      transition: 'all 0.2s',
                      boxSizing: 'border-box',
                      resize: 'vertical'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#EAB308'}
                    onBlur={(e) => e.target.style.borderColor = 'rgba(234, 179, 8, 0.2)'}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'security' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          {/* Password */}
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
              margin: '0 0 1.5rem 0',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <Key size={20} />
              Alterar Senha
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem', color: '#F9FAFB' }}>
                  Senha Atual
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? "text" : "password"}
                    style={{
                      width: '100%',
                      height: '2.5rem',
                      backgroundColor: '#1F2937',
                      border: '1px solid rgba(234, 179, 8, 0.2)',
                      borderRadius: '0.5rem',
                      padding: '0 2.5rem 0 0.75rem',
                      color: '#F9FAFB',
                      fontSize: '0.875rem',
                      outline: 'none',
                      transition: 'all 0.2s',
                      boxSizing: 'border-box'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#EAB308'}
                    onBlur={(e) => e.target.style.borderColor = 'rgba(234, 179, 8, 0.2)'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '0.75rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: '#9CA3AF',
                      cursor: 'pointer',
                      padding: '0.25rem'
                    }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem', color: '#F9FAFB' }}>
                  Nova Senha
                </label>
                <input
                  type="password"
                  style={{
                    width: '100%',
                    height: '2.5rem',
                    backgroundColor: '#1F2937',
                    border: '1px solid rgba(234, 179, 8, 0.2)',
                    borderRadius: '0.5rem',
                    padding: '0 0.75rem',
                    color: '#F9FAFB',
                    fontSize: '0.875rem',
                    outline: 'none',
                    transition: 'all 0.2s',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#EAB308'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(234, 179, 8, 0.2)'}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem', color: '#F9FAFB' }}>
                  Confirmar Nova Senha
                </label>
                <input
                  type="password"
                  style={{
                    width: '100%',
                    height: '2.5rem',
                    backgroundColor: '#1F2937',
                    border: '1px solid rgba(234, 179, 8, 0.2)',
                    borderRadius: '0.5rem',
                    padding: '0 0.75rem',
                    color: '#F9FAFB',
                    fontSize: '0.875rem',
                    outline: 'none',
                    transition: 'all 0.2s',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#EAB308'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(234, 179, 8, 0.2)'}
                />
              </div>
            </div>
          </div>

          {/* Two-Factor Authentication */}
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
              margin: '0 0 1.5rem 0',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <Shield size={20} />
              Autenticação de Dois Fatores
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{
                padding: '1rem',
                backgroundColor: '#1F2937',
                borderRadius: '0.5rem',
                border: '1px solid rgba(234, 179, 8, 0.1)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontWeight: '500', color: '#F9FAFB' }}>SMS</span>
                  <label style={{ position: 'relative', display: 'inline-block', width: '3rem', height: '1.5rem' }}>
                    <input
                      type="checkbox"
                      defaultChecked={notifications.sms}
                      onChange={() => handleNotificationChange('sms')}
                      style={{ opacity: 0, width: 0, height: 0 }}
                    />
                    <span style={{
                      position: 'absolute',
                      cursor: 'pointer',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundColor: notifications.sms ? '#EAB308' : '#374151',
                      transition: '0.4s',
                      borderRadius: '1.5rem'
                    }}>
                      <span style={{
                        position: 'absolute',
                        content: '""',
                        height: '1.125rem',
                        width: '1.125rem',
                        left: notifications.sms ? '1.875rem' : '0.1875rem',
                        bottom: '0.1875rem',
                        backgroundColor: 'white',
                        transition: '0.4s',
                        borderRadius: '50%'
                      }}></span>
                    </span>
                  </label>
                </div>
                <p style={{ fontSize: '0.875rem', color: '#9CA3AF', margin: 0 }}>
                  Receber códigos de verificação por SMS
                </p>
              </div>
              <div style={{
                padding: '1rem',
                backgroundColor: '#1F2937',
                borderRadius: '0.5rem',
                border: '1px solid rgba(234, 179, 8, 0.1)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontWeight: '500', color: '#F9FAFB' }}>App Autenticador</span>
                  <label style={{ position: 'relative', display: 'inline-block', width: '3rem', height: '1.5rem' }}>
                    <input
                      type="checkbox"
                      defaultChecked={false}
                      style={{ opacity: 0, width: 0, height: 0 }}
                    />
                    <span style={{
                      position: 'absolute',
                      cursor: 'pointer',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundColor: '#374151',
                      transition: '0.4s',
                      borderRadius: '1.5rem'
                    }}>
                      <span style={{
                        position: 'absolute',
                        content: '""',
                        height: '1.125rem',
                        width: '1.125rem',
                        left: '0.1875rem',
                        bottom: '0.1875rem',
                        backgroundColor: 'white',
                        transition: '0.4s',
                        borderRadius: '50%'
                      }}></span>
                    </span>
                  </label>
                </div>
                <p style={{ fontSize: '0.875rem', color: '#9CA3AF', margin: 0 }}>
                  Usar aplicativo autenticador (Google Authenticator, Authy)
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'notifications' && (
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
            margin: '0 0 1.5rem 0',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <Bell size={20} />
            Preferências de Notificação
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
            {[
              { key: 'email', label: 'Notificações por Email', description: 'Receber notificações importantes por email' },
              { key: 'push', label: 'Notificações Push', description: 'Receber notificações no navegador' },
              { key: 'sms', label: 'Notificações SMS', description: 'Receber alertas críticos por SMS' },
              { key: 'marketing', label: 'Marketing', description: 'Receber ofertas e novidades' },
            ].map((notification) => (
              <div key={notification.key} style={{
                padding: '1rem',
                backgroundColor: '#1F2937',
                borderRadius: '0.5rem',
                border: '1px solid rgba(234, 179, 8, 0.1)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontWeight: '500', color: '#F9FAFB' }}>{notification.label}</span>
                  <label style={{ position: 'relative', display: 'inline-block', width: '3rem', height: '1.5rem' }}>
                    <input
                      type="checkbox"
                      checked={notifications[notification.key as keyof typeof notifications]}
                      onChange={() => handleNotificationChange(notification.key)}
                      style={{ opacity: 0, width: 0, height: 0 }}
                    />
                    <span style={{
                      position: 'absolute',
                      cursor: 'pointer',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundColor: notifications[notification.key as keyof typeof notifications] ? '#EAB308' : '#374151',
                      transition: '0.4s',
                      borderRadius: '1.5rem'
                    }}>
                      <span style={{
                        position: 'absolute',
                        content: '""',
                        height: '1.125rem',
                        width: '1.125rem',
                        left: notifications[notification.key as keyof typeof notifications] ? '1.875rem' : '0.1875rem',
                        bottom: '0.1875rem',
                        backgroundColor: 'white',
                        transition: '0.4s',
                        borderRadius: '50%'
                      }}></span>
                    </span>
                  </label>
                </div>
                <p style={{ fontSize: '0.875rem', color: '#9CA3AF', margin: 0 }}>
                  {notification.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'appearance' && (
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
            margin: '0 0 1.5rem 0',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <Palette size={20} />
            Aparência
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
            {[
              { name: 'Dark Gold', description: 'Tema atual', active: true },
              { name: 'Dark Blue', description: 'Tema azul escuro', active: false },
              { name: 'Dark Green', description: 'Tema verde escuro', active: false },
            ].map((theme, index) => (
              <div key={index} style={{
                padding: '1rem',
                backgroundColor: theme.active ? 'rgba(234, 179, 8, 0.1)' : '#1F2937',
                borderRadius: '0.5rem',
                border: theme.active ? '2px solid #EAB308' : '1px solid rgba(234, 179, 8, 0.1)',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                if (!theme.active) {
                  e.currentTarget.style.backgroundColor = 'rgba(234, 179, 8, 0.05)';
                }
              }}
              onMouseLeave={(e) => {
                if (!theme.active) {
                  e.currentTarget.style.backgroundColor = '#1F2937';
                }
              }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontWeight: '500', color: '#F9FAFB' }}>{theme.name}</span>
                  {theme.active && (
                    <div style={{
                      width: '1rem',
                      height: '1rem',
                      borderRadius: '50%',
                      backgroundColor: '#EAB308'
                    }}></div>
                  )}
                </div>
                <p style={{ fontSize: '0.875rem', color: '#9CA3AF', margin: 0 }}>
                  {theme.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'billing' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          {/* Current Plan */}
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
              margin: '0 0 1.5rem 0',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <CreditCard size={20} />
              Plano Atual
            </h2>
            <div style={{
              padding: '1rem',
              backgroundColor: '#1F2937',
              borderRadius: '0.5rem',
              border: '1px solid rgba(234, 179, 8, 0.1)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#F9FAFB', margin: 0 }}>
                  Plano Premium
                </h3>
                <span style={{
                  padding: '0.25rem 0.5rem',
                  backgroundColor: 'rgba(16, 185, 129, 0.2)',
                  color: '#10B981',
                  borderRadius: '0.25rem',
                  fontSize: '0.75rem',
                  fontWeight: '500'
                }}>
                  Ativo
                </span>
              </div>
              <p style={{ fontSize: '2rem', fontWeight: '700', color: '#EAB308', margin: '0 0 0.5rem 0' }}>
                R$ 99,90
                <span style={{ fontSize: '1rem', color: '#9CA3AF', fontWeight: '400' }}>/mês</span>
              </p>
              <p style={{ fontSize: '0.875rem', color: '#9CA3AF', margin: '0 0 1rem 0' }}>
                Próxima cobrança: 15/02/2024
              </p>
              <button style={{
                width: '100%',
                padding: '0.75rem',
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
                Alterar Plano
              </button>
            </div>
          </div>

          {/* Payment Method */}
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
              margin: '0 0 1.5rem 0',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <Smartphone size={20} />
              Método de Pagamento
            </h2>
            <div style={{
              padding: '1rem',
              backgroundColor: '#1F2937',
              borderRadius: '0.5rem',
              border: '1px solid rgba(234, 179, 8, 0.1)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <div style={{
                  width: '2rem',
                  height: '2rem',
                  backgroundColor: '#EAB308',
                  borderRadius: '0.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#000000',
                  fontWeight: '600'
                }}>
                  💳
                </div>
                <div>
                  <p style={{ fontWeight: '500', color: '#F9FAFB', margin: '0 0 0.25rem 0' }}>
                    Cartão de Crédito
                  </p>
                  <p style={{ fontSize: '0.875rem', color: '#9CA3AF', margin: 0 }}>
                    **** **** **** 1234
                  </p>
                </div>
              </div>
              <button style={{
                width: '100%',
                padding: '0.75rem',
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
                Alterar Método
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Salvar */}
      {showSaveModal && (
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
              marginBottom: '1rem',
              margin: 0
            }}>
              ✅ Configurações Salvas!
            </h3>
            
            <p style={{ color: '#9CA3AF', marginBottom: '2rem' }}>
              Suas alterações foram salvas com sucesso.
            </p>
            
            <button
              onClick={() => setShowSaveModal(false)}
              style={{
                width: '100%',
                padding: '0.75rem',
                backgroundColor: '#EAB308',
                border: 'none',
                borderRadius: '0.5rem',
                color: '#000000',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: '600'
              }}
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}