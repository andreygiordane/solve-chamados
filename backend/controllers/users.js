const User = require('../models/User');
const Auth = require('../models/Auth');

// Buscar todos os usuários
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll();
    
    // Remover senhas dos resultados
    const usersWithoutPasswords = users.map(user => {
      const { password_hash, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });

    res.json({
      success: true,
      users: usersWithoutPasswords
    });
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    res.status(500).json({ 
      success: false,
      error: 'Erro interno do servidor' 
    });
  }
};

// Buscar usuário por ID
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        error: 'Usuário não encontrado' 
      });
    }

    // Remover senha do resultado
    const { password_hash, ...userWithoutPassword } = user;

    res.json({
      success: true,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    res.status(500).json({ 
      success: false,
      error: 'Erro interno do servidor' 
    });
  }
};

// Criar novo usuário
exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role, group_id } = req.body;

    console.log('📝 Criando novo usuário:', { name, email, role });

    // Validações
    if (!name || !email || !password) {
      return res.status(400).json({ 
        success: false,
        error: 'Nome, email e senha são obrigatórios' 
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        success: false,
        error: 'A senha deve ter pelo menos 6 caracteres' 
      });
    }

    // Verificar se email já existe
    const existingUser = await Auth.findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ 
        success: false,
        error: 'Email já cadastrado' 
      });
    }

    // Criar usuário usando o Auth (que já faz o hash da senha)
    const user = await Auth.createUser({
      name,
      email,
      password,
      role: role || 'tecnico', // Valor padrão se não especificado
      group_id: group_id || null
    });

    console.log('✅ Usuário criado com sucesso:', user.email);

    res.status(201).json({
      success: true,
      message: 'Usuário criado com sucesso',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        group_id: user.group_id,
        created_at: user.created_at
      }
    });

  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    res.status(500).json({ 
      success: false,
      error: 'Erro interno do servidor: ' + error.message 
    });
  }
};

// Atualizar usuário
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role, group_id, is_active } = req.body;

    console.log('✏️ Atualizando usuário:', { id, name, email, role });

    // Verificar se usuário existe
    const existingUser = await User.findById(id);
    if (!existingUser) {
      return res.status(404).json({ 
        success: false,
        error: 'Usuário não encontrado' 
      });
    }

    // Se estiver alterando o email, verificar se já existe
    if (email && email !== existingUser.email) {
      const userWithEmail = await Auth.findUserByEmail(email);
      if (userWithEmail && userWithEmail.id !== parseInt(id)) {
        return res.status(400).json({ 
          success: false,
          error: 'Email já está em uso por outro usuário' 
        });
      }
    }

    // Atualizar usuário
    const updatedUser = await User.update(id, {
      name: name || existingUser.name,
      email: email || existingUser.email,
      role: role || existingUser.role,
      group_id: group_id !== undefined ? group_id : existingUser.group_id,
      is_active: is_active !== undefined ? is_active : existingUser.is_active
    });

    // Remover senha do resultado
    const { password_hash, ...userWithoutPassword } = updatedUser;

    res.json({
      success: true,
      message: 'Usuário atualizado com sucesso',
      user: userWithoutPassword
    });

  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    res.status(500).json({ 
      success: false,
      error: 'Erro interno do servidor' 
    });
  }
};

// Alterar senha do usuário
exports.changePassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { new_password, confirm_password } = req.body;

    console.log('🔐 Alterando senha do usuário:', id);

    // Validações
    if (!new_password || !confirm_password) {
      return res.status(400).json({ 
        success: false,
        error: 'Nova senha e confirmação são obrigatórias' 
      });
    }

    if (new_password !== confirm_password) {
      return res.status(400).json({ 
        success: false,
        error: 'As senhas não coincidem' 
      });
    }

    if (new_password.length < 6) {
      return res.status(400).json({ 
        success: false,
        error: 'A senha deve ter pelo menos 6 caracteres' 
      });
    }

    // Verificar se usuário existe
    const existingUser = await User.findById(id);
    if (!existingUser) {
      return res.status(404).json({ 
        success: false,
        error: 'Usuário não encontrado' 
      });
    }

    // Alterar senha
    await Auth.changePassword(id, new_password);

    res.json({
      success: true,
      message: 'Senha alterada com sucesso'
    });

  } catch (error) {
    console.error('Erro ao alterar senha:', error);
    res.status(500).json({ 
      success: false,
      error: 'Erro interno do servidor' 
    });
  }
};

// Deletar usuário
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    console.log('🗑️ Deletando usuário:', id);

    // Verificar se usuário existe
    const existingUser = await User.findById(id);
    if (!existingUser) {
      return res.status(404).json({ 
        success: false,
        error: 'Usuário não encontrado' 
      });
    }

    // Não permitir deletar o próprio usuário
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({ 
        success: false,
        error: 'Não é possível excluir seu próprio usuário' 
      });
    }

    // Deletar usuário
    await User.delete(id);

    res.json({
      success: true,
      message: 'Usuário deletado com sucesso'
    });

  } catch (error) {
    console.error('Erro ao deletar usuário:', error);
    res.status(500).json({ 
      success: false,
      error: 'Erro interno do servidor' 
    });
  }
};

// Buscar estatísticas de usuários
exports.getUserStats = async (req, res) => {
  try {
    const stats = await User.getStats();
    
    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({ 
      success: false,
      error: 'Erro interno do servidor' 
    });
  }
};