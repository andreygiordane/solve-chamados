const express = require('express');
const router = express.Router();
const usersController = require('../controllers/users');
const { authenticate, requireRole } = require('../middleware/auth');

// Todas as rotas exigem autenticação
router.use(authenticate);

// ==================== ROTAS DE CONSULTA ====================

// Listar todos os usuários (apenas admin)
router.get('/', requireRole(['admin']), usersController.getAllUsers);

// Estatísticas de usuários (apenas admin)
router.get('/stats', requireRole(['admin']), usersController.getUserStats);

// Buscar usuário por ID
router.get('/:id', requireRole(['admin']), usersController.getUserById);

// ==================== ROTAS DE GERENCIAMENTO ====================

// Criar novo usuário (apenas admin)
router.post('/', requireRole(['admin']), usersController.createUser);

// Atualizar usuário (apenas admin)
router.put('/:id', requireRole(['admin']), usersController.updateUser);

// Alterar senha do usuário (admin ou o próprio usuário)
router.put('/:id/password', requireRole(['admin']), usersController.changePassword);

// Deletar usuário (apenas admin)
router.delete('/:id', requireRole(['admin']), usersController.deleteUser);

// ==================== ROTA DE FALLBACK ====================

router.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Rota de usuários não encontrada',
    availableRoutes: {
      GET: [
        '/api/users',
        '/api/users/stats',
        '/api/users/:id'
      ],
      POST: [
        '/api/users'
      ],
      PUT: [
        '/api/users/:id',
        '/api/users/:id/password'
      ],
      DELETE: [
        '/api/users/:id'
      ]
    }
  });
});

module.exports = router;