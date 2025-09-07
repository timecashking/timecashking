'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export function LoginScreen() {
  const [email, setEmail] = useState('adrianokinng@gmail.com');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');
  const [showPassword, setShowPassword] = useState(false);
  
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setMessageType('');

    // Simulação de login para demonstração
    setTimeout(() => {
      if (email === 'adrianokinng@gmail.com' && password === 'play22') {
        // Login simulado bem-sucedido
        localStorage.setItem('token', 'demo-token-123');
        localStorage.setItem('user', JSON.stringify({
          id: 1,
          name: 'Adriano King',
          email: 'adrianokinng@gmail.com',
          role: 'admin'
        }));
        setMessage('Logando...');
        setMessageType('success');
        setTimeout(() => {
          router.push('/dashboard');
        }, 1000);
      } else {
        setMessage('Email ou senha incorretos');
        setMessageType('error');
      }
      setLoading(false);
    }, 1500);
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#000000', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      padding: '1rem',
      fontFamily: 'Inter, system-ui, sans-serif'
    }}>
      <div style={{ width: '100%', maxWidth: '28rem' }}>
        {/* Logo e Título */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
            <Image
              src="/logo.png"
              alt="TimeCash King"
              width={120}
              height={120}
              style={{ maxWidth: '120px', height: 'auto' }}
            />
          </div>
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: 'bold',
            background: 'linear-gradient(90deg, #FCD34D, #D97706)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            marginBottom: '0.5rem'
          }}>
            TIMECASH KING
          </h1>
          <p style={{ 
            color: '#D1D5DB', 
            fontSize: '1rem',
            fontWeight: '500'
          }}>
            O Rei do seu Tempo e do seu Dinheiro
          </p>
        </div>

        {/* Card do Formulário */}
        <div style={{
          backgroundColor: '#111827',
          border: '1px solid rgba(234, 179, 8, 0.3)',
          borderRadius: '0.75rem',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          padding: '2rem'
        }}>
          {/* Título do Formulário */}
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: '700',
              color: '#FEF3C7',
              margin: 0
            }}>
              Entrar
            </h2>
            <p style={{
              color: '#9CA3AF',
              fontSize: '0.875rem',
              margin: '0.5rem 0 0 0'
            }}>
              Acesse sua conta para continuar
            </p>
          </div>

          {/* Formulário */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem', color: '#FEF3C7' }}>
                Email
              </label>
              <div style={{ position: 'relative' }}>
                <div style={{
                  position: 'absolute',
                  left: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#9CA3AF',
                  fontSize: '1rem',
                  zIndex: 1
                }}>
                  ✉️
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    width: '100%',
                    height: '2.75rem',
                    borderRadius: '0.5rem',
                    border: '1px solid rgba(234, 179, 8, 0.3)',
                    backgroundColor: '#1F2937',
                    padding: '0.75rem 1rem 0.75rem 2.5rem',
                    fontSize: '0.875rem',
                    color: '#FEF3C7',
                    outline: 'none',
                    transition: 'all 0.2s',
                    boxSizing: 'border-box'
                  }}
                  placeholder="Digite seu email"
                  required
                  onFocus={(e) => e.target.style.borderColor = '#EAB308'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(234, 179, 8, 0.3)'}
                />
              </div>
              {email && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginTop: '0.5rem',
                  color: '#10B981',
                  fontSize: '0.75rem',
                  fontWeight: '500'
                }}>
                  <span style={{ marginRight: '0.25rem' }}>✓</span>
                  Conta encontrada
                </div>
              )}
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem', color: '#FEF3C7' }}>
                Senha
              </label>
              <div style={{ position: 'relative' }}>
                <div style={{
                  position: 'absolute',
                  left: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#9CA3AF',
                  fontSize: '1rem',
                  zIndex: 1
                }}>
                  🔒
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    width: '100%',
                    height: '2.75rem',
                    borderRadius: '0.5rem',
                    border: '1px solid rgba(234, 179, 8, 0.3)',
                    backgroundColor: '#1F2937',
                    padding: '0.75rem 2.5rem 0.75rem 2.5rem',
                    fontSize: '0.875rem',
                    color: '#FEF3C7',
                    outline: 'none',
                    transition: 'all 0.2s',
                    boxSizing: 'border-box'
                  }}
                  placeholder="Digite sua senha"
                  required
                  onFocus={(e) => e.target.style.borderColor = '#EAB308'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(234, 179, 8, 0.3)'}
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
                    fontSize: '1rem',
                    padding: '0.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1
                  }}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {message && (
              <div
                style={{
                  padding: '0.75rem',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  ...(messageType === 'success' ? {
                    backgroundColor: 'rgba(16, 185, 129, 0.2)',
                    color: '#10B981',
                    border: '1px solid rgba(16, 185, 129, 0.3)'
                  } : {
                    backgroundColor: 'rgba(239, 68, 68, 0.2)',
                    color: '#EF4444',
                    border: '1px solid rgba(239, 68, 68, 0.3)'
                  })
                }}
              >
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                background: '#EAB308',
                color: '#000000',
                padding: '0.875rem 1rem',
                borderRadius: '0.5rem',
                fontWeight: '700',
                fontSize: '1rem',
                transition: 'all 0.2s',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.5 : 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                height: '2.75rem'
              }}
            >
              {loading ? 'Processando...' : 'Entrar'}
              {!loading && <span style={{ fontSize: '1.2rem' }}>→</span>}
            </button>
          </form>

        </div>

        {/* Rodapé */}
        <div style={{
          position: 'fixed',
          bottom: '1rem',
          left: '1rem',
          color: '#6B7280',
          fontSize: '0.75rem'
        }}>
          © 2024 TimeCash King. Todos os direitos reservados.
        </div>
      </div>
    </div>
  );
}