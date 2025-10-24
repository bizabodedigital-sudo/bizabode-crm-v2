import mongoose from 'mongoose'
import Company from '../lib/models/Company'
import User from '../lib/models/User'
import Item from '../lib/models/Item'
import Lead from '../lib/models/Lead'
import Opportunity from '../lib/models/Opportunity'
import Customer from '../lib/models/Customer'
import bcrypt from 'bcryptjs'

// Connect to production MongoDB with authentication
async function connectDB() {
  try {
    const mongoUri = 'mongodb://admin:password123@localhost:27017/bizabode_crm?authSource=admin'
    await mongoose.connect(mongoUri)
    console.log('✅ MongoDB connected successfully')
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error)
    throw error
  }
}

async function seedProductionData() {
  try {
    console.log('🌱 Starting production database seeding...')
    await connectDB()

    // Check if data already exists
    const existingCompany = await Company.findOne({})
    if (existingCompany) {
      console.log('📊 Data already exists, skipping seed')
      console.log(`Company: ${existingCompany.name}`)
      
      const userCount = await User.countDocuments({ companyId: existingCompany._id })
      const itemCount = await Item.countDocuments({ companyId: existingCompany._id })
      const leadCount = await Lead.countDocuments({ companyId: existingCompany._id })
      const customerCount = await Customer.countDocuments({ companyId: existingCompany._id })
      
      console.log(`Users: ${userCount}`)
      console.log(`Items: ${itemCount}`)
      console.log(`Leads: ${leadCount}`)
      console.log(`Customers: ${customerCount}`)
      
      await mongoose.disconnect()
      return
    }

    // 1. Create Company
    console.log('🏢 Creating company...')
    const company = await Company.create({
      name: 'Bizabode Demo Company',
      email: 'admin@bizabode.com',
      phone: '+1-555-0100',
      address: '123 Business Ave, Suite 100',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'USA',
      licenseKey: 'DEMO-LICENSE-2024-BIZABODE',
      licensePlan: 'trial',
      licenseExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      settings: {
        currency: 'USD',
        timezone: 'America/New_York',
        dateFormat: 'MM/dd/yyyy',
        businessHours: {
          start: '09:00',
          end: '17:00'
        }
      }
    })

    // 2. Create Users
    console.log('👥 Creating users...')
    const hashedPassword = await bcrypt.hash('password123', 12)
    
    const users = await User.create([
      {
        name: 'Rojay Henry',
        email: 'rojay@bizabode.com',
        password: hashedPassword,
        role: 'admin',
        companyId: company._id,
        isActive: true
      },
      {
        name: 'Sarah Johnson',
        email: 'sarah@bizabode.com',
        password: hashedPassword,
        role: 'manager',
        companyId: company._id,
        isActive: true
      },
      {
        name: 'Mike Davis',
        email: 'mike@bizabode.com',
        password: hashedPassword,
        role: 'sales',
        companyId: company._id,
        isActive: true
      },
      {
        name: 'Emily Brown',
        email: 'emily@bizabode.com',
        password: hashedPassword,
        role: 'warehouse',
        companyId: company._id,
        isActive: true
      }
    ])

    const [admin, salesManager, salesRep, inventoryManager] = users

    // 3. Create Inventory Items
    console.log('📦 Creating inventory items...')
    const items = await Item.create([
      {
        companyId: company._id,
        sku: 'TECH-001',
        name: 'Wireless Bluetooth Mouse',
        description: 'Ergonomic wireless mouse with 2.4GHz connectivity',
        category: 'Electronics',
        quantity: 150,
        reorderLevel: 50,
        unitPrice: 29.99,
        costPrice: 18.50,
        supplier: 'TechSupply Co',
        location: 'Warehouse A, Shelf 1',
        critical: false,
        createdBy: inventoryManager._id
      },
      {
        companyId: company._id,
        sku: 'TECH-002',
        name: 'Mechanical Gaming Keyboard',
        description: 'RGB mechanical keyboard with blue switches',
        category: 'Electronics',
        quantity: 75,
        reorderLevel: 25,
        unitPrice: 89.99,
        costPrice: 55.00,
        supplier: 'TechSupply Co',
        location: 'Warehouse A, Shelf 2',
        critical: false,
        createdBy: inventoryManager._id
      },
      {
        companyId: company._id,
        sku: 'TECH-003',
        name: 'USB-C Hub 7-in-1',
        description: '7-in-1 USB-C hub with HDMI, ethernet, and USB ports',
        category: 'Accessories',
        quantity: 200,
        reorderLevel: 75,
        unitPrice: 49.99,
        costPrice: 28.00,
        supplier: 'AccessoryWorld',
        location: 'Warehouse B, Shelf 1',
        critical: false,
        createdBy: inventoryManager._id
      },
      {
        companyId: company._id,
        sku: 'TECH-004',
        name: 'Monitor Stand Adjustable',
        description: 'Height adjustable monitor stand for ergonomic viewing',
        category: 'Accessories',
        quantity: 45,
        reorderLevel: 20,
        unitPrice: 39.99,
        costPrice: 22.00,
        supplier: 'OfficeSupply Inc',
        location: 'Warehouse B, Shelf 2',
        critical: false,
        createdBy: inventoryManager._id
      },
      {
        companyId: company._id,
        sku: 'TECH-005',
        name: 'Webcam HD 1080p',
        description: 'High definition webcam with auto-focus',
        category: 'Electronics',
        quantity: 12, // Low stock
        reorderLevel: 30,
        unitPrice: 79.99,
        costPrice: 45.00,
        supplier: 'TechSupply Co',
        location: 'Warehouse A, Shelf 3',
        critical: true,
        createdBy: inventoryManager._id
      },
      {
        companyId: company._id,
        sku: 'TECH-006',
        name: 'Desk Lamp LED',
        description: 'Adjustable LED desk lamp with touch controls',
        category: 'Office Furniture',
        quantity: 0, // Out of stock
        reorderLevel: 15,
        unitPrice: 59.99,
        costPrice: 32.00,
        supplier: 'OfficeSupply Inc',
        location: 'Warehouse C, Shelf 1',
        critical: true,
        createdBy: inventoryManager._id
      }
    ])

    // 4. Create Customers
    console.log('🏢 Creating customers...')
    const customers = await Customer.create([
      {
        companyId: company._id,
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
        currentBalance: 0,
        creditUsed: 0,
        creditAvailable: 50000,
        status: 'Active',
        rating: 5,
        totalOrders: 0,
        totalValue: 0,
        averageOrderValue: 0,
        assignedTo: salesRep._id,
        tags: ['high-value', 'technology'],
        notes: 'Large technology company, prefers bulk orders'
      },
      {
        companyId: company._id,
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
        currentBalance: 0,
        creditUsed: 0,
        creditAvailable: 25000,
        status: 'Active',
        rating: 4,
        totalOrders: 0,
        totalValue: 0,
        averageOrderValue: 0,
        assignedTo: salesRep._id,
        tags: ['startup', 'growing'],
        notes: 'Fast-growing startup, frequent small orders'
      }
    ])

    // 5. Create Leads
    console.log('🎯 Creating leads...')
    const leads = await Lead.create([
      {
        companyId: company._id,
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
        notes: 'Interested in office equipment for new creative studio',
        assignedTo: salesRep._id
      },
      {
        companyId: company._id,
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
        notes: 'Retail chain looking for bulk electronics purchase',
        assignedTo: salesManager._id
      }
    ])

    // 6. Create Opportunities
    console.log('💼 Creating opportunities...')
    const opportunities = await Opportunity.create([
      {
        companyId: company._id,
        leadId: leads[1]._id,
        title: 'RetailPlus Office Equipment Deal',
        customerName: 'Carlos Mendoza',
        customerEmail: 'carlos@retailplus.com',
        value: 25000,
        stage: 'proposal',
        probability: 75,
        expectedCloseDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        assignedTo: salesManager._id,
        notes: 'Large bulk order for multiple retail locations'
      },
      {
        companyId: company._id,
        leadId: leads[0]._id,
        title: 'Creative Studio Setup',
        customerName: 'Amanda Foster',
        customerEmail: 'amanda@creativestudio.com',
        value: 8500,
        stage: 'qualification',
        probability: 50,
        expectedCloseDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        assignedTo: salesRep._id,
        notes: 'New studio setup, needs full office equipment package'
      }
    ])

    console.log('✅ Production seed data created successfully!')
    console.log('\n📊 Summary:')
    console.log(`- Company: ${company.name}`)
    console.log(`- Users: ${users.length}`)
    console.log(`- Items: ${items.length} (1 low stock, 1 out of stock)`)
    console.log(`- Customers: ${customers.length}`)
    console.log(`- Leads: ${leads.length}`)
    console.log(`- Opportunities: ${opportunities.length}`)

    console.log('\n🔐 Login Credentials:')
    console.log('Admin: rojay@bizabode.com / password123')
    console.log('Manager: sarah@bizabode.com / password123')
    console.log('Sales: mike@bizabode.com / password123')
    console.log('Warehouse: emily@bizabode.com / password123')

    console.log('\n🌐 Application URLs:')
    console.log('- Main App: http://localhost:3000')
    console.log('- Direct (no proxy): http://localhost:3000')
    console.log('- Health Check: http://localhost:3000/api/health')

    await mongoose.disconnect()
    console.log('🎉 Production seeding completed!')

  } catch (error) {
    console.error('❌ Error seeding production database:', error)
    process.exit(1)
  }
}

// Run if called directly
if (require.main === module) {
  seedProductionData()
    .then(() => {
      process.exit(0)
    })
    .catch((error) => {
      console.error('💥 Production seeding failed:', error)
      process.exit(1)
    })
}

export { seedProductionData }
