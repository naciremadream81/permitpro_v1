#!/usr/bin/env node

/**
 * Simple database setup script for PermitPro
 * This creates the SQLite database and initial tables without Prisma
 */

const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');

const DB_PATH = path.join(__dirname, 'prisma', 'dev.db');

console.log('🗄️ Setting up PermitPro database...');

// Remove existing database if it exists
if (fs.existsSync(DB_PATH)) {
  console.log('📁 Removing existing database...');
  fs.unlinkSync(DB_PATH);
}

// Create database
const db = new sqlite3.Database(DB_PATH);

// Create tables
const createTables = () => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Users table
      db.run(`
        CREATE TABLE User (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          email TEXT UNIQUE NOT NULL,
          name TEXT NOT NULL,
          password TEXT NOT NULL,
          role TEXT DEFAULT 'User',
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Packages table
      db.run(`
        CREATE TABLE Package (
          id TEXT PRIMARY KEY,
          customerName TEXT NOT NULL,
          propertyAddress TEXT NOT NULL,
          county TEXT NOT NULL,
          status TEXT DEFAULT 'Draft',
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          userId INTEGER,
          FOREIGN KEY (userId) REFERENCES User (id)
        )
      `);

      // Documents table
      db.run(`
        CREATE TABLE Document (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          url TEXT NOT NULL,
          version INTEGER DEFAULT 1,
          uploadedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          packageId TEXT,
          uploaderId INTEGER,
          FOREIGN KEY (packageId) REFERENCES Package (id),
          FOREIGN KEY (uploaderId) REFERENCES User (id)
        )
      `);

      // Checklist items table
      db.run(`
        CREATE TABLE ChecklistItem (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          item TEXT NOT NULL,
          completed BOOLEAN DEFAULT 0,
          packageId TEXT,
          FOREIGN KEY (packageId) REFERENCES Package (id)
        )
      `);

      // Contractors table
      db.run(`
        CREATE TABLE Contractor (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          license TEXT NOT NULL,
          phone TEXT NOT NULL,
          email TEXT NOT NULL,
          address TEXT,
          specialties TEXT,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Package contractors relationship table
      db.run(`
        CREATE TABLE PackageContractor (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          packageId TEXT NOT NULL,
          contractorId INTEGER NOT NULL,
          role TEXT NOT NULL,
          FOREIGN KEY (packageId) REFERENCES Package (id),
          FOREIGN KEY (contractorId) REFERENCES Contractor (id)
        )
      `);

      // Checklist item documents table
      db.run(`
        CREATE TABLE ChecklistDocument (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          checklistItemId INTEGER NOT NULL,
          packageId TEXT NOT NULL,
          fileName TEXT NOT NULL,
          filePath TEXT NOT NULL,
          uploadedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          uploadedBy INTEGER,
          FOREIGN KEY (checklistItemId) REFERENCES ChecklistItem (id),
          FOREIGN KEY (packageId) REFERENCES Package (id),
          FOREIGN KEY (uploadedBy) REFERENCES User (id)
        )
      `, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  });
};

