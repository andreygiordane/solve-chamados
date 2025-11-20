const Asset = require('../models/Asset');

exports.getAllAssets = async (req, res) => {
  try {
    const assets = await Asset.findAll();
    res.json(assets);
  } catch (error) {
    console.error('Erro ao buscar assets:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

exports.createAsset = async (req, res) => {
  try {
    const asset = await Asset.create(req.body);
    res.status(201).json(asset);
  } catch (error) {
    console.error('Erro ao criar asset:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

exports.deleteAsset = async (req, res) => {
  try {
    await Asset.delete(req.params.id);
    res.status(204).send();
  } catch (error) {
    console.error('Erro ao deletar asset:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};