const Role = require('../models/Role');

exports.getAllRoles = async (req, res) => {
  try {
    const roles = await Role.findAll();
    res.json(roles);
  } catch (error) {
    console.error('Erro ao buscar roles:', error);
    res.status(500).json({ error: 'Erro interno' });
  }
};

exports.createRole = async (req, res) => {
  try {
    const role = await Role.create(req.body);
    res.status(201).json(role);
  } catch (error) {
    console.error('Erro ao criar role:', error);
    res.status(500).json({ error: 'Erro interno' });
  }
};

exports.updateRole = async (req, res) => {
  try {
    const role = await Role.update(req.params.id, req.body);
    res.json(role);
  } catch (error) {
    console.error('Erro ao atualizar role:', error);
    res.status(500).json({ error: 'Erro interno' });
  }
};

exports.deleteRole = async (req, res) => {
  try {
    await Role.delete(req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};