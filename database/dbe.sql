-- ========================================================
-- SCHEMA DE BANCO DE DADOS - SOLVE CHAMADOS (VERSÃO FINAL)
-- ========================================================

-- 1. LIMPEZA (Ordem importa para não dar erro de chave estrangeira)
DROP TABLE IF EXISTS asset_history;
DROP TABLE IF EXISTS user_sessions;
DROP TABLE IF EXISTS tickets;
DROP TABLE IF EXISTS assets;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS roles;
DROP TABLE IF EXISTS groups;

-- 2. TABELA DE GRUPOS
CREATE TABLE groups (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT
);

-- 3. TABELA DE ROLES (CARGOS E PERMISSÕES)
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE, -- ex: 'admin', 'tecnico'
    label VARCHAR(100) NOT NULL,      -- ex: 'Administrador'
    description TEXT,
    permissions JSONB DEFAULT '[]'    -- Lista de permissões em JSON
);

-- 4. TABELA DE USUÁRIOS (Com campos de segurança e bloqueio)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255),       
    role VARCHAR(50) NOT NULL,        
    group_id INTEGER REFERENCES groups(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Segurança: Bloqueio de conta por tentativas falhas
    failed_login_attempts INTEGER DEFAULT 0,
    lockout_until TIMESTAMP DEFAULT NULL,

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP,
    last_login TIMESTAMP
);

-- 5. TABELA DE SESSÕES
CREATE TABLE user_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 6. TABELA DE EQUIPAMENTOS (ASSETS) (Com campos Financeiros e Garantia)
CREATE TABLE assets (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(100),
    description TEXT,
    status VARCHAR(50) DEFAULT 'ativo',
    
    -- Campos Novos: Financeiro e Garantia
    acquisition_date DATE,
    warranty_end DATE,
    cost NUMERIC(10, 2),
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP
);

-- 7. TABELA DE HISTÓRICO DE EQUIPAMENTOS (AUDIT TRAIL)
CREATE TABLE asset_history (
    id SERIAL PRIMARY KEY,
    asset_id INTEGER REFERENCES assets(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    action_type VARCHAR(50) NOT NULL, -- 'CRIACAO', 'ATUALIZACAO', 'EXCLUSAO'
    description TEXT,
    old_status VARCHAR(50),
    new_status VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW()
);

-- 8. TABELA DE CHAMADOS (TICKETS) (Com Anexos e SLA)
CREATE TABLE tickets (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    priority VARCHAR(50) NOT NULL,     
    status VARCHAR(50) DEFAULT 'aberto', 
    requester VARCHAR(255) NOT NULL,   
    assignee VARCHAR(255),             
    location VARCHAR(255),
    asset_id INTEGER REFERENCES assets(id) ON DELETE SET NULL,
    updates JSONB DEFAULT '[]',
    
    -- Campos Novos
    sla_deadline TIMESTAMP,
    category VARCHAR(100),
    attachment TEXT, -- Tipo TEXT para suportar Base64 ou caminhos longos
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP
);

-- ========================================================
-- DADOS INICIAIS (SEED)
-- ========================================================

-- Grupos
INSERT INTO groups (name, description) VALUES 
('Geral', 'Grupo padrão para usuários gerais'),
('TI - Suporte', 'Equipe de suporte técnico'),
('TI - Infra', 'Equipe de infraestrutura');

-- Roles
INSERT INTO roles (name, label, description, permissions) VALUES 
('admin', 'Administrador', 'Acesso total ao sistema', '["view_dashboard", "manage_tickets", "create_ticket", "assign_tickets", "delete_tickets", "manage_assets", "manage_users", "manage_groups", "manage_roles"]'),
('tecnico', 'Técnico N1', 'Atendimento de chamados', '["view_dashboard", "manage_tickets", "create_ticket", "assign_tickets", "manage_assets"]'),
('tecnico_n3', 'Técnico N3', 'Suporte avançado', '["view_dashboard", "manage_tickets", "create_ticket", "assign_tickets", "delete_tickets", "manage_assets"]'),
('usuario', 'Usuário Comum', 'Abertura de chamados', '["create_ticket", "view_dashboard"]');

-- Usuário Admin (Senha: "Admin")
INSERT INTO users (name, email, password_hash, role, group_id, is_active) VALUES 
('Admin', 'admin@solve.com', '$2b$10$R9h/cIPz0gi.URNNX3kh2OPST9/PgBkqquii.V37YoJXl8j9i/Wvm', 'admin', 2, true);

-- Equipamentos de teste
INSERT INTO assets (name, code, description, status, cost, acquisition_date) VALUES 
('Notebook Dell Latitude', 'DELL-001', 'Core i5, 16GB RAM', 'ativo', 3500.00, '2023-01-15'),
('Impressora HP LaserJet', 'PRT-002', 'Setor Financeiro', 'ativo', 1200.50, '2022-06-10');

-- Gerar histórico inicial para os itens de teste (Opcional, mas recomendado)
INSERT INTO asset_history (asset_id, user_id, action_type, description, new_status, created_at)
SELECT id, NULL, 'CRIACAO', 'Carga inicial do sistema', status, created_at 
FROM assets;