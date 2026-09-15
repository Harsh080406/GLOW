-- Seed data for GLOW Transit System

INSERT INTO users (id, name, email, role, department, phone) VALUES
('u-001', 'Dr. Arvind Patel', 'admin@glowbus.edu', 'super_admin', 'Administration', '+91 98765 43210'),
('u-002', 'CMA Rajesh Dave', 'finance@glowbus.edu', 'finance_admin', 'Finance & Billing', '+91 98765 43211'),
('u-003', 'Mahesh Patel', 'driver@glowbus.edu', 'driver', 'Fleet Operations', '+91 98765 43212'),
('u-004', 'Rahul Sharma', 'student@glowbus.edu', 'student', 'Computer Science (B.Tech)', '+91 98765 43213')
ON CONFLICT (id) DO NOTHING;

INSERT INTO buses (id, registration_no, model, capacity, status, fuel_level) VALUES
('BUS-101', 'GJ-01-AB-1234', 'Volvo B11R AC Superliner', 52, 'On Route', 88),
('BUS-102', 'GJ-01-AB-5678', 'Tata Starbus EV Metro', 45, 'On Route', 94),
('BUS-103', 'GJ-01-AB-9012', 'Ashok Leyland Oyster', 40, 'Maintenance', 25)
ON CONFLICT (id) DO NOTHING;
