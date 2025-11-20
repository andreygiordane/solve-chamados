const { Pool } = require('pg');
const bcrypt = require('bcrypt');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'solve_chamados',
  password: '951405',
  port: 5432,
});

async function fixPasswords() {
  try {
    console.log('🔧 Corrigindo senhas...');
    
    // Buscar todos os usuários
    const users = await pool.query('SELECT id, name, email, password_hash FROM users');
    
    for (const user of users.rows) {
      // Se a senha não tem 60 caracteres (não é bcrypt), corrigir
      if (user.password_hash.length !== 60) {
        console.log(`📝 Corrigindo senha do usuário: ${user.name} (${user.email})`);
        
        // Criar hash bcrypt da senha "123456"
        const hashedPassword = await bcrypt.hash('123456', 10);
        
        // Atualizar no banco
        await pool.query(
          'UPDATE users SET password_hash = $1 WHERE id = $2',
          [hashedPassword, user.id]
        );
        
        console.log(`✅ Senha corrigida para: ${user.name}`);
      }
    }
    
    console.log('🎉 Todas as senhas foram corrigidas!');
    
    // Verificar resultado
    const result = await pool.query(`
      SELECT id, name, email, LENGTH(password_hash) as pwd_length 
      FROM users
    `);
    
    console.log('📊 Resultado final:');
    result.rows.forEach(user => {
      console.log(`   ${user.name} (${user.email}): ${user.pwd_length} caracteres`);
    });
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await pool.end();
  }
}

fixPasswords();