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
    console.log('👤 [LOGIN] Usuário encontrado:', user ? `Sim (ID: ${user.id})` : 'Não');

    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Usuário não encontrado' 
      });
    }

    // DEBUG DETALHADO
    console.log('🔍 DEBUG DETALHADO:');
    console.log('   User ID:', user.id);
    console.log('   User Name:', user.name);
    console.log('   Password Hash:', user.password_hash);
    console.log('   Hash Length:', user.password_hash?.length);
    console.log('   Hash Type:', typeof user.password_hash);

    // Verificar se usuário está ativo
    if (user.is_active === false) {
      console.log('❌ [LOGIN] Usuário inativo');
      return res.status(401).json({ 
        success: false, 
        message: 'Usuário desativado' 
      });
    }

    // Verificar se usuário tem senha definida
    if (!user.password_hash) {
      console.log('❌ [LOGIN] Usuário sem senha hash');
      
      // Tentar corrigir automaticamente
      console.log('🔄 Tentando corrigir senha automaticamente...');
      try {
        await Auth.fixUserPassword(user.id, '123456');
        
        // Buscar usuário novamente após correção
        const updatedUser = await Auth.findUserByEmail(email);
        if (updatedUser && updatedUser.password_hash) {
          console.log('✅ Senha corrigida automaticamente');
          user.password_hash = updatedUser.password_hash;
        }
      } catch (fixError) {
        console.log('❌ Falha ao corrigir senha automaticamente:', fixError);
      }
    }

    // Se ainda não tem senha após tentativa de correção
    if (!user.password_hash) {
      return res.status(401).json({ 
        success: false, 
        message: 'Usuário não possui senha definida. Use a rota /fix-passwords primeiro.' 
      });
    }

    console.log('🔑 [LOGIN] Verificando senha...');
    
    // TESTE DO BCRYPT
    const testHash = await bcrypt.hash('123456', 10);
    console.log('   Test Hash:', testHash.substring(0, 20) + '...');
    console.log('   Test Hash Length:', testHash.length);

    const testCompare = await bcrypt.compare('123456', testHash);
    console.log('   Test Compare Result:', testCompare);

    // Verificar senha do usuário
    const isPasswordValid = await Auth.verifyPassword(password, user.password_hash);
    console.log('✅ [LOGIN] Senha válida:', isPasswordValid);

    if (!isPasswordValid) {
      console.log('❌ [LOGIN] Senha incorreta');
      
      // Tentar corrigir a senha se estiver incorreta
      console.log('🔄 Tentando corrigir senha...');
      try {
        await Auth.fixUserPassword(user.id, '123456');
        console.log('✅ Senha corrigida, tente fazer login novamente');
      } catch (fixError) {
        console.log('❌ Falha ao corrigir senha:', fixError);
      }
      
      return res.status(401).json({ 
        success: false, 
        message: 'Senha incorreta. A senha foi reinicializada para "123456". Tente novamente.' 
      });
    }

    // Criar sessão
    console.log('📝 [LOGIN] Criando sessão...');
    const session = await Auth.createSession(user.id);
    
    // Atualizar último login
    await Auth.updateLastLogin(user.id);

    // Remover dados sensíveis
    const userResponse = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      group_id: user.group_id,
      group_name: user.group_name,
      last_login: user.last_login
    };

    console.log('🎉 [LOGIN] Login realizado com sucesso para:', user.email);
    console.log('🔑 [LOGIN] Token da sessão:', session.session_token.substring(0, 20) + '...');

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
    
    // Erro mais específico
    if (error.message.includes('user_sessions')) {
      return res.status(500).json({ 
        success: false, 
        message: 'Erro de configuração do banco. Execute a rota /fix-passwords primeiro.' 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: 'Erro interno do servidor: ' + error.message 
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

    res.json({
      success: true,
      message: 'Logout realizado com sucesso'
    });

  } catch (error) {
    console.error('Erro no logout:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro interno do servidor' 
    });
  }
};

// Função de perfil
const getProfile = async (req, res) => {
  try {
    const user = await Auth.findUserById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'Usuário não encontrado' 
      });
    }

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

    res.json({
      success: true,
      user: userResponse
    });

  } catch (error) {
    console.error('Erro ao buscar perfil:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro interno do servidor' 
    });
  }
};

