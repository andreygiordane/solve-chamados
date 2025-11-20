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
      
      const user = result.rows[0];
      
      // Se usuário existe mas não tem hash válido, corrigir automaticamente
      if (user && (!user.password_hash || user.password_hash.length !== 60)) {
        console.log(`⚠️ Senha inválida para ${user.email}, corrigindo automaticamente...`);
        await this.fixUserPassword(user.id, '123456');
        
        // Buscar novamente após correção
        const updatedResult = await pool.query(
          `SELECT u.*, g.name as group_name 
           FROM users u 
           LEFT JOIN groups g ON u.group_id = g.id 
           WHERE u.email = $1`,
          [email]
        );
        return updatedResult.rows[0];
      }
      
      return user;
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

  // Método para verificar senha (CORRIGIDO - estava faltando)
  static async verifyPassword(plainPassword, hashedPassword) {
    try {
      if (!hashedPassword) {
        console.log('❌ Hash de senha não fornecido');
        return false;
      }
      
      console.log('🔐 Verificando senha...');
      console.log('   Senha fornecida:', plainPassword ? '***' : 'vazia');
      console.log('   Hash no banco:', hashedPassword.substring(0, 20) + '...');
      
      const result = await bcrypt.compare(plainPassword, hashedPassword);
      console.log('   Resultado da comparação:', result);
      
      return result;
    } catch (error) {
      console.error('❌ Erro ao verificar senha:', error);
      return false;
    }
  }

  // Método para criar hash de senha
  static async hashPassword(password) {
    try {
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      console.log('🔐 Hash criado:', hashedPassword.substring(0, 20) + '...');
      return hashedPassword;
    } catch (error) {
      console.error('❌ Erro ao criar hash:', error);
      throw error;
    }
  }

  // Método para criar sessão
  static async createSession(userId) {
    try {
      const sessionToken = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas
      
      console.log('📝 Criando sessão para usuário:', userId);
      
      const result = await pool.query(
        `INSERT INTO user_sessions (user_id, session_token, expires_at) 
         VALUES ($1, $2, $3) 
         RETURNING *`,
        [userId, sessionToken, expiresAt]
      );
      
      console.log('✅ Sessão criada com sucesso');
      return result.rows[0];
    } catch (error) {
      console.error('❌ Erro ao criar sessão:', error);
      
      // Se a tabela não existir, criar automaticamente
      if (error.message.includes('user_sessions')) {
        console.log('🔄 Tentando criar tabela user_sessions...');
        await this.createSessionsTable();
        
        // Tentar novamente
        return await this.createSession(userId);
      }
      
      throw error;
    }
  }

  // Método para buscar sessão por token
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
      console.error('❌ Erro ao buscar sessão:', error);
      return null;
    }
  }

  // Método para deletar sessão
  static async deleteSession(token) {
    try {
      await pool.query(
        'DELETE FROM user_sessions WHERE session_token = $1',
        [token]
      );
      console.log('✅ Sessão deletada');
    } catch (error) {
      console.error('❌ Erro ao deletar sessão:', error);
    }
  }

  // Método para limpar sessões expiradas
  static async cleanupExpiredSessions() {
    try {
      // Verificar se a tabela existe antes de tentar limpar
      const tableExists = await pool.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = 'user_sessions'
        )
      `);
      
      if (!tableExists.rows[0].exists) {
        console.log('⚠️ Tabela user_sessions não existe, pulando limpeza...');
        return;
      }
      
      const result = await pool.query(
        'DELETE FROM user_sessions WHERE expires_at <= NOW() RETURNING *'
      );
      
      if (result.rows.length > 0) {
        console.log(`🧹 Limpas ${result.rows.length} sessões expiradas`);
      }
    } catch (error) {
      console.error('❌ Erro ao limpar sessões expiradas:', error.message);
    }
  }

  // Método para atualizar último login
  static async updateLastLogin(userId) {
    try {
      await pool.query(
        'UPDATE users SET last_login = NOW() WHERE id = $1',
        [userId]
      );
      console.log('✅ Último login atualizado para usuário:', userId);
    } catch (error) {
      console.error('❌ Erro ao atualizar último login:', error);
    }
  }

  // Método para criar usuário
  static async createUser(userData) {
    try {
      const { name, email, password, role, group_id } = userData;
      const passwordHash = await this.hashPassword(password);
      
      const result = await pool.query(
        `INSERT INTO users (name, email, password_hash, role, group_id) 
         VALUES ($1, $2, $3, $4, $5) 
         RETURNING id, name, email, role, group_id, created_at`,
        [name, email, passwordHash, role, group_id]
      );
      
      console.log('✅ Usuário criado:', name);
      return result.rows[0];
    } catch (error) {
      console.error('❌ Erro ao criar usuário:', error);
      throw error;
    }
  }

  // Método para corrigir senha de usuário
  static async fixUserPassword(userId, plainPassword = '123456') {
    try {
      console.log(`🔧 Corrigindo senha para usuário ${userId}...`);
      
      const hashedPassword = await this.hashPassword(plainPassword);
      
      const result = await pool.query(
        'UPDATE users SET password_hash = $1 WHERE id = $2 RETURNING id, name, email',
        [hashedPassword, userId]
      );
      
      console.log(`✅ Senha corrigida para: ${result.rows[0].name}`);
      return result.rows[0];
    } catch (error) {
      console.error('❌ Erro ao corrigir senha:', error);
      throw error;
    }
  }

  // Método para corrigir todas as senhas
  static async fixAllPasswords() {
    try {
      console.log('🔧 Corrigindo todas as senhas...');
      
      const users = await pool.query('SELECT id, name, email FROM users');
      
      for (const user of users.rows) {
        await this.fixUserPassword(user.id, '123456');
      }
      
      console.log('🎉 Todas as senhas foram corrigidas!');
    } catch (error) {
      console.error('❌ Erro ao corrigir senhas:', error);
    }
  }

  // Método para criar tabela de sessões
  static async createSessionsTable() {
    try {
      console.log('🗃️ Criando tabela user_sessions...');
      
      await pool.query(`
        CREATE TABLE IF NOT EXISTS user_sessions (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          session_token VARCHAR(255) UNIQUE NOT NULL,
          expires_at TIMESTAMP NOT NULL,
          created_at TIMESTAMP DEFAULT NOW()
        )
      `);
      
      console.log('✅ Tabela user_sessions criada/verificada');
    } catch (error) {
      console.error('❌ Erro ao criar tabela user_sessions:', error);
      throw error;
    }
  }

  // Método para verificar estrutura do banco
  static async checkDatabaseStructure() {
    try {
      const usersColumns = await pool.query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns 
        WHERE table_name = 'users'
        ORDER BY ordinal_position
      `);

      const sessionsColumns = await pool.query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns 
        WHERE table_name = 'user_sessions'
        ORDER BY ordinal_position
      `);

      console.log('📊 Estrutura da tabela users:', usersColumns.rows);
      console.log('📊 Estrutura da tabela user_sessions:', sessionsColumns.rows);

      return {
        users: usersColumns.rows,
        sessions: sessionsColumns.rows
      };
    } catch (error) {
      console.error('❌ Erro ao verificar estrutura do banco:', error);
      throw error;
    }
  }
}

// Exportar a classe e a pool para uso externo
module.exports = Auth;
module.exports.pool = pool; // Para acesso direto à pool se necessário