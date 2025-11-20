const { Pool } = require('pg');
const bcrypt = require('bcrypt');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'solve_chamados',
  password: '951405', // substitua pela sua senha do PostgreSQL
  port: 5432,
});

async function setupDatabase() {
  const client = await pool.connect();
  
  try {
    console.log('🚀 Iniciando configuração do banco de dados...');
    
    await client.query('BEGIN');

    // 1. Verificar tabela user_sessions
    console.log('\n📋 Verificando tabela user_sessions...');
    try {
      const sessionsCheck = await client.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_name = 'user_sessions'
      `);
      
      if (sessionsCheck.rows.length === 0) {
        console.log('📝 Criando tabela user_sessions...');
        await client.query(`
          CREATE TABLE user_sessions (
            id SERIAL PRIMARY KEY,
            user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
            session_token VARCHAR(255) UNIQUE NOT NULL,
            expires_at TIMESTAMP NOT NULL,
            created_at TIMESTAMP DEFAULT NOW()
          )
        `);
        console.log('✅ Tabela user_sessions criada com sucesso!');
      } else {
        console.log('✅ Tabela user_sessions já existe');
      }
    } catch (error) {
      console.log('❌ Erro ao verificar/criar user_sessions:', error.message);
    }

    // 2. Verificar e corrigir senhas
    console.log('\n🔐 Verificando senhas dos usuários...');
    const users = await client.query('SELECT id, name, email, password_hash FROM users');
    
    for (const user of users.rows) {
      console.log(`\n👤 Processando: ${user.name} (${user.email})`);
      console.log(`   Hash atual: ${user.password_hash}`);
      console.log(`   Tamanho: ${user.password_hash?.length || 0}`);
      
      // Se não tem hash ou o hash é muito curto, corrigir
      if (!user.password_hash || user.password_hash.length !== 60) {
        console.log('   🔄 Criando novo hash bcrypt para "123456"...');
        const newHash = await bcrypt.hash('123456', 10);
        
        await client.query(
          'UPDATE users SET password_hash = $1 WHERE id = $2',
          [newHash, user.id]
        );
        
        console.log('   ✅ Senha atualizada com hash bcrypt');
        console.log(`   Novo hash: ${newHash.substring(0, 20)}...`);
      } else {
        console.log('   ✅ Hash bcrypt já está correto');
      }
    }

    await client.query('COMMIT');
    
    // 3. Verificação final
    console.log('\n📊 VERIFICAÇÃO FINAL:');
    const finalUsers = await client.query(`
      SELECT 
        id, 
        name, 
        email, 
        LENGTH(password_hash) as pwd_length,
        CASE 
          WHEN LENGTH(password_hash) = 60 THEN '✅ CORRETO'
          ELSE '❌ INCORRETO'
        END as status
      FROM users
    `);
    
    console.log('\n👥 USUÁRIOS:');
    finalUsers.rows.forEach(user => {
      console.log(`   ${user.name} (${user.email}): ${user.pwd_length} chars - ${user.status}`);
    });
    
    const finalTables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name IN ('users', 'user_sessions', 'tickets', 'assets', 'groups')
    `);
    
    console.log('\n🗃️ TABELAS EXISTENTES:');
    finalTables.rows.forEach(table => {
      console.log(`   ✅ ${table.table_name}`);
    });
    
    console.log('\n🎉 Configuração do banco concluída com sucesso!');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Erro na configuração:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

setupDatabase();