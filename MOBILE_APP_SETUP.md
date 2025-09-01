# Configuração do App Móvel - TimeCash King

## 📱 Visão Geral

O TimeCash King Mobile é um aplicativo React Native desenvolvido com Expo que oferece controle financeiro completo na palma da sua mão. O app sincroniza com a API backend e oferece uma experiência nativa em iOS e Android.

## 🚀 Funcionalidades Implementadas

### ✅ Core Features
- **Autenticação OAuth com Google**
- **Dashboard interativo** com gráficos em tempo real
- **Navegação por abas** (Dashboard, Transações, Relatórios, Notificações, Perfil)
- **Sincronização automática** com a API backend
- **Interface moderna** com React Native Paper
- **Gráficos interativos** com react-native-chart-kit
- **Armazenamento seguro** de tokens e dados

### 📊 Dashboard Features
- Resumo financeiro (receitas, despesas, saldo)
- Gráfico de linha para evolução temporal
- Gráfico de pizza para distribuição
- Lista de transações recentes
- Seletor de período (semana, mês, ano)
- Ações rápidas (nova transação, relatórios)

## 🛠️ Stack Tecnológica

- **React Native** - Framework principal
- **Expo SDK 53** - Plataforma de desenvolvimento
- **TypeScript** - Tipagem estática
- **React Navigation 6** - Navegação
- **React Native Paper** - Componentes UI Material Design
- **React Native Chart Kit** - Gráficos interativos
- **Axios** - Cliente HTTP
- **Expo Secure Store** - Armazenamento seguro
- **Expo Auth Session** - Autenticação OAuth

## 📋 Pré-requisitos

### Desenvolvimento
- Node.js 18+
- npm ou yarn
- Expo CLI (`npm install -g @expo/cli`)
- Android Studio (para Android)
- Xcode (para iOS, apenas macOS)

### Contas Necessárias
- **Google Cloud Console** - Para OAuth
- **Expo Account** - Para builds e deploy
- **App Store Connect** - Para iOS (opcional)
- **Google Play Console** - Para Android (opcional)

## 🔧 Instalação e Configuração

### 1. Configuração do Projeto

```bash
# Navegar para o diretório mobile
cd mobile

# Instalar dependências
npm install

# Instalar dependências específicas do Expo
npx expo install react-native-screens react-native-safe-area-context
```

### 2. Configuração de Ambiente

```bash
# Copiar arquivo de exemplo
cp env.example .env

# Editar variáveis de ambiente
```

**Arquivo `.env`:**
```env
# API Configuration
EXPO_PUBLIC_API_URL=https://timecashking-api.onrender.com

# Google OAuth
EXPO_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id-here

# Push Notifications
EXPO_PUBLIC_VAPID_PUBLIC_KEY=your-vapid-public-key-here

# External APIs (Optional)
EXPO_PUBLIC_TWELVE_DATA_API_KEY=your-twelve-data-api-key
EXPO_PUBLIC_OPENWEATHER_API_KEY=your-openweather-api-key
```

### 3. Configuração do Google OAuth

