const pool = require('../config/database');

class User {
  // Buscar todos os usuários
  static async findAll() {
    const result = await pool.query(`
      SELECT u.*, g.name as group_name 
      FROM users u 
      LEFT JOIN groups g ON u.group_id = g.id 
      ORDER BY u.name
    `);
    return result.rows;
  }

  // Buscar usuário por ID
  static async findById(id) {
    const result = await pool.query(`
      SELECT u.*, g.name as group_name 
      FROM users u 
      LEFT JOIN groups g ON u.group_id = g.id 
      WHERE u.id = $1
    `, [id]);
    return result.rows[0];
  }

  // Atualizar usuário
  static async update(id, userData) {
    const { name, email, role, group_id, is_active } = userData;
    
    const result = await pool.query(`
      UPDATE users 
      SET name = $1, email = $2, role = $3, group_id = $4, is_active = $5, updated_at = NOW()
      WHERE id = $6
      RETURNING *
    `, [name, email, role, group_id, is_active, id]);
    
    return result.rows[0];
  }

  // Deletar usuário
  static async delete(id) {
    await pool.query('DELETE FROM users WHERE id = $1', [id]);
    return true;
  }

  // Buscar estatísticas
  static async getStats() {
    const totalResult = await pool.query('SELECT COUNT(*) as total FROM users');
    const activeResult = await pool.query('SELECT COUNT(*) as active FROM users WHERE is_active = true');
    const rolesResult = await pool.query('SELECT role, COUNT(*) as count FROM users GROUP BY role');
    
    return {
      total: parseInt(totalResult.rows[0].total),
      active: parseInt(activeResult.rows[0].active),
      by_role: rolesResult.rows
    };
  }

  // Buscar usuários por role
  static async findByRole(role) {
    const result = await pool.query(`
      SELECT u.*, g.name as group_name 
      FROM users u 
      LEFT JOIN groups g ON u.group_id = g.id 
      WHERE u.role = $1 
      ORDER BY u.name
    `, [role]);
    return result.rows;
  }
}

module.exports = User;