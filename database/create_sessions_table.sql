-- CRIAR TABELA DE SESSÕES E CORRIGIR SENHAS

-- 1. Criar tabela user_sessions se não existir
CREATE TABLE IF NOT EXISTS user_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 2. Corrigir a senha do usuário admin com hash bcrypt correto
UPDATE users SET 
    password_hash = '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'
WHERE email = 'admin@solve.com';

-- 3. Verificar resultado
SELECT 
    id, 
    name, 
    email, 
    LENGTH(password_hash) as password_length,
    CASE 
        WHEN LENGTH(password_hash) = 60 THEN '✅ HASH CORRETO'
        ELSE '❌ HASH INCORRETO'
    END as status
FROM users;

-- 4. Verificar se a tabela de sessões foi criada
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'user_sessions'
ORDER BY ordinal_position;