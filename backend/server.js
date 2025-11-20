const express = require('express');
const cors = require('cors');
const ticketsRoutes = require('./routes/tickets');
const assetsRoutes = require('./routes/assets');
const usersRoutes = require('./routes/users');
const groupsRoutes = require('./routes/groups');
const authRoutes = require('./routes/auth');
const { authenticate } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Rotas públicas
app.use('/api/auth', authRoutes);

// Rotas protegidas (aplicar middleware de autenticação)
app.use('/api/tickets', authenticate, ticketsRoutes);
app.use('/api/assets', authenticate, assetsRoutes);
app.use('/api/users', authenticate, usersRoutes);
app.use('/api/groups', authenticate, groupsRoutes);

// Rota de health check (pública)
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'API Solve Chamados está rodando!',
    timestamp: new Date().toISOString()
  });
});

// Middleware de erro
app.use((error, req, res, next) => {
  console.error('Erro não tratado:', error);
  res.status(500).json({ 
    success: false,
    error: 'Erro interno do servidor' 
  });
});

// Rota não encontrada
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false,
    error: 'Rota não encontrada' 
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor backend rodando na porta ${PORT}`);
  console.log(`🔐 Sistema de autenticação ativo`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`⏰ Iniciado em: ${new Date().toLocaleString()}`);
});