1. **Acesse [Google Cloud Console](https://console.cloud.google.com)**
2. **Crie um projeto ou use existente**
3. **Ative as APIs necessárias:**
   - Google+ API
   - Google OAuth 2.0
4. **Crie credenciais OAuth 2.0:**
   - Tipo: Aplicativo móvel
   - URIs de redirecionamento: `timecashking://auth`
5. **Copie o Client ID para o arquivo `.env`**

### 4. Configuração do Expo

```bash
# Login no Expo
expo login

# Configurar EAS Build (opcional)
eas build:configure
```

## 🚀 Executando o App

### Desenvolvimento Local

```bash
# Iniciar servidor de desenvolvimento
npm start

# Ou usar Expo CLI
expo start
```

### Plataformas Específicas

```bash
# Android
npm run android
# ou
expo start --android

# iOS (requer macOS)
npm run ios
# ou
expo start --ios

# Web
npm run web
# ou
expo start --web
```

### Testando no Dispositivo

1. **Instale o app Expo Go** no seu dispositivo
2. **Escaneie o QR code** que aparece no terminal
3. **O app será carregado** automaticamente

## 📱 Estrutura do Projeto

```
mobile/
├── src/
│   ├── contexts/
│   │   └── AuthContext.tsx          # Contexto de autenticação
│   ├── navigation/
│   │   └── AppNavigator.tsx         # Navegação principal
│   ├── screens/
│   │   ├── LoginScreen.tsx          # Tela de login
│   │   └── DashboardScreen.tsx     # Dashboard principal
│   ├── services/
│   │   └── api.ts                   # Serviço de API
│   └── types/
│       └── index.ts                  # Definições TypeScript
├── assets/                           # Imagens e ícones
├── App.tsx                           # Componente principal
├── app.json                          # Configuração Expo
├── package.json                      # Dependências
└── README.md                         # Documentação
```

## 🔐 Sistema de Autenticação

### Fluxo OAuth
1. **Usuário clica** em "Entrar com Google"
2. **Redirecionamento** para Google OAuth
3. **Autorização** do usuário
4. **Troca de código** por token
5. **Armazenamento seguro** do token
6. **Redirecionamento** para dashboard

### Persistência
- **Tokens** armazenados em SecureStore
- **Verificação automática** de validade
- **Logout automático** em token expirado
- **Refresh automático** de dados

## 📊 Dashboard e Gráficos

### Resumo Financeiro
- **Receitas e despesas** do período selecionado
- **Saldo atual** com formatação brasileira
- **Comparação** com períodos anteriores

### Gráficos Implementados
- **Linha**: Evolução financeira temporal
- **Pizza**: Distribuição receitas vs despesas
- **Responsivos** para diferentes tamanhos de tela

### Dados em Tempo Real
- **Sincronização automática** com API
- **Pull-to-refresh** para atualização manual
- **Loading states** para melhor UX

## 🔄 Integração com API

### Endpoints Utilizados
```typescript
// Autenticação
POST /auth/google              // Login OAuth
GET  /auth/me                  // Dados do usuário

// Transações
GET  /transactions             // Lista de transações
POST /transactions             // Nova transação
PATCH /transactions/:id        // Atualizar transação
DELETE /transactions/:id       // Deletar transação

// Resumos
GET  /summary?period=month     // Resumo financeiro

// Categorias
GET  /categories              // Lista de categorias
POST /categories               // Nova categoria

// Notificações
GET  /notifications            // Lista de notificações
PATCH /notifications/:id/read  // Marcar como lida
```

### Cliente HTTP Configurado
- **Axios** com interceptors
- **Autenticação automática** com Bearer token
- **Tratamento de erros** centralizado
- **Timeout** configurado (10s)

## 🎨 Design System

### Cores
```css
/* Primária */
--primary: #10b981;     /* Verde */

/* Secundária */
--secondary: #6b7280;    /* Cinza */

/* Estados */
--success: #10b981;      /* Verde */
--error: #ef4444;       /* Vermelho */
--warning: #f59e0b;     /* Amarelo */

/* Neutros */
--background: #f8fafc;  /* Fundo */
--surface: #ffffff;      /* Superfícies */
--text: #1f2937;         /* Texto principal */
--text-secondary: #6b7280; /* Texto secundário */
```

### Componentes
- **React Native Paper** para consistência
- **Material Design** como base
- **Ícones** do Material Design
- **Tipografia** hierárquica
- **Espaçamento** padronizado

## 📱 Responsividade

### Adaptações
- **Safe area** respeitada
- **Orientação portrait** otimizada
- **Touch targets** adequados (44px mínimo)
- **Scroll** suave e responsivo

### Breakpoints
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

## 🔔 Notificações Push

### Configuração
```bash
# Instalar dependências
npx expo install expo-notifications expo-device

# Configurar VAPID keys
# Adicionar no .env:
EXPO_PUBLIC_VAPID_PUBLIC_KEY=your-vapid-key
```

### Tipos de Notificação
- **Lembretes**: Transações pendentes
- **Alertas**: Gastos excessivos
- **Relatórios**: Resumos periódicos
- **Pagamentos**: Status de assinatura

## 🧪 Testes

### Testes Unitários
```bash
# Instalar Jest
npm install --save-dev jest @testing-library/react-native

# Executar testes
npm test
```

### Testes E2E
```bash
# Instalar Detox
npm install --save-dev detox

# Executar testes E2E
npm run test:e2e
```

## 📦 Build e Deploy

### EAS Build (Recomendado)

```bash
# Configurar EAS
eas build:configure

# Build para Android
eas build --platform android

# Build para iOS
eas build --platform ios

# Build para ambas plataformas
eas build --platform all
```

### Build Local (Legacy)

```bash
# Android
expo build:android

# iOS
expo build:ios
```

### App Stores

#### Google Play Store
1. **Criar conta** no Google Play Console
2. **Configurar app** com informações básicas
3. **Upload APK/AAB** gerado pelo EAS
4. **Configurar** preços e disponibilidade
5. **Publicar** na loja

#### App Store
1. **Criar conta** no App Store Connect
2. **Configurar app** com informações básicas
3. **Upload IPA** gerado pelo EAS
4. **Configurar** preços e disponibilidade
5. **Enviar para revisão**

## 🐛 Troubleshooting

### Problemas Comuns

#### 1. Erro de OAuth
```bash
# Verificar configuração
- Google Client ID correto
- URIs de redirecionamento configurados
- APIs ativadas no Google Cloud
```

#### 2. Erro de API
```bash
# Verificar conectividade
- URL da API correta
- Servidor backend rodando
- Tokens válidos
```

#### 3. Erro de Build
```bash
# Limpar cache
expo r -c

# Reinstalar dependências
rm -rf node_modules
npm install

# Verificar versões
expo doctor
```

#### 4. Erro de Metro
```bash
# Limpar cache do Metro
npx react-native start --reset-cache

# Ou com Expo
expo start -c
```

### Logs Úteis

```bash
# Logs do Expo
expo logs

# Logs do Android
adb logcat

# Logs do iOS
xcrun simctl spawn booted log stream
```

## 🔧 Configurações Avançadas

### Performance
- **Lazy loading** de componentes
- **Memoização** de dados
- **Otimização** de re-renders
- **Compressão** de imagens

### Segurança
- **Certificados SSL** para produção
- **Validação** de entrada
- **Sanitização** de dados
- **Auditoria** de segurança

### Monitoramento
- **Crashlytics** para crashes
- **Analytics** para uso
- **Performance** monitoring
- **Error tracking**

## 🚀 Próximos Passos

### Funcionalidades Planejadas
- [ ] **Tela de transações** completa
- [ ] **Sistema de notificações** push nativo
- [ ] **Relatórios detalhados** com filtros
- [ ] **Configurações de perfil** avançadas
- [ ] **Integração com APIs** externas
- [ ] **Modo offline** com sincronização
- [ ] **Testes automatizados** completos
- [ ] **Otimização de performance**

### Melhorias Técnicas
- [ ] **TypeScript strict mode**
- [ ] **ESLint** e **Prettier** configurados
- [ ] **Husky** para pre-commit hooks
- [ ] **CI/CD** pipeline
- [ ] **Code coverage** 90%+
- [ ] **Bundle analyzer** para otimização

## 📞 Suporte

### Recursos
- **Documentação**: [docs.timecashking.com](https://docs.timecashking.com)
- **Issues**: [GitHub Issues](https://github.com/timecashking/timecashking/issues)
- **Discord**: [Comunidade TimeCash King](https://discord.gg/timecashking)

### Contato
- **Email**: suporte@timecashking.com
- **Telegram**: @timecashking_support
- **WhatsApp**: +55 11 99999-9999

---

**TimeCash King Mobile** - Controle financeiro na palma da sua mão! 💰📱

*Última atualização: Janeiro 2024*
