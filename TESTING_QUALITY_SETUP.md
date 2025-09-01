# Configuração de Testes e Qualidade - TimeCash King

## 🧪 Visão Geral

Este guia abrange a configuração completa de testes automatizados e ferramentas de qualidade de código para o TimeCash King, garantindo confiabilidade, manutenibilidade e excelência técnica.

## 📋 Funcionalidades Implementadas

### ✅ **Testes Automatizados**
- **Testes Unitários** - Backend (Jest) e Frontend (Vitest)
- **Testes de Integração** - Fluxos completos da API
- **Testes de Componentes** - React components com Testing Library
- **Testes de Hooks** - Custom hooks com renderHook
- **Cobertura de Testes** - Mínimo 80% de cobertura
- **Testes E2E** - Playwright para cenários end-to-end

### 🔧 **Ferramentas de Qualidade**
- **ESLint** - Linting de código JavaScript/TypeScript
- **Prettier** - Formatação automática de código
- **Husky** - Git hooks para qualidade
- **lint-staged** - Linting apenas arquivos modificados
- **TypeScript** - Verificação de tipos estática
- **Commitlint** - Padronização de commits

### 📊 **Monitoramento de Qualidade**
- **CodeQL** - Análise de segurança
- **Dependency scanning** - Vulnerabilidades em dependências
- **SonarQube** - Análise de qualidade de código
- **Coverage reports** - Relatórios de cobertura
- **Performance testing** - Testes de performance

## 🚀 Configuração Rápida

### 1. **Instalar Dependências**

```bash
# Backend
cd .
npm install

# Frontend
cd web
npm install

# Mobile
cd mobile
npm install
```

### 2. **Configurar Git Hooks**

```bash
# Backend
cd .
npm run prepare

# Frontend
cd web
npm run prepare
```

### 3. **Executar Testes**

```bash
# Backend
npm run test:ci

# Frontend
cd web
npm run test:ci
```

## 📁 Estrutura de Testes

### **Backend (`src/tests/`)**
```
src/tests/
├── setup.js                 # Configuração global dos testes
├── unit/                     # Testes unitários
│   ├── controllers/         # Testes de controllers
│   │   ├── auth.test.js
│   │   ├── transactions.test.js
│   │   ├── categories.test.js
│   │   ├── subscriptions.test.js
│   │   └── notifications.test.js
│   ├── middleware/          # Testes de middleware
│   ├── services/            # Testes de services
│   └── utils/               # Testes de utilitários
├── integration/             # Testes de integração
│   ├── api.test.js          # Fluxos completos da API
│   ├── auth-flow.test.js    # Fluxo de autenticação
│   └── database.test.js     # Testes de banco de dados
└── e2e/                     # Testes end-to-end
    ├── auth.spec.js
    ├── transactions.spec.js
    └── dashboard.spec.js
```

### **Frontend (`web/src/tests/`)**
```
web/src/tests/
├── setup.ts                 # Configuração global dos testes
├── components/              # Testes de componentes
│   ├── TransactionCard.test.tsx
│   ├── Dashboard.test.tsx
│   ├── LoginForm.test.tsx
│   └── Navigation.test.tsx
├── hooks/                   # Testes de hooks
│   ├── useAuth.test.ts
│   ├── useTransactions.test.ts
│   └── useNotifications.test.ts
├── pages/                   # Testes de páginas
│   ├── Dashboard.test.tsx
│   ├── Transactions.test.tsx
│   └── Profile.test.tsx
└── utils/                   # Testes de utilitários
    ├── formatters.test.ts
    ├── validators.test.ts
    └── api.test.ts
```

## 🧪 Executando Testes

### **Comandos Principais**

```bash
# Backend
npm run test              # Executar todos os testes
npm run test:watch        # Modo watch
npm run test:coverage     # Com cobertura
npm run test:ci          # Para CI/CD

# Frontend
cd web
npm run test             # Executar todos os testes
npm run test:ui          # Interface visual
npm run test:coverage    # Com cobertura
npm run test:ci         # Para CI/CD
```

### **Testes Específicos**

