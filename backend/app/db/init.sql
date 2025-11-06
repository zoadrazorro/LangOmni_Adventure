-- Initialize LangOmni Adventure Database
-- This script creates the necessary tables and extensions

-- Enable TimescaleDB extension
CREATE EXTENSION IF NOT EXISTS timescaledb;

-- Enable pg_trgm for full-text search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Players table
CREATE TABLE IF NOT EXISTS players (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    level INTEGER DEFAULT 1,
    experience INTEGER DEFAULT 0,
    hp INTEGER DEFAULT 100,
    max_hp INTEGER DEFAULT 100,
    mana INTEGER DEFAULT 50,
    max_mana INTEGER DEFAULT 50,
    location VARCHAR(255) DEFAULT 'Starting Town',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_online BOOLEAN DEFAULT FALSE
);

-- Player inventory
CREATE TABLE IF NOT EXISTS inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_id UUID REFERENCES players(id) ON DELETE CASCADE,
    item_name VARCHAR(255) NOT NULL,
    item_type VARCHAR(50),
    quantity INTEGER DEFAULT 1,
    metadata JSONB,
    acquired_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- NPCs table
CREATE TABLE IF NOT EXISTS npcs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) UNIQUE NOT NULL,
    npc_type VARCHAR(50),
    location VARCHAR(255),
    personality TEXT,
    backstory TEXT,
    conversation_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB
);

-- NPC memory (for vector DB integration)
CREATE TABLE IF NOT EXISTS npc_memories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    npc_id UUID REFERENCES npcs(id) ON DELETE CASCADE,
    player_id UUID REFERENCES players(id) ON DELETE CASCADE,
    memory_text TEXT NOT NULL,
    memory_type VARCHAR(50),
    vector_id VARCHAR(255),
    importance FLOAT DEFAULT 0.5,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Quests
CREATE TABLE IF NOT EXISTS quests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    quest_type VARCHAR(50),
    requirements JSONB,
    rewards JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Player quests (progress tracking)
CREATE TABLE IF NOT EXISTS player_quests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_id UUID REFERENCES players(id) ON DELETE CASCADE,
    quest_id UUID REFERENCES quests(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'active',
    progress JSONB,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    UNIQUE(player_id, quest_id)
);

-- Locations
CREATE TABLE IF NOT EXISTS locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    location_type VARCHAR(50),
    connected_locations JSONB,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Events log (TimescaleDB hypertable)
CREATE TABLE IF NOT EXISTS events (
    time TIMESTAMPTZ NOT NULL,
    event_type VARCHAR(50),
    player_id UUID,
    npc_id UUID,
    location VARCHAR(255),
    action_type VARCHAR(50),
    action_data JSONB,
    result JSONB
);

-- Convert events to hypertable for time-series data
SELECT create_hypertable('events', 'time', if_not_exists => TRUE);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_players_username ON players(username);
CREATE INDEX IF NOT EXISTS idx_players_location ON players(location);
CREATE INDEX IF NOT EXISTS idx_inventory_player_id ON inventory(player_id);
CREATE INDEX IF NOT EXISTS idx_npcs_location ON npcs(location);
CREATE INDEX IF NOT EXISTS idx_npc_memories_npc_id ON npc_memories(npc_id);
CREATE INDEX IF NOT EXISTS idx_npc_memories_player_id ON npc_memories(player_id);
CREATE INDEX IF NOT EXISTS idx_player_quests_player_id ON player_quests(player_id);
CREATE INDEX IF NOT EXISTS idx_events_player_id ON events(player_id);
CREATE INDEX IF NOT EXISTS idx_events_time ON events(time DESC);

-- Insert some seed data
INSERT INTO locations (name, description, location_type, connected_locations) VALUES
    ('Starting Town', 'A peaceful town where many adventurers begin their journey.', 'town', '["Forest Path", "Mountain Road"]'::jsonb),
    ('Forest Path', 'A winding path through an ancient forest.', 'wilderness', '["Starting Town", "Dark Woods"]'::jsonb),
    ('Mountain Road', 'A steep road leading to the mountains.', 'wilderness', '["Starting Town", "Mountain Peak"]'::jsonb)
ON CONFLICT (name) DO NOTHING;

INSERT INTO npcs (name, npc_type, location, personality, backstory) VALUES
    ('Elder Mystic Zorathian', 'quest_giver', 'Starting Town', 'Wise, mysterious, cryptic', 'An ancient mystic who has seen the rise and fall of kingdoms.'),
    ('Blacksmith Gornak', 'merchant', 'Starting Town', 'Gruff, honest, skilled', 'A master blacksmith known throughout the land for his legendary weapons.'),
    ('Mysterious Merchant', 'rare_trader', 'Wandering', 'Enigmatic, fair, knowledgeable', 'A traveling merchant who appears when least expected.')
ON CONFLICT (name) DO NOTHING;

-- Create admin user (password: admin - should be changed in production)
-- Password hash for 'admin' using bcrypt
INSERT INTO players (username, password_hash, level, max_hp, max_mana) VALUES
    ('admin', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5uWDZy.aQ.9WK', 99, 9999, 9999)
ON CONFLICT (username) DO NOTHING;

COMMIT;
