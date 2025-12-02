const express = require('express');
const cors = require('cors');
const ticketsRoutes = require('./routes/tickets');
const assetsRoutes = require('./routes/assets');
const usersRoutes = require('./routes/users');
const groupsRoutes = require('./routes/groups');
const authRoutes = require('./routes/auth');
const rolesRoutes = require('./routes/roles');
const { authenticate } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());

// --- AUMENTADO LIMITE PARA 10MB (IMAGENS) ---
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
// --------------------------------------------

// Rotas públicas
app.use('/api/auth', authRoutes);

// Rotas protegidas
app.use('/api/tickets', authenticate, ticketsRoutes);
app.use('/api/assets', authenticate, assetsRoutes);
app.use('/api/users', authenticate, usersRoutes);
app.use('/api/groups', authenticate, groupsRoutes);
app.use('/api/roles', authenticate, rolesRoutes);

// Rota de health check
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
  if (error.type === 'entity.too.large') {
    return res.status(413).json({ success: false, error: 'Arquivo muito grande (Máx 10MB)' });
  }
  res.status(500).json({ success: false, error: 'Erro interno do servidor' });
});

// Rota não encontrada
app.use('*', (req, res) => {
  res.status(404).json({ success: false, error: 'Rota não encontrada' });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor backend rodando na porta ${PORT}`);
  console.log(`🔐 Sistema de autenticação ativo`);
});