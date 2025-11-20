const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth');
const { authenticate, requireRole, cleanupSessions } = require('../middleware/auth');

// Aplicar limpeza de sessões em todas as rotas auth
router.use(cleanupSessions);

// ==================== ROTAS PÚBLICAS ====================

// 🔐 Autenticação
router.post('/login', authController.login);
router.post('/register', authController.register);
router.post('/logout', authController.logout);

// 🛠️ Utilidades e Diagnóstico
router.get('/diagnose', authController.diagnose);
router.post('/fix-passwords', authController.fixPasswords);
router.post('/setup-database', authController.setupDatabase);

// ℹ️ Informações públicas
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Sistema de autenticação está funcionando',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// ==================== ROTAS PROTEGIDAS ====================

// 👤 Perfil do usuário
router.get('/profile', authenticate, authController.getProfile);
router.get('/validate', authenticate, authController.validateSession);

// 🛡️ Rotas administrativas
router.get('/admin', authenticate, requireRole(['admin']), (req, res) => {
  res.json({ 
    success: true, 
    message: 'Acesso admin permitido',
    user: req.user 
  });
});

// 👥 Listar usuários (apenas admin)
router.get('/users', authenticate, requireRole(['admin']), async (req, res) => {
  try {
    const Auth = require('../models/Auth');
    const users = await Auth.pool.query(`
      SELECT id, name, email, role, is_active, last_login, created_at 
      FROM users 
      ORDER BY name
    `);
    
    res.json({
      success: true,
      users: users.rows
    });
  } catch (error) {
    console.error('Erro ao listar usuários:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao listar usuários'
    });
  }
});

// 🔧 Administração do sistema
router.post('/admin/setup', authenticate, requireRole(['admin']), authController.setupDatabase);
router.post('/admin/fix-passwords', authenticate, requireRole(['admin']), authController.fixPasswords);

// ==================== ROTA DE FALLBACK ====================

// Todas as outras rotas não encontradas
router.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Rota de autenticação não encontrada',
    availableRoutes: {
      public: [
        'POST /api/auth/login',
        'POST /api/auth/register', 
        'POST /api/auth/logout',
        'GET /api/auth/diagnose',
        'POST /api/auth/fix-passwords',
        'POST /api/auth/setup-database',
        'GET /api/auth/health'
      ],
      protected: [
        'GET /api/auth/profile',
        'GET /api/auth/validate',
        'GET /api/auth/admin',
        'GET /api/auth/users',
        'POST /api/auth/admin/setup',
        'POST /api/auth/admin/fix-passwords'
      ]
    }
  });
});

module.exports = router;