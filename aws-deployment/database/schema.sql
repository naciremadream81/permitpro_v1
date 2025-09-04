-- PermitPro Database Schema for AWS RDS PostgreSQL

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'User',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Contractors table
CREATE TABLE IF NOT EXISTS contractors (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    license VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255) NOT NULL,
    address TEXT,
    specialties TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Packages table
CREATE TABLE IF NOT EXISTS packages (
    id SERIAL PRIMARY KEY,
    customer_name VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(20),
    customer_email VARCHAR(255),
    customer_address TEXT,
    property_address TEXT NOT NULL,
    property_parcel_id VARCHAR(100),
    property_zoning VARCHAR(100),
    county VARCHAR(100) NOT NULL,
    permit_type VARCHAR(100) NOT NULL,
    status VARCHAR(50) DEFAULT 'Draft',
    primary_contractor_id INTEGER REFERENCES contractors(id),
    user_id INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Package contractors relationship table
CREATE TABLE IF NOT EXISTS package_contractors (
    id SERIAL PRIMARY KEY,
    package_id INTEGER REFERENCES packages(id) ON DELETE CASCADE,
    contractor_id INTEGER REFERENCES contractors(id) ON DELETE CASCADE,
    role VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Checklist items table
CREATE TABLE IF NOT EXISTS checklist_items (
    id SERIAL PRIMARY KEY,
    package_id INTEGER REFERENCES packages(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    required BOOLEAN DEFAULT true,
    completed BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Checklist documents table
CREATE TABLE IF NOT EXISTS checklist_documents (
    id SERIAL PRIMARY KEY,
    checklist_item_id INTEGER REFERENCES checklist_items(id) ON DELETE CASCADE,
    package_id INTEGER REFERENCES packages(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_size INTEGER,
    mime_type VARCHAR(100),
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    uploaded_by INTEGER REFERENCES users(id)
);

-- Documents table (general documents)
CREATE TABLE IF NOT EXISTS documents (
    id SERIAL PRIMARY KEY,
    package_id INTEGER REFERENCES packages(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_size INTEGER,
    mime_type VARCHAR(100),
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    uploaded_by INTEGER REFERENCES users(id)
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_packages_user_id ON packages(user_id);
CREATE INDEX IF NOT EXISTS idx_packages_status ON packages(status);
CREATE INDEX IF NOT EXISTS idx_packages_county ON packages(county);
CREATE INDEX IF NOT EXISTS idx_package_contractors_package_id ON package_contractors(package_id);
CREATE INDEX IF NOT EXISTS idx_package_contractors_contractor_id ON package_contractors(contractor_id);
CREATE INDEX IF NOT EXISTS idx_checklist_items_package_id ON checklist_items(package_id);
CREATE INDEX IF NOT EXISTS idx_checklist_documents_package_id ON checklist_documents(package_id);
CREATE INDEX IF NOT EXISTS idx_documents_package_id ON documents(package_id);

-- Insert demo data
INSERT INTO users (name, email, password, role) VALUES 
('Demo User', 'demo@permitpro.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'User'),
('Admin User', 'admin@permitpro.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Admin')
ON CONFLICT (email) DO NOTHING;

INSERT INTO contractors (name, license, phone, email, address, specialties) VALUES 
('ABC Construction LLC', 'CBC123456', '(305) 555-0101', 'info@abcconstruction.com', '123 Main St, Miami, FL 33101', 'General Construction, Renovations'),
('Miami Electric Co', 'EC123456', '(305) 555-0102', 'contact@miamielectric.com', '456 Electric Ave, Miami, FL 33102', 'Electrical, Lighting, Panel Upgrades'),
('South Florida Plumbing', 'PC123456', '(305) 555-0103', 'service@southfloridaplumbing.com', '789 Water St, Miami, FL 33103', 'Plumbing, Water Heater, Drain Cleaning'),
('Cool Air HVAC', 'HVAC123456', '(305) 555-0104', 'info@coolairhvac.com', '321 Air Way, Miami, FL 33104', 'HVAC, Air Conditioning, Ductwork'),
('Broward Builders Inc', 'CBC789012', '(954) 555-0105', 'info@browardbuilders.com', '654 Builder Blvd, Fort Lauderdale, FL 33301', 'General Construction, Commercial')
ON CONFLICT DO NOTHING;

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_contractors_updated_at BEFORE UPDATE ON contractors FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_packages_updated_at BEFORE UPDATE ON packages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_checklist_items_updated_at BEFORE UPDATE ON checklist_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