```bash
# Testar apenas um arquivo
npm test -- auth.test.js

# Testar com filtro
npm test -- --grep "login"

# Testar com verbose
npm test -- --verbose

# Testar com debug
npm test -- --detectOpenHandles
```

## 🔧 Ferramentas de Qualidade

### **ESLint**

```bash
# Verificar código
npm run lint

# Corrigir automaticamente
npm run lint:fix
```

**Configuração (`.eslintrc.js`)**
```javascript
module.exports = {
  env: {
    node: true,
    es2021: true,
    jest: true,
  },
  extends: [
    'eslint:recommended',
    '@typescript-eslint/recommended',
    'prettier',
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'prettier'],
  rules: {
    'prettier/prettier': 'error',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'no-console': 'warn',
    'prefer-const': 'error',
  },
};
```

### **Prettier**

```bash
# Formatar código
npm run format

# Verificar formatação
npm run format:check
```

**Configuração (`.prettierrc`)**
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false
}
```

### **TypeScript**

```bash
# Verificar tipos
npm run type-check
```

## 📊 Cobertura de Testes

### **Backend (Jest)**
- **Branches**: 80%
- **Functions**: 80%
- **Lines**: 80%
- **Statements**: 80%

### **Frontend (Vitest)**
- **Branches**: 80%
- **Functions**: 80%
- **Lines**: 80%
- **Statements**: 80%

### **Relatórios de Cobertura**

```bash
# Gerar relatório HTML
npm run test:coverage

# Abrir relatório
open coverage/lcov-report/index.html
```

## 🚀 CI/CD Integration

### **GitHub Actions**

```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm run test:ci
      - run: npm run lint
      - run: npm run type-check
```

### **Pre-commit Hooks**

```bash
# .husky/pre-commit
#!/bin/sh
npx lint-staged
```

## 📝 Padrões de Teste

### **Estrutura de Teste (AAA Pattern)**

```javascript
describe('Component/Function Name', () => {
  // Arrange - Preparar dados e mocks
  beforeEach(() => {
    // Setup
  });

  it('should do something when condition', () => {
    // Arrange - Preparar
    const input = 'test';
    
    // Act - Executar
    const result = function(input);
    
    // Assert - Verificar
    expect(result).toBe('expected');
  });
});
```

### **Nomenclatura de Testes**

```javascript
// ✅ Boas práticas
describe('UserService', () => {
  it('should create user with valid data');
  it('should throw error with invalid email');
  it('should update user profile successfully');
});

// ❌ Evitar
describe('UserService', () => {
  it('test1');
  it('works');
  it('should work');
});
```

### **Mocks e Stubs**

```javascript
// Mock de dependência externa
jest.mock('@/services/api', () => ({
  apiService: {
    loginWithGoogle: jest.fn(),
    getCurrentUser: jest.fn(),
  },
}));

// Mock de localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
};
global.localStorage = localStorageMock;
```

## 🔍 Testes de Integração

### **Fluxos Completos**

```javascript
describe('Authentication Flow', () => {
  it('should complete full authentication flow', async () => {
    // 1. Login com Google
    const authResponse = await request(app)
      .post('/auth/google')
      .send({ credential: 'valid-token' });
    
    expect(authResponse.status).toBe(200);
    
    // 2. Obter perfil do usuário
    const token = authResponse.body.token;
    const profileResponse = await request(app)
      .get('/auth/me')
      .set('Authorization', `Bearer ${token}`);
    
    expect(profileResponse.status).toBe(200);
  });
});
```

### **Testes de Banco de Dados**

```javascript
describe('Database Integration', () => {
  beforeEach(async () => {
    // Limpar banco de dados de teste
    await prisma.transaction.deleteMany();
    await prisma.user.deleteMany();
  });

  it('should persist transaction to database', async () => {
    const transaction = await createTransaction(mockData);
    expect(transaction).toBeDefined();
    expect(transaction.id).toBeDefined();
  });
});
```

## 🎯 Testes E2E

### **Playwright Setup**

```bash
# Instalar Playwright
npm install -D @playwright/test

# Instalar browsers
npx playwright install

# Executar testes
npx playwright test
```

### **Exemplo de Teste E2E**

```javascript
// tests/auth.spec.js
import { test, expect } from '@playwright/test';

test('user can login and access dashboard', async ({ page }) => {
  // Navegar para página de login
  await page.goto('/login');
  
  // Fazer login
  await page.click('[data-testid="google-login"]');
  
  // Verificar redirecionamento
  await expect(page).toHaveURL('/dashboard');
  
  // Verificar elementos do dashboard
  await expect(page.locator('[data-testid="dashboard-title"]')).toBeVisible();
});
```

## 📈 Monitoramento de Qualidade

### **SonarQube**

```yaml
# sonar-project.properties
sonar.projectKey=timecashking
sonar.projectName=TimeCash King
sonar.projectVersion=1.0.0
sonar.sources=src
sonar.tests=tests
sonar.javascript.lcov.reportPaths=coverage/lcov.info
```

### **CodeQL**

```yaml
# .github/workflows/codeql.yml
name: CodeQL
on: [push, pull_request]
jobs:
  analyze:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: github/codeql-action/init@v2
      - uses: github/codeql-action/analyze@v2
```

## 🛠️ Troubleshooting

### **Problemas Comuns**

#### **Testes Falhando**
```bash
# Limpar cache
npm run test -- --clearCache

# Executar com debug
npm run test -- --verbose --detectOpenHandles
```

#### **Cobertura Baixa**
```bash
# Verificar arquivos não cobertos
npm run test:coverage -- --collectCoverageFrom="src/**/*.{js,ts}"

# Gerar relatório detalhado
npm run test:coverage -- --coverageReporters=text-lcov
```

#### **ESLint Errors**
```bash
# Verificar configuração
npx eslint --print-config src/index.js

# Corrigir automaticamente
npm run lint:fix
```

### **Performance Testing**

```javascript
// tests/performance.test.js
describe('API Performance', () => {
  it('should respond within 200ms', async () => {
    const start = Date.now();
    await request(app).get('/api/health');
    const duration = Date.now() - start;
    
    expect(duration).toBeLessThan(200);
  });
});
```

## 📚 Recursos Adicionais

### **Documentação**
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Vitest Documentation](https://vitest.dev/)
- [Testing Library](https://testing-library.com/)
- [Playwright Documentation](https://playwright.dev/)

### **Ferramentas Recomendadas**
- **Jest** - Framework de testes para Node.js
- **Vitest** - Framework de testes para Vite
- **Testing Library** - Utilitários para testar componentes
- **Playwright** - Testes E2E
- **ESLint** - Linting de código
- **Prettier** - Formatação de código
- **Husky** - Git hooks
- **SonarQube** - Análise de qualidade

### **Boas Práticas**
1. **Teste primeiro** - TDD quando possível
2. **Cobertura alta** - Mínimo 80%
3. **Testes isolados** - Sem dependências externas
4. **Nomenclatura clara** - Descrever comportamento
5. **Mocks apropriados** - Evitar dependências reais
6. **Assertions específicas** - Evitar expectativas genéricas
7. **Limpeza adequada** - Cleanup após cada teste

## 🎯 Próximos Passos

### **Melhorias Planejadas**
1. **Testes de Performance** - Load testing
2. **Testes de Acessibilidade** - axe-core
3. **Testes de Segurança** - OWASP ZAP
4. **Testes de Compatibilidade** - Cross-browser testing
5. **Testes de Regressão Visual** - Percy
6. **Testes de API Contract** - Pact
7. **Testes de Stress** - Artillery
8. **Testes de Mutação** - Stryker

### **Integração Contínua**
1. **SonarQube** - Análise de qualidade
2. **Codecov** - Relatórios de cobertura
3. **Dependabot** - Atualizações de dependências
4. **Renovate** - Manutenção automática
5. **Snyk** - Segurança de dependências

---

## 📞 Suporte

Para dúvidas sobre testes e qualidade:

1. **Documentação** - Consulte este guia
2. **Issues** - Abra issue no GitHub
3. **Discussions** - Use GitHub Discussions
4. **Code Review** - Solicite review de PR

---

**TimeCash King** - Testes e Qualidade de Código 🧪✨
