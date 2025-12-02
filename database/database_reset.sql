-- 1. DESATIVAR RESTRIÇÕES (Para evitar erros ao apagar)
DROP TABLE IF EXISTS tickets CASCADE;
DROP TABLE IF EXISTS assets CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS roles CASCADE;
DROP TABLE IF EXISTS groups CASCADE;

-- 2. CRIAR TABELAS

-- Tabela de Grupos (Setores)
CREATE TABLE groups (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de Cargos (Roles)
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL, -- ex: 'admin', 'tecnico'
    label VARCHAR(100) NOT NULL,      -- ex: 'Administrador'
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de Usuários
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL, -- Vincula com roles.name
    group_id INTEGER REFERENCES groups(id),
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de Equipamentos (Assets)
CREATE TABLE assets (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(50) UNIQUE, -- Patrimônio/Tag
    description TEXT,
    status VARCHAR(50) DEFAULT 'ativo',
    created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de Chamados (Tickets)
CREATE TABLE tickets (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'aberto', -- aberto, pendente, em_andamento, concluido, cancelado
    priority VARCHAR(20) DEFAULT 'media', -- baixa, media, alta, critica
    requester VARCHAR(100) NOT NULL,
    assignee VARCHAR(100), -- Nome do técnico
    asset_id INTEGER REFERENCES assets(id),
    location VARCHAR(100),
    group_id INTEGER REFERENCES groups(id), -- Setor responsável
    image_path TEXT,
    updates JSONB DEFAULT '[]', -- Histórico de mensagens
    sla_deadline TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 3. INSERIR DADOS PADRÃO (Obrigatório para o sistema funcionar)

-- Inserir Cargos Padrão
INSERT INTO roles (name, label, description) VALUES 
('admin', 'Administrador', 'Acesso total ao sistema'),
('tecnico', 'Técnico', 'Atendimento de chamados'),
('usuario', 'Usuário', 'Abertura de chamados');

-- Inserir um Grupo Padrão
INSERT INTO groups (name) VALUES ('Geral'), ('TI'), ('Financeiro');

-- Inserir Usuário Admin Padrão
-- Senha: 'admin' (hash bcrypt gerado para exemplo, pode variar dependendo da sua implementação de hash)
-- Se você usar bcrypt no node, crie o usuário via API na primeira vez ou use um hash conhecido.
-- Abaixo insiro um usuário placeholder. O ideal é você criar o primeiro usuário via tela de Login/Registro se tiver, ou usar a rota de criar usuário.
INSERT INTO users (name, email, password_hash, role, group_id) VALUES 
('Admin', 'admin@solve.com', '$2b$10$X/kX9q.u.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1', 'admin', 2); 
-- NOTA: A senha acima é um hash inválido de exemplo. 
-- RECOMENDAÇÃO: Após rodar esse script, delete este usuário e crie um novo via API ou use sua rota de cadastro.