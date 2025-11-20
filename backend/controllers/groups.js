const Group = require('../models/Group');

exports.getAllGroups = async (req, res) => {
  try {
    const groups = await Group.findAll();
    res.json(groups);
  } catch (error) {
    console.error('Erro ao buscar grupos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

exports.createGroup = async (req, res) => {
  try {
    const group = await Group.create(req.body);
    res.status(201).json(group);
  } catch (error) {
    console.error('Erro ao criar grupo:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

exports.deleteGroup = async (req, res) => {
  try {
    await Group.delete(req.params.id);
    res.status(204).send();
  } catch (error) {
    console.error('Erro ao deletar grupo:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};