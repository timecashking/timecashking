# TimeCash King - Sistema de Gestão Financeira

Um sistema completo de gestão financeira pessoal e empresarial com autenticação Google, relatórios avançados e sistema de assinaturas.

## 🚀 Funcionalidades Implementadas

### ✅ Autenticação e Usuários
- **Login com Google OAuth2**
- **Sistema de roles** (USER, ADMIN, MANAGER)
- **Perfis de usuário** com avatar e informações
- **Sessões JWT** seguras

### ✅ Gestão Financeira
- **Categorias personalizadas** para receitas e despesas
- **Transações detalhadas** com descrição, valor e data
- **Validação de entrada** com normalização de valores
- **Paginação** para grandes volumes de dados

### ✅ Relatórios e Análises
- **Resumo financeiro** com KPIs em tempo real
- **Relatórios avançados** com gráficos interativos
- **Exportação CSV** de transações
- **Geração de PDF** com gráficos e tabelas
- **Filtros por período** e agrupamento

### ✅ Sistema de Assinaturas
- **3 planos disponíveis**: Básico, Pro e Enterprise
- **Integração Stripe** para pagamentos
- **Webhooks** para sincronização automática
- **Histórico de pagamentos** completo
- **Cancelamento** de assinaturas

### ✅ Funcionalidades Administrativas
- **Painel Admin** para gestão de usuários
- **Painel Manager** para visualização de relatórios de equipe
- **Controle de acesso** baseado em roles
- **Moderação** de conteúdo

### ✅ Interface Moderna
- **React + TypeScript** para frontend
- **Design responsivo** para mobile e desktop
- **Navegação intuitiva** com rotas organizadas
- **Feedback visual** para ações do usuário

## 🛠️ Tecnologias Utilizadas

### Backend
- **Node.js + Express**
- **Prisma ORM** com PostgreSQL (Neon)
- **JWT** para autenticação
- **Stripe** para pagamentos
- **Puppeteer** para geração de PDF
- **Handlebars** para templates

### Frontend
- **React 18** com TypeScript
- **React Router** para navegação
- **Chart.js** para gráficos
- **date-fns** para manipulação de datas
- **Vite** para build e desenvolvimento

### Infraestrutura
- **Render** para backend
- **Netlify** para frontend
- **Neon** para banco PostgreSQL
- **GitHub** para versionamento

## 📊 Planos de Assinatura

### 🆓 Plano Básico - R$ 19,90/mês
- Até 100 transações/mês
- Relatórios básicos
- Suporte por email

### ⭐ Plano Pro - R$ 39,90/mês
- Transações ilimitadas
- Relatórios avançados
- Exportação PDF
- Suporte prioritário

### 🏢 Plano Enterprise - R$ 99,90/mês
- Tudo do Pro
- Múltiplos usuários
- API personalizada
- Suporte dedicado

## 🚀 Deploy

### Backend (Render)
1. Conecte o repositório GitHub ao Render
2. Configure as variáveis de ambiente:
   ```
   NEON_DATABASE_URL=postgresql://...
   GOOGLE_CLIENT_ID=...
   GOOGLE_CLIENT_SECRET=...
   JWT_SECRET=...
   STRIPE_SECRET_KEY=...
   STRIPE_WEBHOOK_SECRET=...
   FRONTEND_URL=https://timecashking.netlify.app
   ```

### Frontend (Netlify)
1. Conecte o repositório GitHub ao Netlify
2. Configure as variáveis de ambiente:
   ```
   VITE_API_URL=https://timecashking-api.onrender.com
   VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
   ```

## 🔧 Configuração Local

### Pré-requisitos
- Node.js 18+
- npm ou yarn
- Conta no Google Cloud Console
- Conta no Stripe (para pagamentos)

### Instalação
```bash
# Clone o repositório
git clone https://github.com/timecashking/timecashking.git
cd timecashking

# Instale dependências do backend
npm install

# Configure variáveis de ambiente
cp .env.example .env
# Edite .env com suas credenciais

# Configure o banco de dados
npx prisma db push

# Inicie o servidor
npm run dev
```

### Frontend
```bash
cd web
npm install
npm run dev
```

## 📁 Estrutura do Projeto

```
timecashking/
├── server.js              # Servidor Express principal
├── prisma/
│   └── schema.prisma      # Schema do banco de dados
├── web/                   # Frontend React
│   ├── src/
│   │   ├── pages/        # Páginas da aplicação
│   │   ├── api.ts        # Cliente API
│   │   └── main.tsx      # Entry point
│   └── package.json
├── public/               # Página estática inicial
└── package.json
```

## 🔐 Segurança

- **HTTPS** em produção
- **CORS** configurado adequadamente
- **Rate limiting** para proteção contra ataques
- **Helmet** para headers de segurança
- **Validação** de entrada em todos os endpoints
- **Autenticação** obrigatória para rotas protegidas

## 📈 Monitoramento

- **Logs estruturados** em JSON
- **Tratamento de erros** centralizado
- **Health checks** para o sistema
- **Métricas** de performance

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 🆘 Suporte

- **Documentação**: [Wiki do projeto](https://github.com/timecashking/timecashking/wiki)
- **Issues**: [GitHub Issues](https://github.com/timecashking/timecashking/issues)
- **Email**: suporte@timecashking.com

## 🎯 Roadmap

### Próximas Funcionalidades
- [ ] **Notificações push** para lembretes
- [ ] **Integração bancária** via Open Banking
- [ ] **App mobile** nativo
- [ ] **IA para categorização** automática
- [ ] **Metas financeiras** e tracking
- [ ] **Dashboard personalizado** por usuário

### Melhorias Técnicas
- [ ] **Cache Redis** para performance
- [ ] **Testes automatizados** (Jest + Cypress)
- [ ] **CI/CD** completo
- [ ] **Monitoramento** avançado (Sentry, DataDog)
- [ ] **Backup automático** do banco

---

**TimeCash King** - Transformando a gestão financeira em uma experiência simples e poderosa! 💰✨

