-- ============================================================
-- GLOW Campus Transit & Fleet Management System
-- Database DDL Schema (PostgreSQL / MySQL Compatible)
-- ============================================================

CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('super_admin', 'finance_admin', 'driver', 'transport_manager', 'student')),
    department VARCHAR(100),
    phone VARCHAR(20),
    avatar_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS buses (
    id VARCHAR(20) PRIMARY KEY,
    registration_no VARCHAR(50) UNIQUE NOT NULL,
    model VARCHAR(100),
    capacity INT NOT NULL DEFAULT 40,
    status VARCHAR(50) NOT NULL DEFAULT 'Active',
    fuel_level INT DEFAULT 100,
    driver_id VARCHAR(36) REFERENCES users(id),
    current_route_id VARCHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS routes (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    origin VARCHAR(255) NOT NULL,
    destination VARCHAR(255) NOT NULL,
    distance_km DECIMAL(5,2),
    estimated_duration_min INT,
    status VARCHAR(50) DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS student_passes (
    id VARCHAR(36) PRIMARY KEY,
    student_id VARCHAR(36) REFERENCES users(id),
    route_id VARCHAR(36) REFERENCES routes(id),
    qr_code_hash TEXT NOT NULL,
    valid_until DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'ACTIVE',
    issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS fee_transactions (
    id VARCHAR(36) PRIMARY KEY,
    student_id VARCHAR(36) REFERENCES users(id),
    amount DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(50) CHECK (payment_method IN ('UPI', 'CARD', 'NET_BANKING', 'OFFLINE_CHALLAN')),
    status VARCHAR(50) NOT NULL DEFAULT 'SUCCESS',
    reference_no VARCHAR(100) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS emergency_events (
    id VARCHAR(36) PRIMARY KEY,
    reported_by VARCHAR(36) REFERENCES users(id),
    bus_id VARCHAR(20) REFERENCES buses(id),
    event_type VARCHAR(100) NOT NULL,
    location VARCHAR(255) NOT NULL,
    lat DECIMAL(10,6),
    lng DECIMAL(10,6),
    status VARCHAR(50) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'DISPATCHED', 'RESOLVED')),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
