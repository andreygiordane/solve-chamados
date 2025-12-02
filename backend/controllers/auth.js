const Auth = require('../models/Auth');
const bcrypt = require('bcrypt');

// Função de login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('🔐 [LOGIN] Tentativa para:', email);

    // Validar entrada
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email e senha são obrigatórios' 
      });
    }

    // Buscar usuário
    const user = await Auth.findUserByEmail(email);

    if (!user) {
      // Por segurança, não informamos que o email não existe
      return res.status(401).json({ 
        success: false, 
        message: 'Email ou senha inválidos' 
      });
    }

    // === 1. VERIFICAR SE A CONTA ESTÁ BLOQUEADA ===
    if (user.lockout_until) {
      const lockoutTime = new Date(user.lockout_until);
      const now = new Date();

      if (lockoutTime > now) {
        const waitMinutes = Math.ceil((lockoutTime - now) / 60000); // Minutos restantes
        console.log(`🚫 Usuário ${email} está bloqueado por mais ${waitMinutes} minutos`);
        
        return res.status(403).json({
          success: false,
          message: `Conta bloqueada temporariamente devido a muitas tentativas falhas. Tente novamente em ${waitMinutes} minutos.`
        });
      }
    }

    // Verificar se usuário está ativo
    if (user.is_active === false) {
      return res.status(401).json({ 
        success: false, 
        message: 'Usuário desativado' 
      });
    }

    // === 2. VERIFICAR SENHA ===
    const isPasswordValid = await Auth.verifyPassword(password, user.password_hash);

    if (!isPasswordValid) {
      console.log(`❌ [LOGIN] Senha incorreta para ${email}`);
      
      // Incrementar tentativas falhas e verificar se bloqueou
      const result = await Auth.incrementFailedAttempts(user.id);
      
      if (result.locked) {
        console.log(`🚫 Usuário ${email} acabou de ser bloqueado`);
        return res.status(403).json({
          success: false,
          message: 'Muitas tentativas falhas. Sua conta foi bloqueada por 15 minutos.'
        });
      }

      const attemptsLeft = 3 - result.attempts;
      return res.status(401).json({ 
        success: false, 
        message: `Senha incorreta. Você tem mais ${attemptsLeft} tentativa(s) antes do bloqueio temporário.` 
      });
    }

    // === 3. LOGIN BEM SUCEDIDO ===
    
    // Resetar o contador de falhas (importante!)
    await Auth.resetFailedAttempts(user.id);

    // Criar sessão
    const session = await Auth.createSession(user.id);
    await Auth.updateLastLogin(user.id);

    const userResponse = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      group_id: user.group_id,
      group_name: user.group_name
    };

    console.log('🎉 [LOGIN] Sucesso para:', email);

    res.json({
      success: true,
      message: 'Login realizado com sucesso',
      user: userResponse,
      session: {
        token: session.session_token,
        expires_at: session.expires_at
      }
    });

  } catch (error) {
    console.error('💥 [LOGIN] Erro completo:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro interno do servidor' 
    });
  }
};

// Função de logout
const logout = async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (token) {
      await Auth.deleteSession(token);
    }
    res.json({ success: true, message: 'Logout realizado com sucesso' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
};

// Função de perfil
const getProfile = async (req, res) => {
  try {
    const user = await Auth.findUserById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'Usuário não encontrado' });

    const userResponse = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      group_id: user.group_id,
      group_name: user.group_name,
      last_login: user.last_login,
      created_at: user.created_at
    };

    res.json({ success: true, user: userResponse });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
};

// Função de validação de sessão
const validateSession = async (req, res) => {
  try {
    const user = await Auth.findUserById(req.user.id);
    if (!user) return res.status(401).json({ success: false, message: 'Usuário não encontrado' });

    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        group_id: user.group_id,
        group_name: user.group_name
      }
    });
  } catch (error) {
    res.status(401).json({ success: false, message: 'Sessão inválida' });
  }
};

// Função de registro
const register = async (req, res) => {
  try {
    const { name, email, password, role, group_id } = req.body;
    if (!name || !email || !password) return res.status(400).json({ success: false, message: 'Dados incompletos' });

    const existingUser = await Auth.findUserByEmail(email);
    if (existingUser) return res.status(400).json({ success: false, message: 'Email já cadastrado' });

    const user = await Auth.createUser({ name, email, password, role: role || 'tecnico', group_id: group_id || null });

    res.status(201).json({ success: true, message: 'Usuário criado', user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
};

// Função de diagnóstico (Simplificada para manter compatibilidade)
const diagnose = async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) return res.status(400).json({ success: false, message: 'Email obrigatório' });
    
    const user = await Auth.findUserByEmail(email);
    if (!user) return res.json({ success: true, diagnosis: { exists: false } });

    res.json({
      success: true,
      diagnosis: {
        exists: true,
        hasPassword: !!user.password_hash,
        isLocked: !!user.lockout_until,
        failedAttempts: user.failed_login_attempts || 0
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Correção de senhas em massa
const fixPasswords = async (req, res) => {
  try {
    await Auth.fixAllPasswords();
    res.json({ success: true, message: 'Senhas corrigidas e bloqueios resetados' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Setup do banco
const setupDatabase = async (req, res) => {
  try {
    await Auth.createSessionsTable();
    res.json({ success: true, message: 'Banco configurado' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  login,
  logout,
  getProfile,
  validateSession,
  register,
  diagnose,
  fixPasswords,
  setupDatabase
};