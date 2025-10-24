import { connectDB } from '../lib/db'
import Company from '../lib/models/Company'
import User from '../lib/models/User'
import Item from '../lib/models/Item'
import Lead from '../lib/models/Lead'
import Opportunity from '../lib/models/Opportunity'
import Customer from '../lib/models/Customer'
import Quote from '../lib/models/Quote'
import SalesOrder from '../lib/models/SalesOrder'
import Invoice from '../lib/models/Invoice'
import Payment from '../lib/models/Payment'
import Delivery from '../lib/models/Delivery'
import Activity from '../lib/models/Activity'
import Task from '../lib/models/Task'
import Employee from '../lib/models/Employee'
import Supplier from '../lib/models/Supplier'
import PurchaseOrder from '../lib/models/PurchaseOrder'
import Notification from '../lib/models/Notification'
import bcrypt from 'bcryptjs'

async function seedComprehensiveData() {
  try {
    console.log('🌱 Starting comprehensive database seeding...')
    await connectDB()

    // Clear existing data (optional - comment out for production)
    console.log('🧹 Clearing existing data...')
    await Promise.all([
      Company.deleteMany({}),
      User.deleteMany({}),
      Item.deleteMany({}),
      Lead.deleteMany({}),
      Opportunity.deleteMany({}),
      Customer.deleteMany({}),
      Quote.deleteMany({}),
      SalesOrder.deleteMany({}),
      Invoice.deleteMany({}),
      Payment.deleteMany({}),
      Delivery.deleteMany({}),
      Activity.deleteMany({}),
      Task.deleteMany({}),
      Employee.deleteMany({}),
      Supplier.deleteMany({}),
      PurchaseOrder.deleteMany({}),
      Notification.deleteMany({})
    ])

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
        role: 'sales_manager',
        companyId: company._id,
        isActive: true
      },
      {
        name: 'Mike Davis',
        email: 'mike@bizabode.com',
        password: hashedPassword,
        role: 'sales_rep',
        companyId: company._id,
        isActive: true
      },
      {
        name: 'Emily Brown',
        email: 'emily@bizabode.com',
        password: hashedPassword,
        role: 'inventory_manager',
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

    // 4. Create Suppliers
    console.log('🏭 Creating suppliers...')
    const suppliers = await Supplier.create([
      {
        companyId: company._id,
        name: 'TechSupply Co',
        contactName: 'Robert Chen',
        email: 'orders@techsupply.com',
        phone: '+1-555-0200',
        address: '456 Industrial Blvd',
        city: 'Los Angeles',
        state: 'CA',
        zipCode: '90210',
        country: 'USA',
        paymentTerms: 'Net 30',
        rating: 4.5,
        isActive: true,
        createdBy: admin._id
      },
      {
        companyId: company._id,
        name: 'AccessoryWorld',
        contactName: 'Linda Martinez',
        email: 'sales@accessoryworld.com',
        phone: '+1-555-0201',
        address: '789 Commerce St',
        city: 'Chicago',
        state: 'IL',
        zipCode: '60601',
        country: 'USA',
        paymentTerms: 'Net 15',
        rating: 4.2,
        isActive: true,
        createdBy: admin._id
      },
      {
        companyId: company._id,
        name: 'OfficeSupply Inc',
        contactName: 'James Wilson',
        email: 'purchasing@officesupply.com',
        phone: '+1-555-0202',
        address: '321 Supply Chain Dr',
        city: 'Dallas',
        state: 'TX',
        zipCode: '75201',
        country: 'USA',
        paymentTerms: 'Net 45',
        rating: 4.0,
        isActive: true,
        createdBy: admin._id
      }
    ])

    // 5. Create Employees
    console.log('👨‍💼 Creating employees...')
    const employees = await Employee.create([
      {
        companyId: company._id,
        employeeId: 'EMP001',
        firstName: 'John',
        lastName: 'Smith',
        email: 'john.smith@bizabode.com',
        phone: '+1-555-0301',
        department: 'Sales',
        position: 'Sales Representative',
        hireDate: new Date('2024-01-15'),
        salary: 55000,
        status: 'active',
        manager: salesManager._id,
        address: '123 Employee St',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        emergencyContact: {
          name: 'Jane Smith',
          relationship: 'Spouse',
          phone: '+1-555-0302'
        },
        createdBy: admin._id
      },
      {
        companyId: company._id,
        employeeId: 'EMP002',
        firstName: 'Maria',
        lastName: 'Garcia',
        email: 'maria.garcia@bizabode.com',
        phone: '+1-555-0303',
        department: 'Operations',
        position: 'Warehouse Supervisor',
        hireDate: new Date('2024-02-01'),
        salary: 48000,
        status: 'active',
        manager: inventoryManager._id,
        address: '456 Worker Ave',
        city: 'New York',
        state: 'NY',
        zipCode: '10002',
        emergencyContact: {
          name: 'Carlos Garcia',
          relationship: 'Husband',
          phone: '+1-555-0304'
        },
        createdBy: admin._id
      },
      {
        companyId: company._id,
        employeeId: 'EMP003',
        firstName: 'David',
        lastName: 'Chen',
        email: 'david.chen@bizabode.com',
        phone: '+1-555-0305',
        department: 'Customer Service',
        position: 'Customer Service Rep',
        hireDate: new Date('2024-03-10'),
        salary: 42000,
        status: 'active',
        manager: salesManager._id,
        address: '789 Service Rd',
        city: 'New York',
        state: 'NY',
        zipCode: '10003',
        emergencyContact: {
          name: 'Lisa Chen',
          relationship: 'Sister',
          phone: '+1-555-0306'
        },
        createdBy: admin._id
      }
    ])

    // 6. Create Customers
    console.log('🏢 Creating customers...')
    const customers = await Customer.create([
      {
        companyId: company._id,
        companyName: 'TechCorp Solutions',
        contactName: 'Jennifer Wilson',
        email: 'jennifer@techcorp.com',
        phone: '+1-555-0400',
        address: '100 Corporate Plaza',
        city: 'Boston',
        state: 'MA',
        zipCode: '02101',
        country: 'USA',
        customerType: 'Business',
        paymentTerms: 'Net 30',
        creditLimit: 50000,
        status: 'active',
        rating: 5,
        assignedTo: salesRep._id,
        tags: ['high-value', 'technology'],
        notes: 'Large technology company, prefers bulk orders',
        createdBy: salesRep._id
      },
      {
        companyId: company._id,
        companyName: 'StartupHub Inc',
        contactName: 'Alex Rodriguez',
        email: 'alex@startuphub.com',
        phone: '+1-555-0401',
        address: '250 Innovation Dr',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94102',
        country: 'USA',
        customerType: 'Business',
        paymentTerms: 'Net 15',
        creditLimit: 25000,
        status: 'active',
        rating: 4,
        assignedTo: salesRep._id,
        tags: ['startup', 'growing'],
        notes: 'Fast-growing startup, frequent small orders',
        createdBy: salesRep._id
      },
      {
        companyId: company._id,
        companyName: 'Enterprise Global',
        contactName: 'Michael Thompson',
        email: 'michael@enterpriseglobal.com',
        phone: '+1-555-0402',
        address: '500 Enterprise Way',
        city: 'Chicago',
        state: 'IL',
        zipCode: '60601',
        country: 'USA',
        customerType: 'Enterprise',
        paymentTerms: 'Net 45',
        creditLimit: 100000,
        status: 'active',
        rating: 5,
        assignedTo: salesManager._id,
        tags: ['enterprise', 'vip'],
        notes: 'Major enterprise client, quarterly bulk purchases',
        createdBy: salesManager._id
      }
    ])

    // 7. Create Leads
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
        category: 'Small Business',
        productInterest: ['Electronics', 'Accessories'],
        monthlyVolume: 5000,
        territory: 'Northeast',
        leadScore: 75,
        customerType: 'Business',
        notes: 'Interested in office equipment for new creative studio',
        assignedTo: salesRep._id,
        createdBy: salesRep._id
      },
      {
        companyId: company._id,
        name: 'Carlos Mendoza',
        email: 'carlos@retailplus.com',
        phone: '+1-555-0501',
        company: 'RetailPlus Chain',
        source: 'Referral',
        status: 'qualified',
        category: 'Mid-Market',
        productInterest: ['Electronics'],
        monthlyVolume: 15000,
        territory: 'Southwest',
        leadScore: 85,
        customerType: 'Business',
        notes: 'Retail chain looking for bulk electronics purchase',
        assignedTo: salesManager._id,
        createdBy: salesManager._id
      },
      {
        companyId: company._id,
        name: 'Lisa Wang',
        email: 'lisa@techstartup.io',
        phone: '+1-555-0502',
        company: 'TechStartup.io',
        source: 'Cold Call',
        status: 'contacted',
        category: 'Small Business',
        productInterest: ['Electronics', 'Office Furniture'],
        monthlyVolume: 8000,
        territory: 'West Coast',
        leadScore: 60,
        customerType: 'Business',
        notes: 'Growing tech startup, budget conscious',
        assignedTo: salesRep._id,
        createdBy: salesRep._id
      }
    ])

    // 8. Create Opportunities
    console.log('💼 Creating opportunities...')
    const opportunities = await Opportunity.create([
      {
        companyId: company._id,
        leadId: leads[1]._id, // Carlos Mendoza
        title: 'RetailPlus Office Equipment Deal',
        customerName: 'Carlos Mendoza',
        customerEmail: 'carlos@retailplus.com',
        value: 25000,
        stage: 'proposal',
        probability: 75,
        expectedCloseDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
        assignedTo: salesManager._id,
        notes: 'Large bulk order for multiple retail locations',
        createdBy: salesManager._id
      },
      {
        companyId: company._id,
        leadId: leads[0]._id, // Amanda Foster
        title: 'Creative Studio Setup',
        customerName: 'Amanda Foster',
        customerEmail: 'amanda@creativestudio.com',
        value: 8500,
        stage: 'qualification',
        probability: 50,
        expectedCloseDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        assignedTo: salesRep._id,
        notes: 'New studio setup, needs full office equipment package',
        createdBy: salesRep._id
      }
    ])

    // 9. Create Quotes
    console.log('📋 Creating quotes...')
    const quotes = await Quote.create([
      {
        companyId: company._id,
        opportunityId: opportunities[0]._id,
        quoteNumber: 'QT-2024-001',
        customerName: 'Carlos Mendoza',
        customerEmail: 'carlos@retailplus.com',
        items: [
          { 
            itemId: items[0]._id, 
            name: 'Wireless Bluetooth Mouse', 
            sku: 'TECH-001',
            quantity: 100, 
            unitPrice: 29.99, 
            total: 2999.00 
          },
          { 
            itemId: items[1]._id, 
            name: 'Mechanical Gaming Keyboard', 
            sku: 'TECH-002',
            quantity: 50, 
            unitPrice: 89.99, 
            total: 4499.50 
          },
          { 
            itemId: items[2]._id, 
            name: 'USB-C Hub 7-in-1', 
            sku: 'TECH-003',
            quantity: 75, 
            unitPrice: 49.99, 
            total: 3749.25 
          }
        ],
        subtotal: 11247.75,
        taxRate: 8.5,
        tax: 956.06,
        total: 12203.81,
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        status: 'sent',
        notes: 'Bulk discount applied - 5% off total',
        createdBy: salesManager._id
      },
      {
        companyId: company._id,
        opportunityId: opportunities[1]._id,
        quoteNumber: 'QT-2024-002',
        customerName: 'Amanda Foster',
        customerEmail: 'amanda@creativestudio.com',
        items: [
          { 
            itemId: items[0]._id, 
            name: 'Wireless Bluetooth Mouse', 
            sku: 'TECH-001',
            quantity: 25, 
            unitPrice: 29.99, 
            total: 749.75 
          },
          { 
            itemId: items[3]._id, 
            name: 'Monitor Stand Adjustable', 
            sku: 'TECH-004',
            quantity: 15, 
            unitPrice: 39.99, 
            total: 599.85 
          },
          { 
            itemId: items[4]._id, 
            name: 'Webcam HD 1080p', 
            sku: 'TECH-005',
            quantity: 10, 
            unitPrice: 79.99, 
            total: 799.90 
          }
        ],
        subtotal: 2149.50,
        taxRate: 8.5,
        tax: 182.71,
        total: 2332.21,
        validUntil: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        status: 'draft',
        notes: 'Creative studio package deal',
        createdBy: salesRep._id
      }
    ])

    // 10. Create Sales Orders
    console.log('🛒 Creating sales orders...')
    const salesOrders = await SalesOrder.create([
      {
        companyId: company._id,
        quoteId: quotes[0]._id,
        orderNumber: 'SO-2024-001',
        customerName: 'Carlos Mendoza',
        customerEmail: 'carlos@retailplus.com',
        customerId: customers[1]._id,
        items: quotes[0].items,
        subtotal: quotes[0].subtotal,
        tax: quotes[0].tax,
        total: quotes[0].total,
        status: 'confirmed',
        deliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        deliveryAddress: '250 Innovation Dr, San Francisco, CA 94102',
        paymentTerms: 'Net 15',
        notes: 'Expedited delivery requested',
        createdBy: salesManager._id
      }
    ])

    // 11. Create Invoices
    console.log('💰 Creating invoices...')
    const invoices = await Invoice.create([
      {
        companyId: company._id,
        orderId: salesOrders[0]._id,
        invoiceNumber: 'INV-2024-001',
        customerName: 'Carlos Mendoza',
        customerEmail: 'carlos@retailplus.com',
        customerId: customers[1]._id,
        items: salesOrders[0].items,
        subtotal: salesOrders[0].subtotal,
        tax: salesOrders[0].tax,
        total: salesOrders[0].total,
        dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        status: 'sent',
        paidAmount: 0,
        notes: 'Payment due within 15 days',
        createdBy: salesManager._id
      },
      {
        companyId: company._id,
        invoiceNumber: 'INV-2024-002',
        customerName: 'TechCorp Solutions',
        customerEmail: 'jennifer@techcorp.com',
        customerId: customers[0]._id,
        items: [
          { 
            itemId: items[1]._id, 
            name: 'Mechanical Gaming Keyboard', 
            sku: 'TECH-002',
            quantity: 20, 
            unitPrice: 89.99, 
            total: 1799.80 
          }
        ],
        subtotal: 1799.80,
        taxRate: 8.5,
        tax: 152.98,
        total: 1952.78,
        dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // Overdue
        status: 'overdue',
        paidAmount: 0,
        notes: 'Follow up required - payment overdue',
        createdBy: salesRep._id
      }
    ])

    // 12. Create Payments
    console.log('💳 Creating payments...')
    await Payment.create([
      {
        companyId: company._id,
        invoiceId: invoices[0]._id,
        invoiceNumber: 'INV-2024-001',
        customerName: 'Carlos Mendoza',
        amount: 6000.00, // Partial payment
        method: 'bank-transfer',
        reference: 'TXN-ABC123',
        status: 'completed',
        notes: 'Partial payment received, balance pending',
        createdBy: admin._id
      }
    ])

    // 13. Create Deliveries
    console.log('🚚 Creating deliveries...')
    await Delivery.create([
      {
        companyId: company._id,
        invoiceId: invoices[0]._id,
        deliveryNumber: 'DEL-2024-001',
        customerName: 'Carlos Mendoza',
        address: '250 Innovation Dr, San Francisco, CA 94102',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94102',
        country: 'USA',
        scheduledDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        status: 'scheduled',
        driverName: 'Mike Johnson',
        driverPhone: '+1-555-0600',
        vehicleNumber: 'VAN-001',
        qrCode: 'DEL-QR-001-ABC',
        notes: 'Handle with care - electronics',
        createdBy: inventoryManager._id
      },
      {
        companyId: company._id,
        invoiceId: invoices[1]._id,
        deliveryNumber: 'DEL-2024-002',
        customerName: 'TechCorp Solutions',
        address: '100 Corporate Plaza, Boston, MA 02101',
        city: 'Boston',
        state: 'MA',
        zipCode: '02101',
        country: 'USA',
        scheduledDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
        status: 'in-transit',
        driverName: 'Sarah Williams',
        driverPhone: '+1-555-0601',
        vehicleNumber: 'TRUCK-002',
        qrCode: 'DEL-QR-002-XYZ',
        notes: 'Express delivery requested',
        createdBy: inventoryManager._id
      }
    ])

    // 14. Create Activities
    console.log('📞 Creating activities...')
    await Activity.create([
      {
        companyId: company._id,
        type: 'Call',
        subject: 'Initial consultation call',
        description: 'Discussed office equipment needs for new creative studio',
        duration: 45,
        scheduledDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        completedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        outcome: 'Interested',
        followUpRequired: true,
        followUpDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        relatedTo: 'Lead',
        relatedId: leads[0]._id,
        assignedTo: salesRep._id,
        status: 'Completed',
        priority: 'Medium',
        createdBy: salesRep._id
      },
      {
        companyId: company._id,
        type: 'Meeting',
        subject: 'Product demonstration meeting',
        description: 'Demonstrated keyboard and mouse products to RetailPlus team',
        duration: 90,
        scheduledDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        completedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        outcome: 'Quote Requested',
        followUpRequired: false,
        relatedTo: 'Opportunity',
        relatedId: opportunities[0]._id,
        assignedTo: salesManager._id,
        status: 'Completed',
        priority: 'High',
        createdBy: salesManager._id
      },
      {
        companyId: company._id,
        type: 'Email',
        subject: 'Follow-up on overdue invoice',
        description: 'Sent reminder email about overdue payment for INV-2024-002',
        duration: 10,
        scheduledDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        completedDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        outcome: 'Follow-up Needed',
        followUpRequired: true,
        followUpDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        relatedTo: 'Invoice',
        relatedId: invoices[1]._id,
        assignedTo: salesRep._id,
        status: 'Completed',
        priority: 'High',
        createdBy: salesRep._id
      }
    ])

    // 15. Create Tasks
    console.log('✅ Creating tasks...')
    await Task.create([
      {
        companyId: company._id,
        title: 'Follow up with Creative Studio',
        description: 'Call Amanda to discuss quote details and answer any questions',
        type: 'Follow-up',
        priority: 'Medium',
        status: 'Pending',
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        estimatedHours: 0.5,
        assignedTo: salesRep._id,
        relatedTo: 'Lead',
        relatedId: leads[0]._id,
        isRecurring: false,
        reminderEnabled: true,
        reminderMinutes: 60,
        tags: ['follow-up', 'quote'],
        createdBy: salesRep._id
      },
      {
        companyId: company._id,
        title: 'Prepare RetailPlus contract',
        description: 'Draft contract documents for RetailPlus bulk order',
        type: 'Document',
        priority: 'High',
        status: 'In Progress',
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        estimatedHours: 2,
        assignedTo: salesManager._id,
        relatedTo: 'Opportunity',
        relatedId: opportunities[0]._id,
        isRecurring: false,
        reminderEnabled: true,
        reminderMinutes: 120,
        tags: ['contract', 'urgent'],
        createdBy: salesManager._id
      },
      {
        companyId: company._id,
        title: 'Collect overdue payment',
        description: 'Contact TechCorp to collect overdue payment for INV-2024-002',
        type: 'Call',
        priority: 'Urgent',
        status: 'Pending',
        dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
        estimatedHours: 1,
        assignedTo: salesRep._id,
        relatedTo: 'Invoice',
        relatedId: invoices[1]._id,
        isRecurring: false,
        reminderEnabled: true,
        reminderMinutes: 30,
        tags: ['payment', 'overdue', 'urgent'],
        createdBy: admin._id
      }
    ])

    // 16. Create Purchase Orders
    console.log('📝 Creating purchase orders...')
    await PurchaseOrder.create([
      {
        companyId: company._id,
        poNumber: 'PO-2024-001',
        supplierId: suppliers[0]._id,
        supplierName: 'TechSupply Co',
        items: [
          {
            itemId: items[4]._id,
            name: 'Webcam HD 1080p',
            sku: 'TECH-005',
            quantity: 50,
            unitPrice: 45.00,
            total: 2250.00
          }
        ],
        subtotal: 2250.00,
        tax: 191.25,
        total: 2441.25,
        status: 'pending',
        expectedDelivery: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        notes: 'Restock order for low inventory item',
        createdBy: inventoryManager._id
      }
    ])

    // 17. Create Notifications
    console.log('🔔 Creating notifications...')
    await Notification.create([
      {
        userId: admin._id,
        companyId: company._id,
        title: 'Low Stock Alert',
        message: 'Webcam HD 1080p is running low (12 units remaining)',
        type: 'low_stock',
        priority: 'High',
        isRead: false,
        data: {
          itemId: items[4]._id,
          itemName: 'Webcam HD 1080p',
          currentStock: 12,
          reorderLevel: 30
        }
      },
      {
        userId: salesRep._id,
        companyId: company._id,
        title: 'Overdue Invoice Alert',
        message: 'Invoice INV-2024-002 is 5 days overdue ($1,952.78)',
        type: 'overdue_invoice',
        priority: 'Urgent',
        isRead: false,
        data: {
          invoiceId: invoices[1]._id,
          invoiceNumber: 'INV-2024-002',
          amount: 1952.78,
          daysOverdue: 5
        }
      },
      {
        userId: inventoryManager._id,
        companyId: company._id,
        title: 'Out of Stock Alert',
        message: 'Desk Lamp LED is out of stock (0 units)',
        type: 'out_of_stock',
        priority: 'High',
        isRead: false,
        data: {
          itemId: items[5]._id,
          itemName: 'Desk Lamp LED',
          currentStock: 0,
          reorderLevel: 15
        }
      },
      {
        userId: admin._id,
        companyId: company._id,
        title: 'New Quote Created',
        message: 'Quote QT-2024-002 created for Amanda Foster ($2,332.21)',
        type: 'quote_created',
        priority: 'Medium',
        isRead: true,
        data: {
          quoteId: quotes[1]._id,
          quoteNumber: 'QT-2024-002',
          customerName: 'Amanda Foster',
          amount: 2332.21
        }
      }
    ])

    console.log('✅ Comprehensive seed data created successfully!')
    console.log('\n📊 Summary:')
    console.log(`- Company: ${company.name}`)
    console.log(`- Users: ${users.length}`)
    console.log(`- Items: ${items.length}`)
    console.log(`- Suppliers: ${suppliers.length}`)
    console.log(`- Employees: ${employees.length}`)
    console.log(`- Customers: ${customers.length}`)
    console.log(`- Leads: ${leads.length}`)
    console.log(`- Opportunities: ${opportunities.length}`)
    console.log(`- Quotes: ${quotes.length}`)
    console.log(`- Sales Orders: ${salesOrders.length}`)
    console.log(`- Invoices: ${invoices.length}`)
    console.log(`- Payments: 1`)
    console.log(`- Deliveries: 2`)
    console.log(`- Activities: ${activities.length}`)
    console.log(`- Tasks: 3`)
    console.log(`- Purchase Orders: 1`)
    console.log(`- Notifications: 4`)

    console.log('\n🎯 Test Scenarios Created:')
    console.log('- Low stock items (Webcam HD 1080p)')
    console.log('- Out of stock items (Desk Lamp LED)')
    console.log('- Overdue invoice (INV-2024-002)')
    console.log('- Active opportunities in pipeline')
    console.log('- Pending tasks and follow-ups')
    console.log('- Scheduled deliveries')
    console.log('- Partial payments')
    console.log('- Employee records with different departments')
    console.log('- Purchase orders for restocking')
    console.log('- Various notification types')

    console.log('\n🔐 Login Credentials:')
    console.log('Admin: rojay@bizabode.com / password123')
    console.log('Sales Manager: sarah@bizabode.com / password123')
    console.log('Sales Rep: mike@bizabode.com / password123')
    console.log('Inventory Manager: emily@bizabode.com / password123')

  } catch (error) {
    console.error('❌ Error seeding database:', error)
    process.exit(1)
  }
}

// Run if called directly
if (require.main === module) {
  seedComprehensiveData()
    .then(() => {
      console.log('🎉 Database seeding completed!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('💥 Database seeding failed:', error)
      process.exit(1)
    })
}

export { seedComprehensiveData }
