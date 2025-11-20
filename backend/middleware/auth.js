const Auth = require('../models/Auth');

const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Token de autenticação não fornecido' 
      });
    }

    const session = await Auth.findSessionByToken(token);
    
    if (!session) {
      return res.status(401).json({ 
        success: false, 
        message: 'Sessão inválida ou expirada' 
      });
    }

    // Adicionar informações do usuário à requisição
    req.user = {
      id: session.user_id,
      name: session.name,
      email: session.email,
      role: session.role,
      group_id: session.group_id,
      group_name: session.group_name
    };

    next();

  } catch (error) {
    console.error('Erro na autenticação:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro interno do servidor' 
    });
  }
};

const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Não autenticado' 
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Acesso negado. Permissões insuficientes.' 
      });
    }

    next();
  };
};

// Middleware para limpar sessões expiradas periodicamente
const cleanupSessions = async (req, res, next) => {
  try {
    await Auth.cleanupExpiredSessions();
    next();
  } catch (error) {
    console.error('Erro ao limpar sessões:', error);
    next(); // Continuar mesmo com erro
  }
};

// Exportar funções
module.exports = {
  authenticate,
  requireRole,
  cleanupSessions
};