const pool = require('../config/database');

class Asset {
  static async findAll() {
    const result = await pool.query('SELECT * FROM assets ORDER BY name');
    return result.rows;
  }

  static async create(assetData) {
    const { name, type, serial_number, location, status } = assetData;
    const result = await pool.query(`
      INSERT INTO assets (name, type, serial_number, location, status)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [name, type, serial_number, location, status]);
    return result.rows[0];
  }

  static async delete(id) {
    await pool.query('DELETE FROM assets WHERE id = $1', [id]);
    return true;
  }
}

module.exports = Asset;