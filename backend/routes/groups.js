const express = require('express');
const router = express.Router();
const groupsController = require('../controllers/groups');

router.get('/', groupsController.getAllGroups);
router.post('/', groupsController.createGroup);
router.delete('/:id', groupsController.deleteGroup);

module.exports = router;