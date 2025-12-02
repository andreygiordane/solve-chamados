const pool = require('../config/database');

class Role {
  static async findAll() {
    // Busca roles ordenando admin primeiro, depois pelo id
    const result = await pool.query(`
      SELECT * FROM roles 
      ORDER BY CASE WHEN name = 'admin' THEN 0 ELSE 1 END, id
    `);
    return result.rows;
  }

  static async create(roleData) {
    // Recebe permissions no body
    const { name, label, description, permissions } = roleData;
    
    // Converte array de permissões para JSON string se necessário
    const permsJson = JSON.stringify(permissions || []);
    
    const result = await pool.query(
      `INSERT INTO roles (name, label, description, permissions) 
       VALUES ($1, $2, $3, $4::jsonb) 
       RETURNING *`,
      [name.toLowerCase().replace(/\s+/g, '_'), label, description, permsJson]
    );
    return result.rows[0];
  }

  static async update(id, roleData) {
    const { label, permissions } = roleData;
    const permsJson = JSON.stringify(permissions || []);

    const result = await pool.query(
      `UPDATE roles 
       SET label = $1, permissions = $2::jsonb 
       WHERE id = $3 
       RETURNING *`,
      [label, permsJson, id]
    );
    return result.rows[0];
  }

  static async delete(id) {
    // Proteção: não permite deletar roles cruciais
    const check = await pool.query('SELECT name FROM roles WHERE id = $1', [id]);
    if (check.rows[0] && check.rows[0].name === 'admin') {
      throw new Error('Não é possível excluir o cargo de Administrador.');
    }
    await pool.query('DELETE FROM roles WHERE id = $1', [id]);
    return true;
  }
}

module.exports = Role;