// Insert demo data
const insertDemoData = () => {
  return new Promise((resolve, reject) => {
    db.serialize(async () => {
      // Hash passwords
      const demoPassword = await bcrypt.hash('demo123', 10);
      const adminPassword = await bcrypt.hash('admin123', 10);

      // Insert demo users
      const stmt1 = db.prepare(`
        INSERT INTO User (id, email, name, password, role) 
        VALUES (?, ?, ?, ?, ?)
      `);
      
      stmt1.run(1, 'demo@permitpro.com', 'Demo User', demoPassword, 'User');
      stmt1.run(2, 'admin@permitpro.com', 'Admin User', adminPassword, 'Admin');
      stmt1.finalize();

      // Insert demo packages
      const stmt2 = db.prepare(`
        INSERT INTO Package (id, customerName, propertyAddress, county, status, userId) 
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      
      stmt2.run('pkg_1', 'John Smith', '123 Main St, Anytown, ST 12345', 'Example County', 'Draft', 1);
      stmt2.run('pkg_2', 'Jane Doe', '456 Oak Ave, Another City, ST 67890', 'Sample County', 'Submitted', 1);
      stmt2.finalize();

      // Insert demo documents
      const stmt3 = db.prepare(`
        INSERT INTO Document (name, url, packageId, uploaderId) 
        VALUES (?, ?, ?, ?)
      `);
      
      stmt3.run('Site Plan.pdf', '/documents/1/site-plan.pdf', 'pkg_1', 1);
      stmt3.run('Building Plans.pdf', '/documents/2/building-plans.pdf', 'pkg_1', 1);
      stmt3.finalize();

      // Insert demo checklist items
      const stmt4 = db.prepare(`
        INSERT INTO ChecklistItem (item, packageId) 
        VALUES (?, ?)
      `);
      
      stmt4.run('Submit application form', 'pkg_1');
      stmt4.run('Provide site plans', 'pkg_1');
      stmt4.run('Submit building plans', 'pkg_1');
      stmt4.run('Pay application fee', 'pkg_1');
      stmt4.finalize();

      // Insert demo contractors
      const stmt5 = db.prepare(`
        INSERT INTO Contractor (id, name, license, phone, email, address, specialties) 
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      
      stmt5.run(1, 'ABC Construction LLC', 'CBC123456', '(305) 555-0101', 'info@abcconstruction.com', '123 Main St, Miami, FL 33101', 'General Construction, Renovations');
      stmt5.run(2, 'Miami Electric Co', 'EC123456', '(305) 555-0102', 'contact@miamielectric.com', '456 Electric Ave, Miami, FL 33102', 'Electrical, Lighting, Panel Upgrades');
      stmt5.run(3, 'South Florida Plumbing', 'PC123456', '(305) 555-0103', 'service@southfloridaplumbing.com', '789 Water St, Miami, FL 33103', 'Plumbing, Water Heater, Drain Cleaning');
      stmt5.run(4, 'Cool Air HVAC', 'HVAC123456', '(305) 555-0104', 'info@coolairhvac.com', '321 Air Way, Miami, FL 33104', 'HVAC, Air Conditioning, Ductwork');
      stmt5.run(5, 'Broward Builders Inc', 'CBC789012', '(954) 555-0105', 'info@browardbuilders.com', '654 Builder Blvd, Fort Lauderdale, FL 33301', 'General Construction, Commercial');
      stmt5.finalize();

      // Insert demo package contractors
      const stmt6 = db.prepare(`
        INSERT INTO PackageContractor (packageId, contractorId, role) 
        VALUES (?, ?, ?)
      `);
      
      stmt6.run('pkg_1', 1, 'Primary Contractor');
      stmt6.run('pkg_1', 2, 'Electrical Subcontractor');
      stmt6.run('pkg_1', 3, 'Plumbing Subcontractor');
      stmt6.run('pkg_2', 5, 'Primary Contractor');
      stmt6.run('pkg_2', 4, 'HVAC Subcontractor');
      stmt6.finalize();

      resolve();
    });
  });
};

// Run setup
const setup = async () => {
  try {
    await createTables();
    console.log('✅ Database tables created successfully');
    
    await insertDemoData();
    console.log('✅ Demo data inserted successfully');
    
    db.close((err) => {
      if (err) {
        console.error('❌ Error closing database:', err);
        process.exit(1);
      } else {
        console.log('🎉 Database setup completed successfully!');
        console.log('📊 Database location:', DB_PATH);
        console.log('👤 Demo users:');
        console.log('   - demo@permitpro.com / demo123');
        console.log('   - admin@permitpro.com / admin123');
        process.exit(0);
      }
    });
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    process.exit(1);
  }
};

setup();
