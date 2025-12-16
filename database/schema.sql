-- ============================================
-- CHECKLISIN YUK! DATABASE SCHEMA
-- Run this after creating database: CREATE DATABASE checklisin_db;
-- ============================================

-- Drop existing tables if needed (careful in production!)
DROP TABLE IF EXISTS members CASCADE;
DROP TABLE IF EXISTS defects CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ============================================
-- USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'Staff',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- DEFECTS TABLE (pekerjaan defect)
-- ============================================
CREATE TABLE IF NOT EXISTS defects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    defect_type VARCHAR(50) NOT NULL,
    lantai VARCHAR(20) NOT NULL,
    as_location VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'On Progress',
    before_photo TEXT,
    after_photo TEXT,
    notification_time INTEGER DEFAULT NULL,
    notification_at TIMESTAMP DEFAULT NULL,
    is_notified BOOLEAN DEFAULT FALSE,
    created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- MEMBERS TABLE (team members)
-- ============================================
CREATE TABLE IF NOT EXISTS members (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    invited_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id)
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_defects_status ON defects(status);
CREATE INDEX IF NOT EXISTS idx_defects_created_by ON defects(created_by);
CREATE INDEX IF NOT EXISTS idx_members_user_id ON members(user_id);
