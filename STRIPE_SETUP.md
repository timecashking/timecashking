# Configuração do Stripe para TimeCash King

## 1. Criar Conta no Stripe

1. Acesse [stripe.com](https://stripe.com) e crie uma conta
2. Complete a verificação da conta (dados pessoais e bancários)
3. Ative o modo de teste para desenvolvimento

## 2. Obter Chaves de API

### Chave Secreta
1. No Dashboard do Stripe, vá em **Developers > API keys**
2. Copie a **Secret key** (começa com `sk_test_` ou `sk_live_`)
3. Adicione como variável de ambiente no Render:
   - `STRIPE_SECRET_KEY=sk_test_...`

### Chave Pública (Frontend)
1. Copie a **Publishable key** (começa com `pk_test_` ou `pk_live_`)
2. Adicione como variável de ambiente no Netlify:
   - `VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...`

## 3. Configurar Webhooks

1. No Dashboard do Stripe, vá em **Developers > Webhooks**
2. Clique em **Add endpoint**
3. URL do endpoint: `https://timecashking-api.onrender.com/subscription/webhook`
4. Selecione os eventos:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
5. Copie o **Signing secret** (começa com `whsec_`)
6. Adicione como variável de ambiente no Render:
   - `STRIPE_WEBHOOK_SECRET=whsec_...`

## 4. Criar Produtos e Preços

### Produto: TimeCash King
1. Vá em **Products** no Dashboard
2. Clique em **Add product**
3. Nome: `TimeCash King`
4. Descrição: `Sistema de gestão financeira`

### Preços dos Planos
Crie os seguintes preços:

#### Plano Básico
- **Price ID**: `price_basic`
- **Amount**: `1990` (R$ 19,90)
- **Billing**: `Recurring`
- **Interval**: `Month`

#### Plano Pro
- **Price ID**: `price_pro`
- **Amount**: `3990` (R$ 39,90)
- **Billing**: `Recurring`
- **Interval**: `Month`

#### Plano Enterprise
- **Price ID**: `price_enterprise`
- **Amount**: `9990` (R$ 99,90)
- **Billing**: `Recurring`
- **Interval**: `Month`

## 5. Configurar URLs de Sucesso/Cancelamento

### URLs de Sucesso
- **Success URL**: `https://timecashking.netlify.app/subscription/success?session_id={CHECKOUT_SESSION_ID}`
- **Cancel URL**: `https://timecashking.netlify.app/subscription/cancel`

## 6. Variáveis de Ambiente no Render

Adicione estas variáveis no seu serviço no Render:

```bash
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
FRONTEND_URL=https://timecashking.netlify.app
```

## 7. Variáveis de Ambiente no Netlify

Adicione estas variáveis no seu site no Netlify:

```bash
VITE_API_URL=https://timecashking-api.onrender.com
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

## 8. Testar Integração

### Teste de Pagamento
1. Use cartões de teste do Stripe:
   - **Sucesso**: `4242 4242 4242 4242`
   - **Falha**: `4000 0000 0000 0002`
2. Data de expiração: qualquer data futura
3. CVC: qualquer 3 dígitos

### Teste de Webhook
1. No Dashboard do Stripe, vá em **Developers > Webhooks**
2. Clique no seu endpoint
3. Vá em **Events** e teste eventos individuais

## 9. Monitoramento

### Logs do Render
- Monitore os logs do serviço para erros de webhook
- Verifique se os eventos estão sendo processados

### Dashboard do Stripe
- Monitore pagamentos em **Payments**
- Monitore assinaturas em **Subscriptions**
- Monitore webhooks em **Developers > Webhooks**

## 10. Produção

### Ativar Modo Live
1. No Dashboard do Stripe, mude para **Live mode**
2. Atualize as chaves de API para versões live
3. Configure webhooks para URLs de produção
4. Teste com valores reais pequenos

### Compliance
- Implemente Strong Customer Authentication (SCA) se necessário
- Configure notificações de pagamento
- Implemente retry logic para webhooks falhados

## Troubleshooting

### Webhook não recebido
- Verifique se a URL está correta
- Verifique se o endpoint está ativo
- Teste com Stripe CLI

### Pagamento falhou
- Verifique logs do Render
- Verifique se o customer foi criado
- Verifique se o price ID está correto

### Assinatura não atualizada
- Verifique se o webhook está processando eventos
- Verifique se o userId está sendo passado corretamente
- Verifique logs do banco de dados
