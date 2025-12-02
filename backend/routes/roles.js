const express = require('express');
const router = express.Router();
const rolesController = require('../controllers/rolesController');
const { authenticate } = require('../middleware/auth');

// Aplica autenticação em todas as rotas
router.use(authenticate);

// Middleware extra: apenas admin pode gerenciar roles (opcional, mas recomendado)
const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Acesso negado. Apenas administradores.' });
  }
  next();
};

router.get('/', rolesController.getAllRoles);
router.post('/', isAdmin, rolesController.createRole);
router.put('/:id', isAdmin, rolesController.updateRole);
router.delete('/:id', isAdmin, rolesController.deleteRole);

module.exports = router;