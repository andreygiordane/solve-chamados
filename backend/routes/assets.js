const express = require('express');
const router = express.Router();
const assetsController = require('../controllers/assets');

// Rotas de Equipamentos
router.get('/', assetsController.getAllAssets);
router.get('/:id/history', assetsController.getAssetHistory); // <--- ESTA LINHA É ESSENCIAL
router.post('/', assetsController.createAsset);
router.put('/:id', assetsController.updateAsset);
router.delete('/:id', assetsController.deleteAsset);

module.exports = router;