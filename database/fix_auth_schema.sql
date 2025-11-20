-- CORREÇÃO DO SISTEMA DE AUTENTICAÇÃO

-- 1. Adicionar colunas de autenticação na tabela users se não existirem
DO $$ 
BEGIN
    -- Coluna password_hash
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'password_hash') THEN
        ALTER TABLE users ADD COLUMN password_hash VARCHAR(255);
    END IF;

    -- Coluna is_active
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'is_active') THEN
        ALTER TABLE users ADD COLUMN is_active BOOLEAN DEFAULT true;
    END IF;

    -- Coluna last_login
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'last_login') THEN
        ALTER TABLE users ADD COLUMN last_login TIMESTAMP;
    END IF;

    -- Coluna created_at (se não existir)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'created_at') THEN
        ALTER TABLE users ADD COLUMN created_at TIMESTAMP DEFAULT NOW();
    END IF;
END $$;

-- 2. Criar tabela de sessões se não existir
CREATE TABLE IF NOT EXISTS user_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    session_token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 3. Criar tabela de reset de senha se não existir
CREATE TABLE IF NOT EXISTS password_resets (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    reset_token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 4. Atualizar usuários existentes com senha padrão (senha: 123456)
-- Hash para "123456"
UPDATE users SET 
    password_hash = '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    is_active = true
WHERE password_hash IS NULL OR password_hash = '';

-- 5. Garantir que todos os usuários tenham is_active = true
UPDATE users SET is_active = true WHERE is_active IS NULL;

-- 6. Inserir usuário admin padrão se não existir
INSERT INTO users (name, email, role, group_id, password_hash, is_active) 
SELECT 'Administrador', 'admin@solve.com', 'admin', 1, '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', true
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin@solve.com');

-- 7. Verificar estrutura da tabela users
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;