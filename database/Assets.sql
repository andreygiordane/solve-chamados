CREATE TABLE asset_history (
    id SERIAL PRIMARY KEY,
    asset_id INTEGER REFERENCES assets(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL, -- Quem fez a ação
    action_type VARCHAR(50) NOT NULL, -- 'CRIACAO', 'ATUALIZACAO', 'EXCLUSAO'
    description TEXT, -- Detalhes (ex: "Mudou RAM de 8GB para 16GB")
    old_status VARCHAR(50),
    new_status VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW()
);