// MongoDB initialization script for production
// This script sets up the database with proper indexes and initial data

// Switch to the application database
db = db.getSiblingDB('bizabode_crm');

// Create collections with proper indexes
print('Creating collections and indexes...');

// Items collection
db.createCollection('items');
db.items.createIndex({ sku: 1, companyId: 1 }, { unique: true });
db.items.createIndex({ companyId: 1, category: 1 });
db.items.createIndex({ companyId: 1, quantity: 1, reorderLevel: 1 });
db.items.createIndex({ companyId: 1, critical: 1 });

// Leads collection
db.createCollection('leads');
db.leads.createIndex({ companyId: 1, status: 1 });
db.leads.createIndex({ companyId: 1, source: 1 });
db.leads.createIndex({ companyId: 1, createdAt: -1 });

// Opportunities collection
db.createCollection('opportunities');
db.opportunities.createIndex({ companyId: 1, stage: 1 });
db.opportunities.createIndex({ companyId: 1, value: -1 });
db.opportunities.createIndex({ companyId: 1, createdAt: -1 });

// Quotes collection
db.createCollection('quotes');
db.quotes.createIndex({ companyId: 1, status: 1 });
db.quotes.createIndex({ companyId: 1, number: 1 }, { unique: true });
db.quotes.createIndex({ companyId: 1, createdAt: -1 });

// Invoices collection
db.createCollection('invoices');
db.invoices.createIndex({ companyId: 1, status: 1 });
db.invoices.createIndex({ companyId: 1, number: 1 }, { unique: true });
db.invoices.createIndex({ companyId: 1, dueDate: 1 });
db.invoices.createIndex({ companyId: 1, createdAt: -1 });

// Payments collection
db.createCollection('payments');
db.payments.createIndex({ companyId: 1, invoiceId: 1 });
db.payments.createIndex({ companyId: 1, createdAt: -1 });

// Deliveries collection
db.createCollection('deliveries');
db.deliveries.createIndex({ companyId: 1, status: 1 });
db.deliveries.createIndex({ companyId: 1, createdAt: -1 });

// Companies collection
db.createCollection('companies');
db.companies.createIndex({ name: 1 }, { unique: true });
db.companies.createIndex({ licenseKey: 1 }, { unique: true });

// Users collection
db.createCollection('users');
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ companyId: 1, role: 1 });
db.users.createIndex({ companyId: 1, active: 1 });

// Employees collection
db.createCollection('employees');
db.employees.createIndex({ companyId: 1, employeeId: 1 }, { unique: true });
db.employees.createIndex({ companyId: 1, department: 1 });
db.employees.createIndex({ companyId: 1, status: 1 });

// Attendance collection
db.createCollection('attendance');
db.attendance.createIndex({ companyId: 1, employeeId: 1, date: 1 });
db.attendance.createIndex({ companyId: 1, date: -1 });

// Purchase Orders collection
db.createCollection('purchaseorders');
db.purchaseorders.createIndex({ companyId: 1, status: 1 });
db.purchaseorders.createIndex({ companyId: 1, number: 1 }, { unique: true });
db.purchaseorders.createIndex({ companyId: 1, createdAt: -1 });

// After Sales collection
db.createCollection('aftersales');
db.aftersales.createIndex({ companyId: 1, status: 1 });
db.aftersales.createIndex({ companyId: 1, createdAt: -1 });

print('Collections and indexes created successfully!');

// Create initial admin user if not exists
const adminUser = db.users.findOne({ email: 'admin@bizabodedigital.com' });
if (!adminUser) {
  print('Creating initial admin user...');
  db.users.insertOne({
    email: 'admin@bizabodedigital.com',
    password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8KzKz2K', // demo123
    role: 'admin',
    firstName: 'Admin',
    lastName: 'User',
    companyId: null,
    active: true,
    createdAt: new Date(),
    updatedAt: new Date()
  });
  print('Admin user created successfully!');
}

// Create default company if not exists
const defaultCompany = db.companies.findOne({ name: 'Bizabode Digital' });
if (!defaultCompany) {
  print('Creating default company...');
  db.companies.insertOne({
    name: 'Bizabode Digital',
    email: 'admin@bizabodedigital.com',
    phone: '+1-555-0123',
    address: {
      street: '123 Business St',
      city: 'Business City',
      state: 'BC',
      zipCode: '12345',
      country: 'USA'
    },
    licenseKey: 'BIZA-2024-001',
    licensePlan: 'Enterprise',
    licenseExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
    active: true,
    createdAt: new Date(),
    updatedAt: new Date()
  });
  print('Default company created successfully!');
}

print('Database initialization completed successfully!');
