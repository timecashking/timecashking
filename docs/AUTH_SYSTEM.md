# Sistema de Autenticação - TimeCash King

## Visão Geral

O TimeCash King agora suporta **duas formas de autenticação**:

1. **Login por Email/Senha** (Novo!)
2. **Login por Google OAuth** (Existente)

## Funcionalidades Implementadas

### ✅ Backend (Node.js + Express)

- **`AuthSystem`** - Classe principal com todos os métodos de autenticação
- **Validação de dados** - Usando express-validator
- **Hash de senhas** - Usando bcryptjs com salt
- **JWT Tokens** - Para sessões seguras
- **APIs RESTful** - Endpoints completos para autenticação

### ✅ Frontend (React + TypeScript)

- **Componente `Auth`** - Interface completa de login/registro
- **Formulários responsivos** - Login, registro e redefinição de senha
- **Integração com Google OAuth** - Botão para login Google
- **Validação em tempo real** - Feedback imediato para o usuário
- **Design consistente** - Seguindo o padrão visual do sistema

## Endpoints da API

### 🔐 Autenticação

```http
POST /auth/register
POST /auth/login
POST /auth/change-password
POST /auth/reset-password
POST /auth/link-google
POST /auth/unlink-google
```

### 📋 Parâmetros

#### Registro
```json
{
  "email": "user@example.com",
  "password": "minhasenha123",
  "name": "Nome do Usuário" // opcional
}
```

#### Login
```json
{
  "email": "user@example.com",
  "password": "minhasenha123"
}
```

#### Alterar Senha
```json
{
  "currentPassword": "senhaatual",
  "newPassword": "novasenha123"
}
```

#### Redefinir Senha
```json
{
  "email": "user@example.com",
  "newPassword": "novasenha123"
}
```

## Segurança

### 🔒 Hash de Senhas
- **Algoritmo**: bcryptjs
- **Salt rounds**: 12
- **Armazenamento**: Apenas hash + salt (nunca senha em texto)

### 🎫 JWT Tokens
- **Expiração**: 7 dias
- **Payload**: userId, email, companies
- **Renovação**: Automática via middleware

### 🛡️ Validação
- **Email**: Formato válido + normalização
- **Senha**: Mínimo 6 caracteres
- **Rate limiting**: 100 requests por 15 minutos

## Fluxo de Autenticação

### 1. Registro
```
Usuário → Preenche formulário → Validação → Hash da senha → Criação no banco → Sucesso
```

### 2. Login
```
Usuário → Credenciais → Validação → Verificação de hash → Geração JWT → Sucesso
```

### 3. Sessão
```
JWT → Middleware → Verificação → Decodificação → req.user → Acesso às rotas
```

### 4. Logout
```
Usuário → Logout → Remove token → Redireciona → Login
```

## Integração com Google OAuth

### 🔗 Vinculação de Contas
- Usuários podem vincular conta Google após registro
- Mantém ambas as formas de login ativas
- Sincronização de dados (nome, avatar)

### 🔓 Desvinculação
- Requer senha definida para desvincular
- Preserva dados da conta principal
- Remove apenas vínculo Google

## Desenvolvimento Local

### 🚀 Setup Rápido

1. **Instalar dependências**
   ```bash
   npm install
   ```

2. **Configurar ambiente**
   ```bash
   cp env.local .env
   # Editar .env com suas configurações
   ```

3. **Gerar cliente Prisma local**
   ```bash
   npm run prisma:generate:local
   ```

4. **Executar servidor**
   ```bash
   npm run dev:local
   ```

### 🗄️ Banco de Dados Local

- **Schema**: SQLite (sem dependências externas)
- **Arquivo**: `prisma/dev.db`
- **Migrations**: Automáticas via Prisma

## Estrutura de Arquivos

```
├── auth-system.js          # Lógica de autenticação
├── server.js               # Servidor + rotas de auth
├── web/src/
│   ├── components/
│   │   └── Auth.tsx       # Componente de autenticação
│   ├── pages/
│   │   └── Home.tsx       # Integração com Auth
│   └── api.ts             # Headers de autenticação
├── prisma/
│   ├── schema.prisma      # Schema principal
│   └── schema.local.prisma # Schema local (SQLite)
└── scripts/
    └── generate-prisma-local.js # Script de setup local
```

## Testes

### 🧪 Endpoints
```bash
# Testar registro
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"123456","name":"Test User"}'

# Testar login
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"123456"}'
```

### 🔍 Validações
- Email único por usuário
- Senha mínima 6 caracteres
- Validação de formato de email
- Prevenção de contas duplicadas

## Próximos Passos

### 🚀 Melhorias Futuras

1. **Recuperação de senha por email**
   - Sistema de tokens temporários
   - Templates de email
   - Expiração automática

2. **Autenticação de dois fatores (2FA)**
   - TOTP (Google Authenticator)
   - SMS backup
   - Chaves de recuperação

3. **Sessões múltiplas**
   - Controle de dispositivos
   - Revogação de tokens
   - Histórico de login

4. **Auditoria de segurança**
   - Log de tentativas de login
   - Detecção de atividades suspeitas
   - Notificações de segurança

## Suporte

### 📞 Problemas Comuns

1. **"Usuário já existe"**
   - Verificar se email já está cadastrado
   - Tentar login em vez de registro

2. **"Senha incorreta"**
   - Verificar se Caps Lock está ativo
   - Confirmar se email está correto

3. **"Token inválido"**
   - Fazer logout e login novamente
   - Verificar se token não expirou

### 🐛 Debug

```bash
# Logs do servidor
npm run dev:local

# Verificar banco local
npx prisma studio --schema=prisma/schema.local.prisma
```

---

**🎉 Sistema de Autenticação 100% implementado e funcional!**

O TimeCash King agora oferece uma experiência de login completa e segura, mantendo a compatibilidade com o Google OAuth existente.
