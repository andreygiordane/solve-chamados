const Group = require('../models/Group');

exports.getAllGroups = async (req, res) => {
  try {
    const groups = await Group.findAll();
    res.json(groups);
  } catch (error) {
    console.error('Erro ao buscar grupos:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.createGroup = async (req, res) => {
  try {
    const { name } = req.body;

    // Validação básica
    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'O nome do grupo é obrigatório.' });
    }

    const group = await Group.create(req.body);
    res.status(201).json(group);

  } catch (error) {
    console.error('Erro ao criar grupo:', error);

    // ERRO 1: Duplicidade de Nome (Postgres Code 23505)
    if (error.code === '23505') {
      return res.status(400).json({ 
        error: 'Já existe um grupo cadastrado com este nome.' 
      });
    }

    // ERRO 2: Coluna faltando no banco (Postgres Code 42703)
    // Isso acontece se você não rodou o SQL para adicionar a coluna 'description'
    if (error.code === '42703') {
      return res.status(500).json({ 
        error: 'Erro de Banco de Dados: A coluna "description" não existe na tabela groups. Execute o comando SQL: ALTER TABLE groups ADD COLUMN IF NOT EXISTS description TEXT;' 
      });
    }

    // Outros erros: Retorna a mensagem técnica para ajudar no debug
    res.status(500).json({ error: error.message });
  }
};

exports.deleteGroup = async (req, res) => {
  try {
    await Group.delete(req.params.id);
    res.status(204).send();

  } catch (error) {
    // ERRO 3: Chave Estrangeira / Em uso (Postgres Code 23503)
    if (error.code === '23503') {
      return res.status(400).json({ 
        error: 'Não é possível excluir este grupo pois existem usuários vinculados a ele. Mova os usuários para outro grupo antes de excluir.' 
      });
    }

    console.error('Erro ao deletar grupo:', error);
    res.status(500).json({ error: error.message });
  }
};