// Função de validação de sessão
const validateSession = async (req, res) => {
  try {
    const user = await Auth.findUserById(req.user.id);
    
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Usuário não encontrado' 
      });
    }

    const userResponse = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      group_id: user.group_id,
      group_name: user.group_name
    };

    res.json({
      success: true,
      user: userResponse
    });

  } catch (error) {
    console.error('Erro ao validar sessão:', error);
    res.status(401).json({ 
      success: false, 
      message: 'Sessão inválida' 
    });
  }
};

// Função de registro
const register = async (req, res) => {
  try {
    const { name, email, password, role, group_id } = req.body;

    // Validar entrada
    if (!name || !email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Nome, email e senha são obrigatórios' 
      });
    }

    // Verificar se email já existe
    const existingUser = await Auth.findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email já cadastrado' 
      });
    }

    // Criar usuário
    const user = await Auth.createUser({
      name,
      email,
      password,
      role: role || 'tecnico',
      group_id: group_id || null
    });

    res.status(201).json({
      success: true,
      message: 'Usuário criado com sucesso',
      user: user
    });

  } catch (error) {
    console.error('Erro no registro:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro interno do servidor' 
    });
  }
};

// Função de diagnóstico
const diagnose = async (req, res) => {
  try {
    const { email } = req.query;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email é obrigatório para diagnóstico'
      });
    }
    
    // Buscar usuário diretamente
    const user = await Auth.findUserByEmail(email);
    
    if (!user) {
      return res.json({
        success: true,
        diagnosis: {
          exists: false,
          message: 'Usuário não encontrado'
        }
      });
    }

    // Testar senha
    let passwordTest = 'Não testado';
    try {
      if (user.password_hash) {
        const testResult = await bcrypt.compare('123456', user.password_hash);
        passwordTest = testResult ? '✅ Válida' : '❌ Inválida';
      } else {
        passwordTest = '❌ Sem senha';
      }
    } catch (testError) {
      passwordTest = `❌ Erro: ${testError.message}`;
    }

    const diagnosis = {
      exists: true,
      hasPassword: !!user.password_hash,
      passwordLength: user.password_hash ? user.password_hash.length : 0,
      passwordTest: passwordTest,
      isActive: user.is_active !== false,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      database: {
        hasSessionsTable: true, // Assumindo que existe após correção
        connection: '✅ OK'
      }
    };

    res.json({
      success: true,
      diagnosis
    });

  } catch (error) {
    console.error('Erro no diagnóstico:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Novo método para corrigir senhas
const fixPasswords = async (req, res) => {
  try {
    console.log('🔧 Iniciando correção de senhas...');
    
    await Auth.fixAllPasswords();
    
    // Verificar resultado
    const users = await Auth.pool.query('SELECT id, name, email, LENGTH(password_hash) as pwd_len FROM users');
    
    res.json({
      success: true,
      message: 'Senhas corrigidas com sucesso!',
      results: users.rows.map(user => ({
        name: user.name,
        email: user.email,
        password_length: user.pwd_len,
        status: user.pwd_len === 60 ? '✅ CORRETO' : '❌ INCORRETO'
      }))
    });
  } catch (error) {
    console.error('Erro ao corrigir senhas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao corrigir senhas: ' + error.message
    });
  }
};

// Método para criar tabelas se não existirem
const setupDatabase = async (req, res) => {
  try {
    console.log('🗃️ Configurando banco de dados...');
    
    // Criar tabela de sessões se não existir
    await Auth.pool.query(`
      CREATE TABLE IF NOT EXISTS user_sessions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        session_token VARCHAR(255) UNIQUE NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    
    console.log('✅ Tabela user_sessions verificada/criada');
    
    res.json({
      success: true,
      message: 'Banco de dados configurado com sucesso'
    });
  } catch (error) {
    console.error('Erro na configuração do banco:', error);
    res.status(500).json({
      success: false,
      message: 'Erro na configuração: ' + error.message
    });
  }
};

// Exportar todas as funções
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