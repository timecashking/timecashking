# TimeCash King Mobile App

Aplicativo móvel React Native para o TimeCash King - Sistema de controle financeiro pessoal.

## 🚀 Funcionalidades

### ✅ Implementadas
- **Autenticação com Google OAuth**
- **Dashboard interativo** com gráficos e resumos
- **Navegação por abas** (Dashboard, Transações, Relatórios, Notificações, Perfil)
- **Sincronização com API** em tempo real
- **Interface moderna** com React Native Paper
- **Gráficos interativos** com react-native-chart-kit
- **Armazenamento seguro** com expo-secure-store

### 🔄 Em Desenvolvimento
- Tela de transações completa
- Sistema de notificações push
- Relatórios detalhados
- Configurações de perfil
- Integração com APIs externas

## 📱 Screenshots

### Login Screen
- Interface limpa e moderna
- Login com Google OAuth
- Informações sobre recursos do app

### Dashboard
- Resumo financeiro em tempo real
- Gráficos de evolução
- Transações recentes
- Ações rápidas

## 🛠️ Tecnologias Utilizadas

- **React Native** - Framework principal
- **Expo** - Plataforma de desenvolvimento
- **TypeScript** - Tipagem estática
- **React Navigation** - Navegação
- **React Native Paper** - Componentes UI
- **React Native Chart Kit** - Gráficos
- **Axios** - Cliente HTTP
- **Expo Secure Store** - Armazenamento seguro
- **Expo Auth Session** - Autenticação OAuth

## 📋 Pré-requisitos

- Node.js 18+
- npm ou yarn
- Expo CLI
- Conta Google Cloud (para OAuth)

## 🔧 Instalação

1. **Clone o repositório**
   ```bash
   git clone https://github.com/timecashking/timecashking.git
   cd timecashking/mobile
   ```

2. **Instale as dependências**
   ```bash
   npm install
   ```

3. **Configure as variáveis de ambiente**
   ```bash
   cp env.example .env
   ```
   
   Edite o arquivo `.env` com suas configurações:
   ```env
   EXPO_PUBLIC_API_URL=https://timecashking-api.onrender.com
   EXPO_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
   EXPO_PUBLIC_VAPID_PUBLIC_KEY=your-vapid-key
   ```

4. **Configure o Google OAuth**
   - Acesse [Google Cloud Console](https://console.cloud.google.com)
   - Crie um projeto ou use um existente
   - Ative a API Google+ 
   - Crie credenciais OAuth 2.0
   - Adicione o scheme `timecashking://` nas URIs de redirecionamento

## 🚀 Executando o App

### Desenvolvimento
```bash
# Iniciar o servidor de desenvolvimento
npm start

# Executar no Android
npm run android

# Executar no iOS (requer macOS)
npm run ios

# Executar na web
npm run web
```

### Produção
```bash
# Build para Android
eas build --platform android

# Build para iOS
eas build --platform ios
```

## 📱 Estrutura do Projeto

```
src/
├── contexts/
│   └── AuthContext.tsx          # Contexto de autenticação
├── navigation/
│   └── AppNavigator.tsx         # Navegação principal
├── screens/
│   ├── LoginScreen.tsx          # Tela de login
│   └── DashboardScreen.tsx     # Dashboard principal
├── services/
│   └── api.ts                   # Serviço de API
└── types/
    └── index.ts                  # Definições TypeScript
```

## 🔐 Autenticação

O app utiliza autenticação OAuth com Google:

1. **Fluxo de Login**
   - Usuário clica em "Entrar com Google"
   - Redirecionamento para Google OAuth
   - Troca de código por token
   - Armazenamento seguro do token
   - Redirecionamento para dashboard

2. **Persistência**
   - Tokens armazenados em SecureStore
   - Verificação automática de validade
   - Logout automático em token expirado

## 📊 Dashboard

### Resumo Financeiro
- Receitas e despesas do período
- Saldo atual
- Comparação com períodos anteriores

### Gráficos
- **Linha**: Evolução financeira ao longo do tempo
- **Pizza**: Distribuição receitas vs despesas

### Transações Recentes
- Lista das últimas 5 transações
- Ícones por tipo (receita/despesa)
- Formatação de moeda brasileira

## 🔄 Sincronização

### API Integration
- Cliente Axios configurado
- Interceptors para autenticação
- Tratamento de erros automático
- Refresh automático de dados

### Endpoints Utilizados
- `/auth/google` - Login OAuth
- `/auth/me` - Dados do usuário
- `/summary` - Resumo financeiro
- `/transactions` - Lista de transações

## 🎨 Design System

### Cores
- **Primária**: `#10b981` (Verde)
- **Secundária**: `#6b7280` (Cinza)
- **Erro**: `#ef4444` (Vermelho)
- **Sucesso**: `#10b981` (Verde)

### Componentes
- **React Native Paper** para UI consistente
- **Ícones** do Material Design
- **Tipografia** hierárquica
- **Espaçamento** padronizado

## 📱 Responsividade

- **Adaptação automática** para diferentes tamanhos de tela
- **Orientação portrait** otimizada
- **Safe area** respeitada
- **Touch targets** adequados

## 🔔 Notificações

### Push Notifications
- Configuração com Expo Notifications
- VAPID keys para autenticação
- Categorização de notificações
- Preferências do usuário

### Tipos de Notificação
- **Lembretes** - Transações pendentes
- **Alertas** - Gastos excessivos
- **Relatórios** - Resumos periódicos
- **Pagamentos** - Status de assinatura

## 🧪 Testes

### Testes Unitários
```bash
npm test
```

### Testes E2E
```bash
npm run test:e2e
```

## 📦 Build e Deploy

### EAS Build
```bash
# Configurar EAS
eas build:configure

# Build para produção
eas build --platform all --profile production
```

### App Stores
- **Google Play Store** - Android
- **App Store** - iOS

## 🐛 Troubleshooting

### Problemas Comuns

1. **Erro de OAuth**
   - Verificar Google Client ID
   - Confirmar URIs de redirecionamento
   - Verificar permissões da API

2. **Erro de API**
   - Verificar URL da API
   - Confirmar conectividade
   - Verificar logs do servidor

3. **Erro de Build**
   - Limpar cache: `expo r -c`
   - Reinstalar dependências
   - Verificar versões do Expo

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch: `git checkout -b feature/nova-feature`
3. Commit: `git commit -m 'Add nova feature'`
4. Push: `git push origin feature/nova-feature`
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](../LICENSE) para mais detalhes.

## 📞 Suporte

- **Email**: suporte@timecashking.com
- **Documentação**: [docs.timecashking.com](https://docs.timecashking.com)
- **Issues**: [GitHub Issues](https://github.com/timecashking/timecashking/issues)

## 🚀 Próximos Passos

- [ ] Implementar tela de transações completa
- [ ] Adicionar sistema de notificações push
- [ ] Criar relatórios detalhados
- [ ] Implementar configurações de perfil
- [ ] Adicionar integração com APIs externas
- [ ] Implementar modo offline
- [ ] Adicionar testes automatizados
- [ ] Otimizar performance

---

**TimeCash King Mobile** - Controle financeiro na palma da sua mão! 💰📱
