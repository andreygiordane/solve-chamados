-- CORRIGIR SENHAS COM HASH BCRYPT

-- 1. Ver senhas atuais
SELECT id, name, email, password_hash, LENGTH(password_hash) as length 
FROM users;

-- 2. Atualizar para hash bcrypt correto da senha "123456"
UPDATE users SET 
    password_hash = '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'
WHERE LENGTH(password_hash) < 50;

-- 3. Verificar resultado
SELECT 
    id, 
    name, 
    email, 
    LENGTH(password_hash) as pwd_length,
    password_hash
FROM users;