const pool = require('../config/database');

class Ticket {
  static async findAll() {
    const result = await pool.query(`
      SELECT *, 
             EXTRACT(EPOCH FROM created_at) as created_seconds,
             EXTRACT(EPOCH FROM updated_at) as updated_seconds,
             EXTRACT(EPOCH FROM sla_deadline) as sla_deadline_seconds
      FROM tickets 
      ORDER BY created_at DESC
    `);
    return result.rows;
  }

  static async findById(id) {
    const result = await pool.query(`
      SELECT *, 
             EXTRACT(EPOCH FROM created_at) as created_seconds,
             EXTRACT(EPOCH FROM updated_at) as updated_seconds,
             EXTRACT(EPOCH FROM sla_deadline) as sla_deadline_seconds
      FROM tickets 
      WHERE id = $1
    `, [id]);
    return result.rows[0];
  }

  static async create(ticketData) {
    const { title, description, priority, asset_id, location, requester, attachment } = ticketData;

    const finalAssetId = (asset_id === "" || asset_id === "null" || !asset_id) ? null : asset_id;

    // --- LÓGICA DE SLA ---
    const slaHours = {
      'critica': 4,
      'alta': 24,
      'media': 48,
      'baixa': 72
    };

    const hoursToAdd = slaHours[priority] || 48;
    const deadline = new Date();
    deadline.setHours(deadline.getHours() + hoursToAdd);

    const result = await pool.query(`
      INSERT INTO tickets (title, description, priority, asset_id, location, requester, status, sla_deadline, attachment)
      VALUES ($1, $2, $3, $4, $5, $6, 'aberto', $7, $8)
      RETURNING *, EXTRACT(EPOCH FROM created_at) as created_seconds
    `, [title, description, priority, finalAssetId, location, requester, deadline, attachment]);
    
    return result.rows[0];
  }

  static async updateStatus(id, status, additionalData = {}) {
    const { assignee } = additionalData;
    const result = await pool.query(`
      UPDATE tickets 
      SET status = $1, assignee = $2, updated_at = NOW()
      WHERE id = $3
      RETURNING *, EXTRACT(EPOCH FROM updated_at) as updated_seconds
    `, [status, assignee, id]);
    return result.rows[0];
  }

  static async addUpdate(id, updateText, author) {
    const ticket = await this.findById(id);
    let updates = [];
    
    if (ticket.updates && typeof ticket.updates === 'object') {
      updates = Array.isArray(ticket.updates) ? ticket.updates : [];
    }
    
    updates.push({
      text: updateText,
      author: author,
      timestamp: new Date().toISOString()
    });

    const result = await pool.query(`
      UPDATE tickets 
      SET updates = $1::jsonb, updated_at = NOW()
      WHERE id = $2
      RETURNING *, EXTRACT(EPOCH FROM updated_at) as updated_seconds
    `, [JSON.stringify(updates), id]);
    return result.rows[0];
  }

  static async delete(id) {
    await pool.query('DELETE FROM tickets WHERE id = $1', [id]);
    return true;
  }
}

module.exports = Ticket;