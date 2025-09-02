import express from 'express';
import cors from 'cors';

const app = express();
const port = 3000;

// Middleware básico
app.use(cors());
app.use(express.json());

// Rota de teste simples
app.get('/test', (req, res) => {
  console.log('✅ Rota /test chamada');
  res.json({ message: 'Server is working!', timestamp: new Date().toISOString() });
});

// Rota de health check
app.get('/health', (req, res) => {
  console.log('✅ Rota /health chamada');
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Middleware de erro
app.use((err, req, res, next) => {
  console.error('❌ Erro no servidor:', err);
  res.status(500).json({ error: 'Erro interno do servidor' });
});

// Rota 404
app.use('*', (req, res) => {
  console.log('❌ Rota não encontrada:', req.method, req.url);
  res.status(404).json({ error: 'Endpoint não encontrado' });
});

// Iniciar servidor
app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 Servidor de teste rodando em http://localhost:${port}`);
  console.log(`📡 Escutando em todas as interfaces (0.0.0.0)`);
});

// Tratamento de erros não capturados
process.on('uncaughtException', (error) => {
  console.error('❌ Erro não capturado:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Promise rejeitada não tratada:', reason);
});
