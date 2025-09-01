# Configuração do Sistema de Notificações - TimeCash King

## 1. Configuração de Email (Gmail)

### 1.1 Criar App Password no Gmail
1. Acesse sua conta Google
2. Vá em **Segurança** > **Verificação em duas etapas** (ative se não estiver)
3. Vá em **Senhas de app**
4. Clique em **Selecionar app** > **Outro (nome personalizado)**
5. Digite "TimeCash King" e clique em **Gerar**
6. Copie a senha gerada (16 caracteres)

### 1.2 Configurar Variáveis de Ambiente
Adicione no Render:
```bash
EMAIL_USER=seu-email@gmail.com
EMAIL_PASSWORD=sua-senha-de-app-16-caracteres
```

## 2. Configuração de Push Notifications

### 2.1 Gerar Chaves VAPID
1. Instale o web-push globalmente:
   ```bash
   npm install -g web-push
   ```

2. Gere as chaves:
   ```bash
   web-push generate-vapid-keys
   ```

3. Copie as chaves geradas:
   - **Public Key**: `BEl62iUYgUivxIkv69yViEuiBIa1...`
   - **Private Key**: `VJyUJxQqBzNVzDDsvU...`

### 2.2 Configurar Variáveis de Ambiente
Adicione no Render:
```bash
VAPID_PUBLIC_KEY=BEl62iUYgUivxIkv69yViEuiBIa1...
VAPID_PRIVATE_KEY=VJyUJxQqBzNVzDDsvU...
```

### 2.3 Configurar no Frontend
Adicione no Netlify:
```bash
VITE_VAPID_PUBLIC_KEY=BEl62iUYgUivxIkv69yViEuiBIa1...
```

## 3. Tipos de Notificação Implementados

### 3.1 Notificações Automáticas
- **Lembretes Semanais**: Toda segunda-feira às 9h
- **Relatórios Mensais**: Todo dia 1º às 10h
- **Alertas de Pagamento**: Quando assinatura está em atraso
- **Notificações de Sistema**: Manutenções e atualizações

### 3.2 Categorias de Notificação
- **REMINDER**: Lembretes para registrar transações
- **ALERT**: Alertas importantes (pagamentos, limites)
- **REPORT**: Relatórios automáticos
- **PAYMENT**: Notificações relacionadas a pagamentos
- **SYSTEM**: Notificações do sistema

### 3.3 Tipos de Entrega
- **EMAIL**: Notificações por email
- **PUSH**: Notificações push no navegador
- **BOTH**: Ambos os tipos

## 4. Configuração de Cron Jobs

### 4.1 Lembretes Semanais
```javascript
cron.schedule('0 9 * * 1', async () => {
    // Toda segunda-feira às 9h
});
```

### 4.2 Relatórios Mensais
```javascript
cron.schedule('0 10 1 * *', async () => {
    // Todo dia 1º às 10h
});
```

## 5. Endpoints de Notificação

### 5.1 Listar Notificações
```
GET /notifications?page=1&pageSize=20
```

### 5.2 Contar Não Lidas
```
GET /notifications/unread
```

### 5.3 Marcar como Lida
```
PATCH /notifications/:id/read
```

### 5.4 Marcar Todas como Lidas
```
PATCH /notifications/read-all
```

### 5.5 Excluir Notificação
```
DELETE /notifications/:id
```

### 5.6 Preferências
```
GET /notifications/preferences
PATCH /notifications/preferences
```

### 5.7 Teste de Notificação
```
POST /notifications/test
{
    "type": "EMAIL|PUSH|BOTH",
    "category": "SYSTEM"
}
```

## 6. Preferências de Usuário

### 6.1 Configurações Disponíveis
- **emailEnabled**: Ativar notificações por email
- **pushEnabled**: Ativar notificações push
- **reminderEnabled**: Ativar lembretes
- **alertEnabled**: Ativar alertas
- **reportEnabled**: Ativar relatórios
- **paymentEnabled**: Ativar notificações de pagamento
- **systemEnabled**: Ativar notificações do sistema

### 6.2 Frequências
- **reminderFrequency**: daily, weekly, monthly
- **reportFrequency**: weekly, monthly, quarterly

## 7. Templates de Email

### 7.1 Estrutura HTML
```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>{{title}}</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #10b981; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f8fafc; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>TimeCash King</h1>
        </div>
        <div class="content">
            <h2>{{title}}</h2>
            <p>{{message}}</p>
        </div>
        <div class="footer">
            <p>© 2024 TimeCash King. Todos os direitos reservados.</p>
        </div>
    </div>
</body>
</html>
```

## 8. Monitoramento e Logs

### 8.1 Logs Importantes
- **Email sent**: `console.log('Email sent:', result.messageId)`
- **Push notification**: `console.log('Push notification sent:', result)`
- **Cron errors**: `console.error('Weekly reminder error:', error)`

### 8.2 Métricas para Monitorar
- Taxa de entrega de emails
- Taxa de entrega de push notifications
- Tempo de processamento de notificações
- Erros de cron jobs

## 9. Testes

### 9.1 Teste de Email
1. Acesse a página de notificações
2. Clique em "Mostrar Preferências"
3. Clique em "Testar Email"
4. Verifique se o email foi recebido

### 9.2 Teste de Push
1. Permita notificações no navegador
2. Clique em "Testar Push"
3. Verifique se a notificação aparece

### 9.3 Teste de Cron
1. Modifique temporariamente o cron para executar em 1 minuto
2. Verifique os logs do Render
3. Confirme se as notificações foram enviadas

## 10. Troubleshooting

### 10.1 Email não enviado
- Verifique se `EMAIL_USER` e `EMAIL_PASSWORD` estão corretos
- Confirme se a senha de app foi gerada corretamente
- Verifique se a verificação em duas etapas está ativa

### 10.2 Push não funcionando
- Verifique se as chaves VAPID estão configuradas
- Confirme se o usuário permitiu notificações
- Verifique se o service worker está registrado

### 10.3 Cron não executando
- Verifique os logs do Render
- Confirme se o timezone está correto
- Verifique se o processo não está sendo reiniciado

### 10.4 Notificações duplicadas
- Verifique se não há múltiplas instâncias do cron
- Confirme se as preferências estão sendo respeitadas
- Verifique se não há webhooks duplicados

## 11. Produção

### 11.1 Configurações de Produção
- Use um serviço de email dedicado (SendGrid, Mailgun)
- Configure retry logic para falhas
- Implemente rate limiting para notificações
- Configure monitoramento avançado

### 11.2 Escalabilidade
- Use filas para processar notificações em background
- Implemente cache para preferências
- Configure load balancing para cron jobs
- Use CDN para assets de email

### 11.3 Compliance
- Implemente unsubscribe links
- Configure logs de auditoria
- Implemente GDPR compliance
- Configure backup de notificações
