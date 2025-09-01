# Configuração de APIs e Integrações - TimeCash King

## 1. Documentação da API

### 1.1 Swagger UI
A documentação interativa da API está disponível em:
- **Desenvolvimento**: `http://localhost:3000/api-docs`
- **Produção**: `https://timecashking-api.onrender.com/api-docs`

### 1.2 Endpoints Principais
- **Health Check**: `GET /api/health`
- **Moedas**: `GET /api/currency/rates`
- **Criptomoedas**: `GET /api/crypto/rates`
- **Ações**: `GET /api/stock/{symbol}`
- **Clima**: `GET /api/weather/{city}`
- **Webhooks**: `POST /api/webhooks/{type}`

## 2. APIs Externas Integradas

### 2.1 Exchange Rate API (Moedas)
**URL**: `https://api.exchangerate-api.com/v4/latest/BRL`

**Configuração**:
- Não requer API key
- Rate limit: 1000 requests/month (free)
- Suporta 170+ moedas

**Exemplo de resposta**:
```json
{
  "base": "BRL",
  "date": "2024-01-15",
  "rates": {
    "USD": 0.21,
    "EUR": 0.19,
    "GBP": 0.17
  }
}
```

### 2.2 CoinGecko API (Criptomoedas)
**URL**: `https://api.coingecko.com/api/v3/simple/price`

**Configuração**:
- Não requer API key (free tier)
- Rate limit: 50 calls/minute
- Suporta 1000+ criptomoedas

**Exemplo de resposta**:
```json
{
  "bitcoin": {
    "brl": 250000,
    "usd": 50000
  },
  "ethereum": {
    "brl": 15000,
    "usd": 3000
  }
}
```

### 2.3 Twelve Data API (Ações)
**URL**: `https://api.twelvedata.com/price`

