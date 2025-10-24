const axios = require('axios');

const API_BASE = 'http://localhost:3000/api';

// First, register a user and get auth token
async function registerAndLogin() {
  try {
    console.log('🔐 Registering admin user...');
    
    // Register
    const registerResponse = await axios.post(`${API_BASE}/auth/register`, {
      name: 'Rojay Henry',
      email: 'rojay@bizabode.com',
      password: 'password123',
      companyName: 'Bizabode Demo Company',
      licenseKey: 'DEMO-LICENSE-KEY'
    });
    
    console.log('✅ Registration successful');
    
    // Login to get token
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: 'rojay@bizabode.com',
      password: 'password123'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login successful, token obtained');
    
    return token;
  } catch (error) {
    if (error.response?.status === 400 && error.response?.data?.error?.includes('already exists')) {
      console.log('👤 User already exists, logging in...');
      
      // Try to login
      const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
        email: 'rojay@bizabode.com',
        password: 'password123'
      });
      
      return loginResponse.data.token;
    }
    
    console.error('❌ Registration/Login failed:', error.response?.data || error.message);
    throw error;
  }
}

// Seed inventory items
async function seedInventory(token) {
  console.log('📦 Creating inventory items...');
  
  const items = [
    {
      sku: 'TECH-001',
      name: 'Wireless Bluetooth Mouse',
      description: 'Ergonomic wireless mouse with 2.4GHz connectivity',
      category: 'Electronics',
      quantity: 150,
      reorderLevel: 50,
      unitPrice: 29.99,
      costPrice: 18.50,
      supplier: 'TechSupply Co',
      location: 'Warehouse A, Shelf 1'
    },
    {
      sku: 'TECH-002',
      name: 'Mechanical Gaming Keyboard',
      description: 'RGB mechanical keyboard with blue switches',
      category: 'Electronics',
      quantity: 75,
      reorderLevel: 25,
      unitPrice: 89.99,
      costPrice: 55.00,
      supplier: 'TechSupply Co',
      location: 'Warehouse A, Shelf 2'
    },
    {
      sku: 'TECH-003',
      name: 'USB-C Hub 7-in-1',
      description: '7-in-1 USB-C hub with HDMI, ethernet, and USB ports',
      category: 'Accessories',
      quantity: 200,
      reorderLevel: 75,
      unitPrice: 49.99,
      costPrice: 28.00,
      supplier: 'AccessoryWorld',
      location: 'Warehouse B, Shelf 1'
    },
    {
      sku: 'TECH-004',
      name: 'Webcam HD 1080p',
      description: 'High definition webcam with auto-focus',
      category: 'Electronics',
      quantity: 12, // Low stock
      reorderLevel: 30,
      unitPrice: 79.99,
      costPrice: 45.00,
      supplier: 'TechSupply Co',
      location: 'Warehouse A, Shelf 3',
      critical: true
    },
    {
      sku: 'TECH-005',
      name: 'Desk Lamp LED',
      description: 'Adjustable LED desk lamp with touch controls',
      category: 'Office Furniture',
      quantity: 0, // Out of stock
      reorderLevel: 15,
      unitPrice: 59.99,
      costPrice: 32.00,
      supplier: 'OfficeSupply Inc',
      location: 'Warehouse C, Shelf 1',
      critical: true
    }
  ];
  
  for (const item of items) {
    try {
      await axios.post(`${API_BASE}/inventory/items`, item, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log(`✅ Created item: ${item.name}`);
    } catch (error) {
      console.error(`❌ Failed to create item ${item.name}:`, error.response?.data || error.message);
    }
  }
}

// Seed leads
async function seedLeads(token) {
  console.log('🎯 Creating leads...');
  
  const leads = [
    {
      name: 'Amanda Foster',
      email: 'amanda@creativestudio.com',
      phone: '+1-555-0500',
      company: 'Creative Studio LLC',
      source: 'Website',
      status: 'new',
      category: 'Other',
      productInterest: ['Electronics', 'Accessories'],
      monthlyVolume: 5000,
      territory: 'Northeast',
      leadScore: 75,
      customerType: 'Commercial',
      notes: 'Interested in office equipment for new creative studio'
    },
    {
      name: 'Carlos Mendoza',
      email: 'carlos@retailplus.com',
      phone: '+1-555-0501',
      company: 'RetailPlus Chain',
      source: 'Referral',
      status: 'qualified',
      category: 'Restaurant',
      productInterest: ['Electronics'],
      monthlyVolume: 15000,
      territory: 'Southwest',
      leadScore: 85,
      customerType: 'Retail',
      notes: 'Retail chain looking for bulk electronics purchase'
    },
    {
      name: 'Lisa Wang',
      email: 'lisa@techstartup.io',
      phone: '+1-555-0502',
      company: 'TechStartup.io',
      source: 'Cold Call',
      status: 'contacted',
      category: 'Other',
      productInterest: ['Electronics', 'Office Furniture'],
      monthlyVolume: 8000,
      territory: 'West Coast',
      leadScore: 60,
      customerType: 'Commercial',
      notes: 'Growing tech startup, budget conscious'
    }
  ];
  
  for (const lead of leads) {
    try {
      await axios.post(`${API_BASE}/leads`, lead, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log(`✅ Created lead: ${lead.name}`);
    } catch (error) {
      console.error(`❌ Failed to create lead ${lead.name}:`, error.response?.data || error.message);
    }
  }
}

// Seed customers
async function seedCustomers(token) {
  console.log('🏢 Creating customers...');
  
  const customers = [
    {
      companyName: 'TechCorp Solutions',
      contactPerson: 'Jennifer Wilson',
      email: 'jennifer@techcorp.com',
      phone: '+1-555-0400',
      address: '100 Corporate Plaza',
      city: 'Boston',
      state: 'MA',
      postalCode: '02101',
      country: 'USA',
      category: 'Other',
      customerType: 'Commercial',
      paymentTerms: 'Net 30',
      creditLimit: 50000,
      status: 'Active',
      rating: 5,
      tags: ['high-value', 'technology'],
      notes: 'Large technology company, prefers bulk orders'
    },
    {
      companyName: 'StartupHub Inc',
      contactPerson: 'Alex Rodriguez',
      email: 'alex@startuphub.com',
      phone: '+1-555-0401',
      address: '250 Innovation Dr',
      city: 'San Francisco',
      state: 'CA',
      postalCode: '94102',
      country: 'USA',
      category: 'Other',
      customerType: 'Commercial',
      paymentTerms: 'Net 15',
      creditLimit: 25000,
      status: 'Active',
      rating: 4,
      tags: ['startup', 'growing'],
      notes: 'Fast-growing startup, frequent small orders'
    }
  ];
  
  for (const customer of customers) {
    try {
      await axios.post(`${API_BASE}/crm/customers`, customer, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log(`✅ Created customer: ${customer.companyName}`);
    } catch (error) {
      console.error(`❌ Failed to create customer ${customer.companyName}:`, error.response?.data || error.message);
    }
  }
}

// Main seeding function
async function seedDatabase() {
  try {
    console.log('🌱 Starting API-based database seeding...');
    
    // Get authentication token
    const token = await registerAndLogin();
    
    // Seed different modules
    await seedInventory(token);
    await seedLeads(token);
    await seedCustomers(token);
    
    console.log('✅ Database seeding completed successfully!');
    console.log('\n🔐 Login Credentials:');
    console.log('Email: rojay@bizabode.com');
    console.log('Password: password123');
    console.log('\n🌐 Access: http://localhost:3000');
    
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    process.exit(1);
  }
}

// Run the seeding
seedDatabase();
