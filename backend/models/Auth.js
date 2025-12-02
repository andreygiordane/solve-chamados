const pool = require('../config/database');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

class Auth {
  // Método para buscar usuário por email
  static async findUserByEmail(email) {
    try {
      const result = await pool.query(
        `SELECT u.*, g.name as group_name 
         FROM users u 
         LEFT JOIN groups g ON u.group_id = g.id 
         WHERE u.email = $1`,
        [email]
      );
      
      // LÓGICA DE AUTO-RESET REMOVIDA DAQUI
      
      return result.rows[0];
    } catch (error) {
      console.error('Erro ao buscar usuário por email:', error);
      throw error;
    }
  }

  // Método para buscar usuário por ID
  static async findUserById(id) {
    try {
      const result = await pool.query(
        `SELECT u.*, g.name as group_name 
         FROM users u 
         LEFT JOIN groups g ON u.group_id = g.id 
         WHERE u.id = $1`,
        [id]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Erro ao buscar usuário por ID:', error);
      throw error;
    }
  }

  // Verificar senha
  static async verifyPassword(plainPassword, hashedPassword) {
    try {
      if (!hashedPassword) return false;
      return await bcrypt.compare(plainPassword, hashedPassword);
    } catch (error) {
      console.error('❌ Erro ao verificar senha:', error);
      return false;
    }
  }

  // Criar hash de senha
  static async hashPassword(password) {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
  }

  // === NOVOS MÉTODOS DE CONTROLE DE TENTATIVAS ===

  // Incrementar tentativas falhas e bloquear se necessário
  static async incrementFailedAttempts(userId) {
    try {
      // 1. Busca tentativas atuais
      const userResult = await pool.query('SELECT failed_login_attempts FROM users WHERE id = $1', [userId]);
      const currentAttempts = userResult.rows[0]?.failed_login_attempts || 0;
      
      const newAttempts = currentAttempts + 1;
      let lockoutValue = null;
      let isLocked = false;
      
      // 2. Se chegar a 3 tentativas, define bloqueio
      if (newAttempts >= 3) {
        const lockoutTime = new Date();
        lockoutTime.setMinutes(lockoutTime.getMinutes() + 15); // Bloqueio de 15 min
        lockoutValue = lockoutTime;
        isLocked = true;
      }

      // 3. Atualiza no banco
      await pool.query(
        `UPDATE users 
         SET failed_login_attempts = $1, 
             lockout_until = $2 
         WHERE id = $3`,
        [newAttempts, lockoutValue, userId]
      );

      return { attempts: newAttempts, locked: isLocked, lockoutUntil: lockoutValue };
    } catch (error) {
      console.error('Erro ao incrementar tentativas:', error);
      // Retorna objeto seguro em caso de erro para não travar o fluxo
      return { attempts: 0, locked: false, lockoutUntil: null }; 
    }
  }

  // Resetar tentativas (usado após login com sucesso)
  static async resetFailedAttempts(userId) {
    try {
      await pool.query(
        `UPDATE users 
         SET failed_login_attempts = 0, 
             lockout_until = NULL 
         WHERE id = $1`,
        [userId]
      );
    } catch (error) {
      console.error('Erro ao resetar tentativas:', error);
    }
  }

  // ===============================================

  // Criar sessão
  static async createSession(userId) {
    try {
      const sessionToken = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas
      
      const result = await pool.query(
        `INSERT INTO user_sessions (user_id, session_token, expires_at) 
         VALUES ($1, $2, $3) 
         RETURNING *`,
        [userId, sessionToken, expiresAt]
      );
      
      return result.rows[0];
    } catch (error) {
      if (error.message.includes('user_sessions')) {
        await this.createSessionsTable();
        return await this.createSession(userId);
      }
      throw error;
    }
  }

  // Buscar sessão por token
  static async findSessionByToken(token) {
    try {
      const result = await pool.query(
        `SELECT us.*, u.name, u.email, u.role, u.group_id, g.name as group_name
         FROM user_sessions us
         JOIN users u ON us.user_id = u.id
         LEFT JOIN groups g ON u.group_id = g.id
         WHERE us.session_token = $1 AND us.expires_at > NOW()`,
        [token]
      );
      return result.rows[0];
    } catch (error) {
      return null;
    }
  }

  // Deletar sessão
  static async deleteSession(token) {
    await pool.query('DELETE FROM user_sessions WHERE session_token = $1', [token]);
  }

  // Limpar sessões expiradas
  static async cleanupExpiredSessions() {
    try {
      const tableExists = await pool.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = 'user_sessions'
        )
      `);
      
      if (tableExists.rows[0].exists) {
        await pool.query('DELETE FROM user_sessions WHERE expires_at <= NOW()');
      }
    } catch (error) {
      console.error('Erro ao limpar sessões:', error.message);
    }
  }

  // Atualizar último login
  static async updateLastLogin(userId) {
    try {
      await pool.query('UPDATE users SET last_login = NOW() WHERE id = $1', [userId]);
    } catch (error) {
      console.error('Erro ao atualizar último login:', error);
    }
  }

  // Criar usuário
  static async createUser(userData) {
    const { name, email, password, role, group_id } = userData;
    const passwordHash = await this.hashPassword(password);
    
    const result = await pool.query(
      `INSERT INTO users (name, email, password_hash, role, group_id) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING id, name, email, role, group_id, created_at`,
      [name, email, passwordHash, role, group_id]
    );
    return result.rows[0];
  }

  // Corrigir senha (mantido para uso manual/admin se necessário)
  static async fixUserPassword(userId, plainPassword = '123456') {
    const hashedPassword = await this.hashPassword(plainPassword);
    // Também reseta as tentativas falhas ao redefinir a senha
    const result = await pool.query(
      'UPDATE users SET password_hash = $1, failed_login_attempts = 0, lockout_until = NULL WHERE id = $2 RETURNING id, name, email',
      [hashedPassword, userId]
    );
    return result.rows[0];
  }
  
  // Corrigir todas as senhas (método de utilidade)
  static async fixAllPasswords() {
    try {
      const users = await pool.query('SELECT id FROM users');
      for (const user of users.rows) {
        await this.fixUserPassword(user.id, '123456');
      }
    } catch (error) {
      console.error('Erro ao corrigir senhas:', error);
    }
  }

  // Criar tabela de sessões
  static async createSessionsTable() {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_sessions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        session_token VARCHAR(255) UNIQUE NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
  }
}

module.exports = Auth;
module.exports.pool = pool;