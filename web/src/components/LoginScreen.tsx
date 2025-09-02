import React, { useState } from 'react';
import { 
  User, 
  Lock, 
  Mail, 
  Key, 
  Building2, 
  ArrowRight, 
  Eye, 
  EyeOff,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import logo from '../assets/logo.svg';
import { API } from '../api';
import toast from 'react-hot-toast';

interface LoginScreenProps {
  onLoginSuccess: (userData: any, token: string) => void;
  onActivationSuccess: (userData: any, companyData: any, token: string) => void;
}

export function LoginScreen({ onLoginSuccess, onActivationSuccess }: LoginScreenProps) {
  const [mode, setMode] = useState<'login' | 'activation'>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Estados do login
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });

  // Estados da ativação
  const [activationData, setActivationData] = useState({
    code: '',
    email: '',
    password: '',
    confirmPassword: '',
    name: ''
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginData.email || !loginData.password) {
      toast.error('Preencha todos os campos');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData)
      });

      const result = await response.json();

      if (response.ok && result.success) {
        onLoginSuccess(result.user, result.token);
        toast.success('Login realizado com sucesso!');
      } else {
        toast.error(result.error || 'Erro no login');
      }
    } catch (error) {
      toast.error('Erro de conexão');
    } finally {
      setIsLoading(false);
    }
  };

  const handleActivation = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!activationData.code || !activationData.email || !activationData.password || !activationData.name) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    if (activationData.password !== activationData.confirmPassword) {
      toast.error('As senhas não coincidem');
      return;
    }

    if (activationData.password.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API}/activation/activate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: activationData.code,
          email: activationData.email,
          password: activationData.password,
          name: activationData.name
        })
      });

      const result = await response.json();

      if (response.ok) {
        onActivationSuccess(result.user, result.company, result.token);
        toast.success('Conta ativada com sucesso!');
      } else {
        toast.error(result.error || 'Erro na ativação');
      }
    } catch (error) {
      toast.error('Erro de conexão');
    } finally {
      setIsLoading(false);
    }
  };

  const clearForm = () => {
    setLoginData({ email: '', password: '' });
    setActivationData({ code: '', email: '', password: '', confirmPassword: '', name: '' });
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo e Título */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <img src={logo} alt="TimeCash King" className="w-24 h-24" />
          </div>
          <h1 className="text-3xl font-bold text-yellow-400 mb-2">TimeCash King</h1>
          <p className="text-gray-400">O Rei do seu Tempo e do seu Dinheiro</p>
        </div>

        {/* Card Principal */}
        <div className="bg-gray-800 rounded-lg p-8 shadow-xl">
          {/* Tabs */}
          <div className="flex mb-6 bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => {
                setMode('login');
                clearForm();
              }}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                mode === 'login'
                  ? 'bg-yellow-500 text-black'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              Entrar
            </button>
            <button
              onClick={() => {
                setMode('activation');
                clearForm();
              }}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                mode === 'activation'
                  ? 'bg-yellow-500 text-black'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              Ativar Conta
            </button>
          </div>

          {mode === 'login' ? (
            /* Formulário de Login */
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={loginData.email}
                    onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    placeholder="seu@email.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Senha
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    className="w-full pl-10 pr-10 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-600 text-black font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black"></div>
                ) : (
                  <>
                    <span>Entrar</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>
          ) : (
            /* Formulário de Ativação */
            <form onSubmit={handleActivation} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Código de Ativação
                </label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={activationData.code}
                    onChange={(e) => setActivationData({ ...activationData, code: e.target.value.toUpperCase() })}
                    className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-center font-mono text-lg tracking-widest"
                    placeholder="ABC123"
                    maxLength={6}
                    required
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1 text-center">
                  Digite o código de 6 caracteres fornecido
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nome Completo
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={activationData.name}
                    onChange={(e) => setActivationData({ ...activationData, name: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    placeholder="Seu Nome"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={activationData.email}
                    onChange={(e) => setActivationData({ ...activationData, email: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    placeholder="seu@email.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Senha
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={activationData.password}
                    onChange={(e) => setActivationData({ ...activationData, password: e.target.value })}
                    className="w-full pl-10 pr-10 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Confirmar Senha
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={activationData.confirmPassword}
                    onChange={(e) => setActivationData({ ...activationData, confirmPassword: e.target.value })}
                    className="w-full pl-10 pr-10 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    <span>Ativar Conta</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* Informações Adicionais */}
          <div className="mt-6 text-center">
            {mode === 'login' ? (
              <p className="text-sm text-gray-400">
                Não tem uma conta?{' '}
                <button
                  onClick={() => setMode('activation')}
                  className="text-yellow-400 hover:text-yellow-300 font-medium"
                >
                  Ative sua conta
                </button>
              </p>
            ) : (
              <p className="text-sm text-gray-400">
                Já tem uma conta?{' '}
                <button
                  onClick={() => setMode('login')}
                  className="text-yellow-400 hover:text-yellow-300 font-medium"
                >
                  Faça login
                </button>
              </p>
            )}
          </div>

          {/* Dicas */}
          {mode === 'activation' && (
            <div className="mt-6 p-4 bg-blue-900/20 border border-blue-700/30 rounded-lg">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-300">
                  <p className="font-medium mb-1">Como obter o código de ativação?</p>
                  <p>Entre em contato com o administrador do sistema ou solicite através do painel administrativo.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-xs text-gray-500">
            © 2024 TimeCash King. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </div>
  );
}
