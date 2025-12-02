const pool = require('../config/database');

class Asset {
  // Buscar todos
  static async findAll() {
    const result = await pool.query(`
      SELECT a.*, 
      (SELECT status FROM asset_history WHERE asset_id = a.id ORDER BY created_at DESC LIMIT 1) as last_log_status
      FROM assets a 
      ORDER BY a.name
    `);
    return result.rows;
  }

  // Buscar histórico
  static async getHistory(assetId) {
    const result = await pool.query(`
      SELECT h.*, u.name as user_name 
      FROM asset_history h
      LEFT JOIN users u ON h.user_id = u.id
      WHERE h.asset_id = $1
      ORDER BY h.created_at DESC
    `, [assetId]);
    return result.rows;
  }

  // Helper para criar log
  static async createLog(client, data) {
    const { asset_id, user_id, action_type, description, old_status, new_status } = data;
    await client.query(`
      INSERT INTO asset_history (asset_id, user_id, action_type, description, old_status, new_status)
      VALUES ($1, $2, $3, $4, $5, $6)
    `, [asset_id, user_id, action_type, description, old_status, new_status]);
  }

  // Criar
  static async create(assetData, userId) {
    const { name, code, description, status, acquisition_date, warranty_end, cost } = assetData;
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      const result = await client.query(`
        INSERT INTO assets (name, code, description, status, acquisition_date, warranty_end, cost)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `, [name, code, description, status || 'ativo', acquisition_date || null, warranty_end || null, cost || null]);

      const newAsset = result.rows[0];

      await this.createLog(client, {
        asset_id: newAsset.id,
        user_id: userId,
        action_type: 'CRIACAO',
        description: `Equipamento cadastrado no sistema.`,
        old_status: null,
        new_status: newAsset.status
      });

      await client.query('COMMIT');
      return newAsset;
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  }

  // Atualizar (AGORA COM DETALHES)
  static async update(id, assetData, userId) {
    const { name, code, description, status, acquisition_date, warranty_end, cost } = assetData;
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // 1. Buscar dados antigos
      const oldAssetRes = await client.query('SELECT * FROM assets WHERE id = $1', [id]);
      const oldAsset = oldAssetRes.rows[0];

      // 2. Atualizar
      const result = await client.query(`
        UPDATE assets 
        SET name = $1, code = $2, description = $3, status = $4,
            acquisition_date = $5, warranty_end = $6, cost = $7
        WHERE id = $8
        RETURNING *
      `, [name, code, description, status, acquisition_date || null, warranty_end || null, cost || null, id]);

      const newAsset = result.rows[0];

      // 3. Lógica de Comparação Detalhada
      let changes = [];

      // Helper para formatar moeda
      const fmtMoney = (val) => val ? `R$ ${parseFloat(val).toFixed(2)}` : 'R$ 0.00';
      // Helper para formatar data
      const fmtDate = (d) => d ? new Date(d).toISOString().split('T')[0] : 'N/A';
      
      // Status
      if (oldAsset.status !== newAsset.status) {
        changes.push(`Status: '${oldAsset.status}' ➝ '${newAsset.status}'`);
      }

      // Nome
      if (oldAsset.name !== newAsset.name) {
        changes.push(`Nome: '${oldAsset.name}' ➝ '${newAsset.name}'`);
      }

      // Código/Patrimônio
      if ((oldAsset.code || '') !== (newAsset.code || '')) {
        changes.push(`Patrimônio: '${oldAsset.code || 'S/N'}' ➝ '${newAsset.code || 'S/N'}'`);
      }

      // Custo (Compara números)
      if (Number(oldAsset.cost) !== Number(newAsset.cost)) {
        changes.push(`Valor: ${fmtMoney(oldAsset.cost)} ➝ ${fmtMoney(newAsset.cost)}`);
      }

      // Datas (Compara strings YYYY-MM-DD)
      const oldAcq = fmtDate(oldAsset.acquisition_date);
      const newAcq = fmtDate(newAsset.acquisition_date);
      if (oldAcq !== newAcq) {
        changes.push(`Aquisição: ${oldAcq} ➝ ${newAcq}`);
      }

      const oldWar = fmtDate(oldAsset.warranty_end);
      const newWar = fmtDate(newAsset.warranty_end);
      if (oldWar !== newWar) {
        changes.push(`Garantia: ${oldWar} ➝ ${newWar}`);
      }

      // Descrição (Campo longo)
      if ((oldAsset.description || '') !== (newAsset.description || '')) {
        // Se for uma mudança curta, mostra o texto. Se for longa, avisa genérico.
        if (newAsset.description.length < 50) {
           changes.push(`Obs: '${oldAsset.description || ''}' ➝ '${newAsset.description}'`);
        } else {
           changes.push(`Observações atualizadas`);
        }
      }

      // Se não detectou nada (pode acontecer se salvar sem mudar), mensagem padrão
      const logDescription = changes.length > 0 ? changes.join(' | ') : 'Atualização sem alterações detectadas';

      // 4. Gravar Log
      await this.createLog(client, {
        asset_id: id,
        user_id: userId,
        action_type: 'ATUALIZACAO',
        description: logDescription,
        old_status: oldAsset.status,
        new_status: newAsset.status
      });

      await client.query('COMMIT');
      return newAsset;
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  }

  static async delete(id) {
    await pool.query('DELETE FROM assets WHERE id = $1', [id]);
    return true;
  }
}

module.exports = Asset;