const express = require('express');
const router = express.Router();
const groupsController = require('../controllers/groups');

// Rota para listar todos os grupos
router.get('/', groupsController.getAllGroups);

// Rota para criar grupo (Agora trata erro de nome duplicado)
router.post('/', groupsController.createGroup);

// Rota para deletar grupo (Agora trata erro de grupo em uso)
router.delete('/:id', groupsController.deleteGroup);

module.exports = router;