**Configuração**:
1. Registre-se em [twelvedata.com](https://twelvedata.com)
2. Obtenha sua API key
3. Adicione como variável de ambiente:
   ```bash
   TWELVE_DATA_API_KEY=sua-api-key-aqui
   ```

**Rate Limits**:
- Free: 800 requests/month
- Pro: 800 requests/day
- Enterprise: Custom limits

**Exemplo de resposta**:
```json
{
  "symbol": "AAPL",
  "price": "150.25",
  "currency": "USD"
}
```

### 2.4 OpenWeather API (Clima)
**URL**: `https://api.openweathermap.org/data/2.5/weather`

**Configuração**:
1. Registre-se em [openweathermap.org](https://openweathermap.org)
2. Obtenha sua API key
3. Adicione como variável de ambiente:
   ```bash
   OPENWEATHER_API_KEY=sua-api-key-aqui
   ```

**Rate Limits**:
- Free: 1000 requests/day
- Pro: 100,000 requests/day

**Exemplo de resposta**:
```json
{
  "name": "São Paulo",
  "main": {
    "temp": 25.5,
    "humidity": 65,
    "pressure": 1013
  },
  "weather": [
    {
      "main": "Clear",
      "description": "céu limpo"
    }
  ]
}
```

## 3. Webhooks para Integrações

### 3.1 Webhook de Banco
**Endpoint**: `POST /api/webhooks/bank-integration`

**Headers necessários**:
```
Content-Type: application/json
X-Webhook-Signature: assinatura-verificada
```

**Eventos suportados**:
- `transaction.created`: Nova transação bancária
- `account.updated`: Atualização de conta
- `balance.changed`: Mudança no saldo

**Exemplo de payload**:
```json
{
  "event": "transaction.created",
  "data": {
    "id": "txn_123",
    "amount": 100.50,
    "description": "Pagamento recebido",
    "type": "credit",
    "date": "2024-01-15T10:30:00Z"
  }
}
```

### 3.2 Webhook de Contabilidade
**Endpoint**: `POST /api/webhooks/accounting`

**Eventos suportados**:
- `invoice.paid`: Fatura paga
- `expense.created`: Nova despesa
- `report.generated`: Relatório gerado

**Exemplo de payload**:
```json
{
  "event": "invoice.paid",
  "data": {
    "invoice_id": "inv_456",
    "amount": 500.00,
    "client": "Cliente XYZ",
    "paid_at": "2024-01-15T14:20:00Z"
  }
}
```

## 4. Rate Limiting e Segurança

### 4.1 Rate Limiting
- **API geral**: 100 requests/15min por IP
- **Autenticação**: 5 requests/15min por IP
- **Webhooks**: Sem limite (mas com verificação de assinatura)

### 4.2 Autenticação
- **JWT Bearer Token** para endpoints protegidos
- **Webhook signatures** para webhooks
- **API Keys** para serviços externos

### 4.3 CORS
- **Origem principal**: `https://timecashking.netlify.app`
- **Desenvolvimento**: `http://localhost:3000`, `http://localhost:5173`
- **Netlify**: Qualquer subdomínio `.netlify.app`

## 5. Monitoramento e Logs

### 5.1 Logs Estruturados
```javascript
// Exemplo de log de API
console.log('API request:', {
  method: req.method,
  path: req.path,
  ip: req.ip,
  userAgent: req.get('User-Agent'),
  timestamp: new Date().toISOString()
});
```

### 5.2 Métricas para Monitorar
- Taxa de sucesso das APIs externas
- Tempo de resposta
- Rate limit hits
- Erros de webhook
- Uso de API keys

### 5.3 Alertas Recomendados
- Falha em 3+ requests consecutivos para API externa
- Rate limit atingido
- Webhook não processado
- Tempo de resposta > 5s

## 6. Configuração de Produção

### 6.1 Variáveis de Ambiente (Render)
```bash
# APIs Externas
TWELVE_DATA_API_KEY=sk_...
OPENWEATHER_API_KEY=...

# Segurança
JWT_SECRET=seu-jwt-secret-super-seguro
WEBHOOK_SECRET=seu-webhook-secret

# Monitoramento
NODE_ENV=production
LOG_LEVEL=info
```

### 6.2 Variáveis de Ambiente (Netlify)
```bash
# Frontend
VITE_API_URL=https://timecashking-api.onrender.com
VITE_API_DOCS_URL=https://timecashking-api.onrender.com/api-docs
```

## 7. Testes de Integração

### 7.1 Teste de APIs Externas
```bash
# Teste de moedas
curl https://timecashking-api.onrender.com/api/currency/rates

# Teste de criptomoedas
curl https://timecashking-api.onrender.com/api/crypto/rates

# Teste de ações
curl https://timecashking-api.onrender.com/api/stock/AAPL

# Teste de clima
curl https://timecashking-api.onrender.com/api/weather/São%20Paulo
```

### 7.2 Teste de Webhooks
```bash
# Teste de webhook bancário
curl -X POST https://timecashking-api.onrender.com/api/webhooks/bank-integration \
  -H "Content-Type: application/json" \
  -H "X-Webhook-Signature: test-signature" \
  -d '{"event":"transaction.created","data":{"amount":100}}'

# Teste de webhook de contabilidade
curl -X POST https://timecashking-api.onrender.com/api/webhooks/accounting \
  -H "Content-Type: application/json" \
  -d '{"event":"invoice.paid","data":{"amount":500}}'
```

## 8. Troubleshooting

### 8.1 APIs Externas Não Funcionando
- Verifique se as API keys estão configuradas
- Confirme se não atingiu o rate limit
- Verifique os logs do servidor
- Teste a API diretamente no navegador

### 8.2 Webhooks Não Recebidos
- Verifique se a URL está correta
- Confirme se o endpoint está ativo
- Verifique se a assinatura está correta
- Teste com curl ou Postman

### 8.3 Rate Limiting
- Implemente cache para reduzir requests
- Use CDN para assets estáticos
- Configure retry logic com backoff
- Monitore uso de APIs

### 8.4 Performance
- Implemente cache Redis para APIs externas
- Use compression para responses
- Configure CDN para assets
- Implemente lazy loading

## 9. Próximos Passos

### 9.1 Melhorias Futuras
- Implementar cache Redis
- Adicionar mais APIs financeiras
- Implementar webhooks para mais serviços
- Adicionar métricas avançadas
- Implementar retry logic

### 9.2 Escalabilidade
- Usar load balancer
- Implementar microserviços
- Configurar auto-scaling
- Usar message queues
- Implementar circuit breakers

### 9.3 Compliance
- Implementar GDPR compliance
- Adicionar audit logs
- Configurar backup automático
- Implementar disaster recovery
- Adicionar security headers
