const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'solve_chamados',
  password: '951405',
  port: 5432,
});

// Testar conexão
pool.on('connect', () => {
  console.log('✅ Conectado ao PostgreSQL');
});

pool.on('error', (err) => {
  console.error('❌ Erro na conexão PostgreSQL:', err);
});

module.exports = pool;