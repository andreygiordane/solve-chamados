const Asset = require('../models/Asset');

exports.getAllAssets = async (req, res) => {
  try {
    const assets = await Asset.findAll();
    res.json(assets);
  } catch (error) {
    console.error('Erro ao buscar equipamentos:', error);
    res.status(500).json({ error: 'Erro interno' });
  }
};

// NOVO: Buscar Histórico de um equipamento
exports.getAssetHistory = async (req, res) => {
  try {
    const history = await Asset.getHistory(req.params.id);
    res.json(history);
  } catch (error) {
    console.error('Erro ao buscar histórico:', error);
    res.status(500).json({ error: 'Erro interno' });
  }
};

exports.createAsset = async (req, res) => {
  try {
    // Passando o req.user.id (assumindo que o middleware de auth preenche isso)
    const userId = req.user ? req.user.id : null; 
    const asset = await Asset.create(req.body, userId);
    res.status(201).json(asset);
  } catch (error) {
    console.error('Erro ao criar equipamento:', error);
    res.status(500).json({ error: 'Erro interno' });
  }
};

exports.updateAsset = async (req, res) => {
  try {
    const userId = req.user ? req.user.id : null;
    const asset = await Asset.update(req.params.id, req.body, userId);
    res.json(asset);
  } catch (error) {
    console.error('Erro ao atualizar equipamento:', error);
    res.status(500).json({ error: 'Erro interno' });
  }
};

exports.deleteAsset = async (req, res) => {
  try {
    await Asset.delete(req.params.id);
    res.status(204).send();
  } catch (error) {
    if (error.code === '23503') {
      return res.status(400).json({ 
        error: 'Não é possível excluir este equipamento pois existem chamados ou histórico vinculados a ele.' 
      });
    }
    console.error('Erro ao deletar equipamento:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};