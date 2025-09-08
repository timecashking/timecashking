# 🚀 TimeCash King - Sistema de Gestão Financeira

Sistema completo de gestão financeira, estoque e vendas com interface moderna e API robusta.

## ✨ Características

- **🎯 Gestão Financeira**: Controle de receitas, despesas e contas
- **📦 Gestão de Estoque**: Produtos, movimentações e alertas de estoque baixo
- **💰 Vendas**: Sistema completo de vendas com relatórios de lucro
- **📅 Reuniões**: Integração com Google Calendar
- **🔐 Autenticação**: JWT + Refresh Tokens com RBAC
- **📱 PWA**: Progressive Web App para uso offline
- **🌐 API REST**: Documentada com Swagger
- **🎨 UI Moderna**: Tema dark premium com Tailwind CSS

## 🏗️ Arquitetura

```
timecash-king/
├── apps/
│   ├── web/          # Frontend Next.js 14
│   └── api/          # Backend NestJS
├── packages/
│   ├── types/        # Tipos compartilhados
│   └── ui/           # Componentes UI compartilhados
├── scripts/          # Scripts de inicialização
└── docs/            # Documentação
```

## 🚀 Tecnologias

### Frontend
- **Next.js 14** com App Router
- **TypeScript** para type safety
- **Tailwind CSS** para estilização
- **shadcn/ui** para componentes
- **Zustand** para gerenciamento de estado
- **React Hook Form + Zod** para formulários

### Backend
- **NestJS** framework
- **Fastify** para performance
- **Prisma** ORM
- **PostgreSQL** (Neon)
- **JWT** + Refresh Tokens
- **Swagger** para documentação

### Deploy
- **Netlify** para frontend
- **Render** para API e Worker

## 📋 Pré-requisitos

- Node.js 18+
- pnpm
- PostgreSQL
- Google Cloud Console (para OAuth)

## 🛠️ Instalação

### 1. Clone o repositório
```bash
git clone https://github.com/seu-usuario/timecash-king.git
cd timecash-king
```

### 2. Instale as dependências
```bash
pnpm install
```

### 3. Configure as variáveis de ambiente
```bash
cp env.example .env.local
```

Edite o arquivo `.env.local` com suas configurações:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/timecash_king"
JWT_SECRET="sua-chave-secreta-aqui"
GOOGLE_CLIENT_ID="seu-google-client-id"
GOOGLE_CLIENT_SECRET="seu-google-client-secret"
```

### 4. Configure o banco de dados
```bash
# Gere o cliente Prisma
cd apps/api
pnpm prisma generate

# Execute as migrações
pnpm prisma migrate dev

# Inicialize com dados padrão
cd ../..
node scripts/init-db.js
```

### 5. Inicie o desenvolvimento
```bash
# Terminal 1 - Backend
cd apps/api
pnpm run dev

# Terminal 2 - Frontend
cd apps/web
pnpm run dev
```

## 🌐 URLs de Desenvolvimento

- **Frontend**: http://localhost:3001
- **Backend**: http://localhost:3000
- **API Docs**: http://localhost:3000/api

## 🔐 Usuário Padrão

Após executar o script de inicialização:
- **Email**: admin@timecashking.com
- **Senha**: admin123
- **Role**: ADMIN

## 📚 Estrutura da API

### Endpoints Principais
- `POST /auth/register` - Registro de usuário
- `POST /auth/login` - Login
- `POST /auth/refresh` - Renovar token
- `GET /auth/me` - Perfil do usuário

### Módulos Disponíveis
- **Users**: Gestão de usuários
- **Categories**: Categorias de entradas/despesas/produtos
- **Products**: Gestão de produtos e estoque
- **Entries**: Lançamentos financeiros
- **Accounts**: Contas bancárias
- **Sales**: Sistema de vendas
- **Meetings**: Reuniões e agenda
- **OAuth**: Integração Google
- **NLP**: Processamento de texto
- **Infra**: Health check e métricas

### Rotas Legacy
Todas as rotas antigas são preservadas em `/legacy/*` para compatibilidade.

## 🎨 Tema e UI

O sistema usa um tema dark premium com:
- **Cores principais**: Preto (#000000) e Dourado (#FFD700)
- **Acentos**: Azul (#3B82F6), Verde (#10B981), Vermelho (#EF4444)
- **Tipografia**: Inter para melhor legibilidade
- **Animações**: Transições suaves e micro-interações

## 📱 PWA

O frontend é configurado como PWA com:
- Manifest para instalação
- Service Worker para cache offline
- Ícones em múltiplos tamanhos
- Splash screen personalizada

## 🚀 Deploy

- Frontend: Vercel
- Backend: Railway (PostgreSQL no Railway)

### Frontend (Vercel)
```bash
cd apps/web
pnpm run build
# Configure no painel da Vercel apontando para apps/web
```

### Backend (Railway)
- Root Directory: apps/api
- Builder: Dockerfile (apps/api/Dockerfile)
- Start Command: npm run start:prod

## 🔧 Scripts Disponíveis

### Root
```bash
pnpm dev          # Inicia todos os serviços
pnpm build        # Build de todos os pacotes
pnpm test         # Executa testes
pnpm db:init      # Inicializa banco
pnpm db:reset     # Reseta banco
```

### API
```bash
cd apps/api
pnpm run dev      # Desenvolvimento
pnpm run build    # Build para produção
pnpm run start    # Produção
pnpm run test     # Testes
```

### Web
```bash
cd apps/web
pnpm run dev      # Desenvolvimento
pnpm run build    # Build para produção
pnpm run start    # Produção
pnpm run lint     # Linting
```

## 🐛 Troubleshooting

### Problemas Comuns

1. **Porta 3000 ocupada**
   ```bash
   # Pare todos os processos Node
   taskkill /f /im node.exe  # Windows
   pkill node                 # Linux/Mac
   ```

2. **Erro de conexão com banco**
   - Verifique se o PostgreSQL está rodando
   - Confirme as credenciais no `.env.local`
   - Execute `pnpm prisma generate` na pasta `apps/api`

3. **Erro de build**
   - Limpe cache: `pnpm clean`
   - Reinstale dependências: `rm -rf node_modules && pnpm install`

## 📝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para detalhes.

## 🤝 Suporte

- **Issues**: [GitHub Issues](https://github.com/seu-usuario/timecash-king/issues)
- **Documentação**: [Wiki](https://github.com/seu-usuario/timecash-king/wiki)
- **Email**: suporte@timecashking.com

## 🎯 Roadmap

- [ ] Integração com WhatsApp Business
- [ ] Relatórios avançados com gráficos
- [ ] App mobile nativo
- [ ] Integração com bancos brasileiros
- [ ] Sistema de backup automático
- [ ] Múltiplas moedas
- [ ] Integração com sistemas de contabilidade

---

**Desenvolvido com ❤️ pela equipe TimeCash King**
