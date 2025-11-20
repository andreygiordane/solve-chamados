const pool = require('../config/database');

class Group {
  static async findAll() {
    const result = await pool.query('SELECT * FROM groups ORDER BY name');
    return result.rows;
  }

  static async create(groupData) {
    const { name, description } = groupData;
    const result = await pool.query(`
      INSERT INTO groups (name, description)
      VALUES ($1, $2)
      RETURNING *
    `, [name, description]);
    return result.rows[0];
  }

  static async delete(id) {
    await pool.query('DELETE FROM groups WHERE id = $1', [id]);
    return true;
  }
}

module.exports = Group;