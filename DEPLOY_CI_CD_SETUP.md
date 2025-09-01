# Configuração de Deploy e CI/CD - TimeCash King

## 🚀 Visão Geral

Este guia abrange a configuração completa de CI/CD (Continuous Integration/Continuous Deployment) para o TimeCash King, incluindo pipelines automatizados, monitoramento e deploy para diferentes ambientes.

## 📋 Funcionalidades Implementadas

### ✅ CI/CD Pipeline
- **GitHub Actions** - Pipelines automatizados
- **Testes automatizados** - Unit, integration e security
- **Deploy automático** - Render (backend) e Netlify (frontend)
- **Build do mobile** - EAS Build para iOS e Android
- **Monitoramento** - Health checks e alertas
- **Segurança** - CodeQL, dependency scanning, secrets check

### 🔧 Scripts de Deploy
- **Deploy script** - Automatizado para diferentes ambientes
- **Docker** - Containerização completa
- **Docker Compose** - Ambiente de desenvolvimento
- **Rollback** - Reversão de versões

### 📊 Monitoramento
- **Health checks** - Verificação de serviços
- **Performance monitoring** - Métricas de tempo de resposta
- **SSL/TLS verification** - Verificação de certificados
- **Alertas** - Notificações automáticas

## 🛠️ Stack Tecnológica

- **GitHub Actions** - CI/CD pipelines
- **Docker** - Containerização
- **Render** - Deploy do backend
- **Netlify** - Deploy do frontend
- **EAS Build** - Build do mobile
- **Prometheus** - Monitoramento
- **Grafana** - Visualização de métricas

## 📁 Estrutura dos Workflows

```
.github/workflows/
├── ci-cd.yml              # Pipeline principal
├── security.yml           # Verificações de segurança
└── monitoring.yml         # Monitoramento e alertas

scripts/
└── deploy.sh              # Script de deploy

Dockerfile                 # Container do backend
docker-compose.yml         # Ambiente de desenvolvimento
```

## 🔧 Configuração Inicial

### 1. Configurar Secrets no GitHub

Acesse **Settings > Secrets and variables > Actions** e adicione:

```bash
# Render (Backend)
RENDER_TOKEN=your-render-api-token
RENDER_SERVICE_ID=your-render-service-id

# Netlify (Frontend)
NETLIFY_AUTH_TOKEN=your-netlify-auth-token
NETLIFY_SITE_ID=your-netlify-site-id

# Expo (Mobile)
EXPO_TOKEN=your-expo-access-token

# Notificações (Opcional)
SLACK_WEBHOOK_URL=your-slack-webhook-url
DISCORD_WEBHOOK_URL=your-discord-webhook-url
```

### 2. Configurar Render

1. **Criar conta** em [render.com](https://render.com)
2. **Conectar repositório** do GitHub
3. **Criar Web Service**:
   - **Build Command**: `npm ci && npx prisma generate`
   - **Start Command**: `npm start`
   - **Environment**: Node 18
4. **Configurar variáveis de ambiente**:
   ```bash
   NODE_ENV=production
   DATABASE_URL=your-database-url
   JWT_SECRET=your-jwt-secret
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   STRIPE_SECRET_KEY=your-stripe-secret-key
   STRIPE_WEBHOOK_SECRET=your-stripe-webhook-secret
   GMAIL_USER=your-gmail-user
   GMAIL_PASS=your-gmail-app-password
   VAPID_PUBLIC_KEY=your-vapid-public-key
   VAPID_PRIVATE_KEY=your-vapid-private-key
   TWELVE_DATA_API_KEY=your-twelve-data-api-key
   OPENWEATHER_API_KEY=your-openweather-api-key
   ```

### 3. Configurar Netlify

1. **Criar conta** em [netlify.com](https://netlify.com)
2. **Conectar repositório** do GitHub
3. **Configurar build**:
   - **Build command**: `cd web && npm ci && npm run build`
   - **Publish directory**: `web/dist`
   - **Base directory**: `/`
4. **Configurar variáveis de ambiente**:
   ```bash
   VITE_API_URL=https://timecashking-api.onrender.com
   ```

### 4. Configurar Expo

1. **Instalar EAS CLI**:
   ```bash
   npm install -g @expo/eas-cli
   ```

2. **Login no Expo**:
   ```bash
   eas login
   ```

3. **Configurar EAS**:
   ```bash
   cd mobile
   eas build:configure
   ```

## 🚀 Workflows GitHub Actions

### 1. Pipeline Principal (`ci-cd.yml`)

**Triggers**: Push para `main`, Pull Requests

**Jobs**:
- **Test**: Linting, testes, build
- **Deploy Backend**: Deploy para Render
- **Deploy Frontend**: Deploy para Netlify
- **Build Mobile**: Build para iOS/Android
- **Integration Tests**: Testes de integração
- **Notify**: Notificações de sucesso/falha

### 2. Verificações de Segurança (`security.yml`)

**Triggers**: Push, PR, Schedule (diário)

**Jobs**:
- **Dependency Check**: Verificar vulnerabilidades
- **CodeQL**: Análise de código
- **Secrets Check**: Verificar secrets no código
- **License Check**: Verificar licenças
- **Security Config**: Verificar configurações
- **Security Report**: Relatório consolidado

### 3. Monitoramento (`monitoring.yml`)

**Triggers**: Schedule (15min), Manual

**Jobs**:
- **Health Check**: Verificar serviços online
- **Performance Monitor**: Métricas de performance
- **Critical Endpoints**: Testar endpoints críticos
- **SSL Check**: Verificar certificados SSL
- **Alerts**: Gerar alertas e notificações

## 📦 Scripts de Deploy

### Script Principal (`scripts/deploy.sh`)

```bash
# Deploy completo para produção
./scripts/deploy.sh production all

# Deploy apenas do backend
./scripts/deploy.sh production backend

# Deploy apenas do frontend
./scripts/deploy.sh production frontend

# Build do mobile
./scripts/deploy.sh production mobile

# Rollback
./scripts/deploy.sh production rollback
```

### Variáveis de Ambiente Necessárias

```bash
# Render
export RENDER_TOKEN="your-render-token"
export RENDER_SERVICE_ID="your-service-id"

# Netlify
export NETLIFY_AUTH_TOKEN="your-netlify-token"
export NETLIFY_SITE_ID="your-site-id"

# Expo
export EXPO_TOKEN="your-expo-token"
```

## 🐳 Docker e Containerização

### Dockerfile Principal

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npx prisma generate
EXPOSE 3000
CMD ["npm", "start"]
```

### Docker Compose (Desenvolvimento)

```bash
# Iniciar todos os serviços
docker-compose up -d

# Ver logs
docker-compose logs -f

# Parar serviços
docker-compose down

# Rebuild
docker-compose up --build
```

### Serviços Incluídos

- **Backend**: API Node.js
- **Frontend**: React/Vite
- **PostgreSQL**: Banco de dados
- **Redis**: Cache e sessões
- **Nginx**: Proxy reverso
- **Prometheus**: Monitoramento
- **Grafana**: Visualização

## 📊 Monitoramento e Alertas

### Health Checks

**Endpoints monitorados**:
- `https://timecashking-api.onrender.com/api/health`
- `https://timecashking.netlify.app`

**Métricas coletadas**:
- Tempo de resposta
- Status codes
- Disponibilidade
- SSL/TLS status

### Alertas Automáticos

**Condições de alerta**:
- Serviço offline por > 3 tentativas
- Tempo de resposta > 10s (backend) / 15s (frontend)
- Status code != 200
- SSL/TLS inválido

**Notificações**:
- GitHub Actions logs
- Slack/Discord webhooks (configurável)
- Email (configurável)

## 🔒 Segurança

### Verificações Automáticas

1. **Dependency Scanning**:
   ```bash
   npm audit --audit-level=moderate
   ```

2. **CodeQL Analysis**:
   - Vulnerabilidades de segurança
   - Bugs e code smells
   - Análise estática

3. **Secrets Detection**:
   - API keys no código
   - Passwords hardcoded
   - Tokens expostos

4. **License Compliance**:
   - Verificar licenças permitidas
   - MIT, ISC, Apache-2.0, BSD

### Configurações de Segurança

```javascript
// Headers de segurança
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// Rate limiting
app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // limite por IP
}));

// CORS
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
}));
```

## 📈 Métricas e Performance

### Prometheus Metrics

```javascript
// Métricas customizadas
const httpRequestDurationMicroseconds = new prometheus.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
});

const httpRequestsTotal = new prometheus.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
});
```

### Grafana Dashboards

**Dashboards incluídos**:
- **API Performance**: Tempo de resposta, throughput
- **Error Rates**: Taxa de erros por endpoint
- **System Resources**: CPU, memória, disco
- **Business Metrics**: Transações, usuários ativos

## 🚀 Deploy para Produção

### 1. Deploy Automático

**Trigger**: Push para branch `main`

```bash
# Fluxo automático
git push origin main
# ↓
GitHub Actions executa
# ↓
Testes passam
# ↓
Deploy para Render (backend)
# ↓
Deploy para Netlify (frontend)
# ↓
Build mobile apps
# ↓
Health checks
# ↓
Notificação de sucesso
```

### 2. Deploy Manual

```bash
# Usando script
./scripts/deploy.sh production all

# Usando GitHub Actions
# Acesse: Actions > Deploy Manual > Run workflow
```

### 3. Rollback

```bash
# Rollback automático
./scripts/deploy.sh production rollback

# Rollback manual no Render/Netlify
# Acesse os dashboards das plataformas
```

## 🔧 Troubleshooting

### Problemas Comuns

#### 1. Deploy Falha no Render
```bash
# Verificar logs
curl -H "Authorization: Bearer $RENDER_TOKEN" \
     "https://api.render.com/v1/services/$RENDER_SERVICE_ID/deploys" | jq '.[0]'

# Verificar variáveis de ambiente
# Dashboard Render > Service > Environment
```

#### 2. Deploy Falha no Netlify
```bash
# Verificar build logs
# Dashboard Netlify > Deploys > Latest

# Verificar variáveis de ambiente
# Dashboard Netlify > Site settings > Environment variables
```

#### 3. Health Check Falha
```bash
# Verificar se serviços estão online
curl -f https://timecashking-api.onrender.com/api/health
curl -f https://timecashking.netlify.app

# Verificar DNS
nslookup timecashking-api.onrender.com
nslookup timecashking.netlify.app
```

#### 4. Build Mobile Falha
```bash
# Verificar EAS CLI
eas --version

# Verificar login
eas whoami

# Verificar configuração
cat mobile/eas.json
```

### Logs Úteis

```bash
# GitHub Actions
# Acesse: Actions > Workflow runs

# Render
# Dashboard Render > Service > Logs

# Netlify
# Dashboard Netlify > Deploys > Latest > View deploy log

# Docker
docker-compose logs -f [service-name]
```

## 📞 Suporte e Manutenção

### Monitoramento Contínuo

- **Uptime**: 99.9% target
- **Response Time**: < 2s target
- **Error Rate**: < 1% target
- **SSL**: Always valid

### Manutenção Programada

- **Backup**: Diário automático
- **Updates**: Semanal (dependências)
- **Security**: Scan diário
- **Performance**: Review mensal

### Contatos de Emergência

- **Infrastructure**: DevOps team
- **Security**: Security team
- **Business**: Product team

---

**TimeCash King CI/CD** - Deploy automatizado e monitoramento contínuo! 🚀🔧

*Última atualização: Janeiro 